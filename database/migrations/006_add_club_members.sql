-- Migration: Add club members and quota tracking tables

-- Club Members Table
CREATE TABLE IF NOT EXISTS club_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    club_id UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
    member_number VARCHAR(50) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    date_of_birth DATE,
    address TEXT,
    city VARCHAR(100),
    postal_code VARCHAR(20),
    country VARCHAR(100),
    member_since DATE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'active', -- active, suspended, cancelled
    member_type VARCHAR(50) NOT NULL DEFAULT 'regular', -- regular, premium, vip, junior, senior
    quota_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00, -- Monthly/Annual quota amount
    quota_frequency VARCHAR(20) NOT NULL DEFAULT 'monthly', -- monthly, quarterly, annual
    notes TEXT,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL, -- Link to user account if registered
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(club_id, member_number),
    UNIQUE(club_id, email)
);

-- Member Quota Payments Table
CREATE TABLE IF NOT EXISTS member_quotas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    member_id UUID NOT NULL REFERENCES club_members(id) ON DELETE CASCADE,
    club_id UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
    amount DECIMAL(10, 2) NOT NULL,
    payment_date DATE NOT NULL,
    period_start DATE NOT NULL, -- Start of the period covered
    period_end DATE NOT NULL, -- End of the period covered
    payment_method VARCHAR(50), -- cash, card, transfer, stripe
    status VARCHAR(20) NOT NULL DEFAULT 'pending', -- pending, paid, overdue, cancelled
    reference VARCHAR(100), -- Payment reference or transaction ID
    notes TEXT,
    recorded_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for better performance
CREATE INDEX idx_club_members_club_id ON club_members(club_id);
CREATE INDEX idx_club_members_status ON club_members(status);
CREATE INDEX idx_club_members_member_number ON club_members(club_id, member_number);
CREATE INDEX idx_club_members_email ON club_members(email);
CREATE INDEX idx_club_members_user_id ON club_members(user_id);
CREATE INDEX idx_member_quotas_member_id ON member_quotas(member_id);
CREATE INDEX idx_member_quotas_club_id ON member_quotas(club_id);
CREATE INDEX idx_member_quotas_payment_date ON member_quotas(payment_date);
CREATE INDEX idx_member_quotas_status ON member_quotas(status);
