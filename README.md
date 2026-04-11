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
Staff dashboard updates with new incident if zone stays critical
```

One event. Five automatic reactions. Zero manual triggers.

### Why This Architecture

The alternative — individual components each managing their own `setInterval` — produces isolated, disconnected data. A crowd heatmap that doesn't affect wait times. AI suggestions that don't reflect real density. This is the approach most solutions take.

The centralized engine approach requires more careful architecture design but produces an experience that genuinely feels like a live, intelligent system.

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

**AI Suggestion Formula:**
```javascript
confidence = Math.min(95, 60 + (density - 70) * 1.2).toFixed(0)
```

**`src/engine/VenueContext.jsx`** — React Context provider exposing `useVenue()` hook to all components. Single source of truth for entire application state.

**`src/engine/suggestionEngine.js`** — Rule-based decision engine generating contextually accurate staff redeployment suggestions based on live zone states.

**`src/engine/voiceEngine.js`** — Native Web Speech API wrapper managing speech synthesis with priority queuing (high priority cancels current speech, normal priority queues).

**`src/engine/assistantEngine.js`** — Intent-matching engine for the voice assistant. Maps natural language queries to real-time venue data responses across 8 intent categories.

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

**Voice Features:**
- Match commentary with pitch/rate variation by event type
- Proactive tips every 45 seconds based on current venue state
- Voice assistant via floating microphone button
- Natural language queries answered with live engine data

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

### Google Cloud Run
VenueIQ is containerized and deployed on **Google Cloud Run** — Google's fully managed serverless container platform.

- **Project:** `caramel-banner-493006-e2`
- **Region:** `us-central1`
- **Service:** `venueiq-app`
- **Live URL:** https://venueiq-app-756450764548.us-central1.run.app/

**Why Cloud Run:** Automatic scaling, zero server management, pay-per-use pricing, and native integration with Google Cloud's build pipeline via Cloud Build. The React application is built into a production bundle and served via a lightweight Node.js server on Cloud Run.

**Deployment Pipeline:**
```bash
# Build production bundle
npm run build

# Deploy to Cloud Run (via Google Antigravity deployment)
# Uses Cloud Build to containerize and deploy automatically
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend Framework | React 18 + Vite |
| Styling | Tailwind CSS v4 |
| Charts | Recharts |
| Icons | Lucide React |
| Routing | React Router v6 |
| Voice | Web Speech API (native browser) |
| Font | Space Grotesk (Google Fonts) |
| Deployment | Google Cloud Run |
| Build Tool | Google Antigravity + Vite |

---

## 📁 Project Structure

```
VenueIQ-App/
├── src/
│   ├── engine/
│   │   ├── venueEngine.js          # Core simulation engine
│   │   ├── VenueContext.jsx        # React Context + useVenue() hook
│   │   ├── suggestionEngine.js     # AI redeployment rule engine
│   │   ├── voiceEngine.js          # Speech synthesis manager
│   │   ├── speechRecognition.js    # Speech-to-text wrapper
│   │   └── assistantEngine.js      # Voice assistant intent matcher
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
│   ├── pages/
│   │   ├── Landing.jsx
│   │   ├── AttendeePortal.jsx
│   │   └── StaffPortal.jsx
│   ├── data/
│   │   └── mockData.js             # All base data + parking data
│   └── main.jsx                    # VenueProvider wraps entire app
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
- ✅ Public transport alternatives with real-time status
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

---

## 📝 Assumptions Made

1. **Venue:** Wankhede Stadium, Mumbai (50,000 capacity) used as reference
2. **Match:** IPL format — T20 cricket, two innings of 20 overs each
3. **Zones:** Stadium divided into 8 zones (A through H) with linked gates, stalls, and restrooms
4. **User:** Attendee seat fixed at Block C, Row 12, Seat 4 (Zone C) for personalization
5. **Parking:** 5 parking zones (P1–P5) linked to stadium zones, user parked in P2
6. **Crowd Data:** Simulated via weighted random engine — representative of real sensor behavior
7. **Voice:** Optimized for Google Chrome (best Web Speech API support)
8. **Staff:** Single staff session — no authentication or multi-user state
9. **Cost Rate:** Parking priced at ₹60/hour, incrementing every 3 minutes in UI

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

# Build for production
npm run build
```

Open `http://localhost:5173` in Google Chrome for full voice feature support.

---

## ✅ Evaluation Criteria Coverage

| Criteria | Implementation |
|----------|---------------|
| **Code Quality** | Centralized engine architecture, single source of truth, all mock data in one file, components under 200 lines each |
| **Security** | Zero hardcoded secrets, no external API calls, no user data stored, all state in-memory |
| **Efficiency** | `React.memo` on heatmap, `useMemo` for chart data, single engine instance via Context, no redundant re-renders |
| **Testing** | `npm run build` passes with zero errors, all interactive features manually verified |
| **Accessibility** | Voice-first design, mute toggle, text fallback for voice assistant, semantic HTML, color + icon dual coding for status |
| **Google Services** | Deployed on Google Cloud Run (`us-central1`), built via Cloud Build pipeline, served at scale with automatic container management |

---

## 👨‍💻 Built By

**Atishay Jain**  
CS & Data Analytics, IIT Patna  
First Runner-Up — Hack with UP (India's 2nd largest hackathon)  
AIR 1546 — NASA Space Apps AI Challenge

Built for **PromptWars: Virtual** by Google for Developers  
Using **Google Antigravity** — intent-driven development
