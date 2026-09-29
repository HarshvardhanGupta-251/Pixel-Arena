import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Shield, Sparkles, Zap, Award, Layers, CheckCircle2, Maximize2 } from "lucide-react";

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
        {/* ================= HIGH-RESOLUTION GRAPHIC VISUALIZATION ================= */}
        <div className="lg:col-span-7 flex justify-center bg-[#030303] rounded-xl p-3 md:p-6 border border-[#202020] relative shadow-inner overflow-hidden">
          <svg
            viewBox="0 0 600 840"
            className="w-full max-w-[500px] h-auto drop-shadow-[0_20px_50px_rgba(0,0,0,0.95)] select-none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              {/* Grass lawn stripes pattern */}
              <pattern id="turfStripes" width="40" height="40" patternUnits="userSpaceOnUse">
                <rect width="40" height="20" fill="#2d6a36" />
                <rect y="20" width="40" height="20" fill="#357a3e" />
                <line x1="0" y1="20" x2="40" y2="20" stroke="#3d8b47" strokeWidth="0.8" />
                <line x1="0" y1="40" x2="40" y2="40" stroke="#255b2d" strokeWidth="0.8" />
              </pattern>

              {/* Central Pitch Soil Texture */}
              <linearGradient id="pitchGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#bf9f62" />
                <stop offset="50%" stopColor="#d6b677" />
                <stop offset="100%" stopColor="#bf9f62" />
              </linearGradient>

              {/* Pickleball Royal Blue Gradient */}
              <linearGradient id="pickleBlue" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#2252a3" />
                <stop offset="50%" stopColor="#2b66ca" />
                <stop offset="100%" stopColor="#1e4b96" />
              </linearGradient>

              {/* Floodlight Beam Glow Filter */}
              <filter id="floodGlow" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="8" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>

              {/* Neon Green Glow */}
              <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="5" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>

              {/* Shadow for office rooms */}
              <filter id="roomShadow" x="-10%" y="-10%" width="120%" height="120%">
                <feDropShadow dx="2" dy="4" stdDeviation="4" floodColor="#000" floodOpacity="0.8" />
              </filter>
            </defs>

            {/* Dark background perimeter asphalt */}
            <rect x="0" y="0" width="600" height="840" fill="#070707" />

            {/* Trees & boundary foliage accents */}
            <g opacity="0.35">
              <circle cx="20" cy="180" r="16" fill="#1b3820" />
              <circle cx="25" cy="320" r="18" fill="#152f19" />
              <circle cx="22" cy="460" r="17" fill="#1c3d22" />
              <circle cx="28" cy="600" r="19" fill="#132c17" />
              <circle cx="580" cy="220" r="16" fill="#1b3820" />
              <circle cx="575" cy="380" r="18" fill="#152f19" />
            </g>

            {/* Top Boundary Line: Back - 58 ft */}
            <line x1="85" y1="38" x2="520" y2="38" stroke="#52525b" strokeWidth="1.5" strokeDasharray="4 4" />

            {/* ========================================================== */}
            {/* 1. CRICKET TURF (LEFT ZONE)                               */}
            {/* ========================================================== */}
            <g
              className={cn(
                "cursor-pointer transition-all duration-300",
                hoveredZone === "zone_cricket" || selectedZoneId === "zone_cricket"
                  ? "opacity-100"
                  : "opacity-95 hover:opacity-100"
              )}
              onMouseEnter={() => setHoveredZone("zone_cricket")}
              onMouseLeave={() => setHoveredZone(null)}
              onClick={() => onSelectZone && onSelectZone("zone_cricket")}
            >
              {/* Slanted turf polygon */}
              <polygon
                points="95,50 345,50 355,670 145,800"
                fill="url(#turfStripes)"
                stroke={
                  hoveredZone === "zone_cricket" || selectedZoneId === "zone_cricket"
                    ? "#00E676"
                    : "#397e42"
                }
                strokeWidth={hoveredZone === "zone_cricket" || selectedZoneId === "zone_cricket" ? "3" : "1.5"}
                filter={hoveredZone === "zone_cricket" ? "url(#neonGlow)" : undefined}
              />

              {/* Perimeter Safety Netting texture */}
              <polygon
                points="95,50 345,50 355,670 145,800"
                fill="none"
                stroke="#18181b"
                strokeWidth="2"
                strokeDasharray="2 2"
              />

              {/* BRANDING ON CRICKET TURF: PIXEL ARENA + CRICKET TURF */}
              <g transform="translate(220, 220)">
                {/* PIXEL Logo text in white with green pixel box */}
                <rect x="-85" y="-12" width="10" height="10" fill="#00E676" />
                <text
                  x="-70"
                  y="0"
                  fill="#FFFFFF"
                  fontFamily="'Chakra Petch', sans-serif"
                  fontWeight="800"
                  fontSize="24"
                  letterSpacing="3"
                >
                  PIXEL
                </text>
                {/* Green pixel center in X */}
                <rect x="-35" y="-6" width="6" height="6" fill="#00E676" />

                {/* Sub line: ── ARENA ── */}
                <line x1="-70" y1="12" x2="-35" y2="12" stroke="#00E676" strokeWidth="2.5" />
                <text
                  x="5"
                  y="15"
                  textAnchor="middle"
                  fill="#FFFFFF"
                  fontFamily="'Chakra Petch', sans-serif"
                  fontWeight="700"
                  fontSize="9"
                  letterSpacing="5"
                >
                  ARENA
                </text>
                <line x1="45" y1="12" x2="80" y2="12" stroke="#00E676" strokeWidth="2.5" />

                {/* "CRICKET TURF" in bold white */}
                <text
                  x="5"
                  y="34"
                  textAnchor="middle"
                  fill="#FFFFFF"
                  fontFamily="'Inter', sans-serif"
                  fontWeight="800"
                  fontSize="13"
                  letterSpacing="1.5"
                >
                  CRICKET TURF
                </text>
              </g>

              {/* CENTRAL CRICKET PITCH */}
              <rect
                x="195"
                y="380"
                width="50"
                height="230"
                rx="3"
                fill="url(#pitchGrad)"
                stroke="#e2c88f"
                strokeWidth="1.2"
                filter="url(#roomShadow)"
              />

              {/* Top Bowling Crease & Stumps */}
              <line x1="202" y1="405" x2="238" y2="405" stroke="#FFFFFF" strokeWidth="1.8" />
              {/* 3 Stumps + Bails */}
              <rect x="210" y="396" width="20" height="3" fill="#ffffff" />
              <circle cx="213" cy="397" r="1.5" fill="#facc15" />
              <circle cx="220" cy="397" r="1.5" fill="#facc15" />
              <circle cx="227" cy="397" r="1.5" fill="#facc15" />

              {/* Bottom Bowling Crease & Stumps */}
              <line x1="202" y1="585" x2="238" y2="585" stroke="#FFFFFF" strokeWidth="1.8" />
              {/* 3 Stumps + Bails */}
              <rect x="210" y="591" width="20" height="3" fill="#ffffff" />
              <circle cx="213" cy="592" r="1.5" fill="#facc15" />
              <circle cx="220" cy="592" r="1.5" fill="#facc15" />
              <circle cx="227" cy="592" r="1.5" fill="#facc15" />

              {/* Pitch Return Crease Marks */}
              <line x1="202" y1="395" x2="202" y2="415" stroke="#FFFFFF" strokeWidth="1" />
              <line x1="238" y1="395" x2="238" y2="415" stroke="#FFFFFF" strokeWidth="1" />
              <line x1="202" y1="575" x2="202" y2="595" stroke="#FFFFFF" strokeWidth="1" />
              <line x1="238" y1="575" x2="238" y2="595" stroke="#FFFFFF" strokeWidth="1" />
            </g>

            {/* ========================================================== */}
            {/* 2. PICKLEBALL COURT (RIGHT TOP ZONE)                      */}
            {/* ========================================================== */}
            <g
              className={cn(
                "cursor-pointer transition-all duration-300",
                hoveredZone === "zone_pickleball" || selectedZoneId === "zone_pickleball"
                  ? "opacity-100"
                  : "opacity-95 hover:opacity-100"
              )}
              onMouseEnter={() => setHoveredZone("zone_pickleball")}
              onMouseLeave={() => setHoveredZone(null)}
              onClick={() => onSelectZone && onSelectZone("zone_pickleball")}
            >
              {/* Blue Court Surface */}
              <rect
                x="375"
                y="55"
                width="145"
                height="320"
                rx="4"
                fill="url(#pickleBlue)"
                stroke={
                  hoveredZone === "zone_pickleball" || selectedZoneId === "zone_pickleball"
                    ? "#00E676"
                    : "#38bdf8"
                }
                strokeWidth={hoveredZone === "zone_pickleball" || selectedZoneId === "zone_pickleball" ? "3" : "1.5"}
                filter={hoveredZone === "zone_pickleball" ? "url(#neonGlow)" : undefined}
              />

              {/* White Boundary Lines (USAPA Standard) */}
              <rect x="385" y="70" width="125" height="290" fill="none" stroke="#FFFFFF" strokeWidth="2" />

              {/* Non-Volley Zone (The Kitchen) */}
              <rect x="385" y="180" width="125" height="35" fill="#1e4487" stroke="#FFFFFF" strokeWidth="1.2" />
              <rect x="385" y="215" width="125" height="35" fill="#1e4487" stroke="#FFFFFF" strokeWidth="1.2" />

              {/* Center Net across court with posts */}
              <line x1="370" y1="215" x2="525" y2="215" stroke="#FFFFFF" strokeWidth="2.5" />
              <circle cx="370" cy="215" r="3" fill="#e4e4e7" />
              <circle cx="525" cy="215" r="3" fill="#e4e4e7" />

              {/* Center Baseline Split Lines */}
              <line x1="447" y1="70" x2="447" y2="180" stroke="#FFFFFF" strokeWidth="1.5" />
              <line x1="447" y1="250" x2="447" y2="360" stroke="#FFFFFF" strokeWidth="1.5" />

              {/* BRANDING ON PICKLEBALL COURT: PIXEL ARENA + PICKLEBALL COURT */}
              <g transform="translate(447, 125)">
                {/* PIXEL Logo in white with green pixel dot */}
                <rect x="-45" y="-18" width="6" height="6" fill="#00E676" />
                <text
                  x="0"
                  y="-10"
                  textAnchor="middle"
                  fill="#FFFFFF"
                  fontFamily="'Chakra Petch', sans-serif"
                  fontWeight="800"
                  fontSize="16"
                  letterSpacing="2"
                >
                  PIXEL
                </text>
                {/* ── ARENA ── */}
                <line x1="-35" y1="-2" x2="-15" y2="-2" stroke="#00E676" strokeWidth="1.5" />
                <text
                  x="0"
                  y="0"
                  textAnchor="middle"
                  fill="#FFFFFF"
                  fontFamily="'Chakra Petch', sans-serif"
                  fontWeight="700"
                  fontSize="7"
                  letterSpacing="3"
                >
                  ARENA
                </text>
                <line x1="15" y1="-2" x2="35" y2="-2" stroke="#00E676" strokeWidth="1.5" />

                {/* PICKLEBALL COURT */}
                <text
                  x="0"
                  y="18"
                  textAnchor="middle"
                  fill="#FFFFFF"
                  fontFamily="'Inter', sans-serif"
                  fontWeight="800"
                  fontSize="9"
                  letterSpacing="1"
                >
                  PICKLEBALL COURT
                </text>
              </g>
            </g>

            {/* ========================================================== */}
            {/* 3. CLUBHOUSE / CHANGING ROOMS / TOILET BLOCK               */}
            {/* ========================================================== */}
            <g
              className={cn(
                "cursor-pointer transition-all duration-300",
                hoveredZone === "zone_facilities" || selectedZoneId === "zone_facilities"
                  ? "opacity-100"
                  : "opacity-95 hover:opacity-100"
              )}
              onMouseEnter={() => setHoveredZone("zone_facilities")}
              onMouseLeave={() => setHoveredZone(null)}
              onClick={() => onSelectZone && onSelectZone("zone_facilities")}
            >
              {/* Main Outer Building Box with Warm Interior Lighting */}
              <rect
                x="375"
                y="395"
                width="145"
                height="150"
                rx="4"
                fill="#201a15"
                stroke={
                  hoveredZone === "zone_facilities" || selectedZoneId === "zone_facilities"
                    ? "#00E676"
                    : "#715840"
                }
                strokeWidth={hoveredZone === "zone_facilities" || selectedZoneId === "zone_facilities" ? "3" : "1.5"}
                filter="url(#roomShadow)"
              />

              {/* Title Header */}
              <text
                x="447"
                y="415"
                textAnchor="middle"
                fill="#f5f5f4"
                fontFamily="'Chakra Petch', sans-serif"
                fontWeight="700"
                fontSize="9"
                letterSpacing="0.8"
              >
                OFFICE / CHANGING /
              </text>
              <text
                x="447"
                y="426"
                textAnchor="middle"
                fill="#f5f5f4"
                fontFamily="'Chakra Petch', sans-serif"
                fontWeight="700"
                fontSize="9"
                letterSpacing="0.8"
              >
                TOILET BLOCK
              </text>

              {/* Room 1: Office / Reception (Warm light) */}
              <rect x="382" y="445" width="40" height="90" fill="#3b2d1d" rx="2" stroke="#5a452d" strokeWidth="1" />
              {/* Desk & Chair */}
              <rect x="388" y="465" width="24" height="14" fill="#a16207" rx="1.5" />
              <circle cx="400" cy="490" r="4.5" fill="#18181b" stroke="#71717a" strokeWidth="1" />
              <circle cx="400" cy="460" r="3" fill="#facc15" opacity="0.8" />

              {/* Room 2: Changing Suite */}
              <rect x="428" y="445" width="42" height="90" fill="#2d261e" rx="2" stroke="#5a452d" strokeWidth="1" />
              <circle cx="449" cy="460" r="3.5" fill="#fef08a" opacity="0.9" />
              {/* Bench */}
              <rect x="434" y="490" width="30" height="8" fill="#78350f" rx="1" />
              <rect x="445" y="520" width="10" height="10" fill="#0284c7" rx="2" opacity="0.7" />

              {/* Room 3: Restroom / Toilets */}
              <rect x="475" y="445" width="40" height="90" fill="#2d261e" rx="2" stroke="#5a452d" strokeWidth="1" />
              <circle cx="495" cy="460" r="3.5" fill="#fef08a" opacity="0.9" />
              {/* Toilet fixture */}
              <ellipse cx="495" cy="515" rx="5" ry="7" fill="#f4f4f5" />
              <rect x="491" y="522" width="8" height="4" fill="#d4d4d8" />
            </g>

            {/* Storage / Walkway Leftover Zone */}
            <g>
              <polygon
                points="375,555 520,555 490,660 375,690"
                fill="#18181b"
                stroke="#3f3f46"
                strokeWidth="1"
                strokeDasharray="2 2"
              />
              <text
                x="440"
                y="585"
                textAnchor="middle"
                fill="#a1a1aa"
                fontFamily="'Chakra Petch', sans-serif"
                fontWeight="700"
                fontSize="9"
              >
                LEFTOVER
              </text>
              <text
                x="440"
                y="598"
                textAnchor="middle"
                fill="#71717a"
                fontFamily="'Inter', sans-serif"
                fontSize="7.5"
              >
                (STORAGE / WALKWAY)
              </text>
            </g>

            {/* ========================================================== */}
            {/* 4. HIGH-LUX STADIUM FLOODLIGHTS WITH LIGHT CONES           */}
            {/* ========================================================== */}
            <g>
              {/* Cricket Turf Floodlights (8 Units) */}
              {[
                { x: 92, y: 52 },
                { x: 345, y: 52 },
                { x: 90, y: 280 },
                { x: 348, y: 280 },
                { x: 90, y: 500 },
                { x: 350, y: 500 },
                { x: 140, y: 790 },
                { x: 352, y: 665 },
              ].map((pos, idx) => (
                <g key={`c-flood-${idx}`}>
                  <circle cx={pos.x} cy={pos.y} r="8" fill="#fef08a" opacity="0.4" filter="url(#floodGlow)" />
                  <circle cx={pos.x} cy={pos.y} r="3.5" fill="#fef08a" />
                  <circle cx={pos.x} cy={pos.y} r="1.5" fill="#ffffff" />
                </g>
              ))}

              {/* Pickleball Floodlights (4 Units) */}
              {[
                { x: 375, y: 56 },
                { x: 520, y: 56 },
                { x: 375, y: 370 },
                { x: 520, y: 370 },
              ].map((pos, idx) => (
                <g key={`p-flood-${idx}`}>
                  <circle cx={pos.x} cy={pos.y} r="7" fill="#fef08a" opacity="0.4" filter="url(#floodGlow)" />
                  <circle cx={pos.x} cy={pos.y} r="3" fill="#fef08a" />
                  <circle cx={pos.x} cy={pos.y} r="1.2" fill="#ffffff" />
                </g>
              ))}
            </g>

            {/* ========================================================== */}
            {/* 5. DIMENSIONS & AREA OVERLAY CARD (MATCHING USER IMAGE)    */}
            {/* ========================================================== */}
            <g transform="translate(425, 680)">
              {/* Card Background */}
              <rect
                x="-70"
                y="-15"
                width="225"
                height="160"
                rx="8"
                fill="#0d0d0d"
                fillOpacity="0.94"
                stroke="#27272a"
                strokeWidth="1.2"
                filter="url(#roomShadow)"
              />

              {/* Title with Green Line */}
              <text
                x="-55"
                y="6"
                fill="#a3e635"
                fontFamily="'Chakra Petch', sans-serif"
                fontWeight="700"
                fontSize="10"
                letterSpacing="1"
              >
                DIMENSIONS & AREA
              </text>
              <line x1="-55" y1="12" x2="60" y2="12" stroke="#a3e635" strokeWidth="1.2" />

              {/* CRICKET TURF SECTION */}
              <text
                x="-55"
                y="27"
                fill="#f4f4f5"
                fontFamily="'Chakra Petch', sans-serif"
                fontWeight="700"
                fontSize="9"
              >
                CRICKET TURF
              </text>
              <text x="-55" y="40" fill="#a1a1aa" fontFamily="'Inter', sans-serif" fontSize="8">
                • Width (Back): 34 ft
              </text>
              <text x="-55" y="52" fill="#a1a1aa" fontFamily="'Inter', sans-serif" fontSize="8">
                • Length: ~110 ft (follows slant)
              </text>
              <text x="-55" y="64" fill="#a1a1aa" fontFamily="'Inter', sans-serif" fontSize="8">
                • Area: ~3,740 sq ft
              </text>

              {/* PICKLEBALL COURT SECTION */}
              <text
                x="-55"
                y="82"
                fill="#f4f4f5"
                fontFamily="'Chakra Petch', sans-serif"
                fontWeight="700"
                fontSize="9"
              >
                PICKLEBALL COURT
              </text>
              <text x="-55" y="95" fill="#a1a1aa" fontFamily="'Inter', sans-serif" fontSize="8">
                • Size: 24 ft x 52 ft
              </text>
              <text x="-55" y="107" fill="#a1a1aa" fontFamily="'Inter', sans-serif" fontSize="8">
                • Area: 1,248 sq ft
              </text>

              {/* Footnote */}
              <text
                x="-55"
                y="126"
                fill="#71717a"
                fontFamily="'Inter', sans-serif"
                fontStyle="italic"
                fontSize="7"
              >
                *All dimensions are approximate.
              </text>
            </g>
          </svg>
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
