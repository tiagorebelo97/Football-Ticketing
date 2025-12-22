# POS Web Application

## Overview
Web-based version of the Android POS (Point of Sale) application, providing browser-based access to POS operations for staff members.

## Features

### 🔐 Staff Authentication
- **Simulated NFC Login**: Web interface for staff authentication
- Manual NFC card ID entry (replaces physical NFC tap)
- Session management

### 💳 Payment Processing
- Process ticket purchases
- Handle multiple ticket types (Standard, VIP, Student)
- Amount calculation and validation
- Integration with POS API

### 📱 NFC Card Assignment
- Assign NFC cards to fans
- Deposit collection interface
- Card status tracking
- Manual card ID input (simulates NFC scanning)

### 💰 Refund Processing
- Process ticket refunds
- Process deposit refunds (card returns)
- Combined ticket and deposit refunds
- Reason tracking and audit trail

## Technical Stack

- **React 18**: UI framework
- **TypeScript**: Type-safe development
- **React Router**: Client-side routing
- **Axios**: HTTP client for API communication
- **Nginx**: Production web server

## Access Points

- **Development**: http://localhost:3103
- **Production**: http://pos.localhost
- **Traefik**: Integrated with reverse proxy

## Usage

### Staff Login
1. Navigate to http://pos.localhost
2. Enter your NFC Card ID (in Android app, this would be done by tapping your staff NFC card)
3. Click "Login" to authenticate

### Payment Processing
1. From dashboard, click "Process Payment"
2. Enter Match ID, Fan ID, ticket type, and amount
3. Click "Process Payment" to complete the transaction

### NFC Card Assignment
1. From dashboard, click "NFC Card Assignment"
2. Enter the NFC Card ID (simulates scanning)
3. Enter Fan ID and deposit amount
4. Click "Assign NFC Card" to link the card to the fan

### Refund Processing
1. From dashboard, click "Process Refund"
2. Select refund type (Ticket, Deposit, or Both)
3. Enter required IDs and reason
4. Click "Process Refund" to complete

## API Integration

Base URL: `http://pos-api.localhost/api`

### Endpoints Used
- `POST /auth/nfc-login` - Staff authentication
- `POST /payments/process` - Process payment
- `POST /payments/assign-nfc` - Assign NFC card
- `POST /refunds` - Process refund

## Environment Variables

- `REACT_APP_POS_API_URL`: POS API base URL (default: `http://pos-api.localhost/api`)

## Differences from Android App

### NFC Functionality
- **Android**: Uses device NFC reader for card tapping
- **Web**: Manual NFC card ID entry via text input

### Advantages
- No special hardware required
- Access from any device with a browser
- Easier for testing and development
- Cross-platform compatibility

### Limitations
- Cannot read NFC cards directly (requires manual entry)
- Requires keyboard input for card IDs

## Building and Deployment

### Development
```bash
cd apps/pos-web
npm install
npm start
```

### Production Build
```bash
cd apps/pos-web
npm run build
```

### Docker Build
```bash
docker-compose build pos-web
docker-compose up pos-web
```

## Security Notes

- Staff must have valid NFC card IDs registered in the system
- All API calls are made through the nginx proxy
- Session management handled by backend API
- HTTPS recommended for production use

## Future Enhancements

- Barcode scanner integration for ticket scanning
- Receipt printer integration
- Offline mode with sync
- Enhanced reporting features
- Multi-language support
