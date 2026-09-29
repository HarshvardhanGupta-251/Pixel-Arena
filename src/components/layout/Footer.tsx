import React from "react";
import Logo from "@/components/shared/Logo";
import { Phone, Mail, MapPin, Instagram, Facebook, Twitter, Shield } from "lucide-react";

interface FooterProps {
  onNavigate: (tab: string) => void;
  onOpenAdmin: () => void;
  onOpenPolicies: () => void;
}

export function Footer({ onNavigate, onOpenAdmin, onOpenPolicies }: FooterProps) {
  return (
    <footer className="w-full bg-[#070707] border-t border-[#1f1f1f] text-neutral-400 text-sm mt-20 relative z-20 pb-16 lg:pb-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-4">
            <div
              onClick={() => onNavigate("home")}
              className="cursor-pointer inline-block"
            >
              <Logo size="md" showTagline />
            </div>
            <p className="text-neutral-400 text-xs md:text-sm leading-relaxed max-w-sm">
              Mathura's premier multi-sport turf ground. Engineered for box cricket, pickleball, badminton, and volleyball. Equipped with 8x stadium floodlights, FIFA-grade shockpad turf, and an in-house athlete fuel cafe.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded bg-[#171717] border border-[#262626] flex items-center justify-center text-neutral-400 hover:text-[#00E676] hover:border-[#00E676]/40 transition-colors"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded bg-[#171717] border border-[#262626] flex items-center justify-center text-neutral-400 hover:text-[#00E676] hover:border-[#00E676]/40 transition-colors"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded bg-[#171717] border border-[#262626] flex items-center justify-center text-neutral-400 hover:text-[#00E676] hover:border-[#00E676]/40 transition-colors"
              >
                <Twitter className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="font-heading uppercase tracking-wider text-xs font-bold text-white flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-[#00E676]" />
              Navigation
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onNavigate("book")}
                  className="hover:text-[#00E676] transition-colors"
                >
                  Book a Court
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate("cafe")}
                  className="hover:text-[#00E676] transition-colors"
                >
                  Pixel Fuel Cafe
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate("tournaments")}
                  className="hover:text-[#00E676] transition-colors"
                >
                  Active Tournaments
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate("layout")}
                  className="hover:text-[#00E676] transition-colors"
                >
                  Arena Architecture
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate("account")}
                  className="hover:text-[#00E676] transition-colors"
                >
                  My Passes & Orders
                </button>
              </li>
            </ul>
          </div>

          {/* Sports Offered */}
          <div className="space-y-3">
            <h4 className="font-heading uppercase tracking-wider text-xs font-bold text-white flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-[#00E676]" />
              Our Sports
            </h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center justify-between">
                <span>Box Cricket Turf</span>
                <span className="text-[10px] font-mono text-[#00E676]">Pitch + Nets</span>
              </li>
              <li className="flex items-center justify-between">
                <span>Pro Pickleball</span>
                <span className="text-[10px] font-mono text-blue-400">USAPA Court</span>
              </li>
              <li className="flex items-center justify-between">
                <span>Badminton Court</span>
                <span className="text-[10px] font-mono text-purple-400">BWF Standard</span>
              </li>
              <li className="flex items-center justify-between">
                <span>Volleyball Arena</span>
                <span className="text-[10px] font-mono text-amber-400">Turf Setup</span>
              </li>
            </ul>
          </div>

          {/* Contact & Hours */}
          <div className="space-y-3">
            <h4 className="font-heading uppercase tracking-wider text-xs font-bold text-white flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-[#00E676]" />
              Arena Location
            </h4>
            <div className="space-y-2 text-xs">
              <div className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-[#00E676] shrink-0 mt-0.5" />
                <span>Near Pulse Fitness Gym, Mathura, Uttar Pradesh 281001</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-[#00E676] shrink-0" />
                <a href="tel:+919876543210" className="hover:text-white">
                  +91 98765 43210
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-[#00E676] shrink-0" />
                <a href="mailto:bookings@pixelarena.in" className="hover:text-white">
                  bookings@pixelarena.in
                </a>
              </div>
              <div className="pt-1 text-[11px] text-[#00E676] font-mono">
                Operating Hours: 05:00 AM – 01:00 AM (Daily)
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-[#1a1a1a] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
          <div className="flex items-center gap-4">
            <span>© {new Date().getFullYear()} PIXEL ARENA SPORTS LLP. All rights reserved.</span>
            <button
              onClick={onOpenPolicies}
              className="hover:text-[#00E676] transition-colors underline underline-offset-4"
            >
              Policies & Refunds
            </button>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[11px] text-neutral-600 font-mono">
              Direct UPI Settlement (Zero Payment Gateway Fee)
            </span>
            <button
              onClick={onOpenAdmin}
              className="text-neutral-700 hover:text-neutral-400 transition-colors p-1"
              title="Portal Access"
            >
              <Shield className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
