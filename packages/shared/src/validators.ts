import { z } from 'zod';

// Club validators
export const clubCreateSchema = z.object({
  name: z.string().min(1).max(255),
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/),
  logoUrl: z.string().url().optional(),
  primaryColor: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
  secondaryColor: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
});

// Match validators
export const matchCreateSchema = z.object({
  homeTeam: z.string().min(1).max(255),
  awayTeam: z.string().min(1).max(255),
  matchDate: z.string().datetime(),
  venue: z.string().max(255).optional(),
  totalCapacity: z.number().int().positive(),
  ticketPrice: z.number().positive(),
});

export const matchUpdateSchema = matchCreateSchema.partial();

// Ticket validators
export const ticketPurchaseSchema = z.object({
  matchId: z.string().uuid(),
  seatSection: z.string().optional(),
  seatNumber: z.string().optional(),
  includeDeposit: z.boolean().optional(),
});

// NFC validators
export const nfcCardAssignSchema = z.object({
  cardUid: z.string().min(1).max(50),
  userId: z.string().uuid(),
  depositAmount: z.number().positive(),
});

export const nfcStockConfigSchema = z.object({
  totalCards: z.number().int().min(0),
  depositAmount: z.number().positive(),
});

// Fee validators
export const feeConfigSchema = z.object({
  platformFeePercentage: z.number().min(0).max(100),
  transactionFeeFixed: z.number().min(0),
});

// Staff login validator
export const staffLoginSchema = z.object({
  nfcCardUid: z.string().min(1).max(50),
});

// Entry validation
export const entryValidationSchema = z.object({
  ticketIdentifier: z.string(), // Can be QR code or NFC card UID
  matchId: z.string().uuid(),
  gateNumber: z.string().optional(),
  entryType: z.enum(['nfc', 'qr']),
});

// Refund validator
export const refundRequestSchema = z.object({
  ticketId: z.string().uuid().optional(),
  nfcCardId: z.string().uuid().optional(),
  reason: z.string().max(255).optional(),
});
