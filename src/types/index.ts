export type SportType = 'cricket' | 'pickleball' | 'badminton' | 'volleyball';

export type SlotStatus =
  | 'AVAILABLE'
  | 'SELECTED'
  | 'HELD'
  | 'PENDING_APPROVAL'
  | 'CONFIRMED'
  | 'BLOCKED'
  | 'PAST';

export type BookingStatus =
  | 'HELD'
  | 'PENDING_APPROVAL'
  | 'CONFIRMED'
  | 'REJECTED'
  | 'EXPIRED'
  | 'CANCELLED'
  | 'COMPLETED';

export type OrderStatus =
  | 'PLACED'
  | 'ACCEPTED'
  | 'PREPARING'
  | 'READY'
  | 'COMPLETED'
  | 'REJECTED'
  | 'CANCELLED';

export type TournamentStatus =
  | 'UPCOMING'
  | 'FILLING_FAST'
  | 'FULL'
  | 'ONGOING'
  | 'COMPLETED';

export type RegistrationStatus =
  | 'PENDING_APPROVAL'
  | 'CONFIRMED'
  | 'REJECTED'
  | 'CANCELLED';

export interface User {
  uid: string;
  username: string;
  phone: string;
  role: 'customer' | 'admin';
  createdAt: string;
}

export interface Court {
  id: string;
  sport: SportType;
  name: string;
  zoneId: string;
  active: boolean;
  image: string;
  description: string;
  hourlyBaseRate: number;
}

export interface PricingRule {
  id: string;
  sport: SportType;
  dayType: 'weekday' | 'weekend';
  window: 'peak' | 'offpeak';
  startTime: string; // HH:mm
  endTime: string;   // HH:mm
  pricePerHour: number;
}

export interface Slot {
  id: string;          // {zoneId}_{YYYYMMDD}_{HHmm}
  zoneId: string;
  courtId: string;
  date: string;        // YYYY-MM-DD
  time: string;        // e.g. "06:00"
  endTime: string;     // e.g. "07:00"
  status: SlotStatus;
  price: number;
  bookingId?: string;
  holdBy?: string;     // uid
  expiresAt?: number;  // timestamp in ms
}

export interface Booking {
  id: string;
  refCode: string;
  userId: string;
  username: string;
  phone: string;
  sport: SportType;
  courtId: string;
  courtName: string;
  zoneId: string;
  date: string;
  startTime: string;
  endTime: string;
  durationHours: number;
  slotIds: string[];
  amount: number;
  status: BookingStatus;
  utr?: string;
  screenshotUrl?: string;
  createdAt: number;
  holdExpiresAt: number;
  approvedBy?: string;
  approvedAt?: number;
  rejectReason?: string;
  cancelledAt?: number;
  notes?: string;
}

export interface MenuItem {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  price: number;
  image: string;
  isVeg: boolean;
  badges: string[];
  available: boolean;
  isCombo?: boolean;
  comboItems?: string[];
  savings?: number;
  order: number;
}

export interface MenuCategory {
  id: string;
  name: string;
  order: number;
  active: boolean;
}

export interface OrderItem {
  itemId: string;
  name: string;
  price: number;
  qty: number;
  isVeg: boolean;
}

export interface Order {
  id: string;
  refCode: string;
  userId: string;
  username: string;
  phone: string;
  items: OrderItem[];
  notes?: string;
  orderType: 'pickup' | 'serve_court';
  courtOrTable?: string;
  bookingId?: string;
  subtotal: number;
  tax: number;
  total: number;
  status: OrderStatus;
  utr?: string;
  screenshotUrl?: string;
  createdAt: number;
  updatedAt: number;
  rejectReason?: string;
}

export interface Tournament {
  id: string;
  name: string;
  sport: SportType;
  banner: string;
  description: string;
  format: 'Knockout' | 'League' | 'Round-Robin';
  startDate: string;
  endDate: string;
  venue: string;
  entryFee: number;
  prizePool: number;
  prizes: { rank: string; amount: number; trophy?: string }[];
  teamSizeMin: number;
  teamSizeMax: number;
  maxTeams: number;
  registeredCount: number;
  registrationDeadline: string;
  rules: string[];
  faq: { q: string; a: string }[];
  status: TournamentStatus;
  fixtures?: { round: string; match: string; time: string; court: string; status: string; winner?: string }[];
  results?: { match: string; score: string; winner: string }[];
  winners?: { rank: string; team: string; prize: string }[];
}

export interface TournamentRegistration {
  id: string;
  refCode: string;
  tournamentId: string;
  tournamentName: string;
  sport: SportType;
  userId: string;
  teamName: string;
  captainName: string;
  captainPhone: string;
  players: string[];
  notes?: string;
  amount: number;
  status: RegistrationStatus;
  utr?: string;
  screenshotUrl?: string;
  createdAt: number;
  approvedAt?: number;
  rejectReason?: string;
}

export interface SiteSettings {
  name: string;
  tagline: string;
  city: string;
  address: string;
  phone: string;
  whatsapp: string;
  email: string;
  mapEmbedUrl: string;
  mapsUrl?: string;
  openTime: string;    // "05:00"
  closeTime: string;   // "01:00" (next day)
  bookingWindowDays: number;
  maxSlotsPerBooking: number;
  holdMinutes: number;
  adminApprovalWindowHours: number;
  socials: {
    instagram?: string;
    facebook?: string;
    twitter?: string;
    youtube?: string;
  };
  facilities: { title: string; desc: string; icon: string }[];
  upiId: string;
  upiPayeeName: string;
  upiQrImageUrl?: string;
  useStaticQr: boolean;
  taxPercent: number;
  policiesText: string;
  promoBanners: { id: string; text: string; link?: string; active: boolean }[];
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'superadmin' | 'staff';
  createdAt: string;
}

export interface AuditLog {
  id: string;
  adminId: string;
  adminName: string;
  action: string;
  entityType: 'booking' | 'order' | 'tournament' | 'slot' | 'settings' | 'court';
  entityId: string;
  details: string;
  timestamp: number;
}
