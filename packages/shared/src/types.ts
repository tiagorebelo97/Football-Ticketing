// Shared types and interfaces
export interface Club {
  id: string;
  name: string;
  slug: string;
  keycloakRealmId: string;
  stripeAccountId?: string;
  logoUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  keycloakId: string;
  clubId?: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  role: 'super_admin' | 'club_admin' | 'staff' | 'fan';
  createdAt: Date;
  updatedAt: Date;
}

export interface NFCCard {
  id: string;
  clubId: string;
  cardUid: string;
  status: 'available' | 'assigned' | 'blocked' | 'lost';
  assignedToUserId?: string;
  depositPaid: boolean;
  depositAmount?: number;
  assignedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Match {
  id: string;
  clubId: string;
  homeTeam: string;
  awayTeam: string;
  matchDate: Date;
  venue?: string;
  totalCapacity: number;
  currentAttendance: number;
  ticketPrice: number;
  status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

export interface Ticket {
  id: string;
  matchId: string;
  userId: string;
  nfcCardId?: string;
  ticketNumber: string;
  qrCodeData: string;
  status: 'active' | 'used' | 'cancelled' | 'refunded';
  price: number;
  depositAmount: number;
  seatSection?: string;
  seatNumber?: string;
  purchasedAt: Date;
  usedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Transaction {
  id: string;
  clubId: string;
  userId?: string;
  ticketId?: string;
  nfcCardId?: string;
  type: 'ticket_purchase' | 'deposit' | 'refund' | 'nfc_assignment';
  amount: number;
  stripePaymentIntentId?: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface EntryLog {
  id: string;
  matchId: string;
  ticketId: string;
  entryType: 'nfc' | 'qr';
  entryTime: Date;
  gateNumber?: string;
  validationStatus: 'valid' | 'invalid' | 'duplicate';
  createdAt: Date;
}

export interface NFCStockConfig {
  id: string;
  clubId: string;
  totalCards: number;
  availableCards: number;
  depositAmount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface FeeConfig {
  id: string;
  clubId: string;
  platformFeePercentage: number;
  transactionFeeFixed: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface StaffSession {
  id: string;
  userId: string;
  nfcCardId: string;
  clubId: string;
  sessionToken: string;
  loginTime: Date;
  logoutTime?: Date;
  isActive: boolean;
  createdAt: Date;
}

export interface Refund {
  id: string;
  transactionId: string;
  ticketId?: string;
  nfcCardId?: string;
  amount: number;
  reason?: string;
  stripeRefundId?: string;
  status: 'pending' | 'completed' | 'failed';
  processedByUserId?: string;
  createdAt: Date;
  updatedAt: Date;
}
