import React, { useState, useEffect } from "react";
import { arenaStore } from "@/lib/store";
import {
  Booking,
  Order,
  TournamentRegistration,
  Tournament,
  AdminUser,
  SiteSettings,
  AuditLog,
  Court,
} from "@/types";
import { formatINR } from "@/lib/utils";
import { generateUpiUri } from "@/lib/upi";
import { QRCodeSVG } from "qrcode.react";
import {
  Shield,
  LayoutDashboard,
  CheckCircle2,
  XCircle,
  Clock,
  Calendar,
  Coffee,
  Trophy,
  Settings,
  QrCode,
  Users,
  Search,
  Plus,
  AlertTriangle,
  Phone,
  MessageSquare,
  LogOut,
  RefreshCw,
  Eye,
  Sliders,
  FileText,
  DollarSign,
  ChevronRight,
  X,
  Lock,
} from "lucide-react";

interface AdminPortalProps {
  onClose: () => void;
  adminUser: AdminUser | null;
  onLoginAdmin: (email: string) => void;
  onLogoutAdmin: () => void;
}

export function AdminPortal({
  onClose,
  adminUser,
  onLoginAdmin,
  onLogoutAdmin,
}: AdminPortalProps) {
  // Admin module tab
  const [activeModule, setActiveModule] = useState<
    "dashboard" | "approvals" | "bookings" | "slots" | "kitchen" | "tournaments" | "payment" | "settings" | "audit"
  >("dashboard");

  // State slices
  const [bookings, setBookings] = useState<Booking[]>(arenaStore.getBookings());
  const [orders, setOrders] = useState<Order[]>(arenaStore.getOrders());
  const [registrations, setRegistrations] = useState<TournamentRegistration[]>(
    arenaStore.getTournamentRegistrations()
  );
  const [courts, setCourts] = useState<Court[]>(arenaStore.getCourts());
  const [settings, setSettings] = useState<SiteSettings>(arenaStore.getSettings());
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(arenaStore.getAuditLogs());
  const [menuItems, setMenuItems] = useState(arenaStore.getMenuItems());

  // Login form state
  const [emailInput, setEmailInput] = useState("admin@pixelarena.in");
  const [passwordInput, setPasswordInput] = useState("admin123");
  const [loginError, setLoginError] = useState<string | null>(null);

  // Reject modal state
  const [rejectItem, setRejectItem] = useState<{ type: "booking" | "order" | "reg"; id: string } | null>(null);
  const [rejectReasonText, setRejectReasonText] = useState("UTR not reflected in bank account");

  // Manual booking modal
  const [isManualBookingOpen, setIsManualBookingOpen] = useState(false);
  const [manualCourtId, setManualCourtId] = useState("court_cricket_main");
  const [manualDate, setManualDate] = useState(new Date().toISOString().slice(0, 10));
  const [manualTime, setManualTime] = useState("21:00");
  const [manualName, setManualName] = useState("");
  const [manualPhone, setManualPhone] = useState("");
  const [manualAmount, setManualAmount] = useState(1300);
  const [manualNotes, setManualNotes] = useState("");
  const [manualError, setManualError] = useState<string | null>(null);

  // Slot blocking modal
  const [isBlockSlotOpen, setIsBlockSlotOpen] = useState(false);
  const [blockZoneId, setBlockZoneId] = useState("zone_cricket");
  const [blockDate, setBlockDate] = useState(new Date().toISOString().slice(0, 10));
  const [blockTime, setBlockTime] = useState("14:00");
  const [blockReason, setBlockReason] = useState("Turf Maintenance / Cleaning");

  // Subscribe to changes
  useEffect(() => {
    const unsub = arenaStore.subscribe(() => {
      setBookings([...arenaStore.getBookings()]);
      setOrders([...arenaStore.getOrders()]);
      setRegistrations([...arenaStore.getTournamentRegistrations()]);
      setCourts([...arenaStore.getCourts()]);
      setSettings({ ...arenaStore.getSettings() });
      setAuditLogs([...arenaStore.getAuditLogs()]);
      setMenuItems([...arenaStore.getMenuItems()]);
    });
    return unsub;
  }, []);

  // Compute metrics
  const pendingBookings = bookings.filter((b) => b.status === "PENDING_APPROVAL");
  const pendingOrders = orders.filter((o) => o.status === "PLACED" || o.status === "ACCEPTED");
  const pendingRegistrations = registrations.filter((r) => r.status === "PENDING_APPROVAL");
  const totalPendingCount =
    pendingBookings.length + pendingOrders.length + pendingRegistrations.length;

  const confirmedBookings = bookings.filter((b) => b.status === "CONFIRMED");
  const totalConfirmedRevenue =
    confirmedBookings.reduce((sum, b) => sum + b.amount, 0) +
    orders
      .filter((o) => o.status === "COMPLETED" || o.status === "READY" || o.status === "PREPARING")
      .reduce((sum, o) => sum + o.total, 0) +
    registrations
      .filter((r) => r.status === "CONFIRMED")
      .reduce((sum, r) => sum + r.amount, 0);

  // Handle Admin Login
  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) {
      setLoginError("Please enter admin email.");
      return;
    }
    onLoginAdmin(emailInput.trim());
    setLoginError(null);
  };

  // Actions
  const handleApproveBooking = (bookingId: string) => {
    if (!adminUser) return;
    arenaStore.adminApproveBooking(bookingId, adminUser.id);
  };

  const handleConfirmReject = () => {
    if (!adminUser || !rejectItem) return;
    if (rejectItem.type === "booking") {
      arenaStore.adminRejectBooking(rejectItem.id, rejectReasonText, adminUser.id);
    } else if (rejectItem.type === "reg") {
      arenaStore.adminRejectTournamentRegistration(rejectItem.id, rejectReasonText, adminUser.id);
    }
    setRejectItem(null);
    setRejectReasonText("UTR not reflected in bank account");
  };

  const handleKitchenStatus = (orderId: string, status: any) => {
    if (!adminUser) return;
    arenaStore.adminUpdateOrderStatus(orderId, status, adminUser.id);
  };

  const handleManualBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setManualError(null);

    if (!manualName.trim() || !manualPhone.trim()) {
      setManualError("Please enter customer name and phone.");
      return;
    }

    const res = arenaStore.adminCreateManualBooking({
      courtId: manualCourtId,
      date: manualDate,
      times: [manualTime],
      customerName: manualName,
      customerPhone: manualPhone,
      amount: manualAmount,
      notes: manualNotes,
      adminId: adminUser?.id || "admin_super_1",
    });

    if (res.success) {
      setIsManualBookingOpen(false);
      setManualName("");
      setManualPhone("");
      setManualNotes("");
    } else {
      setManualError(res.error || "Slot is already booked.");
    }
  };

  const handleBlockSlotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    arenaStore.adminBlockSlots({
      zoneId: blockZoneId,
      courtId: blockZoneId === "zone_cricket" ? "court_cricket_main" : "court_pickleball_1",
      date: blockDate,
      times: [blockTime],
      reason: blockReason,
      adminId: adminUser?.id || "admin_super_1",
    });
    setIsBlockSlotOpen(false);
  };

  const handleToggleMenuItem = (itemId: string, currentAvailable: boolean) => {
    if (!adminUser) return;
    const item = menuItems.find((i) => i.id === itemId);
    if (item) {
      arenaStore.updateMenuItem({ ...item, available: !currentAvailable }, adminUser.id);
    }
  };

  // If not logged into admin, show secure login
  if (!adminUser) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
        <div className="relative w-full max-w-md bg-[#0a0a0a] border border-[#262626] rounded-xl p-6 md:p-8 shadow-2xl">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-14 h-14 bg-neutral-900 border border-[#00E676] rounded-xl flex items-center justify-center text-[#00E676] mb-3 shadow-[0_0_20px_rgba(0,230,118,0.2)]">
              <Shield className="w-7 h-7" />
            </div>
            <h2 className="font-heading text-xl font-bold uppercase tracking-wider text-white">
              PIXEL ARENA OPS CONTROL ROOM
            </h2>
            <p className="text-xs text-neutral-400 mt-1 font-mono">
              Restricted Area: Arena Owner & Staff Credentials
            </p>
          </div>

          {loginError && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-xs rounded-lg">
              {loginError}
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-heading font-semibold uppercase text-neutral-300 mb-1">
                Admin Email
              </label>
              <input
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                className="w-full px-3 py-2.5 bg-[#141414] border border-[#2a2a2a] focus:border-[#00E676] rounded-md text-white text-xs font-mono focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-heading font-semibold uppercase text-neutral-300 mb-1">
                Password
              </label>
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="w-full px-3 py-2.5 bg-[#141414] border border-[#2a2a2a] focus:border-[#00E676] rounded-md text-white text-xs font-mono focus:outline-none"
                required
              />
            </div>

            {/* Quick 1-click test credentials */}
            <div className="p-3 bg-neutral-900 border border-neutral-800 rounded text-[11px] text-neutral-400 space-y-1">
              <span className="text-[#00E676] font-bold block">Quick Demo Logins:</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setEmailInput("admin@pixelarena.in");
                    setPasswordInput("admin123");
                  }}
                  className="px-2 py-1 bg-black rounded text-neutral-200 hover:text-white border border-neutral-700"
                >
                  Super Admin (Owner)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEmailInput("staff@pixelarena.in");
                    setPasswordInput("staff123");
                  }}
                  className="px-2 py-1 bg-black rounded text-neutral-200 hover:text-white border border-neutral-700"
                >
                  Arena Staff
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-[#00E676] hover:bg-[#00c864] text-black font-heading font-bold text-xs uppercase tracking-wider rounded-md transition-all shadow-[0_0_20px_rgba(0,230,118,0.25)] flex items-center justify-center gap-2 cursor-pointer"
            >
              <Lock className="w-4 h-4" />
              <span>Authenticate Portal Session</span>
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ================= AUTHENTICATED ADMIN CONSOLE =================
  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#080808] text-white overflow-hidden">
      {/* Top Navbar */}
      <div className="h-16 px-4 sm:px-6 bg-[#0e0e0e] border-b border-[#222222] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-black border border-[#00E676] rounded-md flex items-center justify-center text-[#00E676]">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-heading font-bold text-sm tracking-wider uppercase text-white">
                PIXEL ARENA CONTROL ROOM
              </h2>
              <span className="px-2 py-0.5 bg-[#00E676]/20 text-[#00E676] text-[10px] font-mono uppercase font-bold rounded">
                {adminUser.role}
              </span>
            </div>
            <p className="text-[10px] text-neutral-400 font-mono">
              Logged in as {adminUser.name} ({adminUser.email})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {totalPendingCount > 0 && (
            <button
              onClick={() => setActiveModule("approvals")}
              className="px-3 py-1.5 bg-amber-500/20 border border-amber-500 text-amber-300 text-xs font-heading font-bold uppercase rounded flex items-center gap-1.5 animate-pulse cursor-pointer"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>{totalPendingCount} Pending Approvals</span>
            </button>
          )}

          <button
            onClick={onLogoutAdmin}
            className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-md"
            title="Log out of Admin"
          >
            <LogOut className="w-4 h-4" />
          </button>

          <button
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-md"
            title="Close Portal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Workspace with Sidebar */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <aside className="w-60 bg-[#0b0b0b] border-r border-[#1c1c1c] p-3 flex flex-col justify-between shrink-0 overflow-y-auto">
          <div className="space-y-1">
            <button
              onClick={() => setActiveModule("dashboard")}
              className={`w-full p-2.5 rounded-md font-heading text-xs font-semibold uppercase tracking-wider flex items-center gap-2.5 transition-all cursor-pointer ${
                activeModule === "dashboard"
                  ? "bg-[#00E676] text-black"
                  : "text-neutral-400 hover:text-white hover:bg-neutral-900"
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => setActiveModule("approvals")}
              className={`w-full p-2.5 rounded-md font-heading text-xs font-semibold uppercase tracking-wider flex items-center justify-between transition-all cursor-pointer ${
                activeModule === "approvals"
                  ? "bg-[#00E676] text-black"
                  : "text-neutral-400 hover:text-white hover:bg-neutral-900"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>Approvals Inbox</span>
              </div>
              {totalPendingCount > 0 && (
                <span className="w-5 h-5 bg-amber-500 text-black font-mono text-[10px] font-bold rounded-full flex items-center justify-center">
                  {totalPendingCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveModule("bookings")}
              className={`w-full p-2.5 rounded-md font-heading text-xs font-semibold uppercase tracking-wider flex items-center gap-2.5 transition-all cursor-pointer ${
                activeModule === "bookings"
                  ? "bg-[#00E676] text-black"
                  : "text-neutral-400 hover:text-white hover:bg-neutral-900"
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Bookings Manager</span>
            </button>

            <button
              onClick={() => setActiveModule("slots")}
              className={`w-full p-2.5 rounded-md font-heading text-xs font-semibold uppercase tracking-wider flex items-center gap-2.5 transition-all cursor-pointer ${
                activeModule === "slots"
                  ? "bg-[#00E676] text-black"
                  : "text-neutral-400 hover:text-white hover:bg-neutral-900"
              }`}
            >
              <Sliders className="w-4 h-4" />
              <span>Slots & Pricing</span>
            </button>

            <button
              onClick={() => setActiveModule("kitchen")}
              className={`w-full p-2.5 rounded-md font-heading text-xs font-semibold uppercase tracking-wider flex items-center justify-between transition-all cursor-pointer ${
                activeModule === "kitchen"
                  ? "bg-[#00E676] text-black"
                  : "text-neutral-400 hover:text-white hover:bg-neutral-900"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Coffee className="w-4 h-4" />
                <span>Cafe Kitchen</span>
              </div>
              {pendingOrders.length > 0 && (
                <span className="w-5 h-5 bg-[#00E676] text-black font-mono text-[10px] font-bold rounded-full flex items-center justify-center">
                  {pendingOrders.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveModule("tournaments")}
              className={`w-full p-2.5 rounded-md font-heading text-xs font-semibold uppercase tracking-wider flex items-center gap-2.5 transition-all cursor-pointer ${
                activeModule === "tournaments"
                  ? "bg-[#00E676] text-black"
                  : "text-neutral-400 hover:text-white hover:bg-neutral-900"
              }`}
            >
              <Trophy className="w-4 h-4" />
              <span>Tournaments</span>
            </button>

            {adminUser.role === "superadmin" && (
              <>
                <button
                  onClick={() => setActiveModule("payment")}
                  className={`w-full p-2.5 rounded-md font-heading text-xs font-semibold uppercase tracking-wider flex items-center gap-2.5 transition-all cursor-pointer ${
                    activeModule === "payment"
                      ? "bg-[#00E676] text-black"
                      : "text-neutral-400 hover:text-white hover:bg-neutral-900"
                  }`}
                >
                  <QrCode className="w-4 h-4" />
                  <span>UPI Payment Setup</span>
                </button>

                <button
                  onClick={() => setActiveModule("settings")}
                  className={`w-full p-2.5 rounded-md font-heading text-xs font-semibold uppercase tracking-wider flex items-center gap-2.5 transition-all cursor-pointer ${
                    activeModule === "settings"
                      ? "bg-[#00E676] text-black"
                      : "text-neutral-400 hover:text-white hover:bg-neutral-900"
                  }`}
                >
                  <Settings className="w-4 h-4" />
                  <span>Arena Site Settings</span>
                </button>

                <button
                  onClick={() => setActiveModule("audit")}
                  className={`w-full p-2.5 rounded-md font-heading text-xs font-semibold uppercase tracking-wider flex items-center gap-2.5 transition-all cursor-pointer ${
                    activeModule === "audit"
                      ? "bg-[#00E676] text-black"
                      : "text-neutral-400 hover:text-white hover:bg-neutral-900"
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  <span>Audit Logs</span>
                </button>
              </>
            )}
          </div>

          <div className="p-3 bg-[#111111] rounded-lg border border-neutral-800 text-[11px] text-neutral-400 space-y-1">
            <span className="text-[#00E676] font-bold block">Direct Bank Settlement</span>
            <p>All UPI payments go directly to {settings.upiId}</p>
          </div>
        </aside>

        {/* Content Body */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-[#0e0e0e]">
          {/* ================= 1. DASHBOARD ================= */}
          {activeModule === "dashboard" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold font-heading text-white uppercase">
                    ARENA DASHBOARD OVERVIEW
                  </h2>
                  <p className="text-xs text-neutral-400">
                    Real-time operational summary for Pixel Arena
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setIsManualBookingOpen(true)}
                    className="py-2 px-4 bg-[#00E676] text-black font-heading font-bold text-xs uppercase rounded flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Walk-In Booking</span>
                  </button>
                </div>
              </div>

              {/* Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-5 bg-[#141414] border border-neutral-800 rounded-xl space-y-2">
                  <div className="flex items-center justify-between text-neutral-400 text-xs">
                    <span className="font-heading uppercase">Confirmed Revenue</span>
                    <DollarSign className="w-4 h-4 text-[#00E676]" />
                  </div>
                  <div className="text-2xl font-extrabold font-heading text-[#00E676]">
                    {formatINR(totalConfirmedRevenue)}
                  </div>
                  <span className="text-[10px] text-neutral-500 font-mono">
                    Zero gateway commission
                  </span>
                </div>

                <div className="p-5 bg-[#141414] border border-neutral-800 rounded-xl space-y-2">
                  <div className="flex items-center justify-between text-neutral-400 text-xs">
                    <span className="font-heading uppercase">Approvals Queue</span>
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                  </div>
                  <div className="text-2xl font-extrabold font-heading text-amber-400">
                    {totalPendingCount}
                  </div>
                  <span className="text-[10px] text-neutral-500">
                    Awaiting UTR payment verification
                  </span>
                </div>

                <div className="p-5 bg-[#141414] border border-neutral-800 rounded-xl space-y-2">
                  <div className="flex items-center justify-between text-neutral-400 text-xs">
                    <span className="font-heading uppercase">Confirmed Bookings</span>
                    <Calendar className="w-4 h-4 text-blue-400" />
                  </div>
                  <div className="text-2xl font-extrabold font-heading text-white">
                    {confirmedBookings.length}
                  </div>
                  <span className="text-[10px] text-neutral-500">
                    {confirmedBookings.reduce((sum, b) => sum + b.durationHours, 0)} hours reserved
                  </span>
                </div>

                <div className="p-5 bg-[#141414] border border-neutral-800 rounded-xl space-y-2">
                  <div className="flex items-center justify-between text-neutral-400 text-xs">
                    <span className="font-heading uppercase">Live Kitchen Orders</span>
                    <Coffee className="w-4 h-4 text-purple-400" />
                  </div>
                  <div className="text-2xl font-extrabold font-heading text-white">
                    {pendingOrders.length}
                  </div>
                  <span className="text-[10px] text-neutral-500">Being prepped / ready</span>
                </div>
              </div>

              {/* Quick Approvals Teaser */}
              {totalPendingCount > 0 && (
                <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Clock className="w-6 h-6 text-amber-400 animate-spin" />
                    <div>
                      <h4 className="font-heading font-bold text-sm text-white">
                        {totalPendingCount} Customer Requests Waiting for UPI Check
                      </h4>
                      <p className="text-xs text-neutral-300">
                        Check your bank statement for submitted UTRs and approve to unlock customer access passes.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveModule("approvals")}
                    className="py-2 px-4 bg-amber-400 text-black font-heading font-bold text-xs uppercase rounded"
                  >
                    Open Approvals Queue →
                  </button>
                </div>
              )}

              {/* Recent Bookings Feed */}
              <div className="p-5 bg-[#141414] border border-neutral-800 rounded-xl space-y-4">
                <h3 className="font-heading font-bold text-sm text-white uppercase tracking-wider">
                  Recent Court Reservations
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-neutral-300">
                    <thead className="bg-neutral-900 text-neutral-400 font-heading uppercase text-[10px]">
                      <tr>
                        <th className="p-3">Ref Code</th>
                        <th className="p-3">Customer</th>
                        <th className="p-3">Court</th>
                        <th className="p-3">Date & Time</th>
                        <th className="p-3">Amount</th>
                        <th className="p-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-800">
                      {bookings.slice(0, 5).map((b) => (
                        <tr key={b.id} className="hover:bg-neutral-900/50">
                          <td className="p-3 font-mono text-neutral-400">{b.refCode}</td>
                          <td className="p-3 font-medium text-white">{b.username}</td>
                          <td className="p-3">{b.courtName}</td>
                          <td className="p-3 font-mono">
                            {b.date} ({b.startTime}-{b.endTime})
                          </td>
                          <td className="p-3 font-mono text-[#00E676] font-bold">
                            ₹{b.amount}
                          </td>
                          <td className="p-3">
                            <span
                              className={`px-2 py-0.5 text-[9px] font-heading font-bold uppercase rounded ${
                                b.status === "CONFIRMED"
                                  ? "bg-[#00E676]/20 text-[#00E676]"
                                  : b.status === "PENDING_APPROVAL"
                                  ? "bg-amber-500/20 text-amber-300"
                                  : "bg-neutral-800 text-neutral-400"
                              }`}
                            >
                              {b.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ================= 2. APPROVALS INBOX (TOP PRIORITY) ================= */}
          {activeModule === "approvals" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold font-heading text-white uppercase">
                    APPROVALS INBOX
                  </h2>
                  <p className="text-xs text-neutral-400">
                    Verify customer UTR against bank credits. Approving instantly generates the match pass on customer device.
                  </p>
                </div>
                <span className="text-xs font-mono text-amber-400">
                  {totalPendingCount} Action Items Pending
                </span>
              </div>

              {totalPendingCount === 0 ? (
                <div className="p-16 text-center bg-[#141414] border border-neutral-800 rounded-xl space-y-3">
                  <CheckCircle2 className="w-12 h-12 text-[#00E676] mx-auto" />
                  <h3 className="font-heading font-bold text-base text-white">
                    Approvals Queue Clear!
                  </h3>
                  <p className="text-xs text-neutral-400">
                    All submitted UPI payments have been verified and processed.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Pending Bookings */}
                  {pendingBookings.map((b) => (
                    <div
                      key={b.id}
                      className="p-5 bg-[#141414] border border-amber-500/40 rounded-xl flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-lg"
                    >
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 font-heading font-bold text-[10px] uppercase rounded">
                            Court Booking
                          </span>
                          <span className="text-xs font-mono text-neutral-400">
                            Ref: {b.refCode}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-4 text-xs">
                          <div>
                            <span className="text-neutral-500 block">Customer:</span>
                            <span className="font-bold text-white text-sm">{b.username}</span>
                          </div>
                          <div>
                            <span className="text-neutral-500 block">Contact:</span>
                            <div className="flex items-center gap-2 font-mono text-neutral-300">
                              <span>{b.phone}</span>
                              <a
                                href={`https://wa.me/${b.phone.replace(/\D/g, "")}?text=Hi%20${b.username},%20checking%20your%20Pixel%20Arena%20booking%20${b.refCode}`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[#00E676] hover:underline flex items-center gap-0.5"
                              >
                                <MessageSquare className="w-3 h-3" />
                                <span>WhatsApp</span>
                              </a>
                            </div>
                          </div>
                          <div>
                            <span className="text-neutral-500 block">Court & Slot:</span>
                            <span className="font-medium text-white">
                              {b.courtName} • {b.date} ({b.startTime} - {b.endTime})
                            </span>
                          </div>
                        </div>

                        {/* Submitted UTR Box */}
                        <div className="p-3 bg-neutral-900 border border-neutral-800 rounded-lg flex items-center justify-between text-xs max-w-md">
                          <div>
                            <span className="text-neutral-400 block text-[10px] uppercase">
                              Submitted UPI UTR (12 Digits):
                            </span>
                            <span className="font-mono text-base font-bold text-[#00E676]">
                              {b.utr || "Not provided"}
                            </span>
                          </div>
                          <span className="text-lg font-bold font-heading text-white">
                            ₹{b.amount}
                          </span>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-3 shrink-0">
                        <button
                          onClick={() => setRejectItem({ type: "booking", id: b.id })}
                          className="py-2.5 px-4 bg-neutral-900 hover:bg-red-500/20 text-neutral-300 hover:text-red-400 border border-neutral-700 hover:border-red-500/40 rounded-md text-xs font-heading font-semibold uppercase cursor-pointer"
                        >
                          Reject
                        </button>

                        <button
                          onClick={() => handleApproveBooking(b.id)}
                          className="py-2.5 px-6 bg-[#00E676] hover:bg-[#00c864] text-black font-heading font-bold text-xs uppercase tracking-wider rounded-md shadow-[0_0_20px_rgba(0,230,118,0.3)] flex items-center gap-1.5 cursor-pointer"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Approve & Issue Pass</span>
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Pending Registrations */}
                  {pendingRegistrations.map((r) => (
                    <div
                      key={r.id}
                      className="p-5 bg-[#141414] border border-blue-500/40 rounded-xl flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                    >
                      <div className="space-y-2 flex-1">
                        <span className="px-2 py-0.5 bg-blue-500/20 text-blue-300 font-heading font-bold text-[10px] uppercase rounded">
                          Tournament Entry Fee
                        </span>
                        <h4 className="font-heading font-bold text-white text-base">
                          {r.tournamentName} • Team: {r.teamName}
                        </h4>
                        <div className="text-xs text-neutral-400">
                          Captain: {r.captainName} ({r.captainPhone}) • Squad: {r.players.join(", ")}
                        </div>
                        <div className="text-xs font-mono text-[#00E676]">
                          UTR: {r.utr} • Expected: ₹{r.amount}
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setRejectItem({ type: "reg", id: r.id })}
                          className="py-2.5 px-4 bg-neutral-900 text-neutral-300 hover:text-red-400 border border-neutral-700 rounded text-xs font-heading"
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => {
                            if (!adminUser) return;
                            arenaStore.adminApproveTournamentRegistration(r.id, adminUser.id);
                          }}
                          className="py-2.5 px-6 bg-[#00E676] text-black font-heading font-bold text-xs uppercase rounded"
                        >
                          Approve Team Entry
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ================= 3. BOOKINGS MANAGEMENT ================= */}
          {activeModule === "bookings" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold font-heading text-white uppercase">
                    ALL BOOKINGS DIRECTORY
                  </h2>
                  <p className="text-xs text-neutral-400">
                    Manage online and offline walk-in bookings
                  </p>
                </div>
                <button
                  onClick={() => setIsManualBookingOpen(true)}
                  className="py-2.5 px-5 bg-[#00E676] text-black font-heading font-bold text-xs uppercase rounded flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Walk-In / Phone Booking</span>
                </button>
              </div>

              {/* Bookings Table */}
              <div className="p-4 bg-[#141414] border border-neutral-800 rounded-xl overflow-x-auto">
                <table className="w-full text-left text-xs text-neutral-300">
                  <thead className="bg-neutral-900 text-neutral-400 font-heading uppercase text-[10px]">
                    <tr>
                      <th className="p-3">Ref Code</th>
                      <th className="p-3">Customer / Phone</th>
                      <th className="p-3">Court</th>
                      <th className="p-3">Date</th>
                      <th className="p-3">Time</th>
                      <th className="p-3">Amount</th>
                      <th className="p-3">UTR</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800">
                    {bookings.map((b) => (
                      <tr key={b.id} className="hover:bg-neutral-900/50">
                        <td className="p-3 font-mono text-neutral-400">{b.refCode}</td>
                        <td className="p-3">
                          <span className="font-bold text-white block">{b.username}</span>
                          <span className="text-[11px] font-mono text-neutral-500">{b.phone}</span>
                        </td>
                        <td className="p-3">{b.courtName}</td>
                        <td className="p-3 font-mono">{b.date}</td>
                        <td className="p-3 font-mono">
                          {b.startTime} - {b.endTime}
                        </td>
                        <td className="p-3 font-mono text-[#00E676] font-bold">
                          ₹{b.amount}
                        </td>
                        <td className="p-3 font-mono text-neutral-400">
                          {b.utr || "—"}
                        </td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 text-[9px] font-heading font-bold uppercase rounded ${
                              b.status === "CONFIRMED"
                                ? "bg-[#00E676]/20 text-[#00E676]"
                                : b.status === "PENDING_APPROVAL"
                                ? "bg-amber-500/20 text-amber-300"
                                : "bg-neutral-800 text-neutral-400"
                            }`}
                          >
                            {b.status}
                          </span>
                        </td>
                        <td className="p-3 text-right space-x-2">
                          {b.status === "PENDING_APPROVAL" && (
                            <button
                              onClick={() => handleApproveBooking(b.id)}
                              className="text-[#00E676] hover:underline font-bold"
                            >
                              Approve
                            </button>
                          )}
                          {b.status === "CONFIRMED" && (
                            <button
                              onClick={() => {
                                if (confirm("Cancel and free up slots?")) {
                                  arenaStore.cancelBooking(b.id, "Cancelled by Admin");
                                }
                              }}
                              className="text-red-400 hover:underline"
                            >
                              Cancel & Free
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ================= 4. SLOTS & PRICING ================= */}
          {activeModule === "slots" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold font-heading text-white uppercase">
                    SLOTS & GROUND MAINTENANCE
                  </h2>
                  <p className="text-xs text-neutral-400">
                    Block slots for private events, maintenance, or tournaments
                  </p>
                </div>
                <button
                  onClick={() => setIsBlockSlotOpen(true)}
                  className="py-2.5 px-4 bg-red-600 text-white font-heading font-bold text-xs uppercase rounded flex items-center gap-1.5"
                >
                  <AlertTriangle className="w-4 h-4" />
                  <span>Block Slots for Maintenance</span>
                </button>
              </div>

              {/* Courts Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {courts.map((court) => (
                  <div
                    key={court.id}
                    className="p-5 bg-[#141414] border border-neutral-800 rounded-xl space-y-2"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] text-[#00E676] uppercase font-heading font-bold">
                          {court.sport} • {court.zoneId}
                        </span>
                        <h4 className="font-heading font-bold text-lg text-white">
                          {court.name}
                        </h4>
                      </div>
                      <span className="font-mono text-sm text-[#00E676] font-bold">
                        Base ₹{court.hourlyBaseRate}/hr
                      </span>
                    </div>
                    <p className="text-xs text-neutral-400">{court.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================= 5. CAFE KITCHEN VIEW ================= */}
          {activeModule === "kitchen" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold font-heading text-white uppercase">
                    KITCHEN ORDER DISPATCH BOARD
                  </h2>
                  <p className="text-xs text-neutral-400">
                    One-tap order state progression: Accepted → Preparing → Ready → Completed
                  </p>
                </div>
              </div>

              {/* Orders Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {orders.map((o) => (
                  <div
                    key={o.id}
                    className="p-5 bg-[#141414] border border-neutral-800 rounded-xl space-y-4"
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
                      <div>
                        <span className="font-mono text-neutral-400 text-xs">{o.refCode}</span>
                        <h4 className="font-heading font-bold text-sm text-white">
                          {o.courtOrTable}
                        </h4>
                      </div>
                      <span className="px-2 py-0.5 bg-[#00E676]/20 text-[#00E676] font-heading font-bold text-[10px] uppercase rounded">
                        {o.status}
                      </span>
                    </div>

                    <div className="space-y-1.5 text-xs">
                      {o.items.map((i, idx) => (
                        <div key={idx} className="flex justify-between">
                          <span className="font-bold text-white">
                            {i.qty}x {i.name}
                          </span>
                          <span className="font-mono text-neutral-400">₹{i.price * i.qty}</span>
                        </div>
                      ))}
                    </div>

                    {o.notes && (
                      <div className="p-2 bg-neutral-900 border border-neutral-800 text-[11px] text-amber-300 rounded">
                        Note: {o.notes}
                      </div>
                    )}

                    {/* Progress action button */}
                    <div className="pt-2 border-t border-neutral-800 flex gap-2">
                      {o.status === "PLACED" && (
                        <button
                          onClick={() => handleKitchenStatus(o.id, "ACCEPTED")}
                          className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white font-heading font-bold text-xs uppercase rounded"
                        >
                          Accept Order
                        </button>
                      )}
                      {o.status === "ACCEPTED" && (
                        <button
                          onClick={() => handleKitchenStatus(o.id, "PREPARING")}
                          className="w-full py-2 bg-amber-600 hover:bg-amber-500 text-black font-heading font-bold text-xs uppercase rounded"
                        >
                          Mark Preparing
                        </button>
                      )}
                      {o.status === "PREPARING" && (
                        <button
                          onClick={() => handleKitchenStatus(o.id, "READY")}
                          className="w-full py-2 bg-[#00E676] hover:bg-[#00c864] text-black font-heading font-bold text-xs uppercase rounded"
                        >
                          Mark Ready to Serve
                        </button>
                      )}
                      {o.status === "READY" && (
                        <button
                          onClick={() => handleKitchenStatus(o.id, "COMPLETED")}
                          className="w-full py-2 bg-neutral-700 hover:bg-neutral-600 text-white font-heading font-bold text-xs uppercase rounded"
                        >
                          Mark Completed
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Menu Item Availability Toggles */}
              <div className="mt-8 p-5 bg-[#141414] border border-neutral-800 rounded-xl space-y-4">
                <h3 className="font-heading font-bold text-sm text-white uppercase">
                  Menu Items Stock Availability
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {menuItems.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 bg-neutral-900 border border-neutral-800 rounded-lg flex items-center justify-between text-xs"
                    >
                      <span className="font-medium text-white truncate max-w-[160px]">
                        {item.name}
                      </span>
                      <button
                        onClick={() => handleToggleMenuItem(item.id, item.available)}
                        className={`px-2.5 py-1 text-[10px] font-heading font-bold uppercase rounded cursor-pointer ${
                          item.available
                            ? "bg-[#00E676]/20 text-[#00E676] border border-[#00E676]/30"
                            : "bg-red-500/20 text-red-400 border border-red-500/30"
                        }`}
                      >
                        {item.available ? "In Stock" : "Sold Out"}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ================= 6. TOURNAMENTS ================= */}
          {activeModule === "tournaments" && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold font-heading text-white uppercase">
                TOURNAMENT MANAGEMENT
              </h2>
              <div className="p-4 bg-[#141414] border border-neutral-800 rounded-xl space-y-4">
                <p className="text-xs text-neutral-400">
                  Approved teams list and tournament capacities
                </p>
                <div className="space-y-3">
                  {registrations.map((r) => (
                    <div
                      key={r.id}
                      className="p-3 bg-neutral-900 border border-neutral-800 rounded flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-bold text-white block">
                          {r.teamName} ({r.tournamentName})
                        </span>
                        <span className="text-neutral-400">
                          Captain: {r.captainName} • {r.captainPhone}
                        </span>
                      </div>
                      <span className="font-mono text-[#00E676] font-bold">
                        {r.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ================= 7. UPI PAYMENT SETUP ================= */}
          {activeModule === "payment" && (
            <div className="space-y-6 max-w-2xl">
              <div>
                <h2 className="text-2xl font-bold font-heading text-white uppercase">
                  UPI DIRECT SETTLEMENT CONFIG
                </h2>
                <p className="text-xs text-neutral-400">
                  Configure the UPI VPA and payee name where 100% of customer payments are deposited.
                </p>
              </div>

              <div className="p-6 bg-[#141414] border border-neutral-800 rounded-xl space-y-4">
                <div>
                  <label className="block text-xs font-heading font-semibold uppercase text-neutral-300 mb-1">
                    UPI ID (Virtual Payment Address)
                  </label>
                  <input
                    type="text"
                    value={settings.upiId}
                    onChange={(e) =>
                      arenaStore.updateSettings({ upiId: e.target.value }, adminUser.id)
                    }
                    className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded text-xs text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-heading font-semibold uppercase text-neutral-300 mb-1">
                    Payee Name (as registered with bank)
                  </label>
                  <input
                    type="text"
                    value={settings.upiPayeeName}
                    onChange={(e) =>
                      arenaStore.updateSettings({ upiPayeeName: e.target.value }, adminUser.id)
                    }
                    className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded text-xs text-white"
                  />
                </div>

                {/* Live QR Preview */}
                <div className="pt-4 border-t border-neutral-800 flex items-center gap-6">
                  <div className="p-3 bg-white rounded-lg shadow">
                    <QRCodeSVG
                      value={generateUpiUri({
                        vpa: settings.upiId,
                        payeeName: settings.upiPayeeName,
                        amount: 1200,
                        reference: "TEST-QR-PREVIEW",
                      })}
                      size={130}
                    />
                  </div>
                  <div className="space-y-1 text-xs">
                    <span className="font-heading font-bold text-white uppercase">
                      Live Customer Preview
                    </span>
                    <p className="text-neutral-400">
                      When players click Book or Order, this QR code will automatically load with the exact payment amount into their GPay/PhonePe/Paytm app.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================= 8. SITE SETTINGS ================= */}
          {activeModule === "settings" && (
            <div className="space-y-6 max-w-2xl">
              <div>
                <h2 className="text-2xl font-bold font-heading text-white uppercase">
                  ARENA SETTINGS & OPERATING HOURS
                </h2>
                <p className="text-xs text-neutral-400">
                  Update arena contact details, opening times, and slot hold window.
                </p>
              </div>

              <div className="p-6 bg-[#141414] border border-neutral-800 rounded-xl space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-heading font-semibold uppercase text-neutral-300 mb-1">
                      Opening Hour
                    </label>
                    <input
                      type="text"
                      value={settings.openTime}
                      onChange={(e) =>
                        arenaStore.updateSettings({ openTime: e.target.value }, adminUser.id)
                      }
                      className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded text-xs text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-heading font-semibold uppercase text-neutral-300 mb-1">
                      Closing Hour
                    </label>
                    <input
                      type="text"
                      value={settings.closeTime}
                      onChange={(e) =>
                        arenaStore.updateSettings({ closeTime: e.target.value }, adminUser.id)
                      }
                      className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded text-xs text-white font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-heading font-semibold uppercase text-neutral-300 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="text"
                      value={settings.phone}
                      onChange={(e) =>
                        arenaStore.updateSettings({ phone: e.target.value }, adminUser.id)
                      }
                      className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-heading font-semibold uppercase text-neutral-300 mb-1">
                      WhatsApp Number
                    </label>
                    <input
                      type="text"
                      value={settings.whatsapp}
                      onChange={(e) =>
                        arenaStore.updateSettings({ whatsapp: e.target.value }, adminUser.id)
                      }
                      className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded text-xs text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-heading font-semibold uppercase text-neutral-300 mb-1">
                    Arena Physical Address
                  </label>
                  <textarea
                    rows={2}
                    value={settings.address}
                    onChange={(e) =>
                      arenaStore.updateSettings({ address: e.target.value }, adminUser.id)
                    }
                    className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded text-xs text-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ================= 9. AUDIT LOGS ================= */}
          {activeModule === "audit" && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold font-heading text-white uppercase">
                SECURITY & AUDIT LOGS
              </h2>
              <div className="p-4 bg-[#141414] border border-neutral-800 rounded-xl space-y-2">
                {auditLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-3 bg-neutral-900/60 border border-neutral-800/80 rounded flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-bold text-white block">{log.action}</span>
                      <span className="text-neutral-400">{log.details}</span>
                    </div>
                    <span className="text-[10px] font-mono text-neutral-500">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ================= REJECT MODAL ================= */}
      {rejectItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-[#0e0e0e] border border-red-500/40 rounded-xl p-6">
            <h3 className="font-heading font-bold text-lg text-white uppercase">
              Reject Customer Submission
            </h3>
            <p className="text-xs text-neutral-400 mt-1">
              Please enter the reason. The customer will see this explanation and slots will be freed immediately.
            </p>

            <div className="my-4">
              <label className="block text-xs font-heading font-semibold text-neutral-300 mb-1">
                Decline Reason
              </label>
              <textarea
                rows={3}
                value={rejectReasonText}
                onChange={(e) => setRejectReasonText(e.target.value)}
                className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded text-xs text-white"
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setRejectItem(null)}
                className="px-4 py-2 bg-neutral-800 text-neutral-300 text-xs rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReject}
                className="px-4 py-2 bg-red-600 text-white font-heading font-bold text-xs uppercase rounded"
              >
                Confirm Rejection & Free Slots
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MANUAL BOOKING MODAL ================= */}
      {isManualBookingOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-[#0e0e0e] border border-neutral-800 rounded-xl p-6">
            <button
              onClick={() => setIsManualBookingOpen(false)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-heading font-bold text-lg text-white uppercase">
              Create Manual Walk-In Booking
            </h3>
            <p className="text-xs text-neutral-400 mt-0.5">
              Acquires slot in booking engine preventing double-bookings
            </p>

            {manualError && (
              <div className="my-2 p-2 bg-red-500/10 border border-red-500/30 text-red-400 text-xs rounded">
                {manualError}
              </div>
            )}

            <form onSubmit={handleManualBookingSubmit} className="space-y-3 mt-4">
              <div>
                <label className="text-xs text-neutral-300 block mb-1">Court</label>
                <select
                  value={manualCourtId}
                  onChange={(e) => setManualCourtId(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded text-xs text-white"
                >
                  {courts.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.sport})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-neutral-300 block mb-1">Date</label>
                  <input
                    type="date"
                    value={manualDate}
                    onChange={(e) => setManualDate(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded text-xs text-white"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs text-neutral-300 block mb-1">Hour (e.g. 21:00)</label>
                  <input
                    type="text"
                    value={manualTime}
                    onChange={(e) => setManualTime(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded text-xs text-white font-mono"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-neutral-300 block mb-1">Player Name</label>
                  <input
                    type="text"
                    value={manualName}
                    onChange={(e) => setManualName(e.target.value)}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded text-xs text-white"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs text-neutral-300 block mb-1">Player Phone</label>
                  <input
                    type="text"
                    value={manualPhone}
                    onChange={(e) => setManualPhone(e.target.value)}
                    placeholder="98765 43210"
                    className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded text-xs text-white"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-neutral-300 block mb-1">Amount Collected (₹)</label>
                <input
                  type="number"
                  value={manualAmount}
                  onChange={(e) => setManualAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded text-xs text-white font-mono"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-[#00E676] hover:bg-[#00c864] text-black font-heading font-bold text-xs uppercase tracking-wider rounded"
              >
                Confirm & Lock Slot
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ================= BLOCK SLOT MODAL ================= */}
      {isBlockSlotOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-[#0e0e0e] border border-neutral-800 rounded-xl p-6">
            <button
              onClick={() => setIsBlockSlotOpen(false)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-heading font-bold text-lg text-white uppercase">
              Block Slot for Maintenance
            </h3>

            <form onSubmit={handleBlockSlotSubmit} className="space-y-3 mt-4">
              <div>
                <label className="text-xs text-neutral-300 block mb-1">Ground Zone</label>
                <select
                  value={blockZoneId}
                  onChange={(e) => setBlockZoneId(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded text-xs text-white"
                >
                  <option value="zone_cricket">Main Cricket & Volleyball Turf (zone_cricket)</option>
                  <option value="zone_pickleball">Pickleball & Badminton Court (zone_pickleball)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-neutral-300 block mb-1">Date</label>
                  <input
                    type="date"
                    value={blockDate}
                    onChange={(e) => setBlockDate(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded text-xs text-white"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs text-neutral-300 block mb-1">Hour</label>
                  <input
                    type="text"
                    value={blockTime}
                    onChange={(e) => setBlockTime(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded text-xs text-white font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-neutral-300 block mb-1">Reason</label>
                <input
                  type="text"
                  value={blockReason}
                  onChange={(e) => setBlockReason(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded text-xs text-white"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-red-600 hover:bg-red-500 text-white font-heading font-bold text-xs uppercase tracking-wider rounded"
              >
                Close Slot
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminPortal;
