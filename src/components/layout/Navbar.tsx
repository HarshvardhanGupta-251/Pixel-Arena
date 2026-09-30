import React from "react";
import Logo from "@/components/shared/Logo";
import { User, AdminUser } from "@/types";
import { UserCircle, Shield, Phone, Sparkles, MapPin } from "lucide-react";

interface NavbarProps {
  activeTab: string;
  onNavigate: (tab: string) => void;
  currentUser: User | null;
  adminUser: AdminUser | null;
  onOpenLogin: () => void;
  onOpenAdmin: () => void;
  cartCount?: number;
  onOpenCart?: () => void;
}

export function Navbar({
  activeTab,
  onNavigate,
  currentUser,
  adminUser,
  onOpenLogin,
  onOpenAdmin,
  cartCount,
  onOpenCart,
}: NavbarProps) {
  const navItems = [
    { id: "home", label: "Home" },
    { id: "book", label: "Book a Court" },
    { id: "cafe", label: "Pixel Cafe" },
    { id: "tournaments", label: "Tournaments" },
    { id: "layout", label: "Ground Blueprint" },
    { id: "contact", label: "Find Us" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-black/85 backdrop-blur-md border-b border-[#262626]">
      {/* Top micro bar for city & status */}
      <div className="hidden md:flex items-center justify-between px-6 py-1 bg-[#0a0a0a] border-b border-[#1c1c1c] text-xs text-neutral-400">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#00E676] animate-pulse" />
            <span className="text-neutral-300 font-medium">Turf Open: 05:00 AM – 01:00 AM</span>
          </div>
          <span className="text-neutral-600">|</span>
          <div className="flex items-center gap-1 text-neutral-400">
            <MapPin className="w-3.5 h-3.5 text-[#00E676]" />
            <span>Mathura, Uttar Pradesh</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <a
            href="tel:+919876543210"
            className="flex items-center gap-1 text-neutral-300 hover:text-[#00E676] transition-colors"
          >
            <Phone className="w-3 h-3 text-[#00E676]" />
            <span>+91 98765 43210</span>
          </a>
          <span className="text-neutral-600">|</span>
          <button
            onClick={onOpenAdmin}
            className="text-[11px] font-mono text-neutral-500 hover:text-neutral-300 transition-colors flex items-center gap-1"
            title="Arena Staff & Owner Portal"
          >
            <Shield className="w-3 h-3 text-neutral-500" />
            <span>Ops Portal</span>
          </button>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 md:h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <div
          onClick={() => onNavigate("home")}
          className="cursor-pointer flex items-center gap-3 transition-transform hover:scale-[1.02]"
        >
          <Logo size="sm" />
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`px-3.5 py-2 text-sm font-heading font-semibold uppercase tracking-wider transition-all rounded-md cursor-pointer ${
                activeTab === item.id
                  ? "text-[#00E676] bg-[#00E676]/10 border border-[#00E676]/30 shadow-[0_0_12px_rgba(0,230,118,0.2)]"
                  : "text-neutral-300 hover:text-white hover:bg-neutral-900"
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Right Action buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Book CTA on desktop */}
          <button
            onClick={() => onNavigate("book")}
            className="hidden sm:flex items-center gap-2 px-4 py-2 bg-[#00E676] hover:bg-[#00c864] text-black font-heading font-bold text-xs uppercase tracking-wider rounded-md transition-all shadow-[0_0_20px_rgba(0,230,118,0.25)] cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Book Slot</span>
          </button>

          {/* User Account / Login */}
          {currentUser ? (
            <button
              onClick={() => onNavigate("account")}
              className="flex items-center gap-2 px-3 py-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 rounded-md text-sm text-neutral-100 cursor-pointer transition-colors"
            >
              <UserCircle className="w-4 h-4 text-[#00E676]" />
              <span className="font-heading text-xs font-bold truncate max-w-[100px]">
                {currentUser.username}
              </span>
            </button>
          ) : (
            <button
              onClick={onOpenLogin}
              className="px-3.5 py-2 border border-neutral-700 hover:border-[#00E676] text-neutral-200 hover:text-[#00E676] rounded-md font-heading text-xs uppercase font-semibold tracking-wider cursor-pointer transition-all"
            >
              Log In
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

export default Navbar;
