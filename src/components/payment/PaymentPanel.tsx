import React, { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import { arenaStore } from "@/lib/store";
import { generateUpiUri, validateUtr } from "@/lib/upi";
import { formatINR } from "@/lib/utils";
import confetti from "canvas-confetti";
import {
  Clock,
  Copy,
  Check,
  Upload,
  AlertTriangle,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Calendar,
  MapPin,
  ArrowRight,
  Share2,
} from "lucide-react";

interface PaymentPanelProps {
  amount: number;
  refCode: string;
  title: string;
  subtitle?: string;
  holdExpiresAt?: number;
  status: "HELD" | "PENDING_APPROVAL" | "CONFIRMED" | "REJECTED" | "EXPIRED" | "CANCELLED" | "COMPLETED" | "PLACED" | "ACCEPTED" | "PREPARING" | "READY";
  utr?: string;
  rejectReason?: string;
  bookingDetails?: {
    sport: string;
    courtName: string;
    date: string;
    startTime: string;
    endTime: string;
  };
  onSubmitUtr: (utr: string, screenshotUrl?: string) => { success: boolean; error?: string };
  onCancelHold?: () => void;
  onDone?: () => void;
}

export function PaymentPanel({
  amount,
  refCode,
  title,
  subtitle,
  holdExpiresAt,
  status,
  utr: initialUtr = "",
  rejectReason,
  bookingDetails,
  onSubmitUtr,
  onCancelHold,
  onDone,
}: PaymentPanelProps) {
  const settings = arenaStore.getSettings();
  const [utrInput, setUtrInput] = useState(initialUtr);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState(false);
  const [copiedAmount, setCopiedAmount] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [timeLeftMs, setTimeLeftMs] = useState<number>(
    holdExpiresAt ? Math.max(0, holdExpiresAt - Date.now()) : 600000
  );

  // Confetti on confirmed
  useEffect(() => {
    if (status === "CONFIRMED" || status === "READY" || status === "COMPLETED") {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#00E676", "#FFFFFF", "#3B82F6"],
        });
      } catch (e) {
        // ignore
      }
    }
  }, [status]);

  // Hold countdown timer
  useEffect(() => {
    if (!holdExpiresAt || status !== "HELD") return;

    const interval = setInterval(() => {
      const remaining = Math.max(0, holdExpiresAt - Date.now());
      setTimeLeftMs(remaining);

      if (remaining === 0) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [holdExpiresAt, status]);

  const minutes = Math.floor(timeLeftMs / 60000);
  const seconds = Math.floor((timeLeftMs % 60000) / 1000);
  const isExpired = status === "EXPIRED" || (status === "HELD" && timeLeftMs <= 0);

  const upiUri = generateUpiUri({
    vpa: settings.upiId,
    payeeName: settings.upiPayeeName,
    amount,
    reference: refCode,
    note: `Pixel Arena ${refCode}`,
  });

  const handleCopy = (text: string, type: "id" | "amount") => {
    navigator.clipboard.writeText(text);
    if (type === "id") {
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    } else {
      setCopiedAmount(true);
      setTimeout(() => setCopiedAmount(false), 2000);
    }
  };

  const handleScreenshotUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
      setErrorMessage("Screenshot must be under 3 MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setScreenshotPreview(reader.result as string);
      setErrorMessage(null);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const validation = validateUtr(utrInput);
    if (!validation.valid) {
      setErrorMessage(validation.error || "Please enter a valid 12-digit UTR.");
      return;
    }

    const res = onSubmitUtr(utrInput, screenshotPreview || undefined);
    if (!res.success) {
      setErrorMessage(res.error || "Failed to submit payment proof.");
    }
  };

  // ================= STATE: CONFIRMED PASS =================
  if (status === "CONFIRMED") {
    return (
      <div className="w-full max-w-xl mx-auto bg-[#0d0d0d] border border-[#00E676]/40 rounded-xl p-6 md:p-8 shadow-[0_0_50px_rgba(0,230,118,0.15)] relative">
        <div className="text-center pb-6 border-b border-neutral-800">
          <div className="w-16 h-16 bg-[#00E676]/20 text-[#00E676] rounded-full flex items-center justify-center mx-auto mb-3 border border-[#00E676]">
            <CheckCircle2 className="w-9 h-9" />
          </div>
          <span className="px-3 py-1 bg-[#00E676]/20 text-[#00E676] border border-[#00E676]/40 rounded-full text-xs font-heading font-bold uppercase tracking-widest">
            Booking Confirmed by Arena
          </span>
          <h2 className="text-2xl font-bold font-heading text-white mt-3 uppercase">
            COURT ACCESS PASS READY
          </h2>
          <p className="text-xs text-neutral-400 mt-1 font-mono">
            Booking Reference: <span className="text-[#00E676] font-bold">{refCode}</span>
          </p>
        </div>

        {/* Access Pass QR Card */}
        <div className="my-6 p-5 bg-[#141414] border border-neutral-800 rounded-lg flex flex-col md:flex-row items-center gap-6">
          <div className="bg-white p-3 rounded-lg shrink-0 shadow-lg">
            <QRCodeSVG value={`PIXEL-PASS:${refCode}:${bookingDetails?.date || ""}`} size={120} level="M" />
            <div className="text-[10px] text-black font-mono font-bold text-center mt-1">
              ENTRY QR
            </div>
          </div>

          <div className="flex-1 space-y-2 text-center md:text-left">
            <div className="text-xs text-[#00E676] font-heading font-semibold uppercase">
              {bookingDetails?.sport || "Multi-Turf"}
            </div>
            <div className="text-lg font-bold text-white">
              {bookingDetails?.courtName || "Pixel Arena"}
            </div>
            <div className="flex items-center justify-center md:justify-start gap-2 text-xs text-neutral-300">
              <Calendar className="w-3.5 h-3.5 text-[#00E676]" />
              <span>
                {bookingDetails?.date} • {bookingDetails?.startTime} - {bookingDetails?.endTime}
              </span>
            </div>
            <div className="flex items-center justify-center md:justify-start gap-2 text-xs text-neutral-400">
              <MapPin className="w-3.5 h-3.5 text-neutral-400" />
              <span>Near Pulse Fitness Gym, Mathura, UP</span>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <button
            onClick={() => {
              const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
                `Pixel Arena: ${bookingDetails?.sport || "Turf"} Match`
              )}&dates=${bookingDetails?.date.replace(/-/g, "")}T000000Z/${bookingDetails?.date.replace(
                /-/g,
                ""
              )}T020000Z&details=${encodeURIComponent(
                `Booking Ref: ${refCode}. Court: ${bookingDetails?.courtName}`
              )}&location=${encodeURIComponent(settings.address)}`;
              window.open(url, "_blank");
            }}
            className="py-3 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 rounded-md text-xs font-heading font-bold uppercase tracking-wider text-white flex items-center justify-center gap-2 cursor-pointer transition-colors"
          >
            <Calendar className="w-4 h-4 text-[#00E676]" />
            <span>Add to Calendar</span>
          </button>

          <a
            href={settings.mapEmbedUrl}
            target="_blank"
            rel="noreferrer"
            className="py-3 bg-[#00E676] hover:bg-[#00c864] text-black font-heading font-bold text-xs uppercase tracking-wider rounded-md flex items-center justify-center gap-2 cursor-pointer transition-all shadow-[0_0_20px_rgba(0,230,118,0.25)]"
          >
            <MapPin className="w-4 h-4" />
            <span>Get Directions</span>
          </a>
        </div>

        {onDone && (
          <div className="mt-4 text-center">
            <button
              onClick={onDone}
              className="text-xs text-neutral-400 hover:text-white underline underline-offset-4"
            >
              Back to My Bookings
            </button>
          </div>
        )}
      </div>
    );
  }

  // ================= STATE: REJECTED =================
  if (status === "REJECTED") {
    return (
      <div className="w-full max-w-lg mx-auto bg-[#0e0e0e] border border-red-500/40 rounded-xl p-6 md:p-8 text-center shadow-xl">
        <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500/30">
          <XCircle className="w-9 h-9" />
        </div>
        <h3 className="font-heading text-xl font-bold uppercase text-white">
          Payment Verification Declined
        </h3>
        <p className="text-xs text-neutral-400 mt-2">
          Pixel Arena could not verify the submitted UPI payment for reference{" "}
          <span className="font-mono text-white">{refCode}</span>.
        </p>

        {rejectReason && (
          <div className="my-4 p-3.5 bg-red-500/10 border border-red-500/20 text-red-300 text-xs rounded-lg text-left">
            <span className="font-bold text-red-400">Arena Note: </span>
            <span>{rejectReason}</span>
          </div>
        )}

        <div className="pt-4 flex flex-col gap-2">
          {onDone && (
            <button
              onClick={onDone}
              className="w-full py-3 bg-[#00E676] hover:bg-[#00c864] text-black font-heading font-bold text-xs uppercase tracking-wider rounded-md"
            >
              Choose Another Slot
            </button>
          )}
          <a
            href={`https://wa.me/${settings.whatsapp.replace(/\D/g, "")}?text=Hi%20Pixel%20Arena,%20my%20booking%20${refCode}%20was%20rejected.`}
            target="_blank"
            rel="noreferrer"
            className="w-full py-2.5 bg-neutral-900 hover:bg-neutral-800 text-xs text-neutral-300 rounded border border-neutral-700"
          >
            Contact Owner on WhatsApp
          </a>
        </div>
      </div>
    );
  }

  // ================= STATE: PENDING APPROVAL =================
  if (status === "PENDING_APPROVAL" || status === "ACCEPTED" || status === "PREPARING") {
    return (
      <div className="w-full max-w-xl mx-auto bg-[#0e0e0e] border border-amber-500/40 rounded-xl p-6 md:p-8 text-center shadow-[0_0_40px_rgba(255,176,32,0.1)] relative">
        <div className="w-16 h-16 bg-amber-500/10 text-amber-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-amber-500/30 animate-pulse">
          <Clock className="w-8 h-8" />
        </div>

        <span className="px-3 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded-full text-xs font-heading font-semibold uppercase tracking-wider">
          Verification in Progress
        </span>

        <h3 className="font-heading text-xl font-bold uppercase text-white mt-3">
          Awaiting Arena Owner Approval
        </h3>

        <p className="text-xs text-neutral-300 mt-2 leading-relaxed max-w-md mx-auto">
          We have received your payment proof (UTR:{" "}
          <span className="font-mono text-white font-bold">{utrInput || initialUtr}</span>). Pixel Arena verifies UPI transfers manually in our bank portal.
        </p>

        <div className="my-6 p-4 bg-neutral-900/80 border border-neutral-800 rounded-lg text-left text-xs space-y-2">
          <div className="flex justify-between">
            <span className="text-neutral-400">Reference:</span>
            <span className="font-mono text-white">{refCode}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-neutral-400">Total Amount:</span>
            <span className="font-mono text-[#00E676] font-bold">{formatINR(amount)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-neutral-400">Your Slots:</span>
            <span className="text-neutral-200">Locked & Reserved for You</span>
          </div>
          <div className="flex justify-between">
            <span className="text-neutral-400">Estimated Confirmation:</span>
            <span className="text-amber-400 font-medium">Within 15 minutes</span>
          </div>
        </div>

        <p className="text-[11px] text-neutral-500 italic mb-4">
          This page updates automatically the moment the arena manager confirms your payment. You can also view this in your Account tab.
        </p>

        {onDone && (
          <button
            onClick={onDone}
            className="w-full py-2.5 bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-heading uppercase font-semibold rounded transition-colors"
          >
            View in My Account
          </button>
        )}
      </div>
    );
  }

  // ================= STATE: HELD (DEFAULT CHECKOUT PAYMENT FLOW) =================
  return (
    <div className="w-full max-w-2xl mx-auto bg-[#0d0d0d] border border-[#262626] rounded-xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.8)]">
      {/* Top Header & 10-minute hold bar */}
      <div className="p-5 md:p-6 bg-[#121212] border-b border-[#262626]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-[#00E676]/10 text-[#00E676] border border-[#00E676]/30 text-[10px] font-heading font-semibold uppercase rounded">
                Direct UPI Settlement
              </span>
              <span className="text-xs text-neutral-400 font-mono">Ref: {refCode}</span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold font-heading text-white mt-1 uppercase">
              {title}
            </h2>
            {subtitle && <p className="text-xs text-neutral-400 mt-0.5">{subtitle}</p>}
          </div>

          <div className="text-right">
            <div className="text-xs text-neutral-400">Total Payable</div>
            <div className="text-2xl md:text-3xl font-extrabold font-heading text-[#00E676] drop-shadow-[0_0_12px_rgba(0,230,118,0.3)]">
              {formatINR(amount)}
            </div>
          </div>
        </div>

        {/* Hold Countdown Bar */}
        {holdExpiresAt && (
          <div className="mt-4 pt-3 border-t border-neutral-800/80 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-amber-400">
              <Clock className="w-4 h-4 animate-spin text-amber-400" />
              <span className="font-heading uppercase font-semibold">
                Slot Hold Window:
              </span>
              <span className="font-mono font-bold text-amber-300">
                {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
              </span>
            </div>
            <span className="text-[11px] text-neutral-400 hidden sm:inline">
              Slots released automatically after expiry
            </span>
          </div>
        )}
      </div>

      {isExpired ? (
        <div className="p-8 text-center space-y-4">
          <div className="w-14 h-14 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto border border-red-500/30">
            <AlertTriangle className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-heading font-bold uppercase text-white">
            10-Minute Hold Expired
          </h3>
          <p className="text-xs text-neutral-400 max-w-md mx-auto">
            Your temporary slot hold has timed out and the slots have been released to ensure fair access for other players.
          </p>
          <button
            onClick={onCancelHold}
            className="py-2.5 px-6 bg-[#00E676] text-black font-heading font-bold text-xs uppercase rounded hover:bg-[#00c864]"
          >
            Pick New Slots
          </button>
        </div>
      ) : (
        <div className="p-5 md:p-8 space-y-6">
          {/* Step 1: Scan QR or Open App */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            {/* QR Code Container */}
            <div className="md:col-span-5 flex flex-col items-center justify-center bg-white p-4 rounded-xl shadow-xl">
              <QRCodeSVG
                value={upiUri}
                size={180}
                level="M"
                includeMargin
                className="w-full max-w-[180px] h-auto"
              />
              <div className="mt-2 text-center">
                <span className="text-[11px] font-bold text-black tracking-wide uppercase">
                  Scan with any UPI App
                </span>
                <div className="text-[10px] text-neutral-600 font-mono">
                  GPay • PhonePe • Paytm • BHIM
                </div>
              </div>
            </div>

            {/* UPI Details & Mobile Deep link */}
            <div className="md:col-span-7 space-y-4">
              {/* Mobile "Pay with UPI app" button */}
              <a
                href={upiUri}
                className="w-full py-3.5 bg-[#00E676] hover:bg-[#00c864] text-black font-heading font-bold text-sm uppercase tracking-wider rounded-md flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,230,118,0.25)] transition-all cursor-pointer"
              >
                <span>Pay via UPI App</span>
                <ExternalLink className="w-4 h-4" />
              </a>

              {/* Copy UPI ID Card */}
              <div className="bg-[#141414] border border-neutral-800 rounded-lg p-3 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-neutral-400">UPI ID / VPA:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-white font-bold">{settings.upiId}</span>
                    <button
                      type="button"
                      onClick={() => handleCopy(settings.upiId, "id")}
                      className="p-1 hover:text-[#00E676] text-neutral-400 transition-colors"
                      title="Copy UPI ID"
                    >
                      {copiedId ? <Check className="w-3.5 h-3.5 text-[#00E676]" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-neutral-400">Payee Name:</span>
                  <span className="font-semibold text-neutral-200">{settings.upiPayeeName}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-neutral-400">Exact Amount:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[#00E676] font-bold">₹{amount}</span>
                    <button
                      type="button"
                      onClick={() => handleCopy(amount.toString(), "amount")}
                      className="p-1 hover:text-[#00E676] text-neutral-400 transition-colors"
                      title="Copy Amount"
                    >
                      {copiedAmount ? <Check className="w-3.5 h-3.5 text-[#00E676]" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-2 text-[11px] text-neutral-400 leading-tight">
                <ShieldCheck className="w-4 h-4 text-[#00E676] shrink-0 mt-0.5" />
                <span>
                  No hidden platform fees. 100% of your payment goes directly into Pixel Arena's verified business account.
                </span>
              </div>
            </div>
          </div>

          {/* Step 2: Payment Proof Form */}
          <form onSubmit={handleSubmit} className="pt-4 border-t border-neutral-800 space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-heading font-semibold uppercase text-neutral-200 flex items-center gap-2">
                  <span>Enter 12-Digit UPI Transaction ID / UTR</span>
                  <span className="text-red-400">*</span>
                </label>
                <span className="text-[10px] text-neutral-400">Find in your UPI receipt</span>
              </div>

              <input
                type="text"
                maxLength={12}
                value={utrInput}
                onChange={(e) => setUtrInput(e.target.value.replace(/\D/g, "").slice(0, 12))}
                placeholder="e.g. 428910483921"
                className="w-full px-4 py-3 bg-[#141414] border border-[#2a2a2a] focus:border-[#00E676] rounded-md text-white font-mono text-base tracking-widest focus:outline-none transition-colors"
                required
              />
            </div>

            {/* Optional screenshot upload */}
            <div>
              <label className="block text-xs font-heading font-semibold uppercase text-neutral-300 mb-1.5 flex items-center justify-between">
                <span>Upload Payment Screenshot (Optional, max 3 MB)</span>
                {screenshotPreview && (
                  <button
                    type="button"
                    onClick={() => setScreenshotPreview(null)}
                    className="text-[10px] text-red-400 hover:underline"
                  >
                    Remove
                  </button>
                )}
              </label>

              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleScreenshotUpload}
                  className="hidden"
                  id="screenshot-file"
                />
                <label
                  htmlFor="screenshot-file"
                  className="flex items-center justify-center gap-2 p-3 bg-[#141414] hover:bg-[#1a1a1a] border border-dashed border-neutral-700 hover:border-neutral-500 rounded-md cursor-pointer text-xs text-neutral-400 transition-colors"
                >
                  <Upload className="w-4 h-4 text-[#00E676]" />
                  <span>
                    {screenshotPreview
                      ? "Screenshot attached ✓ (Click to change)"
                      : "Click to select payment screenshot / receipt"}
                  </span>
                </label>
              </div>

              {screenshotPreview && (
                <div className="mt-2 w-24 h-24 rounded border border-neutral-800 overflow-hidden">
                  <img
                    src={screenshotPreview}
                    alt="Receipt preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>

            {errorMessage && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-xs rounded-md flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3.5 bg-[#00E676] hover:bg-[#00c864] text-black font-heading font-bold text-xs uppercase tracking-wider rounded-md transition-all shadow-[0_0_20px_rgba(0,230,118,0.25)] flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>I've Paid — Submit for Verification</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default PaymentPanel;
