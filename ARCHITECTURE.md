# Football Ticketing Platform - Architecture Documentation

## System Overview

The Football Ticketing Platform is a multi-tenant SaaS solution that enables football clubs to manage ticket sales with reusable NFC cards, providing a comprehensive ecosystem for fans, staff, and administrators.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         TRAEFIK (Reverse Proxy)                  │
│                     HTTP/HTTPS Load Balancer                     │
└─────────────────────────────────────────────────────────────────┘
                                 │
        ┌────────────────────────┼────────────────────────┐
        │                        │                        │
        ▼                        ▼                        ▼
┌──────────────┐        ┌──────────────┐        ┌──────────────┐
│   Fan PWA    │        │ Super Admin  │        │Club Backoffice│
│   (React)    │        │  Dashboard   │        │  Dashboard    │
└──────────────┘        └──────────────┘        └──────────────┘
        │                        │                        │
        ▼                        ▼                        ▼
┌──────────────┐        ┌──────────────┐        ┌──────────────┐
│   Fan API    │        │Super Admin   │        │Club Backoffice│
│  (Node.js)   │        │     API      │        │     API       │
└──────────────┘        └──────────────┘        └──────────────┘
        │                        │                        │
        └────────────────────────┴────────────────────────┘
                                 │
        ┌────────────────────────┼────────────────────────┐
        │                        │                        │
        ▼                        ▼                        ▼
┌──────────────┐        ┌──────────────┐        ┌──────────────┐
│   POS API    │        │  Entry API   │        │  PostgreSQL  │
│  (Node.js)   │        │  (Node.js)   │        │   Database   │
└──────────────┘        └──────────────┘        └──────────────┘
        │                        │                        │
   ┌────┴────┐              ┌───┴────┐                   ▼
   ▼         ▼              ▼        ▼          ┌──────────────┐
