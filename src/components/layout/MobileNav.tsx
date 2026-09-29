import React from "react";
import { Home, Calendar, Coffee, Trophy, User } from "lucide-react";

interface MobileNavProps {
  activeTab: string;
  onNavigate: (tab: string) => void;
  cartCount: number;
}

export function MobileNav({ activeTab, onNavigate, cartCount }: MobileNavProps) {
  const tabs = [
    { id: "home", label: "Home", icon: Home },
    { id: "book", label: "Book", icon: Calendar, highlight: true },
    { id: "cafe", label: "Cafe", icon: Coffee, badge: cartCount },
    { id: "tournaments", label: "Tournaments", icon: Trophy },
    { id: "account", label: "Account", icon: User },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#0a0a0a]/95 backdrop-blur-lg border-t border-[#262626] px-2 py-1 safe-area-pb">
      <div className="flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onNavigate(tab.id)}
              className={`flex flex-col items-center justify-center py-1.5 px-2 relative transition-all min-w-[54px] cursor-pointer ${
                isActive ? "text-[#00E676]" : "text-neutral-400 hover:text-neutral-200"
              }`}
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform ${
                    isActive ? "scale-110 stroke-[2.5]" : "stroke-[1.8]"
                  }`}
                />
                {tab.badge && tab.badge > 0 ? (
                  <span className="absolute -top-1.5 -right-2.5 w-4 h-4 bg-[#00E676] text-black text-[9px] font-bold rounded-full flex items-center justify-center">
                    {tab.badge}
                  </span>
                ) : null}
              </div>
              <span
                className={`text-[10px] font-heading tracking-wide mt-1 uppercase ${
                  isActive ? "font-bold text-[#00E676]" : "font-medium"
                }`}
              >
                {tab.label}
              </span>
              {isActive && (
                <span className="absolute bottom-0 w-6 h-0.5 bg-[#00E676] rounded-full shadow-[0_0_8px_#00E676]" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

export default MobileNav;
