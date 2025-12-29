# Club Members Management Feature

## Overview

The Club Members Management feature allows club administrators to manage their club's members (sócios), track membership quotas, and import members in bulk from Excel files.

## Features

### 1. Member Management
- **List Members**: View all club members with filtering and search capabilities
- **Add Member**: Create new member records with detailed information
- **View Member Details**: See full member information and quota payment history
- **Update Member**: Edit member information
- **Deactivate Member**: Soft delete members by changing their status to 'cancelled'

### 2. Member Information
Each member record includes:
- Member number (unique within club)
- Personal information (name, email, phone, date of birth)
- Address (address, city, postal code, country)
- Membership details (status, type, member since date)
- Quota information (amount, frequency)
- Notes

### 3. Member Types
- **Regular**: Standard membership
- **Premium**: Premium membership with enhanced benefits
- **VIP**: Very Important Person membership
- **Junior**: Youth membership
- **Senior**: Senior/veteran membership

### 4. Member Status
- **Active**: Currently active member
- **Suspended**: Temporarily suspended membership
- **Cancelled**: Deactivated membership

### 5. Quota Management
- Track monthly, quarterly, or annual quota payments
- Record payment details (date, amount, period, method, reference)
- View payment history
- Track overdue quotas
- Support multiple payment methods: Cash, Card, Bank Transfer, Stripe

### 6. Excel Import
- Bulk import members from Excel (.xlsx) or CSV files
- Flexible column name mapping (supports English and Portuguese)
- Automatic conflict handling (updates existing members)
- Import report showing success/failure counts
- Template download for proper formatting

## API Endpoints

### Members
```
GET    /api/clubs/:clubId/members              - List all members
GET    /api/clubs/:clubId/members/stats        - Get member statistics
POST   /api/clubs/:clubId/members              - Create new member
POST   /api/clubs/:clubId/members/import       - Import members from Excel
GET    /api/clubs/members/:id                  - Get member details
PUT    /api/clubs/members/:id                  - Update member
DELETE /api/clubs/members/:id                  - Deactivate member
```

### Quotas
```
GET    /api/clubs/members/:id/quotas           - Get member quota history
POST   /api/clubs/members/:id/quotas           - Register quota payment
```

## Database Schema

### club_members Table
```sql
- id (UUID, Primary Key)
- club_id (UUID, Foreign Key to clubs)
- member_number (VARCHAR, Unique per club)
- first_name, last_name (VARCHAR)
- email (VARCHAR, Unique per club)
- phone (VARCHAR)
- date_of_birth (DATE)
- address, city, postal_code, country (VARCHAR/TEXT)
- member_since (DATE)
- status (VARCHAR: active, suspended, cancelled)
- member_type (VARCHAR: regular, premium, vip, junior, senior)
- quota_amount (DECIMAL)
- quota_frequency (VARCHAR: monthly, quarterly, annual)
- notes (TEXT)
- user_id (UUID, Optional link to user account)
```

### member_quotas Table
```sql
- id (UUID, Primary Key)
- member_id (UUID, Foreign Key to club_members)
- club_id (UUID, Foreign Key to clubs)
- amount (DECIMAL)
- payment_date (DATE)
- period_start, period_end (DATE)
- payment_method (VARCHAR: cash, card, transfer, stripe)
- status (VARCHAR: pending, paid, overdue, cancelled)
- reference (VARCHAR, Payment reference)
- notes (TEXT)
- recorded_by_user_id (UUID)
```

## Excel Import Format

The Excel import supports flexible column names in English and Portuguese:

### Required Columns
- **Member Number** (Número de Sócio): Unique identifier
- **First Name** (Nome): Member's first name
- **Last Name** (Apelido): Member's last name
- **Email** (E-mail): Email address

### Optional Columns
- **Phone** (Telefone)
- **Date of Birth** (Data de Nascimento)
- **Address** (Morada)
- **City** (Cidade)
- **Postal Code** (Código Postal)
- **Country** (País)
- **Member Since** (Sócio Desde)
- **Status**
- **Member Type** (Tipo de Sócio)
- **Quota Amount** (Quota)
- **Quota Frequency** (Frequência de Quota)
- **Notes** (Notas)

### Example Template
```
Member Number | First Name | Last Name | Email                    | Phone           | Member Since | Status | Member Type | Quota Amount | Quota Frequency
12345        | João       | Silva     | joao.silva@example.com   | +351912345678   | 2020-01-01  | active | regular     | 25.00       | monthly
12346        | Maria      | Santos    | maria.santos@example.com | +351923456789   | 2021-06-15  | active | premium     | 50.00       | monthly
```

## Usage Guide

### Adding a New Member
1. Navigate to "Club Members" in the sidebar
2. Click "Add New Member"
3. Fill in the required fields (member number, name, email, member since)
4. Optionally fill in additional information
5. Click "Create Member"

### Importing Members from Excel
1. Navigate to "Club Members" in the sidebar
2. Click "Import Excel"
3. Download the template (optional)
4. Click "Choose File" and select your Excel file
5. Click "Import"
6. Review the import results

### Recording Quota Payments
1. Navigate to member details page
2. Click "Add Payment"
3. Fill in payment details:
   - Amount
   - Payment date
   - Period covered (start and end dates)
   - Payment method
   - Optional reference and notes
4. Click "Save Payment"

### Viewing Member Statistics
The member list page displays:
- Total members count
- Active members count
- Overdue quotas count
- Total revenue from paid quotas

## Security Considerations

1. **Authentication**: All endpoints require authentication as a club admin
2. **Authorization**: Members can only be accessed/modified by admins of the same club
3. **Data Validation**: Input validation on all fields
4. **File Upload**: 10MB file size limit for Excel imports
5. **SQL Injection**: Parameterized queries prevent SQL injection
6. **Unique Constraints**: Email and member number must be unique per club

## Future Enhancements

Potential future improvements:
- Email notifications for overdue quotas
- Automatic quota payment reminders
- Member self-service portal
- Export members to Excel/CSV
- Advanced reporting and analytics
- Payment integration with Stripe for online quota payments
- Membership renewal workflows
- Member cards generation with QR codes
