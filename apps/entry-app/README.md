# Football Ticketing Android Entry App

## Overview
Entry gate validation application with dual entry support: QR code scanning and NFC card tap, plus live capacity tracking.

## Features
- **Dual Entry Validation**: Support both QR code and NFC card entry methods
- **QR Code Scanning**: Scan QR codes from fan mobile tickets
- **NFC Card Tap**: Tap NFC cards for entry validation
- **Gate Validation**: Real-time ticket validation
- **Live Capacity Tracking**: Display current match attendance
- **Duplicate Detection**: Prevent multiple entries with same ticket

## Technical Requirements
- Android 8.0 (API level 26) or higher
- Camera for QR code scanning
- NFC-enabled device for NFC card tap
- Network connectivity to Entry API

## Key Components

### MainActivity
Main entry point with gate selection

### ScanActivity
Handles NFC and QR code scanning
- NFC tag reading
- QR code camera scanning
- Validation feedback (visual/audio)

### CapacityDashboard
Real-time capacity monitoring
- WebSocket connection for live updates
- Current attendance display
- Capacity percentage visualization

### ValidationResult
Displays validation results
- Success/failure indication
- Ticket details
- Entry logging

## API Integration
Base URL: `http://entry-api.localhost/api`

### Endpoints
- `POST /validation/validate` - Validate ticket entry
- `GET /validation/capacity/:matchId` - Get match capacity
- WebSocket: `/socket.io` - Real-time capacity updates

## Dual Entry Implementation
```kotlin
// QR Code Scanning (using ZXing)
val integrator = IntentIntegrator(this)
integrator.setDesiredBarcodeFormats(IntentIntegrator.QR_CODE)
integrator.setPrompt("Scan ticket QR code")
integrator.setCameraId(0)
integrator.setBeepEnabled(true)
integrator.setBarcodeImageEnabled(false)
integrator.initiateScan()

// Handle QR scan result
override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
    val result = IntentIntegrator.parseActivityResult(requestCode, resultCode, data)
    if (result != null && result.contents != null) {
        val qrCode = result.contents
        validateEntry(qrCode, "qr")
    }
}

// NFC Card Reading
val nfcAdapter = NfcAdapter.getDefaultAdapter(this)
override fun onNewIntent(intent: Intent) {
    if (NfcAdapter.ACTION_TAG_DISCOVERED == intent.action) {
        val tag = intent.getParcelableExtra<Tag>(NfcAdapter.EXTRA_TAG)
        val cardUid = tag?.id?.toHex()
        validateEntry(cardUid, "nfc")
    }
}
```

## WebSocket Integration
```kotlin
// Connect to capacity updates
val socket = IO.socket("http://entry-api.localhost")
socket.on("capacity-update") { args ->
    val data = args[0] as JSONObject
    updateCapacityDisplay(data)
}
socket.emit("subscribe-match", matchId)
```

## Build Instructions
```bash
./gradlew assembleDebug
```

## Installation
```bash
adb install app/build/outputs/apk/debug/app-debug.apk
```
