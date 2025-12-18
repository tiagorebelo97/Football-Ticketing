# Football Ticketing Android POS App

## Overview
Point of Sale application for NFC staff login, payment processing, and refund management.

## Features
- **NFC Staff Login**: Staff can tap their NFC card to log in
- **Payment Processing**: Process ticket purchases and NFC card deposits
- **NFC Card Assignment**: Assign NFC cards to fans with deposit collection
- **Refund Processing**: Process end-of-match refunds for tickets and deposits

## Technical Requirements
- Android 8.0 (API level 26) or higher
- NFC-enabled device
- Network connectivity to POS API

## Key Components

### MainActivity
Main entry point for the POS app

### NFCLoginActivity
Handles NFC-based staff authentication
- Reads NFC card UID
- Validates against POS API
- Creates staff session

### PaymentActivity
Processes payments for tickets and deposits
- Integration with payment gateway
- Transaction recording
- Receipt generation

### NFCAssignmentActivity
Assigns NFC cards to fans
- Scans available NFC card
- Collects deposit
- Links card to user account

### RefundActivity
Handles end-of-match refunds
- Validates ticket/NFC card
- Processes refund
- Updates inventory

## API Integration
Base URL: `http://pos-api.localhost/api`

### Endpoints
- `POST /auth/nfc-login` - Staff NFC login
- `POST /payments/process` - Process payment
- `POST /payments/assign-nfc` - Assign NFC card
- `POST /refunds` - Process refund

## NFC Implementation
```kotlin
// Example NFC reading
val nfcAdapter = NfcAdapter.getDefaultAdapter(this)
val tag = intent.getParcelableExtra<Tag>(NfcAdapter.EXTRA_TAG)
val tagId = tag?.id?.toHex()
```

## Build Instructions
```bash
./gradlew assembleDebug
```

## Installation
```bash
adb install app/build/outputs/apk/debug/app-debug.apk
```
