# Database Migrations

## Overview
This folder contains SQL migration files for the Football Ticketing platform.

## Files
- `init.sql` - Initial database schema (run automatically on first container start)
- `migrations/002_venue_configuration.sql` - Advanced venue configuration system

## Running Migrations

### Manual Application
To apply migrations manually to an existing database:

```bash
# Connect to the PostgreSQL container
docker exec -it postgres psql -U football_user -d football_ticketing

# Apply the migration
\i /docker-entrypoint-initdb.d/migrations/002_venue_configuration.sql
```

### Alternative: Using psql from host
```bash
# If PostgreSQL is accessible on localhost:5432
psql -h localhost -U football_user -d football_ticketing -f database/migrations/002_venue_configuration.sql
```

### Docker Volume Mount
To automatically apply migrations on container restart, mount the migrations folder:
```yaml
volumes:
  - ./database/init.sql:/docker-entrypoint-initdb.d/01-init.sql
  - ./database/migrations/002_venue_configuration.sql:/docker-entrypoint-initdb.d/02-venue_configuration.sql
```

## Migration 002: Venue Configuration System

This migration adds:
- `sports` table with 6 supported sports (Futebol, Hóquei em Patins, Futsal, Basquetebol, Andebol, Voleibol)
- `stands` table for stadium sections (Norte, Sul, Este, Oeste)
- `floors` table for multiple levels per stand
- `sectors` table for sections within floors
- `rows` table for seat rows within sectors
- `seats` table for individual seat management (optional)
- Automatic triggers for capacity calculation
- Views for venue hierarchy and statistics

### Changes to Existing Tables
- `venues` table: Added `sport_id`, `photo_url`, `total_stands`, `total_sectors`, `total_rows` columns

### Safety
All table creation statements use `IF NOT EXISTS` and column additions use `IF NOT EXISTS` to allow safe re-running of the migration.
