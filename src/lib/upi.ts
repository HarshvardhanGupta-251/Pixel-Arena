export interface UpiPaymentDetails {
  vpa: string;        // e.g. pixelarena@upi
  payeeName: string;  // e.g. PIXEL ARENA SPORTS LLP
  amount: number;
  reference: string;  // e.g. PA-BK-20260929-1234
  note?: string;
}

export function generateUpiUri(details: UpiPaymentDetails): string {
  const params = new URLSearchParams({
    pa: details.vpa,
    pn: details.payeeName,
    am: details.amount.toFixed(2),
    cu: "INR",
    tn: details.note || details.reference,
    tr: details.reference,
  });

  return `upi://pay?${params.toString()}`;
}

export function validateUtr(utr: string): { valid: boolean; error?: string } {
  const cleaned = utr.trim();
  if (!cleaned) {
    return { valid: false, error: "Please enter your 12-digit UPI reference (UTR) number." };
  }
  if (!/^\d{12}$/.test(cleaned)) {
    return { valid: false, error: "UTR must be exactly 12 numeric digits from your UPI payment receipt." };
  }
  return { valid: true };
}
