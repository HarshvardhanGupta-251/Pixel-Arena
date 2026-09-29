import {
  Court,
  PricingRule,
  Slot,
  Booking,
  Order,
  MenuItem,
  MenuCategory,
  Tournament,
  TournamentRegistration,
  SiteSettings,
  User,
  AdminUser,
  AuditLog,
  SlotStatus,
  BookingStatus,
  OrderStatus,
} from "@/types";
import {
  INITIAL_COURTS,
  INITIAL_PRICING,
  INITIAL_CATEGORIES,
  INITIAL_MENU_ITEMS,
  INITIAL_TOURNAMENTS,
  INITIAL_SITE_SETTINGS,
  INITIAL_ADMIN_USERS,
} from "./seed-data";
import { getSlotId, calculateSlotPrice } from "./booking-engine";
import { generateRefCode } from "./utils";

const STORAGE_KEYS = {
  COURTS: "pixel_courts_v1",
  PRICING: "pixel_pricing_v1",
  SLOTS: "pixel_slots_v1",
  BOOKINGS: "pixel_bookings_v1",
  ORDERS: "pixel_orders_v1",
  MENU_ITEMS: "pixel_menu_items_v1",
  MENU_CATEGORIES: "pixel_menu_categories_v1",
  TOURNAMENTS: "pixel_tournaments_v1",
  REGISTRATIONS: "pixel_registrations_v1",
  SETTINGS: "pixel_settings_v1",
  CURRENT_USER: "pixel_current_user_v1",
  ADMIN_USER: "pixel_admin_user_v1",
  UTR_INDEX: "pixel_utr_index_v1",
  AUDIT_LOGS: "pixel_audit_logs_v1",
  CART: "pixel_cart_v1",
};

// Cross-tab broadcast channel for real-time slot sync
let broadcastChannel: BroadcastChannel | null = null;
if (typeof window !== "undefined" && "BroadcastChannel" in window) {
  try {
    broadcastChannel = new BroadcastChannel("pixel_arena_realtime");
  } catch (e) {
    console.warn("BroadcastChannel not supported", e);
  }
}

// Memory cache of state
class ArenaStore {
  private listeners: Set<() => void> = new Set();

  constructor() {
    if (typeof window !== "undefined") {
      this.initSeedData();

      // Listen for updates from other tabs
      if (broadcastChannel) {
        broadcastChannel.onmessage = (event) => {
          if (event.data?.type === "SYNC") {
            this.notifyListeners();
          }
        };
      }

      // Check for hold expirations every 10 seconds
      setInterval(() => {
        this.cleanExpiredHolds();
      }, 10000);
    }
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach((listener) => {
      try {
        listener();
      } catch (e) {
        console.error("Store listener error:", e);
      }
    });
  }

  private broadcastUpdate() {
    this.notifyListeners();
    if (broadcastChannel) {
      broadcastChannel.postMessage({ type: "SYNC", timestamp: Date.now() });
    }
  }

