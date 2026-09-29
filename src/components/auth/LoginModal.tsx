import React, { useState, useEffect } from "react";
import Logo from "@/components/shared/Logo";
import { arenaStore } from "@/lib/store";
import { User } from "@/types";
import { X, Phone, Lock, Sparkles, CheckCircle2, ArrowRight } from "lucide-react";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: User) => void;
  initialPhone?: string;
}

export function LoginModal({ isOpen, onClose, onLoginSuccess, initialPhone = "" }: LoginModalProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState(initialPhone);
  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [resendTimer, setResendTimer] = useState(30);
  const [isExistingUser, setIsExistingUser] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setStep(1);
      setError(null);
      setOtp("");
    }
  }, [isOpen]);

  useEffect(() => {
    let interval: any;
    if (step === 2 && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, resendTimer]);

  if (!isOpen) return null;

  const handlePhoneChange = (val: string) => {
    const cleaned = val.replace(/\D/g, "").slice(0, 10);
    setPhone(cleaned);
    setError(null);

    // Check if phone matches any previous user in local storage
    if (cleaned.length === 10) {
      const bookings = arenaStore.getBookings();
      const existingBooking = bookings.find((b) => b.phone.includes(cleaned));
      if (existingBooking) {
        setIsExistingUser(true);
        setUsername(existingBooking.username);
      } else {
        setIsExistingUser(false);
      }
    }
  };

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (phone.length !== 10) {
      setError("Please enter a valid 10-digit Indian mobile number.");
      return;
    }

    if (!isExistingUser) {
      const cleanUser = username.trim();
      if (cleanUser.length < 3) {
        setError("Username must be at least 3 characters.");
        return;
      }
      if (!/^[a-zA-Z0-9_]+$/.test(cleanUser)) {
        setError("Username can only contain letters, numbers, and underscores.");
        return;
      }
    }

    setStep(2);
    setResendTimer(30);
  };

  const handleVerifyOtp = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);

    if (otp.length !== 6) {
      setError("Please enter the 6-digit OTP.");
      return;
    }

    // In demo environment, accept 123456 or any 6-digit code
    const fullPhone = `+91 ${phone}`;
    const user = arenaStore.loginCustomer(username || `Player_${phone.slice(-4)}`, fullPhone);
    onLoginSuccess(user);
    onClose();
  };

  const handleQuickDemoFill = () => {
    setOtp("123456");
    setTimeout(() => {
      const fullPhone = `+91 ${phone || "9845012345"}`;
      const user = arenaStore.loginCustomer(username || "Rohan_Striker", fullPhone);
      onLoginSuccess(user);
      onClose();
    }, 200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-md bg-[#0e0e0e] border border-[#262626] rounded-xl p-6 md:p-8 shadow-[0_0_50px_rgba(0,0,0,0.9)]">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header with Logo */}
        <div className="flex flex-col items-center text-center mb-6">
          <Logo size="md" />
          <h3 className="font-heading text-xl font-bold uppercase tracking-wider text-white mt-4">
            {step === 1 ? "Player Sign In / Registration" : "Enter Verification OTP"}
          </h3>
          <p className="text-xs text-neutral-400 mt-1">
            {step === 1
              ? "Access your bookings, tournament passes, and court reservations"
              : `We sent a 6-digit verification code to +91 ${phone}`}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-xs rounded-lg flex items-start gap-2">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleStep1Submit} className="space-y-4">
            {/* Phone input */}
            <div>
              <label className="block text-xs font-heading font-semibold uppercase text-neutral-300 mb-1.5">
                Mobile Number
              </label>
              <div className="flex items-center bg-[#141414] border border-[#2a2a2a] focus-within:border-[#00E676] rounded-md overflow-hidden transition-colors">
                <span className="px-3 py-2.5 bg-neutral-900 border-r border-[#2a2a2a] text-xs font-mono text-neutral-300">
                  +91
                </span>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  placeholder="98765 43210"
                  className="w-full px-3 py-2.5 bg-transparent text-white text-sm focus:outline-none font-mono"
                  autoFocus
                />
              </div>
            </div>

            {/* Username input (only if new user) */}
            {!isExistingUser && (
              <div>
                <label className="block text-xs font-heading font-semibold uppercase text-neutral-300 mb-1.5 flex items-center justify-between">
                  <span>Player Username</span>
                  <span className="text-[10px] text-neutral-500">3-20 chars</span>
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. Virat_Power18"
                  className="w-full px-3 py-2.5 bg-[#141414] border border-[#2a2a2a] focus:border-[#00E676] rounded-md text-white text-sm focus:outline-none transition-colors"
                />
              </div>
            )}

            {isExistingUser && (
              <div className="p-2.5 bg-[#00E676]/10 border border-[#00E676]/20 rounded-md text-xs text-[#00E676] flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Welcome back, {username}! Proceed to verify with OTP.</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-[#00E676] hover:bg-[#00c864] text-black font-heading font-bold text-xs uppercase tracking-wider rounded-md transition-all shadow-[0_0_20px_rgba(0,230,118,0.25)] flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              <span>Send OTP Code</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-heading font-semibold uppercase text-neutral-300 mb-1.5">
                6-Digit Security Code
              </label>
              <input
                type="text"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="123456"
                className="w-full px-4 py-3 bg-[#141414] border border-[#2a2a2a] focus:border-[#00E676] rounded-md text-white text-center text-xl tracking-[0.4em] font-mono focus:outline-none"
                autoFocus
              />
            </div>

            <div className="flex items-center justify-between text-xs text-neutral-400">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="hover:text-white underline underline-offset-2"
              >
                Change number
              </button>

              <div>
                {resendTimer > 0 ? (
                  <span className="font-mono text-neutral-500">Resend in {resendTimer}s</span>
                ) : (
                  <button
                    type="button"
                    onClick={() => setResendTimer(30)}
                    className="text-[#00E676] hover:underline"
                  >
                    Resend OTP
                  </button>
                )}
              </div>
            </div>

            {/* Quick Demo helper */}
            <div className="pt-2 border-t border-neutral-800">
              <button
                type="button"
                onClick={handleQuickDemoFill}
                className="w-full py-2 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 text-xs rounded border border-neutral-700 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#00E676]" />
                <span>Auto-Fill Test OTP (123456)</span>
              </button>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-[#00E676] hover:bg-[#00c864] text-black font-heading font-bold text-xs uppercase tracking-wider rounded-md transition-all shadow-[0_0_20px_rgba(0,230,118,0.25)] flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Verify & Continue</span>
              <CheckCircle2 className="w-4 h-4" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default LoginModal;
