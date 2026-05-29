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

/**
 * Download a DOM element as a PDF file.
 * Uses dynamic imports of jsPDF + html2canvas to avoid SSR issues.
 * Adds a diagonal demo watermark on every page automatically.
 *
 * @param elementId  - id of the HTML element to capture
 * @param filename   - output filename, e.g. "hall-ticket.pdf"
 */
export async function downloadAsPDF(elementId: string, filename: string): Promise<void> {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`[downloadAsPDF] Element #${elementId} not found`);
    return;
  }

  // Dynamic imports — not bundled on the server
  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
    import('html2canvas'),
    import('jspdf'),
  ]);

  const canvas = await html2canvas(element, {
    scale: 2,          // higher = sharper
    useCORS: true,
    allowTaint: true,
    backgroundColor: '#ffffff',
    logging: false,
  });

  const imgData    = canvas.toDataURL('image/png');
  const pdf        = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth  = pdf.internal.pageSize.getWidth();   // 210 mm
  const pageHeight = pdf.internal.pageSize.getHeight();  // 297 mm
  const imgHeight  = (canvas.height * pageWidth) / canvas.width;
  let remaining    = imgHeight;
  let yOffset      = 0;

  // ── Write content pages ──
  pdf.addImage(imgData, 'PNG', 0, yOffset, pageWidth, imgHeight);
  remaining -= pageHeight;

  while (remaining > 0) {
    yOffset -= pageHeight;
    pdf.addPage();
    pdf.addImage(imgData, 'PNG', 0, yOffset, pageWidth, imgHeight);
    remaining -= pageHeight;
  }

  // ── Watermark — applied on top of every page ──
  const totalPages = (pdf as any).getNumberOfPages();
  const cx = pageWidth  / 2;   // 105 mm  (horizontal centre)
  const cy = pageHeight / 2;   // 148.5 mm (vertical centre)

  for (let p = 1; p <= totalPages; p++) {
    pdf.setPage(p);

    // Light grey, semi-transparent feel via colour choice
    pdf.setTextColor(170, 170, 170);   // #aaaaaa
    pdf.setFontSize(15);

    // Line 1 — slightly above centre
    pdf.text(
      'THIS TEMPLATE IS DEMO TEMPLATE',
      cx,
      cy - 7,
      { align: 'center', angle: 45 }
    );

    // Line 2 — slightly below centre
    pdf.text(
      'CAN BE REPLACABLE AS PER REQUIREMENTS',
      cx,
      cy + 7,
      { align: 'center', angle: 45 }
    );

    // Reset colours for safety
    pdf.setTextColor(0, 0, 0);
  }

  pdf.save(filename);
}

