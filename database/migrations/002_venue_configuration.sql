-- Migration: Advanced Venue Configuration System
-- Creates tables for sports, stands, floors, sectors, rows, and seats
-- Updates venues table with sport and additional metadata

-- Sports table (static list of supported sports)
CREATE TABLE IF NOT EXISTS sports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    code VARCHAR(50) NOT NULL UNIQUE, -- football, hockey, futsal, basketball, handball, volleyball
    field_dimensions JSONB, -- Store field dimensions for 2D rendering
    icon_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default sports
INSERT INTO sports (name, code, field_dimensions) VALUES
    ('Futebol', 'football', '{"length": 105, "width": 68, "unit": "meters"}'),
    ('Hóquei em Patins', 'hockey', '{"length": 40, "width": 20, "unit": "meters"}'),
    ('Futsal', 'futsal', '{"length": 40, "width": 20, "unit": "meters"}'),
    ('Basquetebol', 'basketball', '{"length": 28, "width": 15, "unit": "meters"}'),
    ('Andebol', 'handball', '{"length": 40, "width": 20, "unit": "meters"}'),
    ('Voleibol', 'volleyball', '{"length": 18, "width": 9, "unit": "meters"}')
ON CONFLICT (code) DO NOTHING;

-- Update venues table to add new columns
ALTER TABLE venues 
    ADD COLUMN IF NOT EXISTS sport_id UUID REFERENCES sports(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS photo_url TEXT,
    ADD COLUMN IF NOT EXISTS total_stands INTEGER DEFAULT 0,
    ADD COLUMN IF NOT EXISTS total_sectors INTEGER DEFAULT 0,
    ADD COLUMN IF NOT EXISTS total_rows INTEGER DEFAULT 0;

-- Create index on sport_id
CREATE INDEX IF NOT EXISTS idx_venues_sport_id ON venues(sport_id);

-- Stands table (Norte, Sul, Este, Oeste)
CREATE TABLE IF NOT EXISTS stands (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    venue_id UUID NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL, -- Norte, Sul, Este, Oeste
    position VARCHAR(20) NOT NULL CHECK (position IN ('north', 'south', 'east', 'west')),
    total_floors INTEGER DEFAULT 0,
    total_capacity INTEGER DEFAULT 0,
    color VARCHAR(7), -- Hex color for visualization
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(venue_id, position)
);

-- Floors table (multiple levels per stand)
CREATE TABLE IF NOT EXISTS floors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    stand_id UUID NOT NULL REFERENCES stands(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL, -- Piso 1, Piso 2, etc.
    floor_number INTEGER NOT NULL,
    total_sectors INTEGER DEFAULT 0,
    total_capacity INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(stand_id, floor_number)
);

-- Sectors table (sections within a floor)
CREATE TABLE IF NOT EXISTS sectors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    floor_id UUID NOT NULL REFERENCES floors(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL, -- Setor A, Setor B, etc.
    sector_number INTEGER NOT NULL,
    total_rows INTEGER DEFAULT 0,
    total_seats INTEGER NOT NULL DEFAULT 0,
    configured_seats INTEGER DEFAULT 0, -- Actual seats configured in rows
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(floor_id, sector_number),
    CHECK (configured_seats <= total_seats)
);

-- Rows table (rows within a sector)
CREATE TABLE IF NOT EXISTS rows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sector_id UUID NOT NULL REFERENCES sectors(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL, -- Fila A, Fila B, etc.
    row_number INTEGER NOT NULL,
    seats_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(sector_id, row_number)
);

-- Seats table (optional - individual seats for granular management)
CREATE TABLE IF NOT EXISTS seats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    row_id UUID NOT NULL REFERENCES rows(id) ON DELETE CASCADE,
    sector_id UUID NOT NULL REFERENCES sectors(id) ON DELETE CASCADE,
    seat_number VARCHAR(20) NOT NULL,
    seat_position INTEGER NOT NULL, -- Position in row
    status VARCHAR(20) DEFAULT 'available' CHECK (status IN ('available', 'reserved', 'blocked', 'vip')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(row_id, seat_position)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_stands_venue_id ON stands(venue_id);
CREATE INDEX IF NOT EXISTS idx_stands_position ON stands(position);
CREATE INDEX IF NOT EXISTS idx_floors_stand_id ON floors(stand_id);
CREATE INDEX IF NOT EXISTS idx_sectors_floor_id ON sectors(floor_id);
CREATE INDEX IF NOT EXISTS idx_rows_sector_id ON rows(sector_id);
CREATE INDEX IF NOT EXISTS idx_seats_row_id ON seats(row_id);
CREATE INDEX IF NOT EXISTS idx_seats_sector_id ON seats(sector_id);
CREATE INDEX IF NOT EXISTS idx_seats_status ON seats(status);

-- Triggers for updated_at
CREATE TRIGGER IF NOT EXISTS update_sports_updated_at BEFORE UPDATE ON sports FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER IF NOT EXISTS update_stands_updated_at BEFORE UPDATE ON stands FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER IF NOT EXISTS update_floors_updated_at BEFORE UPDATE ON floors FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER IF NOT EXISTS update_sectors_updated_at BEFORE UPDATE ON sectors FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER IF NOT EXISTS update_rows_updated_at BEFORE UPDATE ON rows FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER IF NOT EXISTS update_seats_updated_at BEFORE UPDATE ON seats FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update stand capacity when floors change
CREATE OR REPLACE FUNCTION update_stand_capacity()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE stands 
    SET total_capacity = (
        SELECT COALESCE(SUM(total_capacity), 0)
        FROM floors
        WHERE stand_id = NEW.stand_id
    )
    WHERE id = NEW.stand_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER IF NOT EXISTS trigger_update_stand_capacity
AFTER INSERT OR UPDATE OR DELETE ON floors
FOR EACH ROW EXECUTE FUNCTION update_stand_capacity();

-- Function to update floor capacity when sectors change
CREATE OR REPLACE FUNCTION update_floor_capacity()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE floors
    SET total_capacity = (
        SELECT COALESCE(SUM(configured_seats), 0)
        FROM sectors
        WHERE floor_id = NEW.floor_id
    )
    WHERE id = NEW.floor_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER IF NOT EXISTS trigger_update_floor_capacity
AFTER INSERT OR UPDATE OR DELETE ON sectors
FOR EACH ROW EXECUTE FUNCTION update_floor_capacity();

-- Function to update sector configured seats when rows change
CREATE OR REPLACE FUNCTION update_sector_configured_seats()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE sectors
    SET configured_seats = (
        SELECT COALESCE(SUM(seats_count), 0)
        FROM rows
        WHERE sector_id = NEW.sector_id
    )
    WHERE id = NEW.sector_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER IF NOT EXISTS trigger_update_sector_configured_seats
AFTER INSERT OR UPDATE OR DELETE ON rows
FOR EACH ROW EXECUTE FUNCTION update_sector_configured_seats();

-- Function to update venue counters
CREATE OR REPLACE FUNCTION update_venue_counters()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE venues
    SET 
        total_stands = (SELECT COUNT(*) FROM stands WHERE venue_id = NEW.venue_id),
        total_sectors = (
            SELECT COUNT(s.*)
            FROM sectors s
            JOIN floors f ON s.floor_id = f.id
            JOIN stands st ON f.stand_id = st.id
            WHERE st.venue_id = NEW.venue_id
        ),
        total_rows = (
            SELECT COUNT(r.*)
            FROM rows r
            JOIN sectors s ON r.sector_id = s.id
            JOIN floors f ON s.floor_id = f.id
            JOIN stands st ON f.stand_id = st.id
            WHERE st.venue_id = NEW.venue_id
        ),
        capacity = (
            SELECT COALESCE(SUM(st.total_capacity), 0)
            FROM stands st
            WHERE st.venue_id = NEW.venue_id
        )
    WHERE id = NEW.venue_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER IF NOT EXISTS trigger_update_venue_counters_stands
AFTER INSERT OR UPDATE OR DELETE ON stands
FOR EACH ROW EXECUTE FUNCTION update_venue_counters();

-- Useful view for venue hierarchy
CREATE OR REPLACE VIEW venue_hierarchy AS
SELECT 
    v.id as venue_id,
    v.name as venue_name,
    v.capacity as venue_capacity,
    s.name as sport_name,
    st.id as stand_id,
    st.name as stand_name,
    st.position as stand_position,
    st.total_capacity as stand_capacity,
    f.id as floor_id,
    f.name as floor_name,
    f.floor_number,
    f.total_capacity as floor_capacity,
    sec.id as sector_id,
    sec.name as sector_name,
    sec.total_seats as sector_total_seats,
    sec.configured_seats as sector_configured_seats,
    r.id as row_id,
    r.name as row_name,
    r.seats_count as row_seats_count
FROM venues v
LEFT JOIN sports s ON v.sport_id = s.id
LEFT JOIN stands st ON v.id = st.venue_id
LEFT JOIN floors f ON st.id = f.stand_id
LEFT JOIN sectors sec ON f.id = sec.floor_id
LEFT JOIN rows r ON sec.id = r.sector_id
ORDER BY v.name, st.position, f.floor_number, sec.sector_number, r.row_number;

-- View for venue statistics
CREATE OR REPLACE VIEW venue_stats AS
SELECT 
    v.id,
    v.name,
    v.capacity,
    COUNT(DISTINCT st.id) as total_stands,
    COUNT(DISTINCT f.id) as total_floors,
    COUNT(DISTINCT sec.id) as total_sectors,
    COUNT(DISTINCT r.id) as total_rows,
    COALESCE(SUM(r.seats_count), 0) as total_configured_seats
FROM venues v
LEFT JOIN stands st ON v.id = st.venue_id
LEFT JOIN floors f ON st.id = f.stand_id
LEFT JOIN sectors sec ON f.id = sec.floor_id
LEFT JOIN rows r ON sec.id = r.sector_id
GROUP BY v.id, v.name, v.capacity;
