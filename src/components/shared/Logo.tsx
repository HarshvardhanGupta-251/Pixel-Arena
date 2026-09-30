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
      <img
        src="/images/Logo .svg"
        alt="Pixel Arena"
        className={cn("w-auto object-contain", sizeMap[size])}
        draggable={false}
      />
      {showTagline && (
        <span className="text-[10px] tracking-[0.25em] text-neutral-400 uppercase mt-0.5 font-medium">
          Multi-Sport Turf Ground
        </span>
      )}
    </div>
  );
}

export default Logo;