┌────────┐┌──────┐    ┌────────┐┌───────┐     │   Keycloak   │
│POS App ││POS   │    │Entry   ││Entry  │     │    (Auth)    │
│(Android││Web   │    │App     ││Web    │     └──────────────┘
│)       ││(React│    │(Android││(React)│              │
└────────┘└──────┘    └────────┘└───────┘              ▼
                                            ┌──────────────┐
                                            │    Redis     │
                                            │   (Cache)    │
                                            └──────────────┘
                                                    │
                                                    ▼
                                            ┌──────────────┐
                                            │    Stripe    │
                                            │  (Payments)  │
                                            └──────────────┘
```

## Technology Stack

### Infrastructure
- **Docker**: Containerization
- **Docker Compose**: Service orchestration
- **Traefik v2.10**: Reverse proxy, load balancing, SSL termination

### Backend
- **Node.js 20**: Runtime environment
- **Express.js**: Web framework
- **TypeScript**: Type-safe development
- **PostgreSQL 15**: Primary database
- **Redis 7**: Caching and session storage

### Frontend
- **React 18**: UI framework
- **React Router**: Client-side routing
- **Axios**: HTTP client
- **PWA**: Progressive Web App capabilities

### Mobile
- **Android**: Native mobile apps
- **NFC**: Near-field communication
- **ZXing**: QR code scanning

### Authentication & Payments
- **Keycloak 23**: Multi-tenant authentication
- **Stripe**: Payment processing
- **JWT**: Token-based authentication

## Database Schema

### Multi-Tenant Design

The platform uses a single database with row-level tenancy through `club_id` foreign keys.

#### Core Tables

1. **clubs** - Tenant organizations
   - Keycloak realm association
   - Stripe connected account
   - Branding (colors, logo)

2. **users** - All platform users
   - Role-based access (super_admin, club_admin, staff, fan)
   - Keycloak ID linking
   - Club association

3. **nfc_cards** - Reusable NFC cards
   - Lifecycle tracking (available, assigned, blocked, lost)
   - Deposit management
   - User assignment

4. **matches** - Football matches
   - Real-time capacity tracking
   - Dynamic pricing
   - Status management

5. **tickets** - Digital tickets
   - QR code generation (always included)
   - Optional NFC card linking
   - Purchase tracking

6. **transactions** - Financial records
   - Stripe payment intents
   - Multi-type support (purchase, deposit, refund)
   - Audit trail

7. **entry_logs** - Gate validations
   - Duplicate detection
   - Capacity enforcement
   - Validation audit

## API Architecture

### Microservices Pattern

Each API service is independently deployable and focuses on a specific domain:

#### 1. Super Admin API (Port 3001)
**Purpose**: Platform management and club provisioning

**Key Endpoints**:
- `POST /api/clubs` - Auto-provision club with Keycloak + Stripe
- `POST /api/nfc-stock/:clubId` - Configure NFC inventory
- `POST /api/fee-config/:clubId` - Set platform fees

**Responsibilities**:
- Keycloak realm creation
- Stripe connected account setup
- Platform-wide configuration

#### 2. Fan API (Port 3003)
**Purpose**: Ticket purchasing and match browsing

**Key Endpoints**:
- `GET /api/matches` - Browse matches
- `POST /api/tickets/purchase` - 3-click checkout
- `GET /api/tickets/:ticketId` - Ticket with QR code

**Responsibilities**:
- Match calendar
- Ticket sales
- QR code generation and NFC card linking
- Stripe payment processing

#### 3. POS API (Port 3004)
**Purpose**: Point-of-sale operations

**Key Endpoints**:
- `POST /api/auth/nfc-login` - Staff authentication
- `POST /api/payments/assign-nfc` - NFC card sales
- `POST /api/refunds` - Process refunds

**Responsibilities**:
- NFC staff login
- Payment processing
- NFC card assignment
- Deposit collection
- Refund processing

#### 4. Entry API (Port 3005)
**Purpose**: Gate validation and capacity tracking

**Key Endpoints**:
- `POST /api/validation/validate` - Validate QR code or NFC entry
- `GET /api/validation/capacity/:matchId` - Live capacity
- WebSocket: Real-time updates

**Responsibilities**:
- Dual entry validation (QR code and NFC card)
- Duplicate prevention
- Capacity enforcement
- Live attendance tracking

#### 5. Club Backoffice API (Port 3002)
**Purpose**: Club management

**Key Endpoints**:
- `POST /api/matches` - Create matches
- `GET /api/nfc/inventory/:clubId` - NFC inventory
- `GET /api/reports/sales/:clubId` - Analytics

**Responsibilities**:
- Match management
- Inventory tracking
- Reporting and analytics

## Data Flow

### Ticket Purchase Flow

```
1. Fan → Fan PWA → Fan API
2. Fan API → PostgreSQL (check availability)
3. Fan API → Stripe (create payment intent)
4. Fan PWA → Stripe (collect payment)
5. Stripe → Fan API (webhook confirmation)
6. Fan API → PostgreSQL (create ticket)
7. Fan API → QR code generation
8. Fan API → Fan PWA (return ticket + QR)
```

### NFC Card Assignment Flow

```
1. Staff → POS App → POS API (NFC login)
2. POS API → PostgreSQL (validate staff card)
3. Fan → POS App (payment for deposit)
4. POS App → POS API (assign NFC)
5. POS API → PostgreSQL (update card status)
6. POS API → Stripe (process deposit)
7. POS API → PostgreSQL (record transaction)
```

### Entry Validation Flow

```
1. Fan → Entry App (scan QR code or tap NFC)
2. Entry App → Entry API (validate with entryType: 'qr' or 'nfc')
3. Entry API → PostgreSQL (check ticket by qr_code_data or nfc_card_id)
4. Entry API → PostgreSQL (check duplicates)
5. Entry API → PostgreSQL (log entry with entry_type)
6. Entry API → PostgreSQL (update attendance)
7. Entry API → WebSocket (broadcast capacity)
8. Entry App ← Entry API (validation result)
```

## Security

### Authentication
- **Keycloak**: Centralized identity management
- **JWT**: Stateless authentication
- **Realms**: Per-club isolation

### Authorization
- **RBAC**: Role-based access control
- **Scopes**: API-level permissions
- **Middleware**: Request validation

### Payment Security
- **PCI Compliance**: Stripe handles card data
- **Payment Intents**: Secure payment flow
- **Webhooks**: Server-side confirmation

### NFC Security
- **Card UID Validation**: Database verification
- **Status Checks**: Active card requirement
- **Deposit Tracking**: Financial accountability

## Scalability

### Horizontal Scaling
- Stateless APIs enable load balancing
- Redis for session sharing
- PostgreSQL read replicas

### Caching Strategy
- Redis caching for:
  - Match listings
  - User sessions
  - NFC card lookups

### Database Optimization
- Indexed foreign keys
- Partitioning by club_id
- Connection pooling

## Monitoring & Observability

### Recommended Tools
- **Prometheus**: Metrics collection
- **Grafana**: Visualization
- **ELK Stack**: Centralized logging
- **Sentry**: Error tracking

### Key Metrics
- API response times
- Database query performance
- Payment success rates
- NFC validation speed
- Match attendance rates

## Deployment

### Development
```bash
docker-compose up
```

### Production Considerations
1. **SSL/TLS**: Traefik + Let's Encrypt
2. **Environment Variables**: Secrets management
3. **Database Backups**: Automated backups
4. **Scaling**: Kubernetes or Docker Swarm
5. **CDN**: Static asset delivery
6. **Monitoring**: Health checks and alerts

## Future Enhancements

### Phase 2
- Mobile apps (iOS)
- Advanced analytics
- Loyalty programs
- Season passes
- Multi-language support

### Phase 3
- AI-powered pricing
- Fraud detection
- Blockchain ticketing
- Biometric entry
- AR stadium navigation

## Support & Maintenance

### Critical Paths
1. Payment processing (Stripe)
2. Entry validation (gates)
3. NFC card management
4. Authentication (Keycloak)

### Backup Strategy
- Database: Daily automated backups
- Configuration: Version controlled
- Secrets: Encrypted vault storage

### Disaster Recovery
- RTO: 4 hours
- RPO: 1 hour
- Failover: Database replication
- Rollback: Blue-green deployment
