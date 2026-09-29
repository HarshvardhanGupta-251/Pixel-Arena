import React, { useState } from "react";
import { Shield, Zap, Layers, Maximize2 } from "lucide-react";

interface GroundLayoutProps {
  onSelectZone?: (zoneId: string) => void;
  selectedZoneId?: string;
  interactive?: boolean;
}

export function GroundLayout({
  onSelectZone,
  selectedZoneId,
  interactive = true,
}: GroundLayoutProps) {
  const [hoveredZone, setHoveredZone] = useState<string | null>(null);

  const zones = [
    {
      id: "zone_cricket",
      name: "Cricket & Multi-Turf",
      sports: ["Box Cricket", "Volleyball"],
      specs: "34 ft wide (back) × ~110 ft (slanted) • 3,740 sq ft",
      surface: "Professional FIFA-grade monofilament artificial grass with shockpad",
      lighting: "8x 400W LED Stadium Floodlights (500+ Lux)",
      badge: "Main Arena",
    },
    {
      id: "zone_pickleball",
      name: "Pickleball & Badminton",
      sports: ["Pickleball", "Badminton"],
      specs: "24 ft × 52 ft • 1,248 sq ft",
      surface: "8-layer acrylic cushioned hardcourt (USAPA tournament standard)",
      lighting: "4x 300W Anti-glare Asymmetric LED Floods",
      badge: "Pro Court",
    },
    {
      id: "zone_facilities",
      name: "Clubhouse & Amenities",
      sports: ["Changing Rooms", "Pixel Cafe", "Restrooms"],
      specs: "24 ft × 20 ft (3 Rooms) + Storage Walkway",
      surface: "Air-conditioned lounge, locker showers, cafe service counter",
      lighting: "Warm LED lounge lights",
      badge: "Amenities",
    },
  ];

  const activeZone = zones.find(
    (z) => z.id === (hoveredZone || selectedZoneId || "zone_cricket")
  );

  return (
    <div className="w-full bg-[#080808] border border-[#222222] rounded-2xl overflow-hidden p-4 md:p-8 shadow-2xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between pb-6 border-b border-[#1c1c1c] gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-[#00E676] animate-pulse rounded-full" />
            <span className="text-xs uppercase font-heading tracking-widest text-[#00E676] font-semibold">
              Pixel Arena Master Plan
            </span>
          </div>
          <h3 className="text-2xl md:text-3xl font-extrabold font-heading text-white uppercase mt-1">
            GROUND BLUEPRINT & ARCHITECTURE
          </h3>
          <p className="text-xs text-neutral-400 mt-1">
            Official top-down architectural layout of Pixel Arena sports ground under floodlights.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="px-3 py-1.5 bg-[#121212] border border-neutral-800 rounded-lg text-neutral-300 font-mono">
            Total Area: ~5,200 sq ft
          </span>
          <span className="px-3 py-1.5 bg-[#121212] border border-neutral-800 rounded-lg text-neutral-300 font-mono">
            Perimeter: 58 ft × 120 ft
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-8 items-start">
        {/* ================= GROUND SVG IMAGE ================= */}
        <div className="lg:col-span-7 flex justify-center bg-[#030303] rounded-xl p-3 md:p-6 border border-[#202020] relative shadow-inner overflow-hidden">
          <div className="relative w-full max-w-[500px] select-none">
            {/* Actual Ground SVG image */}
            <img
              src="/images/Ground.svg"
              alt="Pixel Arena Ground Blueprint"
              className="w-full h-auto drop-shadow-[0_20px_50px_rgba(0,0,0,0.95)]"
              draggable={false}
            />

            {/* Invisible clickable hotspots over the image zones */}
            {interactive && (
              <>
                {/* Cricket Turf zone — left trapezoid area (~15% from left, top 6% to bottom 95%) */}
                <div
                  className="absolute cursor-pointer"
                  style={{ top: "6%", left: "15%", width: "42%", height: "70%" }}
                  onMouseEnter={() => setHoveredZone("zone_cricket")}
                  onMouseLeave={() => setHoveredZone(null)}
                  onClick={() => onSelectZone && onSelectZone("zone_cricket")}
                  title="Cricket & Multi-Turf"
                />
                {/* Pickleball Court zone — right top area */}
                <div
                  className="absolute cursor-pointer"
                  style={{ top: "6%", left: "60%", width: "28%", height: "38%" }}
                  onMouseEnter={() => setHoveredZone("zone_pickleball")}
                  onMouseLeave={() => setHoveredZone(null)}
                  onClick={() => onSelectZone && onSelectZone("zone_pickleball")}
                  title="Pickleball Court"
                />
                {/* Facilities zone — right bottom area */}
                <div
                  className="absolute cursor-pointer"
                  style={{ top: "47%", left: "60%", width: "28%", height: "22%" }}
                  onMouseEnter={() => setHoveredZone("zone_facilities")}
                  onMouseLeave={() => setHoveredZone(null)}
                  onClick={() => onSelectZone && onSelectZone("zone_facilities")}
                  title="Clubhouse & Amenities"
                />
              </>
            )}

            {/* Active zone highlight label */}
            {hoveredZone && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-black/80 border border-[#00E676]/50 rounded-lg text-[#00E676] text-xs font-heading font-semibold whitespace-nowrap pointer-events-none">
                {zones.find((z) => z.id === hoveredZone)?.name}
              </div>
            )}
          </div>
        </div>

        {/* ================= DYNAMIC ZONE SPECS & ACTIONS ================= */}
        <div className="lg:col-span-5 flex flex-col justify-between h-full space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 bg-[#00E676]/10 text-[#00E676] border border-[#00E676]/30 text-xs font-heading font-semibold rounded uppercase tracking-wider">
                {activeZone?.badge}
              </span>
              <span className="text-xs text-neutral-400 font-mono flex items-center gap-1">
                <Maximize2 className="w-3.5 h-3.5 text-[#00E676]" />
                <span>Tap court on blueprint</span>
              </span>
            </div>

            <div>
              <h4 className="text-2xl font-bold font-heading text-white">
                {activeZone?.name}
              </h4>
              <p className="text-xs font-mono text-[#00E676] mt-1 font-semibold">
                {activeZone?.specs}
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <div className="bg-[#121212] p-4 rounded-xl border border-neutral-800">
                <div className="flex items-center gap-2 text-xs font-semibold text-neutral-200 mb-1">
                  <Shield className="w-4 h-4 text-[#00E676]" />
                  <span>Surface Infrastructure</span>
                </div>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  {activeZone?.surface}
                </p>
              </div>

              <div className="bg-[#121212] p-4 rounded-xl border border-neutral-800">
                <div className="flex items-center gap-2 text-xs font-semibold text-neutral-200 mb-1">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span>Illumination Specs</span>
                </div>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  {activeZone?.lighting}
                </p>
              </div>

              <div className="bg-[#121212] p-4 rounded-xl border border-neutral-800">
                <div className="flex items-center gap-2 text-xs font-semibold text-neutral-200 mb-1">
                  <Layers className="w-4 h-4 text-blue-400" />
                  <span>Sports & Facilities</span>
                </div>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {activeZone?.sports.map((sport) => (
                    <span
                      key={sport}
                      className="px-2.5 py-1 bg-neutral-900 border border-neutral-700 text-neutral-200 text-xs rounded font-medium"
                    >
                      {sport}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="pt-2 space-y-2">
            <button
              onClick={() => {
                if (activeZone?.id === "zone_cricket") {
                  window.location.hash = "#book";
                  if (onSelectZone) onSelectZone("zone_cricket");
                } else if (activeZone?.id === "zone_pickleball") {
                  window.location.hash = "#book";
                  if (onSelectZone) onSelectZone("zone_pickleball");
                } else {
                  window.location.hash = "#cafe";
                  if (onSelectZone) onSelectZone("zone_facilities");
                }
              }}
              className="w-full py-3.5 bg-[#00E676] hover:bg-[#00c864] text-black font-heading font-bold text-xs tracking-wider uppercase rounded-md transition-all shadow-[0_0_20px_rgba(0,230,118,0.25)] flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Book This Zone Now</span>
              <span className="text-base font-bold">→</span>
            </button>
            <p className="text-[11px] text-center text-neutral-500 font-mono">
              Direct UPI reservation with instant 10-minute hold lock
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GroundLayout;
