import React from "react";
import GroundLayout from "@/components/shared/GroundLayout";
import Shuffle from "@/components/ui/Shuffle";
import { arenaStore } from "@/lib/store";
import { SportType } from "@/types";
import { formatINR } from "@/lib/utils";
import {
  Sparkles,
  Calendar,
  Coffee,
  Trophy,
  ArrowRight,
  Shield,
  Zap,
  Users,
  Car,
  Clock,
  Phone,
  MessageSquare,
  MapPin,
  Flame,
  CheckCircle2,
} from "lucide-react";

interface HomeViewProps {
  onNavigate: (tab: string) => void;
  onSelectSportForBooking: (sport: SportType) => void;
  onOpenPolicies: () => void;
}

export function HomeView({
  onNavigate,
  onSelectSportForBooking,
  onOpenPolicies,
}: HomeViewProps) {
  const settings = arenaStore.getSettings();
  const courts = arenaStore.getCourts();
  const menuItems = arenaStore.getMenuItems();
  const tournaments = arenaStore.getTournaments();

  const activePromo = settings.promoBanners.find((b) => b.active);

  const sportsCards = [
    {
      sport: "cricket" as SportType,
      title: "Box Cricket Turf",
      desc: "3,740 sq ft lush turf with high-bounce central pitch, 34 ft width, and perimeter protective netting.",
      rate: "From ₹1,000/hr",
      image: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=800&q=80",
      tag: "Main Turf • Floodlit",
    },
    {
      sport: "pickleball" as SportType,
      title: "Pro Pickleball Court",
      desc: "USAPA regulation 24x52 ft tournament court with 8-layer cushion acrylic coating and zero-glare LED illumination.",
      rate: "From ₹600/hr",
      image: "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=800&q=80",
      tag: "Tournament Court",
    },
    {
      sport: "badminton" as SportType,
      title: "Indoor Badminton",
      desc: "BWF certified synthetic court with shockpad cushioning for knee protection and non-marking grip.",
      rate: "From ₹550/hr",
      image: "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=800&q=80",
      tag: "Pro Synthetic Surface",
    },
    {
      sport: "volleyball" as SportType,
      title: "Volleyball Arena",
      desc: "Competition standard turf volleyball with heavy-duty tension netting and spectator boundary space.",
      rate: "From ₹900/hr",
      image: "https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?auto=format&fit=crop&w=800&q=80",
      tag: "Shared Arena Turf",
    },
  ];

  return (
    <div className="w-full">
      {/* Promo Banner Strip */}
      {activePromo && (
        <div
          onClick={() => onNavigate("book")}
          className="bg-[#00E676] text-black py-2.5 px-4 text-center text-xs font-heading font-bold uppercase tracking-wider cursor-pointer hover:bg-[#00c864] transition-colors flex items-center justify-center gap-2"
        >
          <Flame className="w-4 h-4 shrink-0" />
          <span>{activePromo.text}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </div>
      )}

      {/* 1. HERO SECTION */}
      <section className="relative pt-12 pb-20 md:pt-20 md:pb-28 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-6">
          {/* Micro Status Chip */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-neutral-900/90 border border-neutral-700/80 backdrop-blur text-xs">
            <span className="w-2 h-2 rounded-full bg-[#00E676] animate-pulse" />
            <span className="text-white font-heading font-semibold tracking-wide">
              {settings.city.toUpperCase()}'S PREMIER MULTI-SPORT TURF
            </span>
          </div>

          {/* Main Title with React Bits Shuffle Animation */}
          <div className="max-w-5xl mx-auto flex justify-center">
            <Shuffle
              text="ENGINEERED FOR CHAMPIONS. PLAY UNDER FLOODLIGHTS."
              tag="h1"
              className="text-4xl sm:text-6xl lg:text-7xl font-extrabold font-heading text-white tracking-tight uppercase leading-none drop-shadow-[0_0_35px_rgba(0,230,118,0.25)] text-center cursor-default"
              shuffleDirection="right"
              duration={0.35}
              animationMode="evenodd"
              shuffleTimes={2}
              ease="power3.out"
              stagger={0.025}
              threshold={0.1}
              triggerOnce={true}
              triggerOnHover={true}
              respectReducedMotion={true}
            />
          </div>

          {/* Sports Sub-line */}
          <p className="text-sm sm:text-lg text-neutral-300 font-heading font-semibold uppercase tracking-widest max-w-2xl mx-auto">
            Cricket • Pickleball • Badminton • Volleyball
          </p>

          {/* Facility quick chips */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 pt-2 text-xs text-neutral-300">
            <span className="px-3 py-1 bg-black/60 backdrop-blur border border-neutral-800 rounded-full flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>8x Stadium LED Floods</span>
            </span>
            <span className="px-3 py-1 bg-black/60 backdrop-blur border border-neutral-800 rounded-full flex items-center gap-1.5">
              <Coffee className="w-3.5 h-3.5 text-[#00E676]" />
              <span>Pixel Fuel Cafe</span>
            </span>
            <span className="px-3 py-1 bg-black/60 backdrop-blur border border-neutral-800 rounded-full flex items-center gap-1.5">
              <Car className="w-3.5 h-3.5 text-blue-400" />
              <span>Valet Parking</span>
            </span>
            <span className="px-3 py-1 bg-black/60 backdrop-blur border border-neutral-800 rounded-full flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-purple-400" />
              <span>05:00 AM – 01:00 AM</span>
            </span>
          </div>

          {/* 3 Main CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-6 max-w-md mx-auto">
            <button
              onClick={() => onNavigate("book")}
              className="w-full sm:w-auto py-3.5 px-8 bg-[#00E676] hover:bg-[#00c864] text-black font-heading font-bold text-sm uppercase tracking-wider rounded-md transition-all shadow-[0_0_25px_rgba(0,230,118,0.35)] flex items-center justify-center gap-2 cursor-pointer"
            >
              <Calendar className="w-4 h-4" />
              <span>Book a Court</span>
            </button>

            <button
              onClick={() => onNavigate("cafe")}
              className="w-full sm:w-auto py-3.5 px-7 bg-neutral-900/90 hover:bg-neutral-800 text-white font-heading font-bold text-sm uppercase tracking-wider rounded-md border border-neutral-700 hover:border-[#00E676] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Coffee className="w-4 h-4 text-[#00E676]" />
              <span>Order Food</span>
            </button>

            <button
              onClick={() => onNavigate("tournaments")}
              className="w-full sm:w-auto py-3.5 px-7 bg-neutral-900/90 hover:bg-neutral-800 text-white font-heading font-bold text-sm uppercase tracking-wider rounded-md border border-neutral-700 hover:border-[#00E676] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>Tournaments</span>
            </button>
          </div>
        </div>
      </section>

      {/* 2. CHOOSE YOUR SPORT */}
      <section className="py-16 border-t border-[#1c1c1c] bg-[#070707]/70 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-xs uppercase font-heading font-bold text-[#00E676] tracking-widest">
              Available Disciplines
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold font-heading text-white uppercase mt-1">
              CHOOSE YOUR SPORT
            </h2>
            <p className="text-xs md:text-sm text-neutral-400 max-w-lg mx-auto mt-2">
              Reserve your court in seconds. Direct UPI payment with zero convenience fee.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {sportsCards.map((card) => (
              <div
                key={card.sport}
                className="bg-[#111111] border border-[#262626] hover:border-[#00E676] rounded-xl overflow-hidden flex flex-col justify-between transition-all group shadow-xl"
              >
                <div>
                  <div className="relative h-48 w-full bg-neutral-900 overflow-hidden">
                    <img
                      src={card.image}
                      alt={card.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                    <span className="absolute top-3 left-3 px-2 py-0.5 bg-black/80 text-[#00E676] text-[10px] font-heading font-bold uppercase rounded border border-neutral-700">
                      {card.tag}
                    </span>
                    <span className="absolute bottom-3 left-3 font-mono text-sm font-bold text-white bg-black/60 px-2 py-0.5 rounded">
                      {card.rate}
                    </span>
                  </div>

                  <div className="p-5 space-y-2">
                    <h3 className="font-heading font-bold text-lg text-white group-hover:text-[#00E676] transition-colors uppercase">
                      {card.title}
                    </h3>
                    <p className="text-xs text-neutral-400 line-clamp-2">
                      {card.desc}
                    </p>
                  </div>
                </div>

                <div className="p-5 pt-0">
                  <button
                    onClick={() => {
                      onSelectSportForBooking(card.sport);
                      onNavigate("book");
                    }}
                    className="w-full py-2.5 bg-neutral-900 hover:bg-[#00E676] text-neutral-200 hover:text-black font-heading font-bold text-xs uppercase tracking-wider rounded-lg border border-neutral-800 hover:border-[#00E676] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>Book Now</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. ARENA BLUEPRINT & ARCHITECTURE (STRIKEFIT GROUND) */}
      <section className="py-16 border-t border-[#1c1c1c]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <GroundLayout
            onSelectZone={(zoneId) => {
              if (zoneId === "zone_cricket") {
                onSelectSportForBooking("cricket");
                onNavigate("book");
              } else if (zoneId === "zone_pickleball") {
                onSelectSportForBooking("pickleball");
                onNavigate("book");
              } else {
                onNavigate("cafe");
              }
            }}
          />
        </div>
      </section>

      {/* 4. PIXEL CAFE TEASER */}
      <section className="py-16 border-t border-[#1c1c1c] bg-[#070707]/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
            <div>
              <span className="text-xs uppercase font-heading font-bold text-[#00E676] tracking-widest">
                Courtside Refreshment
              </span>
              <h2 className="text-3xl md:text-4xl font-extrabold font-heading text-white uppercase mt-1">
                PIXEL FUEL CAFE
              </h2>
              <p className="text-xs md:text-sm text-neutral-400 mt-1">
                Healthy post-match bowls, wraps, artisan cold brew & chilled electrolyte hydration.
              </p>
            </div>
            <button
              onClick={() => onNavigate("cafe")}
              className="py-2.5 px-5 bg-neutral-900 hover:bg-[#00E676] text-neutral-200 hover:text-black font-heading font-bold text-xs uppercase tracking-wider rounded-lg border border-neutral-700 transition-all flex items-center gap-2 cursor-pointer shrink-0"
            >
              <span>Browse Full Menu & Order</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {menuItems.slice(0, 4).map((item) => (
              <div
                key={item.id}
                onClick={() => onNavigate("cafe")}
                className="bg-[#111111] border border-[#222222] hover:border-[#00E676]/40 rounded-xl overflow-hidden transition-all group cursor-pointer shadow-md"
              >
                <div className="relative h-40 w-full overflow-hidden bg-neutral-900">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  <div className="absolute top-2 left-2 bg-black/70 p-1 rounded">
                    {item.isVeg ? (
                      <span className="w-3 h-3 rounded-full bg-emerald-500 block" />
                    ) : (
                      <span className="w-3 h-3 rounded-full bg-rose-500 block" />
                    )}
                  </div>
                  <span className="absolute bottom-2 left-2 font-mono font-bold text-white text-base bg-black/80 px-2 py-0.5 rounded">
                    ₹{item.price}
                  </span>
                </div>
                <div className="p-4">
                  <h4 className="font-heading font-bold text-sm text-white group-hover:text-[#00E676] transition-colors truncate">
                    {item.name}
                  </h4>
                  <p className="text-xs text-neutral-400 mt-1 line-clamp-2">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. UPCOMING TOURNAMENTS TEASER */}
      <section className="py-16 border-t border-[#1c1c1c]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
            <div>
              <span className="text-xs uppercase font-heading font-bold text-[#00E676] tracking-widest">
                Championship Series
              </span>
              <h2 className="text-3xl md:text-4xl font-extrabold font-heading text-white uppercase mt-1">
                ACTIVE TOURNAMENTS
              </h2>
              <p className="text-xs md:text-sm text-neutral-400 mt-1">
                Enter your squad in weekend knockout cups and win prize pools up to ₹50,000.
              </p>
            </div>
            <button
              onClick={() => onNavigate("tournaments")}
              className="py-2.5 px-5 bg-[#00E676] hover:bg-[#00c864] text-black font-heading font-bold text-xs uppercase tracking-wider rounded-lg transition-all flex items-center gap-2 cursor-pointer shrink-0"
            >
              <span>Explore All Tournaments</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {tournaments.slice(0, 3).map((t) => (
              <div
                key={t.id}
                onClick={() => onNavigate("tournaments")}
                className="bg-[#111111] border border-[#222222] hover:border-[#00E676]/40 rounded-xl overflow-hidden transition-all group cursor-pointer shadow-lg flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-44 w-full bg-neutral-900 overflow-hidden">
                    <img
                      src={t.banner}
                      alt={t.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent" />
                    <span className="absolute top-3 left-3 px-2 py-0.5 bg-black/80 text-[#00E676] text-[10px] font-heading font-bold uppercase rounded border border-neutral-700">
                      {t.sport}
                    </span>
                    <div className="absolute bottom-3 left-3 right-3 flex justify-between items-center text-xs">
                      <span className="text-white font-mono font-bold text-sm">
                        Prize: {formatINR(t.prizePool)}
                      </span>
                      <span className="text-neutral-400 font-mono">
                        {t.registeredCount}/{t.maxTeams} Teams
                      </span>
                    </div>
                  </div>

                  <div className="p-5 space-y-2">
                    <h3 className="font-heading font-bold text-base text-white group-hover:text-[#00E676] transition-colors line-clamp-1">
                      {t.name}
                    </h3>
                    <p className="text-xs text-neutral-400 line-clamp-2">
                      {t.description}
                    </p>
                  </div>
                </div>

                <div className="p-5 pt-0">
                  <div className="w-full py-2 bg-neutral-900 group-hover:bg-[#00E676] text-neutral-300 group-hover:text-black font-heading font-bold text-xs uppercase tracking-wider rounded text-center transition-all">
                    Register Team →
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. WORLD-CLASS FACILITIES */}
      <section className="py-16 border-t border-[#1c1c1c] bg-[#070707]/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-xs uppercase font-heading font-bold text-[#00E676] tracking-widest">
              Built for Athletes
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold font-heading text-white uppercase mt-1">
              WORLD-CLASS AMENITIES
            </h2>
            <p className="text-xs md:text-sm text-neutral-400 max-w-lg mx-auto mt-2">
              Every detail engineered to give you the ultimate stadium matchday experience.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {settings.facilities.map((fac, idx) => (
              <div
                key={idx}
                className="p-6 bg-[#111111] border border-[#222222] rounded-xl space-y-3 hover:border-neutral-700 transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center text-[#00E676]">
                  {fac.icon === "Shield" ? (
                    <Shield className="w-5 h-5" />
                  ) : fac.icon === "Zap" ? (
                    <Zap className="w-5 h-5 text-amber-400" />
                  ) : fac.icon === "Users" ? (
                    <Users className="w-5 h-5 text-blue-400" />
                  ) : fac.icon === "Coffee" ? (
                    <Coffee className="w-5 h-5 text-[#00E676]" />
                  ) : fac.icon === "Car" ? (
                    <Car className="w-5 h-5 text-purple-400" />
                  ) : (
                    <Sparkles className="w-5 h-5 text-teal-400" />
                  )}
                </div>
                <h4 className="font-heading font-bold text-base text-white">
                  {fac.title}
                </h4>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  {fac.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. FIND US & CONTACT */}
      <section id="contact" className="py-16 border-t border-[#1c1c1c]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-5 space-y-6">
              <div>
                <span className="text-xs uppercase font-heading font-bold text-[#00E676] tracking-widest">
                  Location & Directions
                </span>
                <h2 className="text-3xl md:text-4xl font-extrabold font-heading text-white uppercase mt-1">
                  FIND PIXEL ARENA
                </h2>
                <p className="text-xs text-neutral-400 mt-2 leading-relaxed">
                  Conveniently located near Pulse Fitness Gym in Mathura, Uttar Pradesh with direct road access. Free covered car & bike parking.
                </p>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex items-start gap-3 p-3.5 bg-[#111111] border border-neutral-800 rounded-lg">
                  <MapPin className="w-4 h-4 text-[#00E676] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block font-heading uppercase">Arena Address</strong>
                    <span className="text-neutral-300">{settings.address}</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 bg-[#111111] border border-neutral-800 rounded-lg">
                  <Clock className="w-4 h-4 text-[#00E676] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block font-heading uppercase">Turf Timings</strong>
                    <span className="text-neutral-300">
                      05:00 AM – 01:00 AM (Monday to Sunday, 365 Days)
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 bg-[#111111] border border-neutral-800 rounded-lg">
                  <Phone className="w-4 h-4 text-[#00E676] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block font-heading uppercase">Direct Helpdesk</strong>
                    <a href={`tel:${settings.phone}`} className="text-neutral-300 hover:text-white">
                      {settings.phone}
                    </a>
                  </div>
                </div>
              </div>

              {/* Action Buttons: Google Maps Directions & WhatsApp */}
              <div className="pt-2 space-y-2.5">
                <a
                  href={settings.mapsUrl || "https://www.google.com/maps/place/Pulse+Fitness+Gym/@27.5040828,77.6538375,17z/data=!3m1!4b1!4m6!3m5!1s0x397371bf572f7a49:0xcd80515d0cf062ae!8m2!3d27.5040781!4d77.6564178"}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-3.5 bg-neutral-900 hover:bg-neutral-800 text-white font-heading font-bold text-xs uppercase tracking-wider rounded-md flex items-center justify-center gap-2 border border-neutral-700 hover:border-[#00E676] transition-all"
                >
                  <MapPin className="w-4 h-4 text-[#00E676]" />
                  <span>Open in Google Maps / Get Directions</span>
                </a>

                <a
                  href={`https://wa.me/${settings.whatsapp.replace(/\D/g, "")}?text=Hi%20Pixel%20Arena,%20I%20have%20an%20inquiry%20about%20booking%20a%20court%20in%20Mathura.`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-3.5 bg-[#25D366] hover:bg-[#20ba59] text-black font-heading font-bold text-xs uppercase tracking-wider rounded-md flex items-center justify-center gap-2 shadow-lg transition-all"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Chat with Ground Manager on WhatsApp</span>
                </a>
              </div>
            </div>

            {/* Embedded Google Map */}
            <div className="lg:col-span-7 h-[360px] md:h-[420px] rounded-xl overflow-hidden border border-neutral-800 shadow-2xl bg-neutral-900 relative">
              <iframe
                title="Pixel Arena Location Map"
                src={settings.mapEmbedUrl}
                width="100%"
                height="100%"
                style={{ border: 0, filter: "invert(90%) hue-rotate(180deg) brightness(85%) contrast(90%)" }}
                allowFullScreen
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default HomeView;
