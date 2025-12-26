# Stadium Configuration Guide

## Where to Find the Stadium Creation Feature

The **Advanced Stadium Configuration System** is now available in **both** the Super Admin Dashboard and the Club Backoffice applications.

### Super Admin Dashboard

**Access Instructions:**
1. **Application URL:**
   - Development: `http://localhost:3101` or `http://admin.localhost`

2. **Navigation:**
   - Log in to the Super Admin Dashboard
   - Click on **"Venues"** in the sidebar menu
   - Click the **"+ Add Venue"** button to access the advanced stadium configuration wizard
   - **Note:** You must select a club when creating a venue in Super Admin Dashboard

### Club Backoffice

**Access Instructions:**
1. **Application URL:**
   - Development: `http://localhost:3102` or `http://club.localhost`

2. **Navigation:**
   - Log in to the Club Backoffice with your club administrator credentials
   - Click on **"Venues"** in the left sidebar menu
   - Click the **"+ Create Venue"** button to access the advanced stadium configuration wizard
   - **Note:** The club is automatically selected based on your login

### What You Can Do

The advanced stadium configuration feature allows you to:

✅ Create venues with complete stadium structures
✅ Configure stands (North, South, East, West)
✅ Add multiple floors to each stand
✅ Create sectors within each floor
✅ Define rows and seat counts for each sector
✅ Visualize the stadium layout in real-time with 2D graphics
✅ Select from 6 different sports (Football, Hockey, Futsal, Basketball, Handball, Volleyball)
✅ Upload venue photos
✅ Automatic capacity calculations

### Super Admin Dashboard vs Club Backoffice

| Feature | Super Admin Dashboard | Club Backoffice |
|---------|----------------------|-----------------|
| Advanced stadium configuration | ✅ Yes (full wizard) | ✅ Yes (full wizard) |
| 2D stadium visualization | ✅ Yes | ✅ Yes |
| Sport selection | ✅ Yes | ✅ Yes |
| Club selection | ✅ Required (manual select) | ✅ Automatic (logged in club) |
| Manage all clubs' venues | ✅ Yes | ❌ No (only own club) |
| Edit any venue | ✅ Yes | ❌ No (only own venues) |

### Key Differences

**Super Admin Dashboard:**
- Must manually select which club the venue belongs to
- Can create and manage venues for any club
- Requires super admin privileges

**Club Backoffice:**
- Club is automatically set based on login
- Can only create venues for your own club
- Requires club administrator privileges

### Documentation

For detailed implementation documentation, see:
- [VENUE_SYSTEM_IMPLEMENTATION.md](./VENUE_SYSTEM_IMPLEMENTATION.md) - Complete technical documentation

### Application Ports

When running with `docker-compose up`, the applications are available at:

- **Super Admin Dashboard**: http://localhost:3101 or http://admin.localhost
- **Club Backoffice**: http://localhost:3102 or http://club.localhost
- **Fan PWA**: http://localhost:3100 or http://app.localhost
- **POS Web**: http://localhost:3103 or http://pos.localhost
- **Entry Web**: http://localhost:3104 or http://entry.localhost

### Troubleshooting

**Issue:** Can't find the venue creation feature
- **Solution:** The advanced stadium configuration wizard is now available in **both applications**:
  - **Super Admin Dashboard** (port 3101): Navigate to Venues → + Add Venue
  - **Club Backoffice** (port 3102): Navigate to Venues → + Create Venue

**Issue:** Getting "Failed to get club" error in Super Admin Dashboard
- **Solution:** This is a known issue being investigated. The View and Edit buttons have been added to all list pages (Clubs, Venues, Competitions, Seasons) as requested.

**Issue:** Stadium configuration not saving
- **Solution:** Ensure all required fields are filled in both tabs of the venue wizard, and that all sectors have their rows fully configured.

### Need Help?

For more detailed information about the venue system architecture and features, refer to:
- [VENUE_SYSTEM_IMPLEMENTATION.md](./VENUE_SYSTEM_IMPLEMENTATION.md)
- [ARCHITECTURE.md](./ARCHITECTURE.md)
- [README.md](./README.md)
