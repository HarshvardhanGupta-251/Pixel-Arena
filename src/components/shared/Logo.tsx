import React from "react";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  showTagline?: boolean;
}

export function Logo({ className, size = "md", showTagline = false }: LogoProps) {
  const sizeMap = {
    sm: "h-7",
    md: "h-10",
    lg: "h-14",
    xl: "h-20",
  };

  return (
    <div className={cn("inline-flex flex-col items-center select-none group", className)}>
      <div className={cn("flex items-center", sizeMap[size])}>
        <svg
          viewBox="0 0 320 90"
          className="h-full w-auto"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Neon green pixel square accent at top-left of P */}
          <rect x="18" y="8" width="12" height="12" fill="#00E676" />

          {/* Letter P */}
          <path
            d="M36 8H72C82 8 88 14 88 24C88 34 82 40 72 40H52V62H36V8ZM52 24H68C72 24 74 22 74 24C74 26 72 26 68 26H52V24Z"
            fill="#FFFFFF"
          />

          {/* Letter I */}
          <path d="M98 8H114V62H98V8Z" fill="#FFFFFF" />

          {/* Letter X with green pixel core */}
          <path
            d="M124 8H142L153 26L164 8H182L163 35L183 62H165L153 44L141 62H123L143 35L124 8Z"
            fill="#FFFFFF"
          />
          {/* Green pixel square in center of X */}
          <rect x="148" y="30" width="10" height="10" fill="#00E676" />

          {/* Letter E */}
          <path
            d="M192 8H234V22H208V28H230V40H208V48H234V62H192V8Z"
            fill="#FFFFFF"
          />

          {/* Letter L */}
          <path
            d="M244 8H260V48H284V62H244V8Z"
            fill="#FFFFFF"
          />

          {/* Neon green period square after PIXEL */}
          <rect x="290" y="50" width="12" height="12" fill="#00E676" />

          {/* ARENA text with two green divider lines below */}
          <line x1="20" y1="78" x2="68" y2="78" stroke="#00E676" strokeWidth="4" strokeLinecap="square" />
          <text
            x="160"
            y="83"
            textAnchor="middle"
            fill="#FFFFFF"
            fontFamily="'Chakra Petch', sans-serif"
            fontWeight="700"
            fontSize="15"
            letterSpacing="9"
          >
            ARENA
          </text>
          <line x1="252" y1="78" x2="300" y2="78" stroke="#00E676" strokeWidth="4" strokeLinecap="square" />
        </svg>
      </div>
      {showTagline && (
        <span className="text-[10px] tracking-[0.25em] text-neutral-400 uppercase mt-0.5 font-medium">
          Multi-Sport Turf Ground
        </span>
      )}
    </div>
  );
}

export default Logo;
