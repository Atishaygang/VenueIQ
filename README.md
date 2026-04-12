# VenueIQ — Smart Stadium Experience Platform

> A real-time crowd intelligence system for 50,000-person sporting venues. Built with Google Antigravity for PromptWars: Virtual.

🔗 **Live Demo:** https://venueiq-app-756450764548.us-central1.run.app/
🔗 **GitHub:** https://github.com/Atishaygang/VenueIQ

---

## 📋 Table of Contents

- [Chosen Vertical](#chosen-vertical)
- [Approach & Logic](#approach--logic)
- [How the Solution Works](#how-the-solution-works)
- [Google Services Integration](#google-services-integration)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Features](#features)
- [Testing](#testing)
- [Accessibility](#accessibility)
- [Assumptions Made](#assumptions-made)
- [Running Locally](#running-locally)
- [Evaluation Criteria Coverage](#evaluation-criteria-coverage)

---

## 🎯 Chosen Vertical

**Physical Event Experience — Large Scale Sporting Venues**

VenueIQ addresses the core challenges of crowd movement, waiting times, and real-time coordination at large-scale sporting venues with a capacity of 50,000+ attendees.

The insight driving this solution: stadiums invest heavily in the playing field experience. Almost nothing exists for coordinating the 50,000 people around it. Existing solutions are reactive — they show you a problem after it has happened. VenueIQ is predictive and interconnected — every data point influences every other data point in real time.

---

## 🧠 Approach & Logic

### The Core Problem
At a large stadium event, five major pain points exist simultaneously:

1. **Crowd bottlenecks** — no real-time zone density information for attendees or staff
2. **Uncoordinated queues** — food stall and restroom wait times are unknown
3. **Reactive staff management** — staff redeployment happens after problems escalate
4. **Disconnected match data** — live match events have no influence on crowd management
5. **Parking chaos** — no visibility into parking availability or public transport alternatives

### The Solution Architecture

Rather than building isolated features, VenueIQ is built around a **Central Simulation Engine** — a single JavaScript module that maintains the entire venue state and broadcasts changes to all components simultaneously via React Context.

This means when a match event occurs (e.g., a SIX is hit), the following cascade happens automatically:

```
SIX scored in match simulation
        ↓
All zone crowd densities spike (+8 to +15)
        ↓
Stall wait times increase in high-density zones
        ↓
AI engine generates new staff redeployment suggestions
        ↓
Critical voice alert fires to attendees
        ↓
Critical zones written to Firebase Realtime Database
        ↓
Staff dashboard updates with new incident if zone stays critical
```

One event. Six automatic reactions. Zero manual triggers.

---

## ⚙️ How the Solution Works

### The Engine Layer

**`src/engine/venueEngine.js`** — The brain of the application. Runs two core loops:

```javascript
// Loop 1: tick() — every 5 seconds
// Updates: zone density, stall wait times, gate flow rates,
// alert generation, auto-incident creation

// Loop 2: simulateMatch() — every 8 seconds
// Simulates ball-by-ball cricket with weighted probabilities:
// Dot: 30% | Single: 25% | Four: 18% | Six: 8% | Wicket: 4%
```

**Crowd Density Logic:**
- Each zone updates with a delta between -8 and +12
- Biased by match events (SIX → all zones +8 to +15, WICKET → home zones +10)
- Clamped between 5 and 98
- Trend calculated: rising (delta > 3), falling (delta < -3), stable
- Critical zones (≥ 85%) automatically written to Firebase Realtime Database

**AI Suggestion Formula:**
```javascript
confidence = Math.min(95, 60 + (density - 70) * 1.2).toFixed(0)
```

**`src/engine/VenueContext.jsx`** — React Context provider exposing `useVenue()` hook to all components. Single source of truth for entire application state.

**`src/engine/suggestionEngine.js`** — Rule-based decision engine generating contextually accurate staff redeployment suggestions based on live zone states.

**`src/engine/voiceEngine.js`** — Native Web Speech API wrapper managing speech synthesis with priority queuing.

**`src/engine/assistantEngine.js`** — Intent-matching engine for the voice assistant across 8 intent categories.

---

### Portal 1 — Attendee App (`/attendee`)

Mobile-first design with 5-tab bottom navigation:

| Tab | Feature |
|-----|---------|
| 🏠 Home | Live score ticker, match commentary, proactive alerts |
| 🗺️ Navigate | SVG crowd heatmap, smart rerouting, step-by-step directions |
| 🍔 Facilities | Stall wait times, restroom status, seat finder |
| 🔔 Alerts | Full alert history with severity badges and category filters |
| 🅿️ Parking | Personal spot tracker, live cost, SVG parking map, transport |

---

### Portal 2 — Staff Dashboard (`/staff`)

Desktop-first command center with 5 sections:

| Section | Feature |
|---------|---------|
| 📊 Overview | 4 live KPIs, zone density chart, queue length chart |
| 🧠 AI Redeployment | Confidence-scored suggestions, deploy/dismiss actions |
| 📢 Broadcast | Zone-targeted alert composition, broadcast log |
| 🚨 Incidents | Auto-generated + manual incident tracking, resolution workflow |
| 🚪 Gate Control | 12 gate toggles, emergency close all, flow rate monitoring |

---

## ☁️ Google Services Integration

VenueIQ integrates **four Google Services** meaningfully across the stack:

### 1. Google Cloud Run
- **Project:** `caramel-banner-493006-e2` | **Region:** `us-central1`
- Containerized React app with automatic scaling and zero server management
- Built via Cloud Build pipeline on every deployment

### 2. Firebase Realtime Database
Critical crowd alerts written to Firebase whenever any zone reaches ≥ 85% density.
```javascript
// On every engine tick — critical zones sync to Firebase /alerts
// Enables future real sensor integration with zero refactoring needed
```
Fails silently if offline — app works without connectivity.

### 3. Google Fonts API
Space Grotesk loaded via Google Fonts with preconnect performance optimization:
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
```

### 4. Google Maps Embed
Interactive Wankhede Stadium location embedded in Parking tab — zero API key required.

All services documented in `src/config/googleServices.js` for full traceability.

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend Framework | React 18 + Vite |
| Styling | Tailwind CSS v4 |
| Charts | Recharts |
| Icons | Lucide React + Google Material Symbols |
| Routing | React Router v6 |
| Voice | Web Speech API (native browser) |
| Font | Space Grotesk (Google Fonts API) |
| Database | Firebase Realtime Database |
| Deployment | Google Cloud Run |
| Testing | Vitest + React Testing Library |
| Build Tool | Google Antigravity + Vite |

---

## 📁 Project Structure

```
VenueIQ-App/
├── src/
│   ├── engine/
│   │   ├── venueEngine.js
│   │   ├── VenueContext.jsx
│   │   ├── suggestionEngine.js
│   │   ├── voiceEngine.js
│   │   ├── speechRecognition.js
│   │   └── assistantEngine.js
│   ├── components/
│   │   ├── attendee/
│   │   │   ├── HomeTab.jsx
│   │   │   ├── NavigateTab.jsx
│   │   │   ├── FacilitiesTab.jsx
│   │   │   ├── AlertsTab.jsx
│   │   │   ├── ParkingTab.jsx
│   │   │   └── VoiceAssistant.jsx
│   │   ├── staff/
│   │   │   ├── OverviewDashboard.jsx
│   │   │   ├── AIRedeployment.jsx
│   │   │   ├── BroadcastAlerts.jsx
│   │   │   ├── IncidentTracker.jsx
│   │   │   └── GateControl.jsx
│   │   └── shared/
│   │       └── VoiceControlBar.jsx
│   ├── config/
│   │   ├── firebase.js             # Firebase initialization
│   │   └── googleServices.js       # Google Services registry
│   ├── pages/
│   │   ├── Landing.jsx
│   │   ├── AttendeePortal.jsx
│   │   └── StaffPortal.jsx
│   ├── data/
│   │   └── mockData.js
│   ├── test/
│   │   ├── setup.js
│   │   ├── venueEngine.test.js
│   │   ├── suggestionEngine.test.js
│   │   ├── assistantEngine.test.js
│   │   ├── voiceEngine.test.js
│   │   └── integration.test.js
│   └── main.jsx
├── package.json
└── README.md
```

---

## ✨ Features

### Attendee Portal
- ✅ Live match score ticker with ball-by-ball commentary
- ✅ Real-time crowd heatmap (8 zones, color-coded)
- ✅ Smart rerouting avoiding high-density zones
- ✅ Food stall & restroom wait times linked to crowd density
- ✅ Proactive voice alerts for crowd surges and match events
- ✅ Voice assistant with 8 intent categories
- ✅ Parking zone map with live occupancy
- ✅ Personal parking spot tracker with live cost
- ✅ Public transport alternatives with Google Maps embed
- ✅ Full alert history with category filters

### Staff Portal
- ✅ Live KPI cards (attendees, density zones, incidents, gates)
- ✅ Recharts visualizations updating every engine tick
- ✅ AI redeployment suggestions with confidence scores
- ✅ Zone-targeted broadcast system with message log
- ✅ Auto-generated incidents from engine critical events
- ✅ Incident resolution with cooldown tracking
- ✅ 12-gate control panel with flow rate monitoring
- ✅ Emergency close all gates with double confirmation
- ✅ Voice confirmations for all major staff actions
- ✅ Firebase sync badge showing live data connection

---

## 🧪 Testing

VenueIQ uses **Vitest** and **React Testing Library** for comprehensive test coverage.

```bash
# Run all tests once
npm run test:run

# Run in watch mode
npm run test
```

| Test File | Coverage |
|---|---|
| `venueEngine.test.js` | Density clamping (5–98), SIX/WICKET cascade, alert limit (max 20), innings progression |
| `suggestionEngine.test.js` | Min 3 suggestions, confidence formula (60–95), high density in suggestion text |
| `assistantEngine.test.js` | All 8 intents, unknown query fallback, live data in responses |
| `voiceEngine.test.js` | speechSupported() boolean, speak/cancel edge inputs |
| `integration.test.js` | VenueContext provides all 8 zones, match fields, stalls, alerts |

**Edge cases covered:**
- Density never exceeds 98 after 100 consecutive ticks
- Density never drops below 5
- Suggestion engine handles empty zone state gracefully
- Alert history capped at 20 items regardless of frequency

---

## ♿ Accessibility

- **Semantic HTML** — `<nav>`, `<main>`, `<section>` throughout both portals
- **Skip Navigation** — Skip to main content link at top of both portals
- **ARIA Labels** — All icon-only buttons have descriptive labels
- **Live Regions** — Score ticker and KPIs use `aria-live="polite"`
- **Alert Roles** — All alerts use `role="alert"` for screen readers
- **Keyboard Navigation** — Full keyboard access with visible focus rings
- **Toggle States** — `aria-pressed` and `aria-expanded` used correctly
- **Form Labels** — All inputs have associated `<label>` elements
- **Reduced Motion** — All animations respect `prefers-reduced-motion`
- **Color + Icon** — Status never conveyed by color alone
- **Voice Fallback** — Text input fallback on unsupported browsers
- **Contrast** — All text meets WCAG AA ratio (4.5:1 minimum)

---

## 📝 Assumptions Made

1. **Venue:** Wankhede Stadium, Mumbai (50,000 capacity)
2. **Match:** IPL T20 format — two innings of 20 overs each
3. **Zones:** 8 zones (A–H) with linked gates, stalls, and restrooms
4. **User:** Seat fixed at Block C, Row 12, Seat 4 (Zone C)
5. **Parking:** 5 zones (P1–P5), user parked in P2
6. **Crowd Data:** Simulated engine — representative of real sensor behavior
7. **Voice:** Optimized for Google Chrome
8. **Staff:** Single session — no authentication
9. **Cost Rate:** ₹60/hour, incrementing every 3 minutes in UI
10. **Firebase:** Demo config — replace with live credentials for production

---

## 🚀 Running Locally

```bash
# Clone the repository
git clone https://github.com/Atishaygang/VenueIQ.git

# Navigate to app directory
cd VenueIQ/VenueIQ-App

# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm run test:run

# Build for production
npm run build
```

Open `http://localhost:5173` in **Google Chrome** for full voice support.

---

## ✅ Evaluation Criteria Coverage

| Criteria | Implementation |
|----------|---------------|
| **Code Quality** | Centralized engine, single source of truth, all mock data in one file, components under 200 lines, consistent naming |
| **Security** | Zero hardcoded secrets, Firebase config abstracted, no user data stored, input sanitization on all forms |
| **Efficiency** | `React.memo` on heatmap, `useMemo` for charts, single engine instance, lazy Firebase writes, no redundant re-renders |
| **Testing** | 5 test files — engine logic, edge cases, integration, voice safety via Vitest + React Testing Library |
| **Accessibility** | ARIA labels, live regions, skip nav, keyboard navigation, reduced motion, WCAG AA contrast, semantic HTML |
| **Google Services** | Cloud Run (hosting) + Firebase Realtime DB (live alerts) + Google Fonts API (typography) + Google Maps Embed (parking) |

---

## 👨‍💻 Built By

**Atishay Jain**
CS & Data Analytics, IIT Patna
First Runner-Up — Hack with UP (India's 2nd largest hackathon)
AIR 1546 — NASA Space Apps AI Challenge
Top 10 Finalist — HackNauts
1st Position — ML Combat, IIT Patna

Built for **PromptWars: Virtual** by Google for Developers
Using **Google Antigravity** — intent-driven development
