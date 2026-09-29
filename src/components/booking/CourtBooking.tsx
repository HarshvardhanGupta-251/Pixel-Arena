import React, { useState, useEffect } from "react";
import { arenaStore } from "@/lib/store";
import { Court, SportType, Slot, User } from "@/types";
import {
  generateDayTimeSlots,
  calculateSlotPrice,
  areSlotsContiguous,
  getSlotId,
  isWeekend,
} from "@/lib/booking-engine";
import { formatINR } from "@/lib/utils";
import {
  Calendar,
  Clock,
  Sparkles,
  Info,
  Shield,
  Layers,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Flame,
  Maximize2,
  X,
  MapPin,
} from "lucide-react";

interface CourtBookingProps {
  onHoldCreated: (bookingId: string) => void;
  currentUser: User | null;
  onRequireLogin: () => void;
  initialSport?: SportType;
}

export function CourtBooking({
  onHoldCreated,
  currentUser,
  onRequireLogin,
  initialSport = "cricket",
}: CourtBookingProps) {
  const [selectedSport, setSelectedSport] = useState<SportType>(initialSport);
  const [courts, setCourts] = useState<Court[]>(arenaStore.getCourts());
  const [selectedCourtId, setSelectedCourtId] = useState<string>("");
  const [showBlueprintModal, setShowBlueprintModal] = useState<boolean>(false);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().slice(0, 10)
  );
  const [selectedTimes, setSelectedTimes] = useState<string[]>([]);
  const [slotsState, setSlotsState] = useState<Record<string, Slot>>(arenaStore.getSlots());
  const [errorToast, setErrorToast] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const settings = arenaStore.getSettings();
  const pricingRules = arenaStore.getPricing();

  // Subscribe to real-time slot state changes
  useEffect(() => {
    const unsub = arenaStore.subscribe(() => {
      setSlotsState({ ...arenaStore.getSlots() });
      setCourts([...arenaStore.getCourts()]);
    });
    return unsub;
  }, []);

  // Filter courts for selected sport
  const sportCourts = courts.filter((c) => c.sport === selectedSport && c.active);

  // Set default court when sport changes
  useEffect(() => {
    if (sportCourts.length > 0) {
      if (!sportCourts.some((c) => c.id === selectedCourtId)) {
        setSelectedCourtId(sportCourts[0].id);
        setSelectedTimes([]);
      }
    }
  }, [selectedSport, sportCourts]);

  const activeCourt = courts.find((c) => c.id === selectedCourtId) || sportCourts[0];

  // Generate next 14 days
  const dateOptions: { dateStr: string; dayName: string; dayNum: number; monthName: string; isWknd: boolean }[] = [];
  const today = new Date();
  for (let i = 0; i < (settings.bookingWindowDays || 14); i++) {
    const d = new Date();
    d.setDate(today.getDate() + i);
    const dateStr = d.toISOString().slice(0, 10);
    const dayName = d.toLocaleDateString("en-IN", { weekday: "short" });
    const dayNum = d.getDate();
    const monthName = d.toLocaleDateString("en-IN", { month: "short" });
    const isWknd = d.getDay() === 0 || d.getDay() === 6;
    dateOptions.push({ dateStr, dayName, dayNum, monthName, isWknd });
  }

  // Generate time slots (e.g. 05:00 to 01:00)
  const timeSlots = generateDayTimeSlots(settings.openTime || "05:00", settings.closeTime || "01:00");

  // Handle slot toggle
  const handleSlotClick = (time: string, isAvailable: boolean) => {
    if (!isAvailable) return;
    setErrorToast(null);

    if (selectedTimes.includes(time)) {
      // Deselect
      const newTimes = selectedTimes.filter((t) => t !== time);
      setSelectedTimes(newTimes);
      return;
    }

    // Try adding
    const maxSlots = settings.maxSlotsPerBooking || 4;
    if (selectedTimes.length >= maxSlots) {
      setErrorToast(`Maximum ${maxSlots} hours allowed per single booking.`);
      return;
    }

    const nextTimes = [...selectedTimes, time];
    if (!areSlotsContiguous(nextTimes)) {
      setErrorToast("Please select contiguous (back-to-back) hours for your court booking.");
      return;
    }

    setSelectedTimes(nextTimes);
  };

  // Calculate total amount
  const sortedTimes = [...selectedTimes].sort();
  let totalAmount = 0;
  sortedTimes.forEach((time) => {
    if (activeCourt) {
      totalAmount += calculateSlotPrice(
        activeCourt.sport,
        selectedDate,
        time,
        pricingRules,
        activeCourt.hourlyBaseRate
      );
    }
  });

  // Handle proceed to pay
  const handleProceed = () => {
    setErrorToast(null);

    if (selectedTimes.length === 0) {
      setErrorToast("Please select at least one available slot.");
      return;
    }

    if (!currentUser) {
      onRequireLogin();
      return;
    }

    if (!activeCourt) return;

    setIsSubmitting(true);
    const result = arenaStore.acquireHold({
      userId: currentUser.uid,
      username: currentUser.username,
      phone: currentUser.phone,
      courtId: activeCourt.id,
      date: selectedDate,
      times: sortedTimes,
    });

    setIsSubmitting(false);

    if (result.success && result.booking) {
      onHoldCreated(result.booking.id);
    } else {
      setErrorToast(result.error || "Slot is no longer available. Please select another slot.");
      // Refresh slot selection
      setSelectedTimes([]);
    }
  };

  const sportsList: { id: SportType; label: string; icon: string; tag: string }[] = [
    { id: "cricket", label: " Cricket Turf", icon: "🏏", tag: "3,740 sq ft • Floodlit" },
    { id: "pickleball", label: " Pickleball Court ", icon: "🏓", tag: "USAPA Acrylic Court" },
    { id: "badminton", label: "Badminton Court", icon: "🏸", tag: "BWF Cushion Surface" },
    { id: "volleyball", label: "Volleyball Arena", icon: "🏐", tag: "Turf Setup • Nets" },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-[#00E676] rounded-full animate-ping" />
          <span className="text-xs uppercase font-heading font-semibold text-[#00E676] tracking-widest">
            Instant UPI Slot Reservation
          </span>
        </div>
        <h1 className="text-3xl md:text-5xl font-extrabold font-heading text-white uppercase tracking-tight mt-1">
          BOOK A COURT
        </h1>
        <p className="text-sm text-neutral-400 mt-2 max-w-2xl">
          Real-time slot availability with deterministic lock engine. Select your sport, pick date and contiguous hours, and pay directly via UPI QR.
        </p>
      </div>

      {/* Sport Selector Tabs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {sportsList.map((sport) => {
          const isActive = selectedSport === sport.id;
          return (
            <button
              key={sport.id}
              onClick={() => {
                setSelectedSport(sport.id);
                setSelectedTimes([]);
              }}
              className={`p-4 rounded-xl border text-left transition-all cursor-pointer relative overflow-hidden ${
                isActive
                  ? "bg-[#111111] border-[#00E676] shadow-[0_0_20px_rgba(0,230,118,0.2)]"
                  : "bg-[#0c0c0c] border-[#222222] hover:border-neutral-700"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-2xl">{sport.icon}</span>
                {isActive && (
                  <span className="w-2 h-2 bg-[#00E676] rounded-full shadow-[0_0_8px_#00E676]" />
                )}
              </div>
              <h3 className="font-heading font-bold text-sm md:text-base text-white mt-2 uppercase">
                {sport.label}
              </h3>
              <p className="text-[11px] text-neutral-400 font-mono mt-0.5">{sport.tag}</p>
            </button>
          );
        })}
      </div>

      {/* Active Court Banner & Shared Surface Notice */}
      {activeCourt && (
        <div className="mb-6 p-4 bg-[#111111] border border-neutral-800 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {/* Ground Layout Preview Thumbnail */}
            <button
              onClick={() => setShowBlueprintModal(true)}
              className="relative w-16 h-20 md:w-20 md:h-24 rounded-lg overflow-hidden border border-neutral-700 hover:border-[#00E676] shrink-0 bg-neutral-950 group cursor-pointer shadow-lg transition-all"
              title="Click to view full Ground Blueprint"
            >
              <img
                src="/images/ground-blueprint.jpg"
                alt="Ground Layout"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black/40 group-hover:bg-transparent flex items-center justify-center transition-colors">
                <Maximize2 className="w-4 h-4 text-white opacity-80 group-hover:opacity-100 group-hover:text-[#00E676]" />
              </div>
              <span className="absolute bottom-1 inset-x-1 text-[8px] bg-black/85 text-[#00E676] font-mono text-center rounded py-0.5 font-bold uppercase tracking-wider">
                LAYOUT
              </span>
            </button>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-[#00E676]/10 text-[#00E676] border border-[#00E676]/30 text-[10px] font-heading font-semibold uppercase rounded">
                  Selected Court
                </span>
                <h4 className="font-heading font-bold text-lg text-white">
                  {activeCourt.name}
                </h4>
              </div>
              <p className="text-xs text-neutral-400 max-w-xl">
                {activeCourt.description}
              </p>
              <button
                onClick={() => setShowBlueprintModal(true)}
                className="inline-flex items-center gap-1.5 text-xs text-[#00E676] hover:underline pt-1 font-heading uppercase tracking-wider cursor-pointer"
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>View Full Ground Blueprint &amp; Dimensions</span>
              </button>
            </div>
          </div>

          {/* Shared surface tag notice */}
          {activeCourt.zoneId === "zone_cricket" && (
            <div className="p-2.5 bg-neutral-900 border border-neutral-800 rounded-lg text-xs text-neutral-300 flex items-center gap-2 max-w-sm">
              <Layers className="w-4 h-4 text-[#00E676] shrink-0" />
              <span>
                <strong>Shared Surface:</strong> Cricket &amp; Volleyball share Main Arena turf. Reserving a slot locks both sports automatically.
              </span>
            </div>
          )}
        </div>
      )}

      {/* Ground Blueprint Full Screen Modal */}
      {showBlueprintModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setShowBlueprintModal(false)}
        >
          <div
            className="w-full max-w-4xl bg-[#0a0a0a] border border-neutral-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-4 md:p-5 border-b border-neutral-800 flex items-center justify-between bg-neutral-900/50">
              <div className="flex items-center gap-2.5">
                <div className="w-2.5 h-2.5 rounded-full bg-[#00E676] animate-pulse" />
                <div>
                  <h3 className="text-lg font-heading font-bold uppercase text-white tracking-wide">
                    Pixel Arena Ground Blueprint
                  </h3>
                  <p className="text-xs text-neutral-400">
                    Official architectural top-down layout &amp; ground dimensions
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowBlueprintModal(false)}
                className="p-2 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Image Body */}
            <div className="p-4 md:p-6 overflow-y-auto flex-1 flex flex-col md:flex-row items-center justify-center gap-6 bg-[#040404]">
              <div className="w-full max-w-md bg-neutral-950 rounded-xl overflow-hidden border border-neutral-800 shadow-2xl p-2">
                <img
                  src="/images/ground-blueprint.jpg"
                  alt="Pixel Arena Ground Architecture"
                  className="w-full h-auto rounded-lg shadow-inner"
                />
              </div>

              {/* Side Specs */}
              <div className="space-y-4 max-w-xs text-xs text-neutral-300">
                <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-xl space-y-2">
                  <h4 className="font-heading font-bold text-white uppercase text-sm flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#00E676]" />
                    Cricket Turf Specs
                  </h4>
                  <ul className="space-y-1 text-neutral-400 font-mono">
                    <li>• Width (Back): 34 ft</li>
                    <li>• Length: ~110 ft (slanted)</li>
                    <li>• Total Area: ~3,740 sq ft</li>
                    <li>• Central Sand-Infill Pitch</li>
                    <li>• 8x 400W LED Floodlights</li>
                  </ul>
                </div>

                <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-xl space-y-2">
                  <h4 className="font-heading font-bold text-white uppercase text-sm flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-400" />
                    Pickleball Court Specs
                  </h4>
                  <ul className="space-y-1 text-neutral-400 font-mono">
                    <li>• Court Size: 24 ft × 52 ft</li>
                    <li>• Total Area: 1,248 sq ft</li>
                    <li>• Tournament Acrylic Surface</li>
                    <li>• USAPA Regulation Kitchen Lines</li>
                    <li>• 4x 300W Anti-Glare Floods</li>
                  </ul>
                </div>

                <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-xl space-y-1 text-[11px] text-neutral-400">
                  <span className="text-white font-heading font-bold uppercase block mb-1">
                    Amenities Included
                  </span>
                  <p>Air-conditioned changing rooms, shower suites, lockers, and Pixel Fuel Cafe.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Date Picker Strip */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-heading font-bold uppercase tracking-wider text-neutral-300 flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-[#00E676]" />
            <span>Select Date (14-Day Booking Window)</span>
          </span>
          <span className="text-xs text-neutral-500 font-mono">
            {isWeekend(selectedDate) ? "Weekend Pricing Active" : "Weekday Pricing Active"}
          </span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-3 scrollbar-thin">
          {dateOptions.map((opt) => {
            const isSelected = selectedDate === opt.dateStr;
            return (
              <button
                key={opt.dateStr}
                onClick={() => {
                  setSelectedDate(opt.dateStr);
                  setSelectedTimes([]);
                }}
                className={`flex flex-col items-center justify-center min-w-[70px] md:min-w-[80px] py-3 px-2 rounded-lg border transition-all cursor-pointer shrink-0 ${
                  isSelected
                    ? "bg-[#00E676] text-black border-[#00E676] font-bold shadow-[0_0_15px_rgba(0,230,118,0.3)]"
                    : "bg-[#111111] text-neutral-300 border-neutral-800 hover:border-neutral-600 hover:text-white"
                }`}
              >
                <span className="text-[10px] uppercase font-heading tracking-wider">
                  {opt.dayName}
                </span>
                <span className="text-lg md:text-xl font-bold font-mono my-0.5">
                  {opt.dayNum}
                </span>
                <span className="text-[10px] uppercase">
                  {opt.monthName}
                </span>
                {opt.isWknd && (
                  <span
                    className={`text-[8px] uppercase font-mono px-1 rounded mt-1 ${
                      isSelected ? "bg-black/20 text-black" : "text-amber-400"
                    }`}
                  >
                    Wknd
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Slot Status Legend */}
      <div className="flex flex-wrap items-center gap-4 py-3 px-4 bg-[#0a0a0a] border border-[#222222] rounded-lg mb-6 text-xs text-neutral-400">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded border border-neutral-600 bg-neutral-900" />
          <span>Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-[#00E676] border border-[#00E676]" />
          <span className="text-white font-medium">Selected</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-amber-500/30 border border-amber-500 animate-pulse" />
          <span>Being Booked</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-neutral-800 border border-neutral-700 opacity-50" />
          <span>Booked</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-red-950/40 border border-red-800" />
          <span>Maintenance</span>
        </div>
      </div>

      {/* Slot Grid */}
      <div className="space-y-4 mb-24">
        <h3 className="text-xs font-heading font-bold uppercase tracking-wider text-neutral-300 flex items-center gap-1.5">
          <Clock className="w-4 h-4 text-[#00E676]" />
          <span>Hourly Slots for {selectedDate}</span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {timeSlots.map(({ time, endTime }) => {
            if (!activeCourt) return null;

            // Deterministic slot ID: {zoneId}_{YYYYMMDD}_{HHmm}
            const slotId = getSlotId(activeCourt.zoneId, selectedDate, time);
            const slotData = slotsState[slotId];
            const isSelected = selectedTimes.includes(time);

            // Compute live slot state
            const now = Date.now();
            let status: "AVAILABLE" | "HELD" | "PENDING_APPROVAL" | "CONFIRMED" | "BLOCKED" = "AVAILABLE";

            if (slotData) {
              if (slotData.status === "CONFIRMED") {
                status = "CONFIRMED";
              } else if (slotData.status === "BLOCKED") {
                status = "BLOCKED";
              } else if (slotData.status === "PENDING_APPROVAL") {
                status = "PENDING_APPROVAL";
              } else if (slotData.status === "HELD") {
                // If held and not expired
                if (slotData.expiresAt && slotData.expiresAt > now) {
                  status = "HELD";
                }
              }
            }

            // Calculate price
            const price = calculateSlotPrice(
              activeCourt.sport,
              selectedDate,
              time,
              pricingRules,
              activeCourt.hourlyBaseRate
            );

            const isPeak =
              time >= "17:00" || time <= "01:00" || isWeekend(selectedDate);
            const isClickable = status === "AVAILABLE";

            return (
              <button
                key={time}
                onClick={() => handleSlotClick(time, isClickable)}
                disabled={!isClickable && !isSelected}
                aria-pressed={isSelected}
                className={`p-3 rounded-lg border text-left transition-all relative flex flex-col justify-between min-h-[90px] ${
                  isSelected
                    ? "bg-[#00E676] text-black border-[#00E676] font-bold shadow-[0_0_15px_rgba(0,230,118,0.3)] scale-[1.02]"
                    : status === "HELD"
                    ? "bg-amber-500/15 border-amber-500/40 text-amber-300 cursor-not-allowed opacity-80"
                    : status === "PENDING_APPROVAL"
                    ? "bg-amber-600/20 border-amber-600/40 text-amber-200 cursor-not-allowed opacity-80"
                    : status === "CONFIRMED"
                    ? "bg-neutral-900 border-neutral-800 text-neutral-600 cursor-not-allowed opacity-50"
                    : status === "BLOCKED"
                    ? "bg-red-950/20 border-red-900/40 text-red-400 cursor-not-allowed opacity-60"
                    : "bg-[#111111] border-neutral-800 hover:border-[#00E676] text-white cursor-pointer"
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="font-heading font-bold text-sm md:text-base">
                    {time} - {endTime}
                  </span>
                  {isPeak && (
                    <Flame
                      className={`w-3 h-3 ${
                        isSelected ? "text-black" : "text-amber-400"
                      }`}
                    />
                  )}
                </div>

                <div className="flex items-center justify-between w-full mt-2">
                  <span
                    className={`font-mono text-xs ${
                      isSelected ? "text-black font-extrabold" : "text-[#00E676] font-bold"
                    }`}
                  >
                    ₹{price}
                  </span>

                  <span
                    className={`text-[9px] uppercase tracking-wider font-heading px-1.5 py-0.5 rounded ${
                      isSelected
                        ? "bg-black text-[#00E676] font-bold"
                        : status === "HELD"
                        ? "bg-amber-500/20 text-amber-300"
                        : status === "CONFIRMED"
                        ? "bg-neutral-800 text-neutral-500"
                        : status === "BLOCKED"
                        ? "bg-red-900/30 text-red-400"
                        : "text-neutral-400"
                    }`}
                  >
                    {isSelected
                      ? "Selected"
                      : status === "HELD"
                      ? "Being Booked"
                      : status === "PENDING_APPROVAL"
                      ? "Under Check"
                      : status === "CONFIRMED"
                      ? "Booked"
                      : status === "BLOCKED"
                      ? "Closed"
                      : "Available"}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Error / Alert Toast */}
      {errorToast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 px-4 py-3 bg-red-600 text-white text-xs font-semibold rounded-lg shadow-2xl flex items-center gap-2 border border-red-400 animate-bounce max-w-md">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorToast}</span>
        </div>
      )}

      {/* Sticky Bottom Booking Bar */}
      {selectedTimes.length > 0 && (
        <div className="fixed bottom-16 lg:bottom-0 left-0 right-0 z-40 bg-[#0c0c0c]/95 backdrop-blur-md border-t border-[#262626] p-4 shadow-[0_-10px_30px_rgba(0,0,0,0.8)]">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4 text-xs">
              <div>
                <span className="text-neutral-400 block">Court & Date:</span>
                <span className="font-heading font-bold text-white text-sm">
                  {activeCourt?.name} • {selectedDate}
                </span>
              </div>

              <div className="h-8 w-px bg-neutral-800 hidden sm:block" />

              <div>
                <span className="text-neutral-400 block">Time Range:</span>
                <span className="font-mono text-[#00E676] font-bold text-sm">
                  {sortedTimes[0]} to{" "}
                  {`${(Number(sortedTimes[sortedTimes.length - 1].split(":")[0]) + 1)
                    .toString()
                    .padStart(2, "0")}:00`}{" "}
                  ({sortedTimes.length} hr{sortedTimes.length > 1 ? "s" : ""})
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
              <div className="text-right">
                <span className="text-[10px] text-neutral-400 block uppercase">Total Payable</span>
                <span className="text-2xl font-bold font-heading text-[#00E676]">
                  {formatINR(totalAmount)}
                </span>
              </div>

              <button
                onClick={handleProceed}
                disabled={isSubmitting}
                className="py-3 px-6 bg-[#00E676] hover:bg-[#00c864] text-black font-heading font-bold text-xs uppercase tracking-wider rounded-md transition-all shadow-[0_0_20px_rgba(0,230,118,0.25)] flex items-center gap-2 cursor-pointer"
              >
                <span>{currentUser ? "Proceed to Pay via UPI" : "Sign In & Book"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CourtBooking;
