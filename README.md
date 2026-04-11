# How I Built a Smart Stadium Experience Platform in 14 Days — Without Writing a Single Line of Code

*By Atishay Jain | IIT Patna | PromptWars: Virtual — Google Antigravity*

---

**Live App:** https://venueiq-app-756450764548.us-central1.run.app/
**GitHub:** https://github.com/Atishaygang/VenueIQ

---

## The Problem Nobody Talks About

You've been there. It's the final over of an IPL match. 50,000 people are on their feet. And you're stuck in a queue at a food stall, completely disconnected from what's happening inside. You don't know which gate is closest to your seat, which zone is dangerously overcrowded, or whether the restroom nearby has a 2-minute or 20-minute wait.

Stadiums have invested billions in the playing field. Almost nothing in the experience of actually *being* there.

That was the challenge I was given for PromptWars: Virtual — *Design a solution that improves the physical event experience at large-scale sporting venues.*

Most people would build a map. I decided to build something that thinks.

---

## What is VenueIQ?

VenueIQ is a two-portal web platform for smart stadium management — one side for attendees, one side for staff. It's not just a dashboard with pretty charts. It's a living, breathing simulation of a real 50,000-capacity venue where every piece of data talks to every other piece.

Here's what that means in practice:

When a SIX is hit in the match simulation, crowd density spikes across all zones. That spike causes stall wait times to increase in nearby zones. That triggers an AI suggestion for staff to redeploy marshals. That fires a proactive voice alert to attendees in the affected zone. All of this happens automatically, in under 5 seconds, without a single API call to the outside world.

That interconnection is the entire point.

---

## The Build Philosophy: Intent-Driven Development

I came into this challenge as a professional developer — ML systems, FastAPI backends, system design. I've built real things. But PromptWars has one rule: **no manual coding.** You build with intent. You describe what you want, and Google Antigravity builds it.

The first thing I learned was that vague prompts produce vague apps. The second thing I learned was that architecture decisions made in the prompt matter more than any line of code.

So before I wrote a single prompt, I spent two hours on paper. I sketched the user flow, the data relationships, the component hierarchy. I identified the one thing that would separate VenueIQ from every other submission: **a centralized simulation engine where all data is interconnected.**

That became my north star for every prompt I wrote.

---

## The Architecture

VenueIQ is built in React 18 with Vite, styled with Tailwind CSS, visualized with Recharts, and deployed on Google Cloud Run. The entire data layer is a custom JavaScript engine I call VenueEngine — no external APIs, no Firebase, no database.

Here's what the system looks like:

```
VenueEngine (Master Brain)
    ↓ tick() every 5 seconds
    ↓ simulateMatch() every 8 seconds
        ↓
VenueContext (React Context)
    ↓ useVenue() hook
        ↓
┌─────────────────┬──────────────────┐
│  Attendee App   │  Staff Dashboard │
│  (Mobile First) │  (Desktop First) │
└─────────────────┴──────────────────┘
```

The engine runs two core loops:

**tick()** — runs every 5 seconds and updates crowd density for all 8 zones, recalculates stall wait times based on zone density, adjusts gate flow rates, auto-generates incidents when zones stay critical too long, and pushes alerts to both portals.

**simulateMatch()** — runs every 8 seconds and progresses a full cricket match with weighted ball probabilities. Dot ball (30%), single (25%), four (18%), six (8%), wicket (4%). When a six is hit, all zone densities spike. When a wicket falls, home fan zones surge. The match progresses through innings, calculates targets, and announces results.

Everything downstream reacts to these two loops automatically.

---

## The Attendee Experience

The attendee portal is mobile-first with five tabs: Home, Navigate, Facilities, Alerts, and Parking.

**Home** shows a live score ticker that updates every 8 seconds with real ball-by-ball commentary. When a six is hit, the ticker background flashes gold. When a wicket falls, it flashes red. Proactive alerts cycle through the most relevant warnings — zone crowd levels, stall wait times, exit recommendations — all generated from live engine data, not hardcoded strings.

**Navigate** shows an SVG stadium heatmap with 8 zones colored green, yellow, or red based on real engine density values. Rising zones pulse with a subtle glow. Zones above 85% show a warning icon. The "Reroute Me" button doesn't just randomize — it calculates the actual lowest-density path to your seat and tells you why.

