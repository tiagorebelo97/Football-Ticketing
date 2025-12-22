# Entry Web Application

## Overview
Web-based version of the Android Entry gate validation application, providing browser-based access to entry validation and capacity tracking.

## Features

### 🚪 Multi-Gate Support
- Select from multiple entry gates (Gate A, B, C, D, E)
- Independent validation per gate
- Easy gate switching

### 📷 QR Code Scanning
- **Webcam-based QR scanning**: Uses device camera to scan QR codes
- Real-time scanning with visual feedback
- Powered by html5-qrcode library
- Works on desktop and mobile browsers

### 📱 NFC Card Validation
- **Manual NFC entry**: Enter NFC card IDs manually
- Simulates NFC tap functionality
- Instant validation feedback
- Support for both entry methods equally

### ✅ Real-time Validation
- Instant validation results
- Visual success/error indicators
- Display ticket and fan information
- Duplicate entry prevention

### 📊 Live Capacity Dashboard
- Real-time attendance tracking
- WebSocket integration for live updates
- Visual capacity indicators (progress bar)
- Current attendance, total capacity, available spots
- Color-coded warnings (green, orange, red)

## Technical Stack

- **React 18**: UI framework
- **TypeScript**: Type-safe development
- **React Router**: Client-side routing
- **Axios**: HTTP client for API communication
- **Socket.IO Client**: WebSocket for real-time updates
- **html5-qrcode**: QR code scanning library
- **Nginx**: Production web server

## Access Points

- **Development**: http://localhost:3104
- **Production**: http://entry.localhost
- **Traefik**: Integrated with reverse proxy

## Usage

### Gate Selection
1. Navigate to http://entry.localhost
2. Select which entry gate you're managing
3. Choose from available gates (A, B, C, D, E)

### QR Code Validation
1. Click "QR Code Scanner" mode
2. Allow camera access when prompted
3. Point camera at fan's QR code
4. Validation happens automatically
5. See approval/denial result

### NFC Card Validation
1. Click "NFC Manual Entry" mode
2. Enter the NFC Card ID in the text field
3. Click "Validate Entry" or press Enter
4. See validation result
5. (In Android app, fan would tap their NFC card)

### Capacity Monitoring
1. Click "Capacity Dashboard" from any screen
2. Enter the Match ID you want to monitor
3. Click "Load Capacity Data"
4. View real-time capacity updates
5. WebSocket connection shows live attendance changes

## API Integration

Base URL: `http://entry-api.localhost`

### HTTP Endpoints
- `POST /api/validation/validate` - Validate entry (QR or NFC)
- `GET /api/validation/capacity/:matchId` - Get match capacity

### WebSocket Events
- `connect` - Establish WebSocket connection
- `subscribe-match` - Subscribe to match capacity updates
- `capacity-update` - Receive real-time capacity changes
- `disconnect` - Handle disconnection

## Environment Variables

- `REACT_APP_ENTRY_API_URL`: Entry API base URL (default: `http://entry-api.localhost`)

## Dual Entry System

The Entry Web App supports both entry methods equally:

### QR Code Entry
- **Use Case**: Fans with digital tickets on their phones
- **Method**: Scan QR code from fan's mobile device
- **Advantages**: No additional hardware needed

### NFC Card Entry  
- **Use Case**: Fans with reusable NFC cards
- **Method**: Manual NFC card ID entry (simulates tap)
- **Advantages**: Fast, convenient for regular attendees

Both methods validate against the same ticket database and provide the same level of security and duplicate prevention.

## Differences from Android App

### QR Code Scanning
- **Android**: Uses device camera with ZXing library
- **Web**: Uses html5-qrcode with device webcam
- **Both**: Real-time scanning with instant validation

### NFC Functionality
- **Android**: Physical NFC tap using device NFC reader
- **Web**: Manual NFC card ID entry via text input
- **Both**: Same backend validation logic

### Capacity Dashboard
- **Android**: Native UI with Material Design
- **Web**: Responsive web UI with CSS
- **Both**: Same WebSocket real-time updates

## Building and Deployment

### Development
```bash
cd apps/entry-web
npm install
npm start
```

### Production Build
```bash
cd apps/entry-web
npm run build
```

### Docker Build
```bash
docker-compose build entry-web
docker-compose up entry-web
```

## Browser Compatibility

- Chrome/Edge: Full support (recommended)
- Firefox: Full support
- Safari: Full support (iOS 11+)
- Camera access required for QR scanning
- WebSocket support required for live capacity

## Security Notes

- All validation happens server-side
- Duplicate entry prevention enforced by API
- WebSocket connections are secure
- HTTPS recommended for camera access in production
- Rate limiting on validation endpoints

## Performance Considerations

- QR scanning runs at 10 FPS for optimal performance
- WebSocket connections are lightweight
- Capacity updates are throttled on backend
- Client-side caching for better UX

## Future Enhancements

- Offline mode with sync queue
- Enhanced analytics dashboard
- Multi-language support
- Voice feedback for validation results
- Integration with stadium screens
- Advanced reporting features
- Staff performance metrics
