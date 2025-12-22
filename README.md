# Football Ticketing Platform

A comprehensive multi-tenant platform for football clubs featuring reusable NFC cards, Android POS/Entry apps, fan PWA, and administrative dashboards.

## 🎯 Features

### Super Admin Dashboard
- **Auto-provisioning**: Automatically provision new clubs with Keycloak realms and Stripe connected accounts
- **NFC Stock Management**: Configure NFC card inventory and deposit amounts per club
- **Fee Configuration**: Set platform fees and transaction fees for each club

### Fan PWA
- **Match Calendar**: Browse upcoming matches with real-time availability
- **3-Click Checkout**: Streamlined ticket purchase flow (select match → add deposit → pay)
- **Dual Entry Methods**: Instant digital ticket delivery with both QR code and optional NFC card support
- **QR Code Entry**: Contactless entry via QR code scanning
- **NFC Card Entry**: Optional reusable NFC cards for tap-to-enter convenience
- **Deposit Management**: Manage NFC card deposits (refundable)

### POS App (Android)
- **NFC Staff Login**: Staff authenticate by tapping their NFC card
- **Payment Processing**: Process ticket purchases and NFC card sales
- **NFC Assignment**: Assign NFC cards to fans with deposit collection
- **End-Match Refunds**: Process ticket and deposit refunds

### Entry App (Android)
- **Dual Entry Validation**: Support both QR code scanning and NFC card tap for ticket validation
- **QR Code Scanning**: Scan QR codes from fan mobile tickets
- **NFC Card Tap**: Validate entries via NFC card tap
- **Live Capacity Tracking**: Real-time attendance monitoring with WebSocket updates
- **Duplicate Prevention**: Detect and prevent duplicate entries
- **Multi-Gate Support**: Manage multiple entry points simultaneously

### Club Backoffice
- **Match Setup**: Create and configure matches with pricing and capacity
- **NFC Inventory**: Monitor NFC card stock and assignments
- **Reports**: Sales analytics and attendance reports

## 🏗️ Architecture

### Services
- **Traefik**: Reverse proxy and load balancer
- **PostgreSQL**: Primary database with multi-tenant schema
- **Redis**: Session management and caching
- **Keycloak**: Multi-tenant authentication and authorization
- **Node.js APIs**: Microservices for each domain (5 separate APIs)
- **React PWAs**: Progressive web apps for fan and admin interfaces

### Database Schema
Multi-tenant design with:
- Clubs (tenants) with Keycloak realm and Stripe account linking
- Users with role-based access (super_admin, club_admin, staff, fan)
- NFC cards with lifecycle tracking (available, assigned, blocked, lost)
- Matches with real-time capacity tracking
- Tickets with dual entry support: QR code (always) and NFC card (optional)
- Transactions with Stripe integration
- Entry logs for gate validation (supports both QR and NFC methods equally)
- Refunds with audit trail

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose
- Node.js 20+ (for local development)
- Stripe account (for payment processing)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/tiagorebelo97/Football-Ticketing.git
cd Football-Ticketing
```

2. **Configure environment**
```bash
cp .env.example .env
# Edit .env and add your Stripe API keys
```

3. **Start the platform**
```bash
docker-compose up
```

4. **Access the applications**
- Fan PWA: http://app.localhost
- Super Admin Dashboard: http://admin.localhost
- Club Backoffice: http://club.localhost
- Keycloak: http://auth.localhost or http://localhost:8081
- Traefik Dashboard: http://localhost:8080

### API Endpoints
- Super Admin API: http://super-admin-api.localhost or http://localhost:3001
- Club Backoffice API: http://club-api.localhost or http://localhost:3002
- Fan API: http://fan-api.localhost or http://localhost:3003
- POS API: http://pos-api.localhost or http://localhost:3004
- Entry API: http://entry-api.localhost or http://localhost:3005

## 📱 Mobile Apps

### POS App
See `apps/pos-app/README.md` for:
- NFC staff login implementation
- Payment processing flows
- NFC card assignment process
- Refund handling

### Entry App
See `apps/entry-app/README.md` for:
- NFC/QR scanning implementation
- Gate validation logic
- Live capacity tracking via WebSocket
- Duplicate entry prevention

## 🔧 Development

### Project Structure
```
Football-Ticketing/
├── apps/
│   ├── super-admin-api/      # Club provisioning & platform management
│   ├── club-backoffice-api/  # Match setup & club management
│   ├── fan-api/               # Ticket purchasing & match calendar
│   ├── pos-api/               # POS operations & refunds
│   ├── entry-api/             # Gate validation & capacity tracking
│   ├── fan-pwa/               # Fan progressive web app
│   ├── super-admin-dashboard/ # Admin interface (React)
│   ├── club-backoffice/       # Club management interface (React)
│   ├── pos-app/               # Android POS application
│   └── entry-app/             # Android entry gate application
├── packages/
│   └── shared/                # Shared types, utilities, validators
├── database/
│   └── init.sql               # Database schema initialization
└── docker-compose.yml         # Service orchestration
```

### Building Individual Services
```bash
# Build shared package
cd packages/shared && npm run build