**Facilities** shows stall wait times that correlate with zone density. If Zone C is at 91%, stalls in Zone C have high wait times. If Zone C clears, wait times drop. Trend arrows show whether things are getting better or worse.

**Parking** was a feature I added beyond the original brief because it's a genuine pain point nobody addresses. The parking tab shows your assigned spot (P2, East Stand, E-47), a live cost tracker updating every 3 minutes, an SVG top-down parking map with color-coded zone occupancy, and public transport alternatives including metro, bus stops, and cab pickup zones. A smart recommendation banner updates based on match state — if the last 2 overs are approaching, it tells you to book your cab now.

---

## The Voice Layer

This was the feature that made judges stop and look twice.

Every significant event in the app speaks aloud using the browser's native Web Speech API — zero external dependencies, zero API keys. Commentary announces sixes with an excited higher pitch and wickets with a dramatic lower pitch. Critical crowd alerts interrupt whatever's playing. A floating microphone button opens a voice assistant that responds to natural questions like "where is my seat?", "which stall has the shortest queue?", and "what's the score?" — all with real-time engine data woven into the answer.

A global mute toggle persists across tab switches in localStorage. The voice assistant falls back to text input on browsers without microphone support.

---

## The Staff Dashboard

The staff portal is a desktop-first command center with five sections.

The Overview dashboard shows four live KPIs — total attendees fluctuating realistically, zones at high density, active incidents, and gates currently open — all wired to the engine. The Recharts bar charts update every engine tick with smooth animations.

The AI Redeployment panel generates contextually accurate suggestions based on current zone states. If Zone C is at 91% and rising, it doesn't show a generic alert — it says "Deploy 5 crowd marshals to Zone C immediately. Predicted to hit 95% in 6 minutes. Confidence: 94%." The confidence score is calculated from the density formula, not made up. Accepting a suggestion triggers a voice confirmation and marks it as deployed.

The Incident Tracker auto-generates incidents when zones stay critical for more than two consecutive engine ticks. Staff can mark them resolved, which triggers a cooldown so the same zone doesn't re-alert immediately.

The Gate Control panel has 12 individual gate toggles with confirmation modals and a single Emergency Close All Gates button with double confirmation and a dramatic voice announcement.

---

## What Google Antigravity Did vs. What I Had to Direct

Antigravity excelled at generating component structure, Tailwind styling, and Recharts integration. It produced clean, readable code consistently.

Where I had to be very precise: the interconnection logic. Left to default behavior, Antigravity would have built isolated components each managing their own `setInterval`. That's the obvious approach. The non-obvious approach — a single centralized engine broadcasting to a React Context — required me to be specific about the architecture in the prompt itself.

The lesson: the AI is as good as the architect directing it. My ML and system design background meant I could describe the right architecture clearly. That's where the professional experience showed up — not in writing code, but in knowing what to ask for.

---

## What I'd Build Next

Phase 2 of VenueIQ would replace the simulation engine with real data sources. Firebase Realtime Database for crowd sensor feeds. CricAPI for live ball-by-ball scores. A FastAPI backend running an actual time-series ML model for crowd prediction — similar architecture to my Air Pollution prediction system that achieved 91-92% accuracy on satellite and ground data.

The UI wouldn't change at all. The Context layer abstracts the data source completely. Swapping mock data for real data is a configuration change, not a rebuild.

---

## Final Reflection

14 days. No manual code. A fully deployed, voice-enabled, AI-powered stadium platform on Google Cloud Run.

The future of building isn't typing faster. It's thinking clearer.

PromptWars taught me that intent-driven development rewards the same skills that make a great engineer — system thinking, architecture decisions, knowing what matters. The tool changed. The craft didn't.

---

*Atishay Jain is a CS & Data Analytics undergraduate at IIT Patna, ML practitioner, and First Runner-Up at Hack with UP, India's second-largest hackathon.*

**Try VenueIQ:** https://venueiq-app-756450764548.us-central1.run.app/
**GitHub:** https://github.com/Atishaygang/VenueIQ
