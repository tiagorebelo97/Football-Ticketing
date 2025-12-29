-- Add Role-Based Access Control for Club Backoffice
-- This migration adds support for different user roles with specific permissions

-- Create role_definitions table
CREATE TABLE IF NOT EXISTS club_user_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    club_id UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    permissions JSONB NOT NULL DEFAULT '[]',
    is_system_role BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(club_id, name)
);

-- Create club_users table (for club staff members)
CREATE TABLE IF NOT EXISTS club_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    club_id UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES club_user_roles(id) ON DELETE RESTRICT,
    email VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(20),
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES club_users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(club_id, email)
);

-- Function to create default roles for a club
CREATE OR REPLACE FUNCTION create_default_club_roles(target_club_id UUID)
RETURNS void AS $$
BEGIN
    -- Club Admin (full access)
    INSERT INTO club_user_roles (club_id, name, description, permissions, is_system_role)
    VALUES (
        target_club_id,
        'Club Admin',
        'Full access to all club backoffice features',
        '["manage_users", "manage_matches", "manage_venues", "manage_nfc", "view_reports", "manage_settings"]'::jsonb,
        true
    ) ON CONFLICT (club_id, name) DO NOTHING;

    -- Match Manager
    INSERT INTO club_user_roles (club_id, name, description, permissions, is_system_role)
    VALUES (
        target_club_id,
        'Match Manager',
        'Manage matches and ticket sales',
        '["manage_matches", "view_reports"]'::jsonb,
        true
    ) ON CONFLICT (club_id, name) DO NOTHING;

    -- Venue Manager
    INSERT INTO club_user_roles (club_id, name, description, permissions, is_system_role)
    VALUES (
        target_club_id,
        'Venue Manager',
        'Manage venue configurations and seating',
        '["manage_venues"]'::jsonb,
        true
    ) ON CONFLICT (club_id, name) DO NOTHING;

    -- NFC Manager
    INSERT INTO club_user_roles (club_id, name, description, permissions, is_system_role)
    VALUES (
        target_club_id,
        'NFC Manager',
        'Manage NFC card inventory and assignments',
        '["manage_nfc"]'::jsonb,
        true
    ) ON CONFLICT (club_id, name) DO NOTHING;

    -- Report Viewer
    INSERT INTO club_user_roles (club_id, name, description, permissions, is_system_role)
    VALUES (
        target_club_id,
        'Report Viewer',
        'View reports and analytics only',
        '["view_reports"]'::jsonb,
        true
    ) ON CONFLICT (club_id, name) DO NOTHING;
END;
$$ LANGUAGE plpgsql;

-- Create default roles for all existing clubs
DO $$
DECLARE
    club_record RECORD;
BEGIN
    FOR club_record IN SELECT id FROM clubs WHERE deleted_at IS NULL
    LOOP
        PERFORM create_default_club_roles(club_record.id);
    END LOOP;
END $$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_club_users_club_id ON club_users(club_id);
CREATE INDEX IF NOT EXISTS idx_club_users_email ON club_users(email);
CREATE INDEX IF NOT EXISTS idx_club_users_role_id ON club_users(role_id);
CREATE INDEX IF NOT EXISTS idx_club_user_roles_club_id ON club_user_roles(club_id);

-- Add comment explaining the permissions system
COMMENT ON COLUMN club_user_roles.permissions IS 'JSON array of permission strings: manage_users, manage_matches, manage_venues, manage_nfc, view_reports, manage_settings';
