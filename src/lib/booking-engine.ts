import { PricingRule, SportType, Slot, Booking } from "@/types";

/**
 * Deterministic slot ID: slots/{zoneId}_{YYYYMMDD}_{HHmm}
 */
export function getSlotId(zoneId: string, date: string, time: string): string {
  const cleanDate = date.replace(/-/g, "");
  const cleanTime = time.replace(/:/g, "");
  return `${zoneId}_${cleanDate}_${cleanTime}`;
}

/**
 * Checks if a slot time falls into weekday or weekend
 */
export function isWeekend(dateStr: string): boolean {
  // dateStr is YYYY-MM-DD
  const [year, month, day] = dateStr.split("-").map(Number);
  const d = new Date(year, month - 1, day);
  const dayOfWeek = d.getDay(); // 0 is Sunday, 6 is Saturday
  return dayOfWeek === 0 || dayOfWeek === 6;
}

/**
 * Calculate slot price based on court, sport, date, time and pricing rules
 */
export function calculateSlotPrice(
  sport: SportType,
  date: string,
  time: string,
  pricingRules: PricingRule[],
  baseFallback: number = 1000
): number {
  const isWknd = isWeekend(date);
  const dayType = isWknd ? "weekend" : "weekday";

  // Check matching rule
  const matched = pricingRules.find((rule) => {
    if (rule.sport !== sport) return false;
    if (rule.dayType !== dayType) return false;

    // Check time window (e.g. 05:00 to 17:00, or 17:00 to 01:00)
    const [startH] = rule.startTime.split(":").map(Number);
    const [endH] = rule.endTime.split(":").map(Number);
    const [slotH] = time.split(":").map(Number);

    if (endH < startH) {
      // Overnight window (e.g. 17:00 to 01:00)
      return slotH >= startH || slotH < endH;
    } else {
      return slotH >= startH && slotH < endH;
    }
  });

  return matched ? matched.pricePerHour : baseFallback;
}

/**
 * Generates hour slots between openTime and closeTime
 */
export function generateDayTimeSlots(openTime: string, closeTime: string): { time: string; endTime: string }[] {
  const slots: { time: string; endTime: string }[] = [];
  const [startH] = openTime.split(":").map(Number);
  const [endH] = closeTime.split(":").map(Number);

  let currentH = startH;
  // Loop until close hour, supporting overnight (e.g. 5:00 to 1:00)
  while (true) {
    const nextH = (currentH + 1) % 24;
    const timeStr = `${currentH.toString().padStart(2, "0")}:00`;
    const nextTimeStr = `${nextH.toString().padStart(2, "0")}:00`;
    slots.push({ time: timeStr, endTime: nextTimeStr });

    if (nextH === endH) break;
    currentH = nextH;

    // Guard against infinite loop
    if (slots.length >= 24) break;
  }

  return slots;
}

/**
 * Validate that selected times are contiguous
 */
export function areSlotsContiguous(times: string[]): boolean {
  if (times.length <= 1) return true;

  // Sort times chronologically
  const sorted = [...times].sort((a, b) => {
    const [ha] = a.split(":").map(Number);
    const [hb] = b.split(":").map(Number);
    return ha - hb;
  });

  for (let i = 0; i < sorted.length - 1; i++) {
    const [hCurrent] = sorted[i].split(":").map(Number);
    const [hNext] = sorted[i + 1].split(":").map(Number);

    const expectedNext = (hCurrent + 1) % 24;
    if (hNext !== expectedNext) {
      return false;
    }
  }

  return true;
}
