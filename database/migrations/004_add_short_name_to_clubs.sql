-- Add short_name column to clubs table
ALTER TABLE clubs 
ADD COLUMN IF NOT EXISTS short_name VARCHAR(50);
