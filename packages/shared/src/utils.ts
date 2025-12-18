import crypto from 'crypto';

/**
 * Generate a unique QR code data for tickets
 */
export function generateQRCode(ticketId: string, matchId: string): string {
  const data = `${ticketId}:${matchId}:${Date.now()}`;
  const hash = crypto.createHash('sha256').update(data).digest('hex');
  return `TICKET-${hash.substring(0, 32).toUpperCase()}`;
}

/**
 * Generate a unique ticket number
 */
export function generateTicketNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = crypto.randomBytes(4).toString('hex').toUpperCase();
  return `TKT-${timestamp}-${random}`;
}

/**
 * Generate a session token for staff login
 */
export function generateSessionToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Convert snake_case to camelCase
 */
export function snakeToCamel(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

/**
 * Convert camelCase to snake_case
 */
export function camelToSnake(str: string): string {
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
}

/**
 * Transform database row to camelCase object
 */
export function transformRow<T>(row: any): T {
  const transformed: any = {};
  for (const key in row) {
    transformed[snakeToCamel(key)] = row[key];
  }
  return transformed as T;
}

/**
 * Transform array of database rows to camelCase objects
 */
export function transformRows<T>(rows: any[]): T[] {
  return rows.map(row => transformRow<T>(row));
}
