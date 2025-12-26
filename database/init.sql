-- Multi-tenant Football Ticketing Platform Database Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Countries
CREATE TABLE countries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL UNIQUE,
    code VARCHAR(3) NOT NULL UNIQUE,
    flag_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Clubs (Tenants)
CREATE TABLE clubs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    short_name VARCHAR(100),
    slug VARCHAR(100) UNIQUE NOT NULL,
    keycloak_realm_id VARCHAR(255) UNIQUE NOT NULL,
    stripe_account_id VARCHAR(255) UNIQUE,
    logo_url TEXT,
    country_id UUID REFERENCES countries(id) ON DELETE RESTRICT,
    founded_year INTEGER,
    stadium_capacity INTEGER,
    website VARCHAR(255),
    primary_color VARCHAR(7),
    secondary_color VARCHAR(7),
    is_active BOOLEAN DEFAULT true,
    deleted_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Venues (Stadiums)
CREATE TABLE venues (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    club_id UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
    city VARCHAR(255) NOT NULL,
    capacity INTEGER,
    address TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Competitions
CREATE TABLE competitions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    short_name VARCHAR(100),
    type VARCHAR(20) NOT NULL CHECK (type IN ('league', 'cup', 'international')),
    country_id UUID NOT NULL REFERENCES countries(id) ON DELETE CASCADE,
    logo_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seasons
CREATE TABLE seasons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT check_dates CHECK (end_date > start_date)
);

