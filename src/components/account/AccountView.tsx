import React, { useState, useEffect } from "react";
import { arenaStore } from "@/lib/store";
import { User, Booking, Order, TournamentRegistration } from "@/types";
import { formatINR } from "@/lib/utils";
import { QRCodeSVG } from "qrcode.react";
import {
  Calendar,
  Clock,
  MapPin,
  Coffee,
  Trophy,
  User as UserIcon,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  LogOut,
  QrCode,
  Share2,
  X,
} from "lucide-react";

interface AccountViewProps {
  currentUser: User | null;
  onRequireLogin: () => void;
  onLogout: () => void;
  onNavigateToBooking: () => void;
  onNavigateToCafe: () => void;
  onNavigateToTournaments: () => void;
  onOpenPaymentForBooking: (bookingId: string) => void;
}

export function AccountView({
  currentUser,
  onRequireLogin,
  onLogout,
  onNavigateToBooking,
  onNavigateToCafe,
  onNavigateToTournaments,
  onOpenPaymentForBooking,
}: AccountViewProps) {
  const [activeTab, setActiveTab] = useState<"bookings" | "orders" | "tournaments" | "profile">("bookings");
  const [bookings, setBookings] = useState<Booking[]>(arenaStore.getBookings());
  const [orders, setOrders] = useState<Order[]>(arenaStore.getOrders());
  const [registrations, setRegistrations] = useState<TournamentRegistration[]>(arenaStore.getTournamentRegistrations());
  const [selectedPassBooking, setSelectedPassBooking] = useState<Booking | null>(null);

  // Subscribe to store updates
  useEffect(() => {
    const unsub = arenaStore.subscribe(() => {
      setBookings([...arenaStore.getBookings()]);
      setOrders([...arenaStore.getOrders()]);
      setRegistrations([...arenaStore.getTournamentRegistrations()]);
    });
    return unsub;
  }, []);

  if (!currentUser) {
    return (
      <div className="w-full max-w-lg mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 bg-neutral-900 border border-neutral-800 rounded-full flex items-center justify-center mx-auto text-neutral-400">
          <UserIcon className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold font-heading text-white">
          PLAYER ACCOUNT ACCESS
        </h2>
        <p className="text-xs text-neutral-400 max-w-sm mx-auto">
          Please log in with your phone number to view your court reservations, cafe order trackers, and tournament passes.
        </p>
        <button
          onClick={onRequireLogin}
          className="py-3 px-8 bg-[#00E676] hover:bg-[#00c864] text-black font-heading font-bold text-xs uppercase tracking-wider rounded-md transition-all shadow-[0_0_20px_rgba(0,230,118,0.25)]"
        >
          Sign In with Phone OTP
        </button>
      </div>
    );
  }

  // Filter items for current user
  const userBookings = bookings.filter(
    (b) => b.userId === currentUser.uid || b.phone === currentUser.phone
  );
  const userOrders = orders.filter(
    (o) => o.userId === currentUser.uid || o.phone === currentUser.phone
  );
  const userRegistrations = registrations.filter(
    (r) => r.userId === currentUser.uid || r.captainPhone === currentUser.phone
  );

  const handleCancelBooking = (bookingId: string) => {
    if (confirm("Are you sure you want to cancel this booking?")) {
      arenaStore.cancelBooking(bookingId, "Cancelled by user");
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* User Header Profile Card */}
      <div className="p-6 bg-[#111111] border border-[#262626] rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-black border border-[#00E676] rounded-lg flex items-center justify-center text-[#00E676] font-heading font-bold text-xl">
            {currentUser.username.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold font-heading text-white">
                {currentUser.username}
              </h2>
              <span className="px-2 py-0.5 bg-[#00E676]/10 text-[#00E676] text-[10px] font-heading font-semibold uppercase rounded">
                Verified Player
              </span>
            </div>
            <p className="text-xs text-neutral-400 font-mono mt-0.5">
              {currentUser.phone}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onLogout}
            className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-700 rounded-md text-xs font-heading font-semibold uppercase tracking-wider flex items-center gap-2"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-neutral-800 pb-3 mb-6 overflow-x-auto">
        <button
          onClick={() => setActiveTab("bookings")}
          className={`px-4 py-2 rounded-md font-heading text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "bookings"
              ? "bg-[#00E676] text-black"
              : "bg-neutral-900 text-neutral-400 hover:text-white"
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Court Bookings ({userBookings.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("orders")}
          className={`px-4 py-2 rounded-md font-heading text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "orders"
              ? "bg-[#00E676] text-black"
              : "bg-neutral-900 text-neutral-400 hover:text-white"
          }`}
        >
          <Coffee className="w-3.5 h-3.5" />
          <span>Cafe Orders ({userOrders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("tournaments")}
          className={`px-4 py-2 rounded-md font-heading text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "tournaments"
              ? "bg-[#00E676] text-black"
              : "bg-neutral-900 text-neutral-400 hover:text-white"
          }`}
        >
          <Trophy className="w-3.5 h-3.5" />
          <span>Tournaments ({userRegistrations.length})</span>
        </button>
      </div>

      {/* ================= TAB: BOOKINGS ================= */}
      {activeTab === "bookings" && (
        <div className="space-y-4">
          {userBookings.length === 0 ? (
            <div className="p-12 text-center bg-[#111111] border border-neutral-800 rounded-xl space-y-3">
              <Calendar className="w-10 h-10 text-neutral-600 mx-auto" />
              <p className="text-sm text-neutral-400">No court bookings found.</p>
              <button
                onClick={onNavigateToBooking}
                className="py-2.5 px-6 bg-[#00E676] text-black font-heading font-bold text-xs uppercase rounded hover:bg-[#00c864]"
              >
                Book Your First Slot
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {userBookings.map((b) => {
                const isConfirmed = b.status === "CONFIRMED";
                const isPending = b.status === "PENDING_APPROVAL";
                const isHeld = b.status === "HELD";
                const isRejected = b.status === "REJECTED";
                const isCancelled = b.status === "CANCELLED";

                return (
                  <div
                    key={b.id}
                    className="p-5 bg-[#111111] border border-[#222222] hover:border-neutral-700 rounded-xl flex flex-col justify-between space-y-4 shadow-md"
                  >
                    <div>
                      <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
                        <div>
                          <span className="text-[10px] text-neutral-500 font-mono block">
                            Ref: {b.refCode}
                          </span>
                          <h3 className="font-heading font-bold text-base text-white">
                            {b.courtName}
                          </h3>
                        </div>

                        {/* Status Badge */}
                        <span
                          className={`px-2.5 py-1 text-[10px] font-heading font-bold uppercase rounded ${
                            isConfirmed
                              ? "bg-[#00E676]/20 text-[#00E676] border border-[#00E676]/30"
                              : isPending
                              ? "bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse"
                              : isHeld
                              ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                              : isRejected
                              ? "bg-red-500/20 text-red-400 border border-red-500/30"
                              : "bg-neutral-800 text-neutral-400"
                          }`}
                        >
                          {isConfirmed
                            ? "Confirmed Pass"
                            : isPending
                            ? "Awaiting Owner Check"
                            : isHeld
                            ? "Payment Pending"
                            : isRejected
                            ? "Declined"
                            : "Cancelled"}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 my-3 text-xs text-neutral-300">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-[#00E676]" />
                          <span>{b.date}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-[#00E676]" />
                          <span>
                            {b.startTime} - {b.endTime} ({b.durationHours} hr)
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs pt-1">
                        <span className="text-neutral-400">Total Paid / Due:</span>
                        <span className="font-mono text-[#00E676] font-bold text-sm">
                          {formatINR(b.amount)}
                        </span>
                      </div>

                      {b.utr && (
                        <div className="text-[11px] font-mono text-neutral-500 mt-1">
                          Submitted UTR: {b.utr}
                        </div>
                      )}

                      {b.rejectReason && (
                        <div className="mt-2 p-2 bg-red-500/10 border border-red-500/20 text-red-400 text-[11px] rounded">
                          Reason: {b.rejectReason}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="pt-2 border-t border-neutral-800/80 flex items-center justify-between gap-2">
                      {isConfirmed && (
                        <button
                          onClick={() => setSelectedPassBooking(b)}
                          className="py-2 px-4 bg-[#00E676] hover:bg-[#00c864] text-black font-heading font-bold text-xs uppercase tracking-wider rounded flex items-center gap-1.5 cursor-pointer shadow-[0_0_12px_rgba(0,230,118,0.2)]"
                        >
                          <QrCode className="w-3.5 h-3.5" />
                          <span>Show Venue Pass</span>
                        </button>
                      )}

                      {isHeld && (
                        <button
                          onClick={() => onOpenPaymentForBooking(b.id)}
                          className="py-2 px-4 bg-[#00E676] text-black font-heading font-bold text-xs uppercase rounded"
                        >
                          Complete Payment
                        </button>
                      )}

                      {(isConfirmed || isPending) && (
                        <button
                          onClick={() => handleCancelBooking(b.id)}
                          className="text-xs text-neutral-500 hover:text-red-400 underline underline-offset-2 ml-auto"
                        >
                          Cancel Booking
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ================= TAB: CAFE ORDERS ================= */}
      {activeTab === "orders" && (
        <div className="space-y-4">
          {userOrders.length === 0 ? (
            <div className="p-12 text-center bg-[#111111] border border-neutral-800 rounded-xl space-y-3">
              <Coffee className="w-10 h-10 text-neutral-600 mx-auto" />
              <p className="text-sm text-neutral-400">No cafe orders placed yet.</p>
              <button
                onClick={onNavigateToCafe}
                className="py-2.5 px-6 bg-[#00E676] text-black font-heading font-bold text-xs uppercase rounded hover:bg-[#00c864]"
              >
                Order from Pixel Cafe
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {userOrders.map((o) => {
                const statusOrder = [
                  "PLACED",
                  "ACCEPTED",
                  "PREPARING",
                  "READY",
                  "COMPLETED",
                ];
                const currentIndex = statusOrder.indexOf(o.status);

                return (
                  <div
                    key={o.id}
                    className="p-5 bg-[#111111] border border-[#222222] rounded-xl space-y-4 shadow-md"
                  >
                    <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
                      <div>
                        <span className="text-[10px] text-neutral-500 font-mono block">
                          Ref: {o.refCode}
                        </span>
                        <h4 className="font-heading font-bold text-sm text-white">
                          {o.orderType === "serve_court" ? "Dugout Service" : "Counter Pickup"}
                          {o.courtOrTable ? ` (${o.courtOrTable})` : ""}
                        </h4>
                      </div>

                      <span className="px-2 py-0.5 bg-[#00E676]/10 text-[#00E676] font-heading font-bold text-[10px] uppercase rounded">
                        {o.status}
                      </span>
                    </div>

                    {/* Progress tracker */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] text-neutral-400 uppercase font-heading">
                        <span>Placed</span>
                        <span>Accepted</span>
                        <span>Preparing</span>
                        <span>Ready</span>
                      </div>
                      <div className="grid grid-cols-4 gap-1">
                        {statusOrder.slice(0, 4).map((st, i) => (
                          <div
                            key={st}
                            className={`h-1.5 rounded-full ${
                              currentIndex >= i ? "bg-[#00E676]" : "bg-neutral-800"
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Items list */}
                    <div className="space-y-1 text-xs text-neutral-300">
                      {o.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between">
                          <span>
                            {item.qty}x {item.name}
                          </span>
                          <span className="font-mono text-neutral-400">
                            ₹{item.price * item.qty}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="pt-2 border-t border-neutral-800 flex justify-between text-xs">
                      <span className="text-neutral-400">Total Paid via UPI:</span>
                      <span className="font-mono text-[#00E676] font-bold">{formatINR(o.total)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ================= TAB: TOURNAMENTS ================= */}
      {activeTab === "tournaments" && (
        <div className="space-y-4">
          {userRegistrations.length === 0 ? (
            <div className="p-12 text-center bg-[#111111] border border-neutral-800 rounded-xl space-y-3">
              <Trophy className="w-10 h-10 text-neutral-600 mx-auto" />
              <p className="text-sm text-neutral-400">No active tournament entries.</p>
              <button
                onClick={onNavigateToTournaments}
                className="py-2.5 px-6 bg-[#00E676] text-black font-heading font-bold text-xs uppercase rounded hover:bg-[#00c864]"
              >
                Explore Active Tournaments
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {userRegistrations.map((r) => (
                <div
                  key={r.id}
                  className="p-5 bg-[#111111] border border-[#222222] rounded-xl space-y-3 shadow-md"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
                    <span className="text-[10px] font-mono text-neutral-500">Ref: {r.refCode}</span>
                    <span
                      className={`px-2 py-0.5 text-[10px] font-heading font-bold uppercase rounded ${
                        r.status === "CONFIRMED"
                          ? "bg-[#00E676]/20 text-[#00E676]"
                          : "bg-amber-500/20 text-amber-300"
                      }`}
                    >
                      {r.status === "CONFIRMED" ? "Confirmed Spot" : "Verification Pending"}
                    </span>
                  </div>

                  <h3 className="font-heading font-bold text-base text-white">
                    {r.tournamentName}
                  </h3>

                  <div className="text-xs text-neutral-300 space-y-1">
                    <p>
                      <strong>Team:</strong> {r.teamName} (Captain: {r.captainName})
                    </p>
                    <p className="text-neutral-400">
                      <strong>Squad:</strong> {r.players.join(", ")}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-neutral-800 flex justify-between text-xs">
                    <span className="text-neutral-400">Entry Fee:</span>
                    <span className="font-mono text-[#00E676] font-bold">{formatINR(r.amount)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ================= VENUE PASS MODAL ================= */}
      {selectedPassBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="relative w-full max-w-md bg-[#0e0e0e] border border-[#00E676]/40 rounded-xl p-6 shadow-2xl">
            <button
              onClick={() => setSelectedPassBooking(null)}
              className="absolute top-4 right-4 p-1.5 text-neutral-400 hover:text-white rounded"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center pb-4 border-b border-neutral-800">
              <span className="px-2.5 py-1 bg-[#00E676]/10 text-[#00E676] border border-[#00E676]/30 text-xs font-heading font-bold uppercase rounded">
                Verified Match Pass
              </span>
              <h3 className="text-xl font-bold font-heading text-white mt-2 uppercase">
                {selectedPassBooking.courtName}
              </h3>
              <p className="text-xs text-neutral-400 mt-0.5">
                Pass ID: <span className="font-mono text-[#00E676]">{selectedPassBooking.refCode}</span>
              </p>
            </div>

            <div className="my-6 flex flex-col items-center">
              <div className="p-3 bg-white rounded-lg shadow-lg">
                <QRCodeSVG
                  value={`PIXEL-PASS:${selectedPassBooking.refCode}:${selectedPassBooking.date}`}
                  size={160}
                  level="M"
                />
              </div>
              <span className="text-[11px] text-neutral-400 mt-2 font-mono">
                Present this QR at Pixel Arena reception
              </span>
            </div>

            <div className="bg-[#141414] p-3.5 rounded-lg border border-neutral-800 space-y-1.5 text-xs text-neutral-300">
              <div className="flex justify-between">
                <span className="text-neutral-400">Match Date:</span>
                <span className="font-medium text-white">{selectedPassBooking.date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Slot Time:</span>
                <span className="font-mono text-[#00E676]">
                  {selectedPassBooking.startTime} - {selectedPassBooking.endTime}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Booked By:</span>
                <span className="text-white">{selectedPassBooking.username}</span>
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              <button
                onClick={() => window.print()}
                className="w-full py-2.5 bg-[#00E676] text-black font-heading font-bold text-xs uppercase rounded"
              >
                Print / Save Pass
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AccountView;
