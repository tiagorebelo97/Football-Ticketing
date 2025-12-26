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
-- ISO 3166-1 alpha-2 codes and country names
-- Flag URLs using flagcdn.com (w320 size for good quality)

INSERT INTO countries (name, code, flag_url) VALUES
('Afghanistan', 'AF', 'https://flagcdn.com/w320/af.png'),
('Albania', 'AL', 'https://flagcdn.com/w320/al.png'),
('Algeria', 'DZ', 'https://flagcdn.com/w320/dz.png'),
('Andorra', 'AD', 'https://flagcdn.com/w320/ad.png'),
('Angola', 'AO', 'https://flagcdn.com/w320/ao.png'),
('Antigua and Barbuda', 'AG', 'https://flagcdn.com/w320/ag.png'),
('Argentina', 'AR', 'https://flagcdn.com/w320/ar.png'),
('Armenia', 'AM', 'https://flagcdn.com/w320/am.png'),
('Australia', 'AU', 'https://flagcdn.com/w320/au.png'),
('Austria', 'AT', 'https://flagcdn.com/w320/at.png'),
('Azerbaijan', 'AZ', 'https://flagcdn.com/w320/az.png'),
('Bahamas', 'BS', 'https://flagcdn.com/w320/bs.png'),
('Bahrain', 'BH', 'https://flagcdn.com/w320/bh.png'),
('Bangladesh', 'BD', 'https://flagcdn.com/w320/bd.png'),
('Barbados', 'BB', 'https://flagcdn.com/w320/bb.png'),
('Belarus', 'BY', 'https://flagcdn.com/w320/by.png'),
('Belgium', 'BE', 'https://flagcdn.com/w320/be.png'),
('Belize', 'BZ', 'https://flagcdn.com/w320/bz.png'),
('Benin', 'BJ', 'https://flagcdn.com/w320/bj.png'),
('Bhutan', 'BT', 'https://flagcdn.com/w320/bt.png'),
('Bolivia', 'BO', 'https://flagcdn.com/w320/bo.png'),
('Bosnia and Herzegovina', 'BA', 'https://flagcdn.com/w320/ba.png'),
('Botswana', 'BW', 'https://flagcdn.com/w320/bw.png'),
('Brazil', 'BR', 'https://flagcdn.com/w320/br.png'),
('Brunei', 'BN', 'https://flagcdn.com/w320/bn.png'),
('Bulgaria', 'BG', 'https://flagcdn.com/w320/bg.png'),
('Burkina Faso', 'BF', 'https://flagcdn.com/w320/bf.png'),
('Burundi', 'BI', 'https://flagcdn.com/w320/bi.png'),
('Cabo Verde', 'CV', 'https://flagcdn.com/w320/cv.png'),
('Cambodia', 'KH', 'https://flagcdn.com/w320/kh.png'),
('Cameroon', 'CM', 'https://flagcdn.com/w320/cm.png'),
('Canada', 'CA', 'https://flagcdn.com/w320/ca.png'),
('Central African Republic', 'CF', 'https://flagcdn.com/w320/cf.png'),
('Chad', 'TD', 'https://flagcdn.com/w320/td.png'),
('Chile', 'CL', 'https://flagcdn.com/w320/cl.png'),
('China', 'CN', 'https://flagcdn.com/w320/cn.png'),
('Colombia', 'CO', 'https://flagcdn.com/w320/co.png'),
('Comoros', 'KM', 'https://flagcdn.com/w320/km.png'),
('Congo (Democratic Republic of the)', 'CD', 'https://flagcdn.com/w320/cd.png'),
('Congo (Republic of the)', 'CG', 'https://flagcdn.com/w320/cg.png'),
('Costa Rica', 'CR', 'https://flagcdn.com/w320/cr.png'),
('Croatia', 'HR', 'https://flagcdn.com/w320/hr.png'),
('Cuba', 'CU', 'https://flagcdn.com/w320/cu.png'),
('Cyprus', 'CY', 'https://flagcdn.com/w320/cy.png'),
('Czech Republic', 'CZ', 'https://flagcdn.com/w320/cz.png'),
('Denmark', 'DK', 'https://flagcdn.com/w320/dk.png'),
('Djibouti', 'DJ', 'https://flagcdn.com/w320/dj.png'),
('Dominica', 'DM', 'https://flagcdn.com/w320/dm.png'),
('Dominican Republic', 'DO', 'https://flagcdn.com/w320/do.png'),
('East Timor', 'TL', 'https://flagcdn.com/w320/tl.png'),
('Ecuador', 'EC', 'https://flagcdn.com/w320/ec.png'),
('Egypt', 'EG', 'https://flagcdn.com/w320/eg.png'),
('El Salvador', 'SV', 'https://flagcdn.com/w320/sv.png'),
('Equatorial Guinea', 'GQ', 'https://flagcdn.com/w320/gq.png'),
('Eritrea', 'ER', 'https://flagcdn.com/w320/er.png'),
('Estonia', 'EE', 'https://flagcdn.com/w320/ee.png'),
('Eswatini', 'SZ', 'https://flagcdn.com/w320/sz.png'),
('Ethiopia', 'ET', 'https://flagcdn.com/w320/et.png'),
('Fiji', 'FJ', 'https://flagcdn.com/w320/fj.png'),
('Finland', 'FI', 'https://flagcdn.com/w320/fi.png'),
('France', 'FR', 'https://flagcdn.com/w320/fr.png'),
('Gabon', 'GA', 'https://flagcdn.com/w320/ga.png'),
('Gambia', 'GM', 'https://flagcdn.com/w320/gm.png'),
('Georgia', 'GE', 'https://flagcdn.com/w320/ge.png'),
('Germany', 'DE', 'https://flagcdn.com/w320/de.png'),
('Ghana', 'GH', 'https://flagcdn.com/w320/gh.png'),
('Greece', 'GR', 'https://flagcdn.com/w320/gr.png'),
('Grenada', 'GD', 'https://flagcdn.com/w320/gd.png'),
('Guatemala', 'GT', 'https://flagcdn.com/w320/gt.png'),
('Guinea', 'GN', 'https://flagcdn.com/w320/gn.png'),
('Guinea-Bissau', 'GW', 'https://flagcdn.com/w320/gw.png'),
('Guyana', 'GY', 'https://flagcdn.com/w320/gy.png'),
('Haiti', 'HT', 'https://flagcdn.com/w320/ht.png'),
('Honduras', 'HN', 'https://flagcdn.com/w320/hn.png'),
('Hungary', 'HU', 'https://flagcdn.com/w320/hu.png'),
('Iceland', 'IS', 'https://flagcdn.com/w320/is.png'),
('India', 'IN', 'https://flagcdn.com/w320/in.png'),
('Indonesia', 'ID', 'https://flagcdn.com/w320/id.png'),
('Iran', 'IR', 'https://flagcdn.com/w320/ir.png'),
('Iraq', 'IQ', 'https://flagcdn.com/w320/iq.png'),
('Ireland', 'IE', 'https://flagcdn.com/w320/ie.png'),
('Israel', 'IL', 'https://flagcdn.com/w320/il.png'),
('Italy', 'IT', 'https://flagcdn.com/w320/it.png'),
('Ivory Coast', 'CI', 'https://flagcdn.com/w320/ci.png'),
('Jamaica', 'JM', 'https://flagcdn.com/w320/jm.png'),
('Japan', 'JP', 'https://flagcdn.com/w320/jp.png'),
('Jordan', 'JO', 'https://flagcdn.com/w320/jo.png'),
('Kazakhstan', 'KZ', 'https://flagcdn.com/w320/kz.png'),
('Kenya', 'KE', 'https://flagcdn.com/w320/ke.png'),
('Kiribati', 'KI', 'https://flagcdn.com/w320/ki.png'),
('Korea (North)', 'KP', 'https://flagcdn.com/w320/kp.png'),
('Korea (South)', 'KR', 'https://flagcdn.com/w320/kr.png'),
('Kosovo', 'XK', 'https://flagcdn.com/w320/xk.png'),
('Kuwait', 'KW', 'https://flagcdn.com/w320/kw.png'),
('Kyrgyzstan', 'KG', 'https://flagcdn.com/w320/kg.png'),
('Laos', 'LA', 'https://flagcdn.com/w320/la.png'),
('Latvia', 'LV', 'https://flagcdn.com/w320/lv.png'),
('Lebanon', 'LB', 'https://flagcdn.com/w320/lb.png'),
('Lesotho', 'LS', 'https://flagcdn.com/w320/ls.png'),
('Liberia', 'LR', 'https://flagcdn.com/w320/lr.png'),
('Libya', 'LY', 'https://flagcdn.com/w320/ly.png'),
('Liechtenstein', 'LI', 'https://flagcdn.com/w320/li.png'),
('Lithuania', 'LT', 'https://flagcdn.com/w320/lt.png'),
('Luxembourg', 'LU', 'https://flagcdn.com/w320/lu.png'),
('Madagascar', 'MG', 'https://flagcdn.com/w320/mg.png'),
('Malawi', 'MW', 'https://flagcdn.com/w320/mw.png'),
('Malaysia', 'MY', 'https://flagcdn.com/w320/my.png'),
('Maldives', 'MV', 'https://flagcdn.com/w320/mv.png'),
('Mali', 'ML', 'https://flagcdn.com/w320/ml.png'),
('Malta', 'MT', 'https://flagcdn.com/w320/mt.png'),
('Marshall Islands', 'MH', 'https://flagcdn.com/w320/mh.png'),
('Mauritania', 'MR', 'https://flagcdn.com/w320/mr.png'),
('Mauritius', 'MU', 'https://flagcdn.com/w320/mu.png'),
('Mexico', 'MX', 'https://flagcdn.com/w320/mx.png'),
('Micronesia', 'FM', 'https://flagcdn.com/w320/fm.png'),
('Moldova', 'MD', 'https://flagcdn.com/w320/md.png'),
('Monaco', 'MC', 'https://flagcdn.com/w320/mc.png'),
('Mongolia', 'MN', 'https://flagcdn.com/w320/mn.png'),
('Montenegro', 'ME', 'https://flagcdn.com/w320/me.png'),
('Morocco', 'MA', 'https://flagcdn.com/w320/ma.png'),
('Mozambique', 'MZ', 'https://flagcdn.com/w320/mz.png'),
('Myanmar', 'MM', 'https://flagcdn.com/w320/mm.png'),
('Namibia', 'NA', 'https://flagcdn.com/w320/na.png'),
('Nauru', 'NR', 'https://flagcdn.com/w320/nr.png'),
('Nepal', 'NP', 'https://flagcdn.com/w320/np.png'),
('Netherlands', 'NL', 'https://flagcdn.com/w320/nl.png'),
('New Zealand', 'NZ', 'https://flagcdn.com/w320/nz.png'),
('Nicaragua', 'NI', 'https://flagcdn.com/w320/ni.png'),
('Niger', 'NE', 'https://flagcdn.com/w320/ne.png'),
('Nigeria', 'NG', 'https://flagcdn.com/w320/ng.png'),
('North Macedonia', 'MK', 'https://flagcdn.com/w320/mk.png'),
('Norway', 'NO', 'https://flagcdn.com/w320/no.png'),
('Oman', 'OM', 'https://flagcdn.com/w320/om.png'),
('Pakistan', 'PK', 'https://flagcdn.com/w320/pk.png'),
('Palau', 'PW', 'https://flagcdn.com/w320/pw.png'),
('Palestine', 'PS', 'https://flagcdn.com/w320/ps.png'),
('Panama', 'PA', 'https://flagcdn.com/w320/pa.png'),
('Papua New Guinea', 'PG', 'https://flagcdn.com/w320/pg.png'),
('Paraguay', 'PY', 'https://flagcdn.com/w320/py.png'),
('Peru', 'PE', 'https://flagcdn.com/w320/pe.png'),
('Philippines', 'PH', 'https://flagcdn.com/w320/ph.png'),
('Poland', 'PL', 'https://flagcdn.com/w320/pl.png'),
('Portugal', 'PT', 'https://flagcdn.com/w320/pt.png'),
('Qatar', 'QA', 'https://flagcdn.com/w320/qa.png'),
('Romania', 'RO', 'https://flagcdn.com/w320/ro.png'),
('Russia', 'RU', 'https://flagcdn.com/w320/ru.png'),
('Rwanda', 'RW', 'https://flagcdn.com/w320/rw.png'),
('Saint Kitts and Nevis', 'KN', 'https://flagcdn.com/w320/kn.png'),
('Saint Lucia', 'LC', 'https://flagcdn.com/w320/lc.png'),
('Saint Vincent and the Grenadines', 'VC', 'https://flagcdn.com/w320/vc.png'),
('Samoa', 'WS', 'https://flagcdn.com/w320/ws.png'),
('San Marino', 'SM', 'https://flagcdn.com/w320/sm.png'),
('Sao Tome and Principe', 'ST', 'https://flagcdn.com/w320/st.png'),
('Saudi Arabia', 'SA', 'https://flagcdn.com/w320/sa.png'),
('Senegal', 'SN', 'https://flagcdn.com/w320/sn.png'),
('Serbia', 'RS', 'https://flagcdn.com/w320/rs.png'),
('Seychelles', 'SC', 'https://flagcdn.com/w320/sc.png'),
('Sierra Leone', 'SL', 'https://flagcdn.com/w320/sl.png'),
('Singapore', 'SG', 'https://flagcdn.com/w320/sg.png'),
('Slovakia', 'SK', 'https://flagcdn.com/w320/sk.png'),
('Slovenia', 'SI', 'https://flagcdn.com/w320/si.png'),
('Solomon Islands', 'SB', 'https://flagcdn.com/w320/sb.png'),
('Somalia', 'SO', 'https://flagcdn.com/w320/so.png'),
('South Africa', 'ZA', 'https://flagcdn.com/w320/za.png'),
('South Sudan', 'SS', 'https://flagcdn.com/w320/ss.png'),
('Spain', 'ES', 'https://flagcdn.com/w320/es.png'),
('Sri Lanka', 'LK', 'https://flagcdn.com/w320/lk.png'),
('Sudan', 'SD', 'https://flagcdn.com/w320/sd.png'),
('Suriname', 'SR', 'https://flagcdn.com/w320/sr.png'),
('Sweden', 'SE', 'https://flagcdn.com/w320/se.png'),
('Switzerland', 'CH', 'https://flagcdn.com/w320/ch.png'),
('Syria', 'SY', 'https://flagcdn.com/w320/sy.png'),
('Taiwan', 'TW', 'https://flagcdn.com/w320/tw.png'),
('Tajikistan', 'TJ', 'https://flagcdn.com/w320/tj.png'),
('Tanzania', 'TZ', 'https://flagcdn.com/w320/tz.png'),
('Thailand', 'TH', 'https://flagcdn.com/w320/th.png'),
('Togo', 'TG', 'https://flagcdn.com/w320/tg.png'),
('Tonga', 'TO', 'https://flagcdn.com/w320/to.png'),
('Trinidad and Tobago', 'TT', 'https://flagcdn.com/w320/tt.png'),
('Tunisia', 'TN', 'https://flagcdn.com/w320/tn.png'),
('Turkey', 'TR', 'https://flagcdn.com/w320/tr.png'),
('Turkmenistan', 'TM', 'https://flagcdn.com/w320/tm.png'),
('Tuvalu', 'TV', 'https://flagcdn.com/w320/tv.png'),
('Uganda', 'UG', 'https://flagcdn.com/w320/ug.png'),
('Ukraine', 'UA', 'https://flagcdn.com/w320/ua.png'),
('United Arab Emirates', 'AE', 'https://flagcdn.com/w320/ae.png'),
('United Kingdom', 'GB', 'https://flagcdn.com/w320/gb.png'),
('United States', 'US', 'https://flagcdn.com/w320/us.png'),
('Uruguay', 'UY', 'https://flagcdn.com/w320/uy.png'),
('Uzbekistan', 'UZ', 'https://flagcdn.com/w320/uz.png'),
('Vanuatu', 'VU', 'https://flagcdn.com/w320/vu.png'),
('Vatican City', 'VA', 'https://flagcdn.com/w320/va.png'),
('Venezuela', 'VE', 'https://flagcdn.com/w320/ve.png'),
('Vietnam', 'VN', 'https://flagcdn.com/w320/vn.png'),
('Yemen', 'YE', 'https://flagcdn.com/w320/ye.png'),
('Zambia', 'ZM', 'https://flagcdn.com/w320/zm.png'),
('Zimbabwe', 'ZW', 'https://flagcdn.com/w320/zw.png')
ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    flag_url = EXCLUDED.flag_url,
    updated_at = CURRENT_TIMESTAMP;