-- Club Competition Pivot Table
CREATE TABLE club_competition (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    club_id UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
    competition_id UUID NOT NULL REFERENCES competitions(id) ON DELETE CASCADE,
    season_id UUID REFERENCES seasons(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(club_id, competition_id, season_id)
);

-- NFC Card Stock Configuration
CREATE TABLE nfc_stock_config (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    club_id UUID REFERENCES clubs(id) ON DELETE CASCADE,
    total_cards INTEGER NOT NULL DEFAULT 0,
    available_cards INTEGER NOT NULL DEFAULT 0,
    deposit_amount DECIMAL(10, 2) NOT NULL DEFAULT 5.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Fee Configuration
CREATE TABLE fee_config (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    club_id UUID REFERENCES clubs(id) ON DELETE CASCADE,
    platform_fee_percentage DECIMAL(5, 2) DEFAULT 2.50,
    transaction_fee_fixed DECIMAL(10, 2) DEFAULT 0.30,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(club_id)
);

-- Users
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    keycloak_id VARCHAR(255) UNIQUE,
    club_id UUID REFERENCES clubs(id) ON DELETE SET NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    is_verified BOOLEAN DEFAULT false,
    verification_token VARCHAR(255),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(20),
    role VARCHAR(50) NOT NULL, -- super_admin, club_admin, staff, fan
    reset_token VARCHAR(255),
    reset_token_expires TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- NFC Cards
CREATE TABLE nfc_cards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    club_id UUID REFERENCES clubs(id) ON DELETE CASCADE,
    card_uid VARCHAR(50) UNIQUE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'available', -- available, assigned, blocked, lost
    assigned_to_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    deposit_paid BOOLEAN DEFAULT false,
    deposit_amount DECIMAL(10, 2),
    assigned_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Matches
CREATE TABLE matches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    club_id UUID REFERENCES clubs(id) ON DELETE CASCADE,
    home_team VARCHAR(255) NOT NULL,
    away_team VARCHAR(255) NOT NULL,
    match_date TIMESTAMP NOT NULL,
    venue VARCHAR(255),
    total_capacity INTEGER NOT NULL,
    current_attendance INTEGER DEFAULT 0,
    ticket_price DECIMAL(10, 2) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'scheduled', -- scheduled, ongoing, completed, cancelled
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tickets
CREATE TABLE tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    nfc_card_id UUID REFERENCES nfc_cards(id) ON DELETE SET NULL,
    ticket_number VARCHAR(50) UNIQUE NOT NULL,
    qr_code_data TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'active', -- active, used, cancelled, refunded
    price DECIMAL(10, 2) NOT NULL,
    deposit_amount DECIMAL(10, 2) DEFAULT 0,
    seat_section VARCHAR(50),
    seat_number VARCHAR(20),
    purchased_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    used_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Transactions
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    club_id UUID REFERENCES clubs(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    ticket_id UUID REFERENCES tickets(id) ON DELETE SET NULL,
    nfc_card_id UUID REFERENCES nfc_cards(id) ON DELETE SET NULL,
    type VARCHAR(50) NOT NULL, -- ticket_purchase, deposit, refund, nfc_assignment
    amount DECIMAL(10, 2) NOT NULL,
    stripe_payment_intent_id VARCHAR(255),
    status VARCHAR(20) NOT NULL DEFAULT 'pending', -- pending, completed, failed, refunded
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Entry Logs (for gate validation and capacity tracking)
CREATE TABLE entry_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
    ticket_id UUID REFERENCES tickets(id) ON DELETE CASCADE,
    entry_type VARCHAR(20) NOT NULL, -- nfc, qr
    entry_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    gate_number VARCHAR(20),
    validation_status VARCHAR(20) NOT NULL, -- valid, invalid, duplicate
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Staff Sessions (for POS app NFC login)
CREATE TABLE staff_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    nfc_card_id UUID REFERENCES nfc_cards(id) ON DELETE CASCADE,
    club_id UUID REFERENCES clubs(id) ON DELETE CASCADE,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    login_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    logout_time TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Refunds
CREATE TABLE refunds (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_id UUID REFERENCES transactions(id) ON DELETE CASCADE,
    ticket_id UUID REFERENCES tickets(id) ON DELETE SET NULL,
    nfc_card_id UUID REFERENCES nfc_cards(id) ON DELETE SET NULL,
    amount DECIMAL(10, 2) NOT NULL,
    reason VARCHAR(255),
    stripe_refund_id VARCHAR(255),
    status VARCHAR(20) NOT NULL DEFAULT 'pending', -- pending, completed, failed
    processed_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for better query performance
CREATE INDEX idx_countries_name ON countries(name);
CREATE INDEX idx_countries_code ON countries(code);
CREATE INDEX idx_clubs_slug ON clubs(slug);
CREATE INDEX idx_clubs_keycloak_realm ON clubs(keycloak_realm_id);
CREATE INDEX idx_clubs_country_id ON clubs(country_id);
CREATE INDEX idx_clubs_deleted_at ON clubs(deleted_at);
CREATE INDEX idx_venues_club_id ON venues(club_id);
CREATE INDEX idx_venues_city ON venues(city);
CREATE INDEX idx_competitions_country_id ON competitions(country_id);
CREATE INDEX idx_competitions_type ON competitions(type);
CREATE INDEX idx_seasons_is_active ON seasons(is_active);
CREATE INDEX idx_club_competition_club_id ON club_competition(club_id);
CREATE INDEX idx_club_competition_competition_id ON club_competition(competition_id);
CREATE INDEX idx_club_competition_season_id ON club_competition(season_id);
CREATE INDEX idx_users_keycloak_id ON users(keycloak_id);
CREATE INDEX idx_users_club_id ON users(club_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_nfc_cards_uid ON nfc_cards(card_uid);
CREATE INDEX idx_nfc_cards_club_id ON nfc_cards(club_id);
CREATE INDEX idx_nfc_cards_status ON nfc_cards(status);
CREATE INDEX idx_matches_club_id ON matches(club_id);
CREATE INDEX idx_matches_date ON matches(match_date);
CREATE INDEX idx_tickets_match_id ON tickets(match_id);
CREATE INDEX idx_tickets_user_id ON tickets(user_id);
CREATE INDEX idx_tickets_status ON tickets(status);
CREATE INDEX idx_transactions_club_id ON transactions(club_id);
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_ticket_id ON transactions(ticket_id);
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_entry_logs_match_id ON entry_logs(match_id);
CREATE INDEX idx_staff_sessions_user_id ON staff_sessions(user_id);
CREATE INDEX idx_staff_sessions_active ON staff_sessions(is_active);

-- Trigger to update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_countries_updated_at BEFORE UPDATE ON countries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_clubs_updated_at BEFORE UPDATE ON clubs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_venues_updated_at BEFORE UPDATE ON venues FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_competitions_updated_at BEFORE UPDATE ON competitions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_seasons_updated_at BEFORE UPDATE ON seasons FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_nfc_cards_updated_at BEFORE UPDATE ON nfc_cards FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_matches_updated_at BEFORE UPDATE ON matches FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tickets_updated_at BEFORE UPDATE ON tickets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_nfc_stock_config_updated_at BEFORE UPDATE ON nfc_stock_config FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_fee_config_updated_at BEFORE UPDATE ON fee_config FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_refunds_updated_at BEFORE UPDATE ON refunds FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger to ensure only one season is active at a time
CREATE OR REPLACE FUNCTION ensure_single_active_season()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.is_active = true THEN
        UPDATE seasons SET is_active = false WHERE id != NEW.id AND is_active = true;
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER ensure_single_active_season_trigger 
BEFORE INSERT OR UPDATE ON seasons 
FOR EACH ROW 
WHEN (NEW.is_active = true)
EXECUTE FUNCTION ensure_single_active_season();
