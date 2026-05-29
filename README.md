# Rideshare UI Kit — React Replica

High-fidelity React + TypeScript recreation of a premium **Figma Rideshare UI Kit** (iPhone 14 Pro flows). Built with Vite, Tailwind, Framer Motion, and Lucide icons. Screens and interactions were developed using MCP tools (Figma Model Context Protocol) for pixel-perfect translation from design to code.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Tailwind](https://img.shields.io/badge/Tailwind-3-38B2AC?logo=tailwind-css)
![Vitest](https://img.shields.io/badge/Vitest-tested-6E9F18?logo=vitest)

## What This Is

A production-quality **interactive replica** and **component gallery** of a modern rideshare mobile experience:

- **Isolated high-fidelity screen previews** (gallery mode) — click any screen in the sidebar
- **Full realistic App Flow** (toggle) — complete multi-step user journeys with global state, loading overlays, toasts, bottom navigation, and simulated API delays
- Every major flow from the original Figma kit: onboarding, authentication, booking, payments, tracking, and secondary screens

**Key flows implemented:**
- Splash (dark + light variants) → Create Account / Log In
- Sign In + Create Account (form states, social auth buttons, validation toasts)
- Destination selection (search + saved places + recents) → "Finding drivers" overlay → Car Results
- Car selection → Payment processing (Add Card dark/light + Card Scan)
- Full-app mode: Home/Map view, persistent Bottom Nav, Messages, Profile, Ride Tracking with live status progression, Settings (dark/light), Gift Code redeem, Rating & Tips keypad
- Rich micro-interactions: animated toasts, progress overlays, spring transitions, dynamic island + home indicator in device frame

The result feels like a real shipping product inside a device shell.

## Screenshots & Visuals

The `references/` folder contains the original Figma design captures used as the source of truth:

- `splash-76-960.png`, `signin-65-904.png`, `signin-create-34-1612.png`
- `destination-76-1261.png`, `car-result-76-2222.png`
- `add-card-dark-76-988.png`, `add-card-light-1-2613.png`, `card-scan-dark-76-1064.png`

**Generate your own visuals:**
1. `npm run dev`
2. Toggle between Gallery and "Full App Flow"
3. Use browser devtools device emulation or screenshot the phone frame area

(Recommended: capture both light/dark variants and key states like "finding drivers" and ride tracking.)

## Getting Started

### Prerequisites
- Node.js 18+
- npm (or pnpm/yarn)

### Install & Run

```bash
npm install
npm run dev
```

Open http://localhost:5173 (or the port shown).

### Available Scripts

| Command           | Description                              |
|-------------------|------------------------------------------|
| `npm run dev`     | Start Vite dev server with HMR           |
| `npm run build`   | Type-check + production build            |
| `npm run preview` | Preview the production build locally     |
| `npm run lint`    | Run ESLint (zero warnings enforced)      |
| `npm run lint:fix`| Auto-fix lint issues                     |
| `npm run format`  | Format code with Prettier                |
| `npm run test`    | Run Vitest smoke tests (CI mode)         |
| `npm run test:watch` | Watch mode for tests                  |

## Architecture Notes

```
src/
├── App.tsx                 # Gallery + mode toggle + flow orchestration + BookingProvider
├── main.tsx
├── components/
│   ├── PhoneFrame.tsx      # Device chrome, Dynamic Island, toast layer, overlay support
│   ├── RideshareApp.tsx    # Full interactive app (auth + booking + bottom nav + state machine)
│   ├── BottomNavBar.tsx
│   └── ui/                 # Shared design system (Button, Input, CreditCard, StatusBar, etc.)
├── context/
│   └── BookingContext.tsx  # Global ride state, auth, payments, reducers, persistence
├── screens/                # ~17 high-fidelity screens (many with variants)
├── lib/utils.ts
├── index.css               # Tailwind + custom phone frame + component primitives
└── test/                   # Vitest + RTL setup + smoke tests
```

- **Two modes in one shell**: Isolated screens (for design QA) vs. `RideshareApp` (for flow/integration QA)
- Strong emphasis on **motion & polish** matching the Figma kit (springs, progress stages, realistic loading)
- Design tokens live in Tailwind config + CSS custom properties
- Context provides fake "API" helpers (`findRides`, `processPayment`) with realistic timing
- All components are self-contained and prop-driven for easy extraction into a real product

**Tech decisions:**
- Framer Motion for all meaningful animations
- No external UI libs — everything hand-crafted to match Figma
- TypeScript strict + no-explicit-any enforced via lint
- Vitest + Testing Library for fast component smoke coverage

## Implemented Screens + Flows

**Onboarding & Auth**
- SplashScreen (dark/light)
- SignInScreen (welcome + create account variants)

**Booking**
- DestinationScreen (search, saved places, recents)
- CarResultScreen + CarResultV2Screen (multiple ride options)
- BookingConfirmScreen, RideTrackingScreen (live status auto-advance)

**Payments**
- AddCardScreen (dark + light)
- CardScanScreen

**Core App Experience (Full Flow mode)**
- HomeScreen (map + quick rides + recent)
- MessagesScreen + MessagesPage
- ProfileScreen
- SettingsPage (dark/light)
- GiftCodePage
- RatingAndTipsPage

**Supporting**
- Overlays, toasts, loading states, bottom navigation

All primary CTAs are wired to realistic next-step behavior or demo toasts.

## Tooling & Quality

This project was given **strong engineering hygiene** as part of the Docs & Quality pass:

- **ESLint + Prettier** (`.eslintrc.cjs`, `.prettierrc`) — strict, zero-warning policy in CI
- **Vitest + @testing-library/react** — 5 smoke tests covering render + primary CTA clicks
- **TypeScript** (strict mode, noUnused*, isolatedModules)
- Clean `npm run build` (tsc + Vite)
- `.gitignore`, `public/` folder, conventional scripts

Run `npm run lint && npm test && npm run build` locally before committing.

## Credits

- **Original Design**: Figma Rideshare UI Kit (high-fidelity mobile flows)
- **Implementation**: React replica authored via direct use of the [Figma MCP server](https://github.com/modelcontextprotocol/servers) (figma-mcp-go) for design context, node inspection, and visual fidelity
- Additional polish, state management, and full-flow orchestration added to create a usable interactive showcase

---

Built as a demonstration of **design-to-code fidelity** and modern frontend engineering practices.

Happy exploring — switch to Full App Flow and book a ride!