  // --- LocalStorage helpers ---
  private getItem<T>(key: string, defaultValue: T): T {
    if (typeof window === "undefined") return defaultValue;
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : defaultValue;
    } catch {
      return defaultValue;
    }
  }

  private setItem<T>(key: string, value: T): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error("Storage error:", e);
    }
  }

  public initSeedData(forceReset: boolean = false) {
    if (typeof window === "undefined") return;

    if (forceReset || !localStorage.getItem(STORAGE_KEYS.COURTS)) {
      this.setItem(STORAGE_KEYS.COURTS, INITIAL_COURTS);
    }
    if (forceReset || !localStorage.getItem(STORAGE_KEYS.PRICING)) {
      this.setItem(STORAGE_KEYS.PRICING, INITIAL_PRICING);
    }
    if (forceReset || !localStorage.getItem(STORAGE_KEYS.MENU_ITEMS)) {
      this.setItem(STORAGE_KEYS.MENU_ITEMS, INITIAL_MENU_ITEMS);
    }
    if (forceReset || !localStorage.getItem(STORAGE_KEYS.MENU_CATEGORIES)) {
      this.setItem(STORAGE_KEYS.MENU_CATEGORIES, INITIAL_CATEGORIES);
    }
    if (forceReset || !localStorage.getItem(STORAGE_KEYS.TOURNAMENTS)) {
      this.setItem(STORAGE_KEYS.TOURNAMENTS, INITIAL_TOURNAMENTS);
    }
    if (forceReset || !localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
      this.setItem(STORAGE_KEYS.SETTINGS, INITIAL_SITE_SETTINGS);
    } else {
      const existingSettings = this.getItem<SiteSettings>(STORAGE_KEYS.SETTINGS, INITIAL_SITE_SETTINGS);
      if (existingSettings.city?.includes("Bangalore") || existingSettings.address?.includes("Bellandur")) {
        this.setItem(STORAGE_KEYS.SETTINGS, {
          ...existingSettings,
          city: INITIAL_SITE_SETTINGS.city,
          address: INITIAL_SITE_SETTINGS.address,
          mapEmbedUrl: INITIAL_SITE_SETTINGS.mapEmbedUrl,
          mapsUrl: INITIAL_SITE_SETTINGS.mapsUrl,
        });
      }
    }

    // Default demo customer if not logged in
    if (!localStorage.getItem(STORAGE_KEYS.CURRENT_USER)) {
      const demoUser: User = {
        uid: "user_demo_1",
        username: "Rohan_Striker",
        phone: "+91 98450 12345",
        role: "customer",
        createdAt: new Date().toISOString(),
      };
      this.setItem(STORAGE_KEYS.CURRENT_USER, demoUser);
    }

    // Populate a sample confirmed booking so Account page looks populated immediately
    if (forceReset || !localStorage.getItem(STORAGE_KEYS.BOOKINGS)) {
      const sampleBooking: Booking = {
        id: "bk_sample_1",
        refCode: generateRefCode("BK"),
        userId: "user_demo_1",
        username: "Rohan_Striker",
        phone: "+91 98450 12345",
        sport: "cricket",
        courtId: "court_cricket_main",
        courtName: "Main Cricket Turf (Pitch & Nets)",
        zoneId: "zone_cricket",
        date: new Date().toISOString().slice(0, 10),
        startTime: "19:00",
        endTime: "21:00",
        durationHours: 2,
        slotIds: [
          getSlotId("zone_cricket", new Date().toISOString().slice(0, 10), "19:00"),
          getSlotId("zone_cricket", new Date().toISOString().slice(0, 10), "20:00"),
        ],
        amount: 2600,
        status: "CONFIRMED",
        utr: "123456789012",
        createdAt: Date.now() - 3600000 * 2,
        holdExpiresAt: Date.now() + 86400000,
        approvedBy: "admin_super_1",
        approvedAt: Date.now() - 3600000,
      };

      this.setItem(STORAGE_KEYS.BOOKINGS, [sampleBooking]);

      // Seed slots for this sample booking
      const slots = this.getSlots();
      sampleBooking.slotIds.forEach((slotId, idx) => {
        const time = idx === 0 ? "19:00" : "20:00";
        const endT = idx === 0 ? "20:00" : "21:00";
        slots[slotId] = {
          id: slotId,
          zoneId: "zone_cricket",
          courtId: "court_cricket_main",
          date: sampleBooking.date,
          time,
          endTime: endT,
          status: "CONFIRMED",
          price: 1300,
          bookingId: sampleBooking.id,
        };
      });
      this.setItem(STORAGE_KEYS.SLOTS, slots);

      // Seed UTR
      const utrs = this.getUtrIndex();
      utrs["123456789012"] = { refType: "booking", refId: sampleBooking.id };
      this.setItem(STORAGE_KEYS.UTR_INDEX, utrs);
    }
  }

  // --- GETTERS ---
  public getCourts(): Court[] {
    return this.getItem<Court[]>(STORAGE_KEYS.COURTS, INITIAL_COURTS);
  }

  public getPricing(): PricingRule[] {
    return this.getItem<PricingRule[]>(STORAGE_KEYS.PRICING, INITIAL_PRICING);
  }

  public getSlots(): Record<string, Slot> {
    return this.getItem<Record<string, Slot>>(STORAGE_KEYS.SLOTS, {});
  }

  public getBookings(): Booking[] {
    return this.getItem<Booking[]>(STORAGE_KEYS.BOOKINGS, []);
  }

  public getOrders(): Order[] {
    return this.getItem<Order[]>(STORAGE_KEYS.ORDERS, []);
  }

  public getMenuItems(): MenuItem[] {
    return this.getItem<MenuItem[]>(STORAGE_KEYS.MENU_ITEMS, INITIAL_MENU_ITEMS);
  }

  public getMenuCategories(): MenuCategory[] {
    return this.getItem<MenuCategory[]>(STORAGE_KEYS.MENU_CATEGORIES, INITIAL_CATEGORIES);
  }

  public getTournaments(): Tournament[] {
    return this.getItem<Tournament[]>(STORAGE_KEYS.TOURNAMENTS, INITIAL_TOURNAMENTS);
  }

  public getTournamentRegistrations(): TournamentRegistration[] {
    return this.getItem<TournamentRegistration[]>(STORAGE_KEYS.REGISTRATIONS, []);
  }

  public getSettings(): SiteSettings {
    return this.getItem<SiteSettings>(STORAGE_KEYS.SETTINGS, INITIAL_SITE_SETTINGS);
  }

  public getCurrentUser(): User | null {
    return this.getItem<User | null>(STORAGE_KEYS.CURRENT_USER, null);
  }

  public getAdminUser(): AdminUser | null {
    return this.getItem<AdminUser | null>(STORAGE_KEYS.ADMIN_USER, null);
  }

  public getUtrIndex(): Record<string, { refType: string; refId: string }> {
    return this.getItem<Record<string, { refType: string; refId: string }>>(STORAGE_KEYS.UTR_INDEX, {});
  }

  public getAuditLogs(): AuditLog[] {
    return this.getItem<AuditLog[]>(STORAGE_KEYS.AUDIT_LOGS, []);
  }

  // --- CART MANAGEMENT ---
  public getCart(): Record<string, { item: MenuItem; qty: number }> {
    return this.getItem<Record<string, { item: MenuItem; qty: number }>>(STORAGE_KEYS.CART, {});
  }

  public addToCart(item: MenuItem): void {
    const cart = this.getCart();
    if (cart[item.id]) {
      cart[item.id].qty += 1;
    } else {
      cart[item.id] = { item, qty: 1 };
    }
    this.setItem(STORAGE_KEYS.CART, cart);
    this.broadcastUpdate();
  }

  public removeFromCart(itemId: string): void {
    const cart = this.getCart();
    if (!cart[itemId]) return;
    if (cart[itemId].qty <= 1) {
      delete cart[itemId];
    } else {
      cart[itemId].qty -= 1;
    }
    this.setItem(STORAGE_KEYS.CART, cart);
    this.broadcastUpdate();
  }

  public clearCart(): void {
    this.setItem(STORAGE_KEYS.CART, {});
    this.broadcastUpdate();
  }

  public getCartCount(): number {
    const cart = this.getCart();
    return Object.values(cart).reduce((sum, entry) => sum + entry.qty, 0);
  }

  public getCartTotal(): { subtotal: number; tax: number; total: number } {
    const cart = this.getCart();
    const subtotal = Object.values(cart).reduce((sum, entry) => sum + entry.item.price * entry.qty, 0);
    const taxPercent = this.getSettings().taxPercent || 5;
    const tax = Math.round((subtotal * taxPercent) / 100);
    return { subtotal, tax, total: subtotal + tax };
  }

  // --- AUTH METHODS ---
  public loginCustomer(username: string, phone: string): User {
    const existing = this.getCurrentUser();
    const user: User = {
      uid: existing?.phone === phone ? existing.uid : `user_${Date.now()}`,
      username: username || existing?.username || `Player_${phone.slice(-4)}`,
      phone,
      role: "customer",
      createdAt: existing?.createdAt || new Date().toISOString(),
    };
    this.setItem(STORAGE_KEYS.CURRENT_USER, user);
    this.broadcastUpdate();
    return user;
  }

  public logoutCustomer() {
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }
    this.broadcastUpdate();
  }

  public loginAdmin(email: string, role: "superadmin" | "staff" = "superadmin"): AdminUser {
    const admin: AdminUser = {
      id: email.includes("staff") ? "admin_staff_1" : "admin_super_1",
      email,
      name: email.includes("staff") ? "Arena Staff Manager" : "Super Admin (Owner)",
      role,
      createdAt: new Date().toISOString(),
    };
    this.setItem(STORAGE_KEYS.ADMIN_USER, admin);
    this.broadcastUpdate();
    return admin;
  }

  public logoutAdmin() {
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEYS.ADMIN_USER);
    }
    this.broadcastUpdate();
  }

  // --- BOOKING ENGINE (ATOMIC TRANSACTIONS & MULTI-SLOT LOCKS) ---

  /**
   * Acquire a 10-minute hold atomically
   */
  public acquireHold(params: {
    userId: string;
    username: string;
    phone: string;
    courtId: string;
    date: string;
    times: string[]; // e.g. ["18:00", "19:00"]
    notes?: string;
  }): { success: boolean; booking?: Booking; error?: string } {
    const courts = this.getCourts();
    const court = courts.find((c) => c.id === params.courtId);
    if (!court) {
      return { success: false, error: "Court not found" };
    }

    const pricing = this.getPricing();
    const slots = this.getSlots();
    const now = Date.now();
    const holdMinutes = this.getSettings().holdMinutes || 10;
    const expiresAt = now + holdMinutes * 60 * 1000;

    // Check user active holds limit (max 2 active holds per user)
    const bookings = this.getBookings();
    const activeHolds = bookings.filter(
      (b) => b.userId === params.userId && b.status === "HELD" && b.holdExpiresAt > now
    );
    if (activeHolds.length >= 2) {
      return {
        success: false,
        error: "You already have 2 pending slot reservations. Please complete payment or let them expire.",
      };
    }

    // Sort times ascending to prevent deadlocks
    const sortedTimes = [...params.times].sort((a, b) => a.localeCompare(b));

    // Construct slot IDs
    const slotIds = sortedTimes.map((t) => getSlotId(court.zoneId, params.date, t));

    // ATOMIC CHECK: Verify all requested slots are free
    for (const slotId of slotIds) {
      const existingSlot = slots[slotId];
      if (existingSlot) {
        // If confirmed, pending approval, or blocked -> taken
        if (
          existingSlot.status === "CONFIRMED" ||
          existingSlot.status === "PENDING_APPROVAL" ||
          existingSlot.status === "BLOCKED"
        ) {
          return {
            success: false,
            error: `Slot ${existingSlot.time} is already booked or blocked by another match.`,
          };
        }

        // If held by someone else and not expired
        if (
          existingSlot.status === "HELD" &&
          existingSlot.expiresAt &&
          existingSlot.expiresAt > now &&
          existingSlot.holdBy !== params.userId
        ) {
          return {
            success: false,
            error: `Slot ${existingSlot.time} is currently being booked by someone else. Please try another slot.`,
          };
        }
      }
    }

    // Compute prices
    let totalAmount = 0;
    sortedTimes.forEach((time) => {
      const price = calculateSlotPrice(court.sport, params.date, time, pricing, court.hourlyBaseRate);
      totalAmount += price;
    });

    // Create booking document
    const startTime = sortedTimes[0];
    const lastTime = sortedTimes[sortedTimes.length - 1];
    const [lastH] = lastTime.split(":").map(Number);
    const endTime = `${((lastH + 1) % 24).toString().padStart(2, "0")}:00`;

    const bookingId = `bk_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const newBooking: Booking = {
      id: bookingId,
      refCode: generateRefCode("BK"),
      userId: params.userId,
      username: params.username,
      phone: params.phone,
      sport: court.sport,
      courtId: court.id,
      courtName: court.name,
      zoneId: court.zoneId,
      date: params.date,
      startTime,
      endTime,
      durationHours: sortedTimes.length,
      slotIds,
      amount: totalAmount,
      status: "HELD",
      createdAt: now,
      holdExpiresAt: expiresAt,
      notes: params.notes,
    };

    // Lock all slots
    sortedTimes.forEach((time, index) => {
      const slotId = slotIds[index];
      const [h] = time.split(":").map(Number);
      const slotEnd = `${((h + 1) % 24).toString().padStart(2, "0")}:00`;
      const price = calculateSlotPrice(court.sport, params.date, time, pricing, court.hourlyBaseRate);

      slots[slotId] = {
        id: slotId,
        zoneId: court.zoneId,
        courtId: court.id,
        date: params.date,
        time,
        endTime: slotEnd,
        status: "HELD",
        price,
        bookingId,
        holdBy: params.userId,
        expiresAt,
      };
    });

    // Persist
    bookings.push(newBooking);
    this.setItem(STORAGE_KEYS.BOOKINGS, bookings);
    this.setItem(STORAGE_KEYS.SLOTS, slots);

    this.broadcastUpdate();
    return { success: true, booking: newBooking };
  }

  /**
   * User submits payment UTR proof
   */
  public submitBookingPayment(params: {
    bookingId: string;
    utr: string;
    screenshotUrl?: string;
  }): { success: boolean; error?: string } {
    const utr = params.utr.trim();
    if (!/^\d{12}$/.test(utr)) {
      return { success: false, error: "UTR must be a valid 12-digit number." };
    }

    // Check duplicate UTR
    const utrIndex = this.getUtrIndex();
    if (utrIndex[utr] && utrIndex[utr].refId !== params.bookingId) {
      return {
        success: false,
        error: "This UPI Transaction ID (UTR) has already been submitted for another booking/order. Please enter the unique UTR for this transaction.",
      };
    }

    const bookings = this.getBookings();
    const booking = bookings.find((b) => b.id === params.bookingId);
    if (!booking) {
      return { success: false, error: "Booking record not found." };
    }

    if (booking.status === "EXPIRED" || (booking.status === "HELD" && booking.holdExpiresAt < Date.now())) {
      return { success: false, error: "The 10-minute hold has expired. Please select your slot again." };
    }

    booking.status = "PENDING_APPROVAL";
    booking.utr = utr;
    if (params.screenshotUrl) {
      booking.screenshotUrl = params.screenshotUrl;
    }

    // Update slot statuses
    const slots = this.getSlots();
    booking.slotIds.forEach((slotId) => {
      if (slots[slotId]) {
        slots[slotId].status = "PENDING_APPROVAL";
      }
    });

    // Register UTR
    utrIndex[utr] = { refType: "booking", refId: booking.id };

    this.setItem(STORAGE_KEYS.BOOKINGS, bookings);
    this.setItem(STORAGE_KEYS.SLOTS, slots);
    this.setItem(STORAGE_KEYS.UTR_INDEX, utrIndex);

    this.broadcastUpdate();
    return { success: true };
  }

  /**
   * Admin approves booking
   */
  public adminApproveBooking(bookingId: string, adminId: string): boolean {
    const bookings = this.getBookings();
    const booking = bookings.find((b) => b.id === bookingId);
    if (!booking) return false;

    booking.status = "CONFIRMED";
    booking.approvedBy = adminId;
    booking.approvedAt = Date.now();

    const slots = this.getSlots();
    booking.slotIds.forEach((slotId) => {
      if (slots[slotId]) {
        slots[slotId].status = "CONFIRMED";
      }
    });

    this.addAuditLog({
      adminId,
      adminName: this.getAdminUser()?.name || "Admin",
      action: "APPROVE_BOOKING",
      entityType: "booking",
      entityId: bookingId,
      details: `Approved booking ${booking.refCode} for ${booking.courtName} (${booking.date} ${booking.startTime}-${booking.endTime}) amount ₹${booking.amount}`,
    });

    this.setItem(STORAGE_KEYS.BOOKINGS, bookings);
    this.setItem(STORAGE_KEYS.SLOTS, slots);
    this.broadcastUpdate();
    return true;
  }

  /**
   * Admin rejects booking
   */
  public adminRejectBooking(bookingId: string, reason: string, adminId: string): boolean {
    const bookings = this.getBookings();
    const booking = bookings.find((b) => b.id === bookingId);
    if (!booking) return false;

    booking.status = "REJECTED";
    booking.rejectReason = reason;

    // Release slots immediately!
    const slots = this.getSlots();
    booking.slotIds.forEach((slotId) => {
      delete slots[slotId];
    });

    // Remove UTR reservation so it can be re-entered if user made a typo
    if (booking.utr) {
      const utrIndex = this.getUtrIndex();
      delete utrIndex[booking.utr];
      this.setItem(STORAGE_KEYS.UTR_INDEX, utrIndex);
    }

    this.addAuditLog({
      adminId,
      adminName: this.getAdminUser()?.name || "Admin",
      action: "REJECT_BOOKING",
      entityType: "booking",
      entityId: bookingId,
      details: `Rejected booking ${booking.refCode}. Reason: ${reason}. Slots released.`,
    });

    this.setItem(STORAGE_KEYS.BOOKINGS, bookings);
    this.setItem(STORAGE_KEYS.SLOTS, slots);
    this.broadcastUpdate();
    return true;
  }

  /**
   * Admin / User cancels booking
   */
  public cancelBooking(bookingId: string, reason: string = "User requested cancellation"): boolean {
    const bookings = this.getBookings();
    const booking = bookings.find((b) => b.id === bookingId);
    if (!booking) return false;

    booking.status = "CANCELLED";
    booking.cancelledAt = Date.now();
    booking.rejectReason = reason;

    // Release slots
    const slots = this.getSlots();
    booking.slotIds.forEach((slotId) => {
      delete slots[slotId];
    });

    this.setItem(STORAGE_KEYS.BOOKINGS, bookings);
    this.setItem(STORAGE_KEYS.SLOTS, slots);
    this.broadcastUpdate();
    return true;
  }

  /**
   * Admin creates manual walk-in / phone booking
   */
  public adminCreateManualBooking(params: {
    courtId: string;
    date: string;
    times: string[];
    customerName: string;
    customerPhone: string;
    amount: number;
    notes?: string;
    adminId: string;
  }): { success: boolean; booking?: Booking; error?: string } {
    const courts = this.getCourts();
    const court = courts.find((c) => c.id === params.courtId);
    if (!court) return { success: false, error: "Court not found" };

    const slots = this.getSlots();
    const sortedTimes = [...params.times].sort();
    const slotIds = sortedTimes.map((t) => getSlotId(court.zoneId, params.date, t));

    // Verify slots are not confirmed
    for (const slotId of slotIds) {
      const s = slots[slotId];
      if (s && (s.status === "CONFIRMED" || s.status === "BLOCKED")) {
        return { success: false, error: `Slot ${s.time} is already booked or blocked.` };
      }
    }

    const startTime = sortedTimes[0];
    const lastTime = sortedTimes[sortedTimes.length - 1];
    const [lastH] = lastTime.split(":").map(Number);
    const endTime = `${((lastH + 1) % 24).toString().padStart(2, "0")}:00`;

    const bookingId = `bk_manual_${Date.now()}`;
    const newBooking: Booking = {
      id: bookingId,
      refCode: generateRefCode("WALK"),
      userId: `walkin_${params.customerPhone.slice(-4)}`,
      username: params.customerName,
      phone: params.customerPhone,
      sport: court.sport,
      courtId: court.id,
      courtName: court.name,
      zoneId: court.zoneId,
      date: params.date,
      startTime,
      endTime,
      durationHours: sortedTimes.length,
      slotIds,
      amount: params.amount,
      status: "CONFIRMED",
      createdAt: Date.now(),
      holdExpiresAt: Date.now() + 86400000,
      approvedBy: params.adminId,
      approvedAt: Date.now(),
      notes: `Walk-in / Direct: ${params.notes || "Paid at venue"}`,
    };

    sortedTimes.forEach((time, idx) => {
      const slotId = slotIds[idx];
      const [h] = time.split(":").map(Number);
      const slotEnd = `${((h + 1) % 24).toString().padStart(2, "0")}:00`;
      slots[slotId] = {
        id: slotId,
        zoneId: court.zoneId,
        courtId: court.id,
        date: params.date,
        time,
        endTime: slotEnd,
        status: "CONFIRMED",
        price: Math.round(params.amount / sortedTimes.length),
        bookingId,
      };
    });

    const bookings = this.getBookings();
    bookings.push(newBooking);

    this.addAuditLog({
      adminId: params.adminId,
      adminName: this.getAdminUser()?.name || "Admin",
      action: "MANUAL_BOOKING",
      entityType: "booking",
      entityId: bookingId,
      details: `Created walk-in booking ${newBooking.refCode} for ${params.customerName} (₹${params.amount})`,
    });

    this.setItem(STORAGE_KEYS.BOOKINGS, bookings);
    this.setItem(STORAGE_KEYS.SLOTS, slots);
    this.broadcastUpdate();
    return { success: true, booking: newBooking };
  }

  /**
   * Admin blocks slots for maintenance / tournament
   */
  public adminBlockSlots(params: {
    zoneId: string;
    courtId: string;
    date: string;
    times: string[];
    reason: string;
    adminId: string;
  }): boolean {
    const slots = this.getSlots();
    params.times.forEach((time) => {
      const slotId = getSlotId(params.zoneId, params.date, time);
      const [h] = time.split(":").map(Number);
      const slotEnd = `${((h + 1) % 24).toString().padStart(2, "0")}:00`;

      slots[slotId] = {
        id: slotId,
        zoneId: params.zoneId,
        courtId: params.courtId,
        date: params.date,
        time,
        endTime: slotEnd,
        status: "BLOCKED",
        price: 0,
      };
    });

    this.addAuditLog({
      adminId: params.adminId,
      adminName: this.getAdminUser()?.name || "Admin",
      action: "BLOCK_SLOTS",
      entityType: "slot",
      entityId: `${params.zoneId}_${params.date}`,
      details: `Blocked ${params.times.length} slots on ${params.date}. Reason: ${params.reason}`,
    });

    this.setItem(STORAGE_KEYS.SLOTS, slots);
    this.broadcastUpdate();
    return true;
  }

  /**
   * Admin unblocks a slot
   */
  public adminUnblockSlot(slotId: string, adminId: string): boolean {
    const slots = this.getSlots();
    if (slots[slotId] && slots[slotId].status === "BLOCKED") {
      delete slots[slotId];
      this.setItem(STORAGE_KEYS.SLOTS, slots);
      this.addAuditLog({
        adminId,
        adminName: this.getAdminUser()?.name || "Admin",
        action: "UNBLOCK_SLOT",
        entityType: "slot",
        entityId: slotId,
        details: `Unblocked slot ${slotId}`,
      });
      this.broadcastUpdate();
      return true;
    }
    return false;
  }

  /**
   * Release expired holds (10-minute timeout)
   */
  public cleanExpiredHolds() {
    const now = Date.now();
    const bookings = this.getBookings();
    const slots = this.getSlots();
    let hasChanges = false;

    bookings.forEach((b) => {
      if (b.status === "HELD" && b.holdExpiresAt < now) {
        b.status = "EXPIRED";
        hasChanges = true;
        // Free slots
        b.slotIds.forEach((slotId) => {
          if (slots[slotId] && slots[slotId].status === "HELD") {
            delete slots[slotId];
          }
        });
      }
    });

    if (hasChanges) {
      this.setItem(STORAGE_KEYS.BOOKINGS, bookings);
      this.setItem(STORAGE_KEYS.SLOTS, slots);
      this.broadcastUpdate();
    }
  }

  // --- CAFE ORDER FLOW ---
  public createCafeOrder(params: {
    userId: string;
    username: string;
    phone: string;
    items: { itemId: string; name: string; price: number; qty: number; isVeg: boolean }[];
    orderType: "pickup" | "serve_court";
    courtOrTable?: string;
    notes?: string;
    bookingId?: string;
  }): Order {
    const subtotal = params.items.reduce((sum, item) => sum + item.price * item.qty, 0);
    const taxPercent = this.getSettings().taxPercent || 5;
    const tax = Math.round((subtotal * taxPercent) / 100);
    const total = subtotal + tax;

    const orderId = `ord_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newOrder: Order = {
      id: orderId,
      refCode: generateRefCode("CAFE"),
      userId: params.userId,
      username: params.username,
      phone: params.phone,
      items: params.items,
      notes: params.notes,
      orderType: params.orderType,
      courtOrTable: params.courtOrTable,
      bookingId: params.bookingId,
      subtotal,
      tax,
      total,
      status: "PLACED",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const orders = this.getOrders();
    orders.unshift(newOrder);
    this.setItem(STORAGE_KEYS.ORDERS, orders);
    this.broadcastUpdate();
    return newOrder;
  }

  public submitOrderPayment(params: {
    orderId: string;
    utr: string;
    screenshotUrl?: string;
  }): { success: boolean; error?: string } {
    const utr = params.utr.trim();
    if (!/^\d{12}$/.test(utr)) {
      return { success: false, error: "UTR must be a 12-digit number." };
    }

    const utrIndex = this.getUtrIndex();
    if (utrIndex[utr] && utrIndex[utr].refId !== params.orderId) {
      return { success: false, error: "This UPI UTR has already been used." };
    }

    const orders = this.getOrders();
    const order = orders.find((o) => o.id === params.orderId);
    if (!order) return { success: false, error: "Order not found." };

    order.utr = utr;
    if (params.screenshotUrl) order.screenshotUrl = params.screenshotUrl;
    order.status = "ACCEPTED";
    order.updatedAt = Date.now();

    utrIndex[utr] = { refType: "order", refId: order.id };

    this.setItem(STORAGE_KEYS.ORDERS, orders);
    this.setItem(STORAGE_KEYS.UTR_INDEX, utrIndex);
    this.broadcastUpdate();
    return { success: true };
  }

  public adminUpdateOrderStatus(orderId: string, status: OrderStatus, adminId: string): boolean {
    const orders = this.getOrders();
    const order = orders.find((o) => o.id === orderId);
    if (!order) return false;

    order.status = status;
    order.updatedAt = Date.now();

    this.addAuditLog({
      adminId,
      adminName: this.getAdminUser()?.name || "Admin",
      action: "UPDATE_ORDER_STATUS",
      entityType: "order",
      entityId: orderId,
      details: `Updated order ${order.refCode} status to ${status}`,
    });

    this.setItem(STORAGE_KEYS.ORDERS, orders);
    this.broadcastUpdate();
    return true;
  }

  // --- TOURNAMENTS ---
  public registerTournament(params: {
    tournamentId: string;
    userId: string;
    teamName: string;
    captainName: string;
    captainPhone: string;
    players: string[];
    notes?: string;
    utr?: string;
    screenshotUrl?: string;
  }): { success: boolean; registration?: TournamentRegistration; error?: string } {
    const tournaments = this.getTournaments();
    const tourn = tournaments.find((t) => t.id === params.tournamentId);
    if (!tourn) return { success: false, error: "Tournament not found" };

    if (tourn.registeredCount >= tourn.maxTeams) {
      return { success: false, error: "Tournament is already full!" };
    }

    if (params.utr) {
      const utrIndex = this.getUtrIndex();
      if (utrIndex[params.utr]) {
        return { success: false, error: "This UTR is already used." };
      }
    }

    const regId = `reg_${Date.now()}`;
    const newReg: TournamentRegistration = {
      id: regId,
      refCode: generateRefCode("TRN"),
      tournamentId: tourn.id,
      tournamentName: tourn.name,
      sport: tourn.sport,
      userId: params.userId,
      teamName: params.teamName,
      captainName: params.captainName,
      captainPhone: params.captainPhone,
      players: params.players,
      notes: params.notes,
      amount: tourn.entryFee,
      status: "PENDING_APPROVAL",
      utr: params.utr,
      screenshotUrl: params.screenshotUrl,
      createdAt: Date.now(),
    };

    if (params.utr) {
      const utrIndex = this.getUtrIndex();
      utrIndex[params.utr] = { refType: "tournament", refId: regId };
      this.setItem(STORAGE_KEYS.UTR_INDEX, utrIndex);
    }

    const regs = this.getTournamentRegistrations();
    regs.unshift(newReg);
    this.setItem(STORAGE_KEYS.REGISTRATIONS, regs);

    this.broadcastUpdate();
    return { success: true, registration: newReg };
  }

  public adminApproveTournamentRegistration(regId: string, adminId: string): boolean {
    const regs = this.getTournamentRegistrations();
    const reg = regs.find((r) => r.id === regId);
    if (!reg) return false;

    reg.status = "CONFIRMED";
    reg.approvedAt = Date.now();

    // Increment registered count
    const tournaments = this.getTournaments();
    const tourn = tournaments.find((t) => t.id === reg.tournamentId);
    if (tourn) {
      tourn.registeredCount = Math.min(tourn.registeredCount + 1, tourn.maxTeams);
      if (tourn.registeredCount >= tourn.maxTeams) {
        tourn.status = "FULL";
      } else if (tourn.registeredCount >= tourn.maxTeams * 0.75) {
        tourn.status = "FILLING_FAST";
      }
      this.setItem(STORAGE_KEYS.TOURNAMENTS, tournaments);
    }

    this.addAuditLog({
      adminId,
      adminName: this.getAdminUser()?.name || "Admin",
      action: "APPROVE_TOURNAMENT_REG",
      entityType: "tournament",
      entityId: regId,
      details: `Approved team ${reg.teamName} for ${reg.tournamentName}`,
    });

    this.setItem(STORAGE_KEYS.REGISTRATIONS, regs);
    this.broadcastUpdate();
    return true;
  }

  public adminRejectTournamentRegistration(regId: string, reason: string, adminId: string): boolean {
    const regs = this.getTournamentRegistrations();
    const reg = regs.find((r) => r.id === regId);
    if (!reg) return false;

    reg.status = "REJECTED";
    reg.rejectReason = reason;

    this.addAuditLog({
      adminId,
      adminName: this.getAdminUser()?.name || "Admin",
      action: "REJECT_TOURNAMENT_REG",
      entityType: "tournament",
      entityId: regId,
      details: `Rejected team ${reg.teamName} for ${reg.tournamentName}. Reason: ${reason}`,
    });

    this.setItem(STORAGE_KEYS.REGISTRATIONS, regs);
    this.broadcastUpdate();
    return true;
  }

  // --- SETTINGS & MANAGEMENT ---
  public updateSettings(settings: Partial<SiteSettings>, adminId: string): void {
    const current = this.getSettings();
    const updated = { ...current, ...settings };
    this.setItem(STORAGE_KEYS.SETTINGS, updated);

    this.addAuditLog({
      adminId,
      adminName: this.getAdminUser()?.name || "Admin",
      action: "UPDATE_SETTINGS",
      entityType: "settings",
      entityId: "site_settings",
      details: `Updated arena site settings & UPI configuration`,
    });

    this.broadcastUpdate();
  }

  public updateMenuItem(item: MenuItem, adminId: string): void {
    const items = this.getMenuItems();
    const index = items.findIndex((i) => i.id === item.id);
    if (index >= 0) {
      items[index] = item;
    } else {
      items.push(item);
    }
    this.setItem(STORAGE_KEYS.MENU_ITEMS, items);

    this.addAuditLog({
      adminId,
      adminName: this.getAdminUser()?.name || "Admin",
      action: "UPDATE_MENU_ITEM",
      entityType: "order",
      entityId: item.id,
      details: `Updated menu item ${item.name}`,
    });

    this.broadcastUpdate();
  }

  public updatePricing(rules: PricingRule[], adminId: string): void {
    this.setItem(STORAGE_KEYS.PRICING, rules);
    this.addAuditLog({
      adminId,
      adminName: this.getAdminUser()?.name || "Admin",
      action: "UPDATE_PRICING",
      entityType: "court",
      entityId: "pricing_rules",
      details: `Updated pricing rules`,
    });
    this.broadcastUpdate();
  }

  private addAuditLog(log: Omit<AuditLog, "id" | "timestamp">) {
    const logs = this.getAuditLogs();
    logs.unshift({
      ...log,
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: Date.now(),
    });
    this.setItem(STORAGE_KEYS.AUDIT_LOGS, logs.slice(0, 150)); // keep last 150
  }
}

export const arenaStore = new ArenaStore();
