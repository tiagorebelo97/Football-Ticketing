# Stadium Configuration Guide

## Where to Find the Stadium Creation Feature

The **Advanced Stadium Configuration System** is available in the **Club Backoffice** application, not in the Super Admin Dashboard.

### Access Instructions

1. **Application URL:**
   - Development: `http://localhost:3102` or `http://club.localhost`
   - The Club Backoffice is a separate application from the Super Admin Dashboard

2. **Navigation:**
   - Log in to the Club Backoffice with your club administrator credentials
   - Click on **"Venues"** in the left sidebar menu
   - Click the **"+ Create Venue"** button to access the advanced stadium configuration wizard

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
| Basic venue creation | ✅ Yes (name, city, capacity) | ✅ Yes (basic info) |
| Advanced stadium configuration | ❌ No | ✅ Yes (stands, floors, sectors, rows) |
| 2D stadium visualization | ❌ No | ✅ Yes |
| Sport selection | ❌ No | ✅ Yes |
| Manage all clubs' venues | ✅ Yes | ❌ No (only own club) |

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
- **Solution:** Make sure you're logged into the **Club Backoffice** (port 3102), not the Super Admin Dashboard (port 3101)

**Issue:** Getting "Failed to get club" error in Super Admin Dashboard
- **Solution:** This is a known issue being investigated. The View and Edit buttons have been added to all list pages (Clubs, Venues, Competitions, Seasons) as requested.

**Issue:** Stadium configuration not saving
- **Solution:** Ensure all required fields are filled in both tabs of the venue wizard, and that all sectors have their rows fully configured.

### Need Help?

For more detailed information about the venue system architecture and features, refer to:
- [VENUE_SYSTEM_IMPLEMENTATION.md](./VENUE_SYSTEM_IMPLEMENTATION.md)
- [ARCHITECTURE.md](./ARCHITECTURE.md)
- [README.md](./README.md)
