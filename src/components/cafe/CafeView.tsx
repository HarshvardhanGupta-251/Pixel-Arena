import React, { useState, useEffect } from "react";
import { arenaStore } from "@/lib/store";
import { MenuItem, MenuCategory, User, Order, Booking } from "@/types";
import { formatINR } from "@/lib/utils";
import {
  ShoppingBag,
  Search,
  Plus,
  Minus,
  Trash2,
  Clock,
  Sparkles,
  Layers,
  ArrowRight,
  X,
  CheckCircle2,
  Coffee,
  UtensilsCrossed,
  Flame,
  Check,
  Calendar,
} from "lucide-react";

interface CafeViewProps {
  currentUser: User | null;
  onRequireLogin: () => void;
  onOrderCreated: (orderId: string) => void;
  isOpenCart: boolean;
  onCloseCart: () => void;
  onOpenCart: () => void;
}

export function CafeView({
  currentUser,
  onRequireLogin,
  onOrderCreated,
  isOpenCart,
  onCloseCart,
  onOpenCart,
}: CafeViewProps) {
  const [categories, setCategories] = useState<MenuCategory[]>(arenaStore.getMenuCategories());
  const [menuItems, setMenuItems] = useState<MenuItem[]>(arenaStore.getMenuItems());
  const [settings, setSettings] = useState(arenaStore.getSettings());
  const [cart, setCart] = useState(arenaStore.getCart());

  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [vegOnly, setVegOnly] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [orderType, setOrderType] = useState<"pickup" | "serve_court">("serve_court");
  const [courtOrTable, setCourtOrTable] = useState<string>("Cricket Turf Dugout #1");
  const [selectedBookingId, setSelectedBookingId] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Subscribe to arenaStore updates
  useEffect(() => {
    const unsub = arenaStore.subscribe(() => {
      setCategories([...arenaStore.getMenuCategories()]);
      setMenuItems([...arenaStore.getMenuItems()]);
      setSettings({ ...arenaStore.getSettings() });
      setCart({ ...arenaStore.getCart() });
    });
    return unsub;
  }, []);

  // Close drawer on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpenCart) {
        onCloseCart();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpenCart, onCloseCart]);

  // Check if current user has any confirmed or pending bookings today
  const todayStr = new Date().toISOString().slice(0, 10);
  const userBookings = currentUser
    ? arenaStore.getBookings().filter(
        (b) =>
          (b.userId === currentUser.uid || b.phone === currentUser.phone) &&
          (b.status === "CONFIRMED" || b.status === "PENDING_APPROVAL")
      )
    : [];

  // Filter items
  const filteredItems = menuItems.filter((item) => {
    if (!item.available) return false;
    if (activeCategory !== "all" && item.categoryId !== activeCategory) return false;
    if (vegOnly && !item.isVeg) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        item.name.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const cartItemsList = Object.values(cart);
  const totalCartCount = cartItemsList.reduce((sum, i) => sum + i.qty, 0);
  const subtotal = cartItemsList.reduce((sum, i) => sum + i.item.price * i.qty, 0);
  const tax = Math.round((subtotal * (settings.taxPercent || 5)) / 100);
  const total = subtotal + tax;

  const handleAddToCart = (item: MenuItem) => {
    arenaStore.addToCart(item);
  };

  const handleRemoveFromCart = (itemId: string) => {
    arenaStore.removeFromCart(itemId);
    // If cart is now empty, automatically close the drawer to prevent getting stuck
    if (arenaStore.getCartCount() === 0) {
      onCloseCart();
    }
  };

  const handleAttachBooking = (bookingId: string) => {
    setSelectedBookingId(bookingId);
    const bk = userBookings.find((b) => b.id === bookingId);
    if (bk) {
      setOrderType("serve_court");
      setCourtOrTable(`${bk.courtName} (Slot: ${bk.startTime}-${bk.endTime})`);
    }
  };

  const handleCheckout = () => {
    setErrorMsg(null);
    if (cartItemsList.length === 0) return;

    if (!currentUser) {
      onRequireLogin();
      return;
    }

    if (orderType === "serve_court" && !courtOrTable.trim()) {
      setErrorMsg("Please specify which court or table to serve your order to.");
      return;
    }

    const order = arenaStore.createCafeOrder({
      userId: currentUser.uid,
      username: currentUser.username,
      phone: currentUser.phone,
      items: cartItemsList.map((i) => ({
        itemId: i.item.id,
        name: i.item.name,
        price: i.item.price,
        qty: i.qty,
        isVeg: i.item.isVeg,
      })),
      orderType,
      courtOrTable: orderType === "serve_court" ? courtOrTable : "Counter Pickup",
      notes,
      bookingId: selectedBookingId || undefined,
    });

    arenaStore.clearCart();
    onCloseCart();
    onOrderCreated(order.id);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-32">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-[#00E676] rounded-full animate-pulse" />
            <span className="text-xs uppercase font-heading font-semibold text-[#00E676] tracking-widest">
              Pixel Fuel Sports Cafe
            </span>
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold font-heading text-white uppercase tracking-tight mt-1">
            ATHLETE NUTRITION & CAFE
          </h1>
          <p className="text-xs md:text-sm text-neutral-400 mt-1 max-w-2xl leading-relaxed">
            Clean-fuel protein meals, whole wheat tandoori wraps, nitro cold brew, and rapid isotonic hydration. Freshly prepared and delivered straight to your turf dugout.
          </p>
        </div>

        {/* View Cart Trigger Button */}
        {totalCartCount > 0 && (
          <button
            onClick={onOpenCart}
            className="py-3 px-6 bg-[#00E676] hover:bg-[#00c864] text-black font-heading font-bold text-xs uppercase tracking-wider rounded-md flex items-center gap-2.5 shadow-[0_0_20px_rgba(0,230,118,0.3)] transition-all cursor-pointer shrink-0"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>
              View Cart ({totalCartCount} item{totalCartCount > 1 ? "s" : ""}) • {formatINR(total)}
            </span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="sticky top-16 md:top-20 z-30 bg-[#0a0a0a]/95 backdrop-blur-md py-4 mb-8 border-y border-neutral-800 space-y-3.5">
        {/* Row 1: Category Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setActiveCategory("all")}
            className={`px-4 py-2 rounded-lg font-heading text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer shrink-0 ${
              activeCategory === "all"
                ? "bg-[#00E676] text-black shadow-[0_0_12px_rgba(0,230,118,0.25)]"
                : "bg-neutral-900 text-neutral-400 hover:text-white hover:bg-neutral-800"
            }`}
          >
            All Items ({menuItems.filter((i) => i.available).length})
          </button>
          {categories.map((cat) => {
            const count = menuItems.filter((i) => i.categoryId === cat.id && i.available).length;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-2 rounded-lg font-heading text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer shrink-0 ${
                  activeCategory === cat.id
                    ? "bg-[#00E676] text-black shadow-[0_0_12px_rgba(0,230,118,0.25)]"
                    : "bg-neutral-900 text-neutral-400 hover:text-white hover:bg-neutral-800"
                }`}
              >
                {cat.name} ({count})
              </button>
            );
          })}
        </div>

        {/* Row 2: Secondary Controls (Count, Veg Only Toggle & Search) */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2 border-t border-neutral-850">
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-neutral-400">
              Showing <strong className="text-white">{filteredItems.length}</strong> items
            </span>

            <span className="text-neutral-700">|</span>

            {/* Veg Only Toggle */}
            <label className="inline-flex items-center gap-2 cursor-pointer bg-neutral-900 hover:bg-neutral-850 px-3 py-1.5 rounded-lg border border-neutral-800 text-xs transition-colors shrink-0">
              <input
                type="checkbox"
                checked={vegOnly}
                onChange={(e) => setVegOnly(e.target.checked)}
                className="accent-[#00E676] w-3.5 h-3.5 rounded cursor-pointer"
              />
              <span className="flex items-center gap-1.5 font-medium text-neutral-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block shadow-[0_0_6px_#10b981]" />
                Veg Only
              </span>
            </label>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search food, drinks..."
              className="w-full pl-9 pr-8 py-1.5 bg-neutral-900 border border-neutral-800 focus:border-[#00E676] rounded-lg text-xs text-white focus:outline-none transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white text-xs cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Menu Items Grid */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-20 bg-[#111111] border border-neutral-800 rounded-xl space-y-3">
          <UtensilsCrossed className="w-12 h-12 text-neutral-600 mx-auto" />
          <h3 className="font-heading font-bold text-base text-white uppercase">
            No Menu Items Found
          </h3>
          <p className="text-xs text-neutral-400">
            Try adjusting your search query or category filter.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems.map((item) => {
            const inCart = cart[item.id];
            return (
              <div
                key={item.id}
                className="bg-[#111111] border border-[#262626] hover:border-[#00E676]/40 rounded-xl overflow-hidden flex flex-col justify-between transition-all group shadow-xl"
              >
                <div>
                  {/* Image & Indicators */}
                  <div className="relative h-48 w-full bg-neutral-900 overflow-hidden">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                      onError={(e) => {
                        // Fallback image gradient
                        (e.target as HTMLElement).style.display = "none";
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

                    {/* Standard Indian Veg/Non-Veg Badge */}
                    <div className="absolute top-3 left-3 bg-black/80 backdrop-blur-sm px-2 py-1 rounded border border-neutral-700 flex items-center gap-1.5 shadow">
                      {item.isVeg ? (
                        <div className="w-3.5 h-3.5 border-2 border-emerald-500 rounded-sm flex items-center justify-center p-0.5">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        </div>
                      ) : (
                        <div className="w-3.5 h-3.5 border-2 border-rose-500 rounded-sm flex items-center justify-center p-0.5">
                          <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                        </div>
                      )}
                      <span className="text-[10px] font-heading font-semibold text-neutral-200">
                        {item.isVeg ? "VEG" : "NON-VEG"}
                      </span>
                    </div>

                    {/* Promotional Badges */}
                    <div className="absolute top-3 right-3 flex flex-col gap-1 items-end">
                      {item.badges.map((b) => (
                        <span
                          key={b}
                          className="px-2 py-0.5 bg-[#00E676] text-black text-[10px] font-heading font-bold uppercase rounded shadow-[0_0_8px_rgba(0,230,118,0.3)]"
                        >
                          {b}
                        </span>
                      ))}
                    </div>

                    {/* Price in overlay */}
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                      <span className="text-xl font-extrabold font-heading text-white drop-shadow">
                        ₹{item.price}
                      </span>
                      {item.savings && (
                        <span className="px-2 py-0.5 bg-black/80 border border-[#00E676]/40 text-[#00E676] text-[10px] font-mono font-bold rounded">
                          Save ₹{item.savings}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Food Content */}
                  <div className="p-5 space-y-2">
                    <h3 className="font-heading font-bold text-base text-white group-hover:text-[#00E676] transition-colors line-clamp-1">
                      {item.name}
                    </h3>
                    <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>

                    {/* Combo Item Breakdown */}
                    {item.isCombo && item.comboItems && (
                      <div className="pt-2 text-[11px] text-[#00E676] font-mono bg-[#141414] p-2 rounded border border-neutral-800">
                        <span className="font-bold block text-neutral-300">Combo pack includes:</span>
                        {item.comboItems.join(" • ")}
                      </div>
                    )}
                  </div>
                </div>

                {/* Stepper or Add button */}
                <div className="p-5 pt-0">
                  {inCart ? (
                    <div className="flex items-center justify-between bg-neutral-900 border border-[#00E676] rounded-lg p-1.5 shadow-[0_0_12px_rgba(0,230,118,0.2)]">
                      <button
                        onClick={() => handleRemoveFromCart(item.id)}
                        className="w-8 h-8 rounded bg-neutral-800 hover:bg-neutral-700 text-white flex items-center justify-center cursor-pointer transition-colors"
                        title="Reduce quantity"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="font-heading font-bold text-sm text-[#00E676] px-3 font-mono">
                        {inCart.qty} in cart
                      </span>
                      <button
                        onClick={() => handleAddToCart(item)}
                        className="w-8 h-8 rounded bg-[#00E676] text-black flex items-center justify-center cursor-pointer hover:bg-[#00c864] transition-colors"
                        title="Increase quantity"
                      >
                        <Plus className="w-4 h-4 font-bold" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleAddToCart(item)}
                      className="w-full py-2.5 bg-neutral-900 hover:bg-[#00E676] text-neutral-200 hover:text-black font-heading font-bold text-xs uppercase tracking-wider rounded-lg border border-neutral-800 hover:border-[#00E676] transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add to Order</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Floating Bottom Bar on Mobile/Desktop when items are in cart */}
      {totalCartCount > 0 && !isOpenCart && (
        <div className="fixed bottom-16 lg:bottom-4 left-4 right-4 sm:left-auto sm:right-8 z-40">
          <button
            onClick={onOpenCart}
            className="w-full sm:w-auto py-3.5 px-6 bg-[#00E676] hover:bg-[#00c864] text-black font-heading font-bold text-xs uppercase tracking-wider rounded-xl shadow-[0_0_30px_rgba(0,230,118,0.4)] flex items-center justify-between sm:justify-start gap-4 transition-all cursor-pointer animate-bounce"
          >
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4" />
              <span>{totalCartCount} item{totalCartCount > 1 ? "s" : ""} selected</span>
            </div>
            <div className="flex items-center gap-1.5 border-l border-black/20 pl-3">
              <span className="font-mono text-sm">{formatINR(total)}</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </button>
        </div>
      )}

      {/* Cart Drawer / Side Modal */}
      {isOpenCart && (
        <div
          className="fixed inset-0 z-[100] flex justify-end bg-black/80 backdrop-blur-sm animate-in fade-in duration-150 cursor-pointer"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              onCloseCart();
            }
          }}
        >
          <div
            className="w-full max-w-md bg-[#0d0d0d] border-l border-[#262626] h-full flex flex-col justify-between shadow-2xl relative cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-5 border-b border-neutral-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#00E676]/10 text-[#00E676] flex items-center justify-center">
                  <ShoppingBag className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-heading text-lg font-bold uppercase text-white">
                    Cafe Order Summary
                  </h3>
                  <span className="text-[11px] text-neutral-400 font-mono">
                    {totalCartCount} item{totalCartCount > 1 ? "s" : ""} in cart
                  </span>
                </div>
              </div>
              <button
                onClick={onCloseCart}
                className="p-2 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors cursor-pointer"
                title="Close Cart"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cart Items List */}
            <div className="p-5 flex-1 overflow-y-auto space-y-4">
              {cartItemsList.length === 0 ? (
                <div className="text-center py-20 px-4 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center mx-auto text-neutral-400">
                    <Coffee className="w-8 h-8 text-neutral-500" />
                  </div>
                  <div>
                    <h4 className="text-base font-heading font-bold uppercase text-white">
                      Your Fuel Cart is Empty
                    </h4>
                    <p className="text-xs text-neutral-400 mt-1 max-w-xs mx-auto leading-relaxed">
                      You removed all items. Add protein snacks, electrolyte hydration, or combos from the menu.
                    </p>
                  </div>
                  <button
                    onClick={onCloseCart}
                    className="py-3 px-8 bg-[#00E676] hover:bg-[#00c864] text-black font-heading font-bold text-xs uppercase tracking-wider rounded-lg transition-all shadow-[0_0_20px_rgba(0,230,118,0.25)] cursor-pointer"
                  >
                    Back to Menu
                  </button>
                </div>
              ) : (
                <>
                  {/* Items */}
                  <div className="space-y-3">
                    {cartItemsList.map(({ item, qty }) => (
                      <div
                        key={item.id}
                        className="p-3.5 bg-[#141414] border border-neutral-800 rounded-xl flex items-center justify-between gap-3"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            {item.isVeg ? (
                              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                            ) : (
                              <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                            )}
                            <h4 className="font-heading font-bold text-xs text-white truncate">
                              {item.name}
                            </h4>
                          </div>
                          <span className="text-xs font-mono text-[#00E676] font-bold block mt-1">
                            ₹{item.price * qty} (₹{item.price} × {qty})
                          </span>
                        </div>

                        {/* Stepper */}
                        <div className="flex items-center gap-1.5 bg-neutral-900 border border-neutral-700 rounded-lg p-1">
                          <button
                            onClick={() => handleRemoveFromCart(item.id)}
                            className="w-7 h-7 rounded bg-neutral-800 hover:bg-neutral-700 text-white flex items-center justify-center text-xs transition-colors"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="text-xs font-bold text-white font-mono w-5 text-center">
                            {qty}
                          </span>
                          <button
                            onClick={() => handleAddToCart(item)}
                            className="w-7 h-7 rounded bg-[#00E676] text-black flex items-center justify-center text-xs hover:bg-[#00c864] transition-colors"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Optional: Attach to Active Booking */}
                  {userBookings.length > 0 && (
                    <div className="p-3.5 bg-neutral-900/90 border border-neutral-800 rounded-xl space-y-2">
                      <label className="text-xs font-heading font-semibold uppercase text-neutral-300 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-[#00E676]" />
                        <span>Attach to My Court Booking</span>
                      </label>
                      <select
                        value={selectedBookingId}
                        onChange={(e) => handleAttachBooking(e.target.value)}
                        className="w-full px-3 py-2 bg-black border border-neutral-700 rounded text-xs text-white"
                      >
                        <option value="">Select your active court reservation...</option>
                        {userBookings.map((b) => (
                          <option key={b.id} value={b.id}>
                            {b.courtName} ({b.startTime}-{b.endTime}) - {b.refCode}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Delivery Location Configuration */}
                  <div className="pt-4 border-t border-neutral-800 space-y-3">
                    <label className="text-xs font-heading font-semibold uppercase text-neutral-300 block">
                      Order Service Mode
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setOrderType("serve_court")}
                        className={`p-3 rounded-lg border text-xs font-heading font-bold uppercase transition-all cursor-pointer ${
                          orderType === "serve_court"
                            ? "bg-[#00E676] text-black border-[#00E676] shadow-[0_0_12px_rgba(0,230,118,0.25)]"
                            : "bg-neutral-900 text-neutral-400 border-neutral-800 hover:text-white"
                        }`}
                      >
                        Serve at Court
                      </button>
                      <button
                        type="button"
                        onClick={() => setOrderType("pickup")}
                        className={`p-3 rounded-lg border text-xs font-heading font-bold uppercase transition-all cursor-pointer ${
                          orderType === "pickup"
                            ? "bg-[#00E676] text-black border-[#00E676] shadow-[0_0_12px_rgba(0,230,118,0.25)]"
                            : "bg-neutral-900 text-neutral-400 border-neutral-800 hover:text-white"
                        }`}
                      >
                        Counter Pickup
                      </button>
                    </div>

                    {orderType === "serve_court" && (
                      <div>
                        <label className="text-[11px] text-neutral-400 block mb-1">
                          Court Dugout / Table Location:
                        </label>
                        <input
                          type="text"
                          value={courtOrTable}
                          onChange={(e) => setCourtOrTable(e.target.value)}
                          placeholder="e.g. Cricket Dugout #1, Pickleball Court 1"
                          className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-xs text-white focus:outline-none focus:border-[#00E676]"
                        />
                      </div>
                    )}

                    <div>
                      <label className="text-[11px] text-neutral-400 block mb-1">
                        Special Instructions for Chef:
                      </label>
                      <input
                        type="text"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="e.g. Less spicy, extra lemon wedge, serve warm"
                        className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-xs text-white focus:outline-none focus:border-[#00E676]"
                      />
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Bill Summary & Proceed */}
            {cartItemsList.length > 0 && (
              <div className="p-5 bg-neutral-950 border-t border-neutral-800 space-y-3.5">
                <div className="space-y-1.5 text-xs text-neutral-400">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-mono text-white">₹{subtotal}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>GST ({settings.taxPercent || 5}%)</span>
                    <span className="font-mono text-white">₹{tax}</span>
                  </div>
                  <div className="flex justify-between text-base font-extrabold text-white pt-2 border-t border-neutral-800">
                    <span className="font-heading uppercase">Total Amount</span>
                    <span className="font-mono text-[#00E676]">{formatINR(total)}</span>
                  </div>
                </div>

                {errorMsg && (
                  <div className="p-2.5 bg-red-500/10 border border-red-500/30 text-red-400 text-xs rounded-lg">
                    {errorMsg}
                  </div>
                )}

                <button
                  onClick={handleCheckout}
                  className="w-full py-3.5 bg-[#00E676] hover:bg-[#00c864] text-black font-heading font-bold text-xs uppercase tracking-wider rounded-md transition-all shadow-[0_0_20px_rgba(0,230,118,0.3)] flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Pay {formatINR(total)} via UPI QR</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default CafeView;
