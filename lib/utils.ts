// ============================================================
// Presentify ERP — Shared Utility Functions
// ============================================================

/**
 * Sanitize text input: strips HTML-like tags, trims whitespace,
 * and enforces a maximum character length.
 */
export function sanitizeInput(value: string, maxLength = 500): string {
  return value
    .replace(/[<>]/g, '') // strip potential HTML injection chars
    .replace(/javascript:/gi, '') // strip JS protocol
    .trim()
    .slice(0, maxLength);
}

/**
 * Sanitize a numeric input to be within [min, max].
 * Returns null if the value is invalid or out of range.
 */
export function sanitizeNumericInput(
  value: string,
  min: number,
  max: number
): number | null {
  const num = parseInt(value, 10);
  if (isNaN(num)) return null;
  if (num < min || num > max) return null;
  return num;
}

/**
 * Calculate a letter grade and grade points from total marks (out of 100).
 * Follows a standard 10-point grading scale.
 */
export function getGrade(total: number): { grade: string; points: number; color: string } {
  if (total >= 90) return { grade: 'O', points: 10, color: 'text-violet-700 bg-violet-100 border-violet-200' };
  if (total >= 80) return { grade: 'A+', points: 9, color: 'text-blue-700 bg-blue-100 border-blue-200' };
  if (total >= 70) return { grade: 'A', points: 8, color: 'text-indigo-700 bg-indigo-100 border-indigo-200' };
  if (total >= 60) return { grade: 'B+', points: 7, color: 'text-emerald-700 bg-emerald-100 border-emerald-200' };
  if (total >= 50) return { grade: 'B', points: 6, color: 'text-yellow-700 bg-yellow-100 border-yellow-200' };
  if (total >= 40) return { grade: 'C', points: 5, color: 'text-orange-700 bg-orange-100 border-orange-200' };
  return { grade: 'F', points: 0, color: 'text-red-700 bg-red-100 border-red-200' };
}

/**
 * Calculate SPI from an array of subject results.
 */
export function calculateSPI(
  subjects: { credits: number; internal: number; external: number }[]
): number {
  const totalCredits = subjects.reduce((s, sub) => s + sub.credits, 0);
  const totalPoints = subjects.reduce((s, sub) => {
    const total = sub.internal + sub.external;
    const { points } = getGrade(total);
    return s + sub.credits * points;
  }, 0);
  if (totalCredits === 0) return 0;
  return Math.round((totalPoints / totalCredits) * 100) / 100;
}

/**
 * Format a number as Indian Rupee currency.
 */
export function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Generate a random receipt number.
 */
export function generateReceiptNo(prefix = 'PRES'): string {
  return `${prefix}${Date.now().toString().slice(-8)}`;
}

/**
 * Generate a random transaction ID.
 */
export function generateTransactionId(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = 'TXN';
  for (let i = 0; i < 10; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Generate a ticket ID for grievances.
 */
export function generateTicketId(): string {
  return `GRV${Date.now().toString().slice(-6)}`;
}

/**
 * Format a date string (YYYY-MM-DD) to a readable Indian locale format.
 */
export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Format an ISO timestamp to a readable date+time string.
 */
export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
