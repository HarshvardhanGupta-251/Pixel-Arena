import React, { useState, useEffect } from "react";
import { ThemeProvider } from "@/components/theme-provider";
import DottedSurface from "@/components/ui/dotted-surface";
import Navbar from "@/components/layout/Navbar";
import MobileNav from "@/components/layout/MobileNav";
import Footer from "@/components/layout/Footer";
import HomeView from "@/components/home/HomeView";
import CourtBooking from "@/components/booking/CourtBooking";
import CafeView from "@/components/cafe/CafeView";
import TournamentsView from "@/components/tournaments/TournamentsView";
import AccountView from "@/components/account/AccountView";
import PaymentPanel from "@/components/payment/PaymentPanel";
import LoginModal from "@/components/auth/LoginModal";
import AdminPortal from "@/components/admin/AdminPortal";
import PoliciesModal from "@/components/policies/PoliciesModal";
import GroundLayout from "@/components/shared/GroundLayout";
import { arenaStore } from "@/lib/store";
import { SportType, User, AdminUser, Booking, Order, TournamentRegistration, Tournament } from "@/types";

export function App() {
  const [activeTab, setActiveTab] = useState<string>("home");
  const [selectedSport, setSelectedSport] = useState<SportType>("cricket");
  const [currentUser, setCurrentUser] = useState<User | null>(arenaStore.getCurrentUser());
  const [adminUser, setAdminUser] = useState<AdminUser | null>(arenaStore.getAdminUser());

  // Modal / overlay states
  const [isLoginOpen, setIsLoginOpen] = useState<boolean>(false);
  const [isAdminPortalOpen, setIsAdminPortalOpen] = useState<boolean>(false);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isPoliciesOpen, setIsPoliciesOpen] = useState<boolean>(false);

  // Active checkout targets
  const [activeBookingId, setActiveBookingId] = useState<string | null>(null);
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);
  const [activeRegId, setActiveRegId] = useState<string | null>(null);
  const [cartCount, setCartCount] = useState<number>(arenaStore.getCartCount());

  // Subscribe to arenaStore for reactive changes across tabs
  useEffect(() => {
    const unsub = arenaStore.subscribe(() => {
      setCurrentUser(arenaStore.getCurrentUser());
      setAdminUser(arenaStore.getAdminUser());
      setCartCount(arenaStore.getCartCount());
    });
    return unsub;
  }, []);

  // Listen to hash changes (e.g. #book, #cafe)
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace("#", "");
      if (["home", "book", "cafe", "tournaments", "account", "layout", "contact"].includes(hash)) {
        setActiveTab(hash);
      }
    };
    handleHash();
    window.addEventListener("hashchange", handleHash);
    return () => window.removeEventListener("hashchange", handleHash);
  }, []);

  const handleNavigate = (tab: string) => {
    setActiveBookingId(null);
    setActiveOrderId(null);
    setActiveRegId(null);

    if (tab === "contact") {
      setActiveTab("home");
      setTimeout(() => {
        document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
      }, 100);
      return;
    }

    setActiveTab(tab);
    window.location.hash = `#${tab}`;
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSelectSportForBooking = (sport: SportType) => {
    setSelectedSport(sport);
    setActiveBookingId(null);
    setActiveTab("book");
  };

  // Find active booking for checkout
  const currentBooking: Booking | undefined = activeBookingId
    ? arenaStore.getBookings().find((b) => b.id === activeBookingId)
    : undefined;

  // Find active order for checkout
  const currentOrder: Order | undefined = activeOrderId
    ? arenaStore.getOrders().find((o) => o.id === activeOrderId)
    : undefined;

  // Find active registration for checkout
  const currentReg: TournamentRegistration | undefined = activeRegId
    ? arenaStore.getTournamentRegistrations().find((r) => r.id === activeRegId)
    : undefined;

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" forcedTheme="dark" enableSystem={false}>
      <div className="min-h-screen bg-[#000000] text-white flex flex-col relative selection:bg-[#00E676] selection:text-black">
        {/* Animated Three.js Dotted Surface Background (hidden on admin portal) */}
        {!isAdminPortalOpen && (
          <DottedSurface size={7} opacity={0.7} sizeAttenuation={true} vertexColors={true} />
        )}

        {/* Global Desktop Navigation Header */}
        <Navbar
          activeTab={activeTab}
          onNavigate={handleNavigate}
          currentUser={currentUser}
          adminUser={adminUser}
          onOpenLogin={() => setIsLoginOpen(true)}
          onOpenAdmin={() => setIsAdminPortalOpen(true)}
          cartCount={cartCount}
          onOpenCart={() => {
            setActiveTab("cafe");
            setIsCartOpen(true);
          }}
        />

        {/* Main Content Area */}
        <main className="flex-1 relative z-10">
          {/* ================= ACTIVE CHECKOUT: COURT BOOKING PAYMENT ================= */}
          {currentBooking ? (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
              <button
                onClick={() => setActiveBookingId(null)}
                className="mb-6 text-xs text-neutral-400 hover:text-white flex items-center gap-1 font-heading uppercase"
              >
                <span>← Back to Court Picker</span>
              </button>

              <PaymentPanel
                amount={currentBooking.amount}
                refCode={currentBooking.refCode}
                title="Court Booking Payment"
                subtitle={`${currentBooking.courtName} • ${currentBooking.date} (${currentBooking.startTime} - ${currentBooking.endTime})`}
                holdExpiresAt={currentBooking.holdExpiresAt}
                status={currentBooking.status}
                utr={currentBooking.utr}
                rejectReason={currentBooking.rejectReason}
                bookingDetails={{
                  sport: currentBooking.sport,
                  courtName: currentBooking.courtName,
                  date: currentBooking.date,
                  startTime: currentBooking.startTime,
                  endTime: currentBooking.endTime,
                }}
                onSubmitUtr={(utr, screenshot) => {
                  return arenaStore.submitBookingPayment({
                    bookingId: currentBooking.id,
                    utr,
                    screenshotUrl: screenshot,
                  });
                }}
                onCancelHold={() => {
                  arenaStore.cancelBooking(currentBooking.id, "Hold timed out");
                  setActiveBookingId(null);
                }}
                onDone={() => {
                  setActiveBookingId(null);
                  setActiveTab("account");
                }}
              />
            </div>
          ) : currentOrder ? (
            /* ================= ACTIVE CHECKOUT: CAFE ORDER PAYMENT ================= */
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
              <button
                onClick={() => setActiveOrderId(null)}
                className="mb-6 text-xs text-neutral-400 hover:text-white flex items-center gap-1 font-heading uppercase"
              >
                <span>← Back to Cafe Menu</span>
              </button>

              <PaymentPanel
                amount={currentOrder.total}
                refCode={currentOrder.refCode}
                title="Pixel Fuel Cafe Order"
                subtitle={`Serving to: ${currentOrder.courtOrTable} • ${currentOrder.items.length} item(s)`}
                status={currentOrder.status}
                utr={currentOrder.utr}
                onSubmitUtr={(utr, screenshot) => {
                  return arenaStore.submitOrderPayment({
                    orderId: currentOrder.id,
                    utr,
                    screenshotUrl: screenshot,
                  });
                }}
                onDone={() => {
                  setActiveOrderId(null);
                  setActiveTab("account");
                }}
              />
            </div>
          ) : currentReg ? (
            /* ================= ACTIVE CHECKOUT: TOURNAMENT ENTRY FEE PAYMENT ================= */
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
              <button
                onClick={() => setActiveRegId(null)}
                className="mb-6 text-xs text-neutral-400 hover:text-white flex items-center gap-1 font-heading uppercase"
              >
                <span>← Back to Tournaments</span>
              </button>

              <PaymentPanel
                amount={currentReg.amount}
                refCode={currentReg.refCode}
                title="Tournament Entry Registration"
                subtitle={`${currentReg.tournamentName} • Team: ${currentReg.teamName}`}
                status={currentReg.status}
                utr={currentReg.utr}
                onSubmitUtr={(utr) => {
                  currentReg.utr = utr;
                  currentReg.status = "PENDING_APPROVAL";
                  return { success: true };
                }}
                onDone={() => {
                  setActiveRegId(null);
                  setActiveTab("account");
                }}
              />
            </div>
          ) : (
            /* ================= ROUTED VIEWS ================= */
            <>
              {activeTab === "home" && (
                <HomeView
                  onNavigate={handleNavigate}
                  onSelectSportForBooking={handleSelectSportForBooking}
                  onOpenPolicies={() => setIsPoliciesOpen(true)}
                />
              )}

              {activeTab === "book" && (
                <CourtBooking
                  currentUser={currentUser}
                  onRequireLogin={() => setIsLoginOpen(true)}
                  initialSport={selectedSport}
                  onHoldCreated={(bookingId) => setActiveBookingId(bookingId)}
                />
              )}

              {activeTab === "cafe" && (
                <CafeView
                  currentUser={currentUser}
                  onRequireLogin={() => setIsLoginOpen(true)}
                  isOpenCart={isCartOpen}
                  onOpenCart={() => setIsCartOpen(true)}
                  onCloseCart={() => setIsCartOpen(false)}
                  onOrderCreated={(orderId) => setActiveOrderId(orderId)}
                />
              )}

              {activeTab === "tournaments" && (
                <TournamentsView
                  currentUser={currentUser}
                  onRequireLogin={() => setIsLoginOpen(true)}
                  onRegisterSubmit={(tourn, details) => {
                    if (!currentUser) return;
                    const res = arenaStore.registerTournament({
                      tournamentId: tourn.id,
                      userId: currentUser.uid,
                      teamName: details.teamName,
                      captainName: details.captainName,
                      captainPhone: details.captainPhone,
                      players: details.players,
                      notes: details.notes,
                    });
                    if (res.success && res.registration) {
                      setActiveRegId(res.registration.id);
                    }
                  }}
                />
              )}

              {activeTab === "account" && (
                <AccountView
                  currentUser={currentUser}
                  onRequireLogin={() => setIsLoginOpen(true)}
                  onLogout={() => {
                    arenaStore.logoutCustomer();
                    setCurrentUser(null);
                  }}
                  onNavigateToBooking={() => handleNavigate("book")}
                  onNavigateToCafe={() => handleNavigate("cafe")}
                  onNavigateToTournaments={() => handleNavigate("tournaments")}
                  onOpenPaymentForBooking={(bookingId) => setActiveBookingId(bookingId)}
                />
              )}

              {activeTab === "layout" && (
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                  <div className="mb-6">
                    <h1 className="text-3xl font-extrabold font-heading text-white uppercase">
                      GROUND ARCHITECTURE & MEASUREMENTS
                    </h1>
                    <p className="text-xs text-neutral-400 mt-1">
                      High-resolution top-down architectural layout of the StrikeFit sports infrastructure at Pixel Arena.
                    </p>
                  </div>
                  <GroundLayout
                    onSelectZone={(zoneId) => {
                      if (zoneId === "zone_cricket") {
                        handleSelectSportForBooking("cricket");
                      } else if (zoneId === "zone_pickleball") {
                        handleSelectSportForBooking("pickleball");
                      } else {
                        handleNavigate("cafe");
                      }
                    }}
                  />
                </div>
              )}
            </>
          )}
        </main>

        {/* Global Footer */}
        <Footer
          onNavigate={handleNavigate}
          onOpenAdmin={() => setIsAdminPortalOpen(true)}
          onOpenPolicies={() => setIsPoliciesOpen(true)}
        />

        {/* Mobile Bottom Tab Bar */}
        <MobileNav activeTab={activeTab} onNavigate={handleNavigate} cartCount={cartCount} />

        {/* Player Login Modal (Phone OTP) */}
        <LoginModal
          isOpen={isLoginOpen}
          onClose={() => setIsLoginOpen(false)}
          onLoginSuccess={(user) => {
            setCurrentUser(user);
            setIsLoginOpen(false);
          }}
        />

        {/* Hidden Super-Admin Control Room */}
        {isAdminPortalOpen && (
          <AdminPortal
            onClose={() => setIsAdminPortalOpen(false)}
            adminUser={adminUser}
            onLoginAdmin={(email) => {
              const admin = arenaStore.loginAdmin(email);
              setAdminUser(admin);
            }}
            onLogoutAdmin={() => {
              arenaStore.logoutAdmin();
              setAdminUser(null);
            }}
          />
        )}

        {/* Policies Modal */}
        <PoliciesModal isOpen={isPoliciesOpen} onClose={() => setIsPoliciesOpen(false)} />
      </div>
    </ThemeProvider>
  );
}

export default App;