# Build specific API
cd apps/super-admin-api && npm run build

# Build frontend app
cd apps/fan-pwa && npm run build
```

### Running in Development Mode
```bash
# Install dependencies
npm install

# Start individual service
cd apps/fan-api && npm run dev
```

## 🔐 Security

### Authentication
- Keycloak handles all authentication with separate realms per club
- JWT tokens for API authentication
- Role-based access control (RBAC)

### Payment Security
- PCI-compliant Stripe integration
- No card data stored in database
- Stripe Connected Accounts for multi-tenant payouts

### NFC Security
- Card UIDs validated against database
- Staff cards require active status
- Deposit tracking prevents fraud

## 📊 API Documentation

### Super Admin API
- `POST /api/clubs` - Provision new club (creates Keycloak realm + Stripe account)
- `GET /api/clubs` - List all clubs
- `POST /api/nfc-stock/:clubId` - Configure NFC stock
- `POST /api/fee-config/:clubId` - Configure fees

### Fan API
- `GET /api/matches` - List upcoming matches
- `POST /api/tickets/purchase` - Purchase ticket (3-click flow)
- `GET /api/tickets/:ticketId` - Get ticket with QR code and NFC card info

### POS API
- `POST /api/auth/nfc-login` - NFC staff authentication
- `POST /api/payments/assign-nfc` - Assign NFC card to fan
- `POST /api/refunds` - Process refund

### Entry API
- `POST /api/validation/validate` - Validate QR code or NFC entry
- `GET /api/validation/capacity/:matchId` - Get live capacity
- WebSocket: Real-time capacity updates

### Club Backoffice API
- `POST /api/matches` - Create match
- `GET /api/nfc/inventory/:clubId` - View NFC inventory
- `GET /api/reports/sales/:clubId` - Sales reports

## 🧪 Testing

### Database Testing
```bash
# Connect to PostgreSQL
docker exec -it postgres psql -U football_user -d football_ticketing

# Run sample queries
SELECT * FROM clubs;
SELECT * FROM nfc_cards WHERE status = 'available';
```

### API Testing
```bash
# Health checks
curl http://localhost:3001/health  # Super Admin API
curl http://localhost:3003/health  # Fan API
curl http://localhost:3005/health  # Entry API
```

## 🛠️ Deployment

### Production Considerations
1. **Environment Variables**: Set production Stripe keys and strong passwords
2. **SSL/TLS**: Configure Traefik with Let's Encrypt for HTTPS
3. **Database Backups**: Implement regular PostgreSQL backups
4. **Scaling**: Scale APIs horizontally using Docker Swarm or Kubernetes
5. **Monitoring**: Add Prometheus/Grafana for metrics
6. **Logging**: Centralize logs with ELK stack

### Docker Production Build
```bash
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

## 📝 License

MIT License

## 🤝 Contributing

Contributions welcome! Please read the contributing guidelines before submitting PRs.

## 📧 Support

For issues and questions, please use the GitHub issue tracker.