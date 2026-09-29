# 🎮 Pixel Arena

> A full-featured sports arena management web app — book courts, order from the cafe, join tournaments, and manage the facility — all in one dark-mode, premium UI.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Pages & Routes](#pages--routes)
- [Admin Portal](#admin-portal)
- [Environment Variables](#environment-variables)
- [Scripts](#scripts)

---

## Overview

**Pixel Arena** is a sports facility management platform built for a multi-sport complex housing a **Cricket/Box Cricket Turf** and a **Pickleball Court**. It allows players to book slots, order food from the in-house cafe, register for tournaments, and track their activity — all from a single sleek interface.

The platform includes a **hidden super-admin control room** for facility managers to review bookings, approve UPI payments, and manage tournaments.

---

## Features

### 🏏 Court Booking
- Browse available courts by sport (Cricket, Pickleball)
- Real-time slot picker with dynamic pricing (peak/off-peak, weekday/weekend)
- Instant **10-minute hold lock** on slot selection
- Contiguous multi-slot selection
- Booking confirmation with unique reference code

### ☕ Pixel Fuel Cafe
- Full in-house cafe menu with categories
- Cart system with quantity management
- Order placement tied to court/table
- Order history in account dashboard

### 🏆 Tournaments
- Browse upcoming tournaments by sport
- Team registration with captain & player details
- Registration confirmation with reference code
- Tournament status tracking

### 👤 User Account
- Phone-based OTP login (mock flow)
- View all bookings, orders, and tournament registrations
- Payment status tracking (Pending / Approved / Rejected)
- Cancel active holds

### 💳 UPI Payment Flow
- Submit UTR number after UPI transfer
- Optional screenshot upload
- Live countdown timer on pending holds
- Admin approval/rejection with reasons

### 🗺️ Ground Layout
- Interactive architectural blueprint of the facility
- Click zones to view specs and jump to booking
- Real ground plan SVG rendered from official layout

### 🌐 Responsive Design
- Desktop navigation + Mobile bottom tab bar
- Dark-mode only, optimised for all screen sizes
- Animated Three.js dotted particle background

### 🔐 Admin Portal
- Hidden super-admin entry (accessible from footer)
- Review all bookings with payment proofs
- Approve or reject UPI payments
- Manage tournament registrations
- View cafe orders

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 + Vite 8 |
| Language | TypeScript 7 |
| Styling | Tailwind CSS v4 |
| 3D / Animations | Three.js + GSAP + Motion |
| Icons | Lucide React |
| QR Codes | qrcode.react |
| Date Utilities | date-fns |
| State | Custom reactive store (`arenaStore`) |
| Build | Vite + esbuild |

---

## Getting Started

### Prerequisites

- **Node.js** v18+
- **npm** v9+

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/HarshvardhanGupta-251/Pixel-Arena.git
cd Pixel-Arena

# 2. Install dependencies
npm install

# 3. Start the development server
npm run dev
```

The app will be available at **http://localhost:3000**

> If port 3000 is occupied, Vite will automatically try the next available port (e.g. 3001).

---

## Project Structure

```
Pixel-Arena/
├── public/
│   └── images/
│       └── Ground.svg              # Official ground architectural blueprint
├── src/
│   ├── components/
│   │   ├── account/                # User account & booking history
│   │   ├── admin/                  # Hidden super-admin control room
│   │   ├── auth/                   # Phone OTP login modal
│   │   ├── booking/                # Court booking & slot picker
│   │   ├── cafe/                   # Cafe menu, cart & orders
│   │   ├── home/                   # Landing / home view
│   │   ├── layout/                 # Navbar, MobileNav, Footer
│   │   ├── payment/                # UPI payment panel
│   │   ├── policies/               # Terms & policies modal
│   │   ├── shared/                 # GroundLayout component
│   │   ├── tournaments/            # Tournament browser & registration
│   │   └── ui/                     # DottedSurface, shared UI primitives
│   ├── lib/
│   │   ├── store.ts                # Central reactive arenaStore
│   │   ├── booking-engine.ts       # Slot generation & pricing logic
│   │   └── utils.ts                # Utility helpers
│   ├── types/                      # TypeScript type definitions
│   ├── App.tsx                     # Root component & hash router
│   ├── main.tsx                    # Entry point
│   └── index.css                   # Global styles & Tailwind imports
├── index.html
├── vite.config.ts
├── tsconfig.json
└── package.json
```

---

## Pages & Routes

Navigation is hash-based (`window.location.hash`):

| Hash | Page | Description |
|---|---|---|
| `#home` | Home | Landing page with hero, sports overview & layout preview |
| `#book` | Court Booking | Slot picker for Cricket and Pickleball courts |
| `#cafe` | Pixel Fuel Cafe | Food & beverage ordering system |
| `#tournaments` | Tournaments | Upcoming events & team registration |
| `#account` | My Account | User bookings, orders & payment status |
| `#layout` | Ground Layout | Interactive architectural blueprint |

---

## Admin Portal

The admin portal is **hidden** — accessible via the footer (visible only to those who know).

**Admin capabilities:**
- View all court bookings and their payment status
- **Approve** or **Reject** UPI payments (with optional rejection reason)
- View UTR numbers and payment screenshot uploads
- Manage tournament registrations
- View cafe orders

To access: scroll to the footer → click the discrete admin entry point → log in with the admin email.

---

## Environment Variables

Copy `.env.example` to `.env` and fill in values as needed:

```bash
cp .env.example .env
```

> The app runs fully offline without any external API keys — all data is managed in-memory via `arenaStore`.

---

## Scripts

```bash
# Start development server with hot reload
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview

# TypeScript type-check
npm run lint
```

---

## Sports at Pixel Arena

### 🏏 Cricket / Box Cricket Turf
- **Size:** 34 ft wide (back) × ~110 ft (slanted) • 3,740 sq ft
- **Surface:** Professional FIFA-grade monofilament artificial grass with shockpad
- **Lighting:** 8× 400W LED Stadium Floodlights (500+ Lux)

### 🏓 Pickleball Court
- **Size:** 24 ft × 52 ft • 1,248 sq ft
- **Surface:** 8-layer acrylic cushioned hardcourt (USAPA tournament standard)
- **Lighting:** 4× 300W Anti-glare Asymmetric LED Floods

---

## License

This project is private. All rights reserved © Pixel Arena.
