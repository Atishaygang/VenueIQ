import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { generateSuggestions } from './suggestionEngine';
import { speak } from './voiceEngine';
import { db, ref, set } from '../config/firebase';
import { useFirebase } from '../hooks/useFirebase';

export const VenueContext = createContext();

export function useVenue() {
  return useContext(VenueContext);
}

const INITIAL_ZONES = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
const INITIAL_STALLS = ['Burger King Block A', 'Pizza Hut Block B', 'Local Snacks C', 'Beverages Stall 1', 'Stall 14B', 'Ice Cream Parlor', 'Popcorn Express', 'Hotdogs & More'];
const INITIAL_RESTROOMS = ['Block A Restrooms', 'Block B Restrooms', 'VIP Level Restrooms', 'Gate 3 Washrooms'];

const initialState = {
  zones: INITIAL_ZONES.reduce((acc, z, i) => {
    acc[z] = { density: 40 + i * 5, trend: 'stable', lastChange: 0, ticksAbove90: 0 };
    return acc;
  }, {}),
  match: {
    team1: 'Mumbai Indians',
    team2: 'Chennai Super Kings',
    batting: 1, 
    score: 142,
    wickets: 3,
    balls: 98,
    target: null,
    phase: 'innings1', 
    recentBalls: ['4', '1', 'W', '0', '6', '1'],
    lastEvent: 'FOUR by Rohit Sharma'
  },
  stalls: INITIAL_STALLS.reduce((acc, s, i) => {
    acc[s] = { waitTime: i * 2 + 1, trend: 'stable', zone: INITIAL_ZONES[i % 8] };
    return acc;
  }, {}),
  restrooms: INITIAL_RESTROOMS.reduce((acc, r, i) => {
    acc[r] = { waitTime: i * 3, status: 'Free', zone: INITIAL_ZONES[i % 8] };
    return acc;
  }, {}),
  gates: Array.from({length: 12}).reduce((acc, _, i) => {
    acc[i + 1] = { open: true, flowRate: 120, zone: INITIAL_ZONES[i % 8] };
    return acc;
  }, {}),
  alerts: [],
  incidents: [],
  suggestions: [],
  totalAttendees: 47832
};

function formatOvers(balls) {
  const o = Math.floor(balls / 6);
  const b = balls % 6;
  return `${o}.${b}`;
}

export function VenueProvider({ children }) {
  const [state, setState] = useState(initialState);
  const [lastTickTrigger, setLastTickTrigger] = useState(Date.now());
  const { readInitialState, writeZoneDensity, writeMatchState } = useFirebase();

  // Read initial state on load
  useEffect(() => {
    readInitialState().then(data => {
      if (data) {
        setState(prev => ({
          ...prev,
          zones: data.zones || prev.zones,
          match: data.match || prev.match
        }));
      }
    });
  }, [readInitialState]);

  // Write zone densities on every tick
  useEffect(() => {
    Object.keys(state.zones).forEach(z => {
      writeZoneDensity(z, state.zones[z].density);
    });
  }, [lastTickTrigger, writeZoneDensity]);

  // Write match state on match interval update
  useEffect(() => {
    writeMatchState(state.match);
  }, [state.match, writeMatchState]);
  
  // Voice alert tracking refs
  const lastAlertIdRef = useRef(null);
  const criticalZoneCooldowns = useRef({});

  // Monitor for global voice alerts
  useEffect(() => {
    if (state.alerts.length === 0) return;
    const latestAlert = state.alerts[0]; // Assuming alerts are unshifted
    
    if (latestAlert.id !== lastAlertIdRef.current) {
      lastAlertIdRef.current = latestAlert.id;
      
      // Critical zone crossing 85
      if (latestAlert.severity === 'Critical' && latestAlert.msg.includes('Gateway routing advised')) {
        const zoneMatch = latestAlert.zone;
        const now = Date.now();
        const lastSpoken = criticalZoneCooldowns.current[zoneMatch] || 0;
        
        if (now - lastSpoken > 60000) {
           speak(`Attention! ${zoneMatch} has reached critical crowd density. Attendees please use alternate exits.`, { rate: 0.95, pitch: 0.9, priority: 'high' });
           criticalZoneCooldowns.current[zoneMatch] = now;
        }
      }
      
      // Zone clearing
      if (latestAlert.severity === 'Info' && latestAlert.msg.includes('clearing')) {
         speak(`${latestAlert.zone} is now clearing. Normal crowd flow resumed.`, { rate: 0.9, pitch: 1.0, priority: 'normal' });
      }
    }
  }, [state.alerts]);

  // Master Engine Tick
  useEffect(() => {
    const tickInterval = setInterval(() => {
      setState(prev => {
        let next = { ...prev };
        let newAlerts = [];
        let newIncidents = [];
        const spikeAmount = prev._temporarySpike || { zones: [], amt: 0 };
        let totalDensityChange = 0;

        INITIAL_ZONES.forEach(z => {
          let oldD = prev.zones[z].density;
          let delta = Math.floor(Math.random() * 21) - 8;
          if (spikeAmount.zones.includes(z)) delta += spikeAmount.amt;

          let newD = Math.max(5, Math.min(98, oldD + delta));
          let actualDelta = newD - oldD;
          totalDensityChange += actualDelta;

          let trend = 'stable';
          if (actualDelta > 3) trend = 'rising';
          if (actualDelta < -3) trend = 'falling';

          let ticksAbove90 = actualDelta > 0 && newD >= 90 ? prev.zones[z].ticksAbove90 + 1 : 0;
          next.zones[z] = { density: newD, trend, lastChange: actualDelta, ticksAbove90 };

          if (newD >= 85 && oldD < 85) {
            newAlerts.push({ id: Date.now()+Math.random(), timestamp: Date.now(), msg: `⚠️ Zone ${z} at ${newD}% capacity — Gateway routing advised`, severity: 'Critical', zone: `Zone ${z}`, type: 'Crowd' });
          } else if (newD >= 70 && oldD < 70) {
             newAlerts.push({ id: Date.now()+Math.random(), timestamp: Date.now(), msg: `Zone ${z} building up (${newD}%)`, severity: 'Warning', zone: `Zone ${z}`, type: 'Crowd' });
          } else if (newD < 40 && oldD >= 40) {
             newAlerts.push({ id: Date.now()+Math.random(), timestamp: Date.now(), msg: `✅ Zone ${z} clearing — good time for amenities`, severity: 'Info', zone: `Zone ${z}`, type: 'Crowd' });
          }

          if (ticksAbove90 > 2) {
            if (!prev.incidents.find(i => i.zone === `Zone ${z}` && i.type === 'Crowd' && i.status !== 'Resolved')) {
               newIncidents.push({ id: `INC-${Date.now().toString().slice(-4)}`, zone: `Zone ${z}`, type: 'Crowd', desc: `Crowd overflow risk in Zone ${z} — marshal response needed`, reportedAt: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}), status: 'Open', assigned: 'Unassigned' });
            }
          }
        });

        next._temporarySpike = null;
        next.totalAttendees = Math.max(0, prev.totalAttendees + Math.floor(totalDensityChange * 2));

        INITIAL_STALLS.forEach(s => {
          let stall = prev.stalls[s];
          let zDensity = next.zones[stall.zone].density;
          let delta = 0;
          if (zDensity > 70) delta = Math.floor(Math.random() * 3);
          else if (zDensity < 50) delta = -Math.floor(Math.random() * 3);
          else delta = Math.floor(Math.random() * 3) - 1;

          let newWait = Math.max(0, stall.waitTime + delta);
          let trend = newWait > stall.waitTime ? 'rising' : newWait < stall.waitTime ? 'falling' : 'stable';
          
          if (newWait < 5 && stall.waitTime >= 5) {
             newAlerts.push({ id: Date.now()+Math.random(), timestamp: Date.now(), msg: `🍔 ${s} wait dropped to ${newWait} mins`, severity: 'Success', zone: `Zone ${stall.zone}`, type: 'Food' });
          }
          next.stalls[s] = { ...stall, waitTime: newWait, trend };
        });

        INITIAL_RESTROOMS.forEach(r => {
          let restroom = prev.restrooms[r];
          let zDensity = next.zones[restroom.zone].density;
          let waitTime = Math.floor(zDensity / 10);
          let status = waitTime < 5 ? 'Free' : waitTime < 10 ? 'Busy' : 'Very Busy';
          if (status === 'Free' && restroom.status !== 'Free') {
             newAlerts.push({ id: Date.now()+Math.random(), timestamp: Date.now(), msg: `🚽 ${r} now free`, severity: 'Info', zone: `Zone ${restroom.zone}`, type: 'Safety' });
          }
          next.restrooms[r] = { ...restroom, waitTime, status };
        });

        Object.keys(prev.gates).forEach(g => {
          let gate = prev.gates[g];
          if (!gate.open) {
            next.gates[g] = { ...gate, flowRate: 0 };
            return;
          }
          let zTrend = next.zones[gate.zone].trend;
          let flowRate = gate.flowRate;
          if (zTrend === 'rising') flowRate = Math.min(300, flowRate + Math.floor(Math.random() * 20));
          else if (zTrend === 'falling') flowRate = Math.max(10, flowRate - Math.floor(Math.random() * 20));
          else flowRate += Math.floor(Math.random() * 11) - 5;
          next.gates[g] = { ...gate, flowRate };
        });

        next.alerts = [...newAlerts, ...prev.alerts].slice(0, 20);
        next.incidents = [...newIncidents, ...prev.incidents];

        // Sync critical zone alerts to Firebase Realtime DB
        Object.keys(next.zones).forEach(z => {
          if (next.zones[z].density >= 85) {
             set(ref(db, `alerts/zone_${z}`), {
               density: next.zones[z].density,
               status: 'Critical Alert Active',
               timestamp: Date.now()
             }).catch(err => console.warn('Firebase write skipped:', err.message));
          }
        });

        const newSugs = generateSuggestions(next.zones, next.stalls, next.gates);
        next.suggestions = newSugs.map(ns => {
           let existing = prev.suggestions.find(es => es.action === ns.action);
           if (existing && existing.deployed) return { ...ns, deployed: true };
           return ns;
        });

        setLastTickTrigger(Date.now());
        return next;
      });
    }, 5000);

    return () => clearInterval(tickInterval);
  }, []);

  // Match Simulation
  useEffect(() => {
    const matchInterval = setInterval(() => {
      setState(prev => {
        if (prev.match.phase === 'result') return prev;

        let next = { ...prev };
        let m = { ...prev.match };

        if (m.balls >= 120 || (m.target && m.score > m.target) || m.wickets === 10) {
          if (m.phase === 'innings1') {
            m.phase = 'innings2';
            m.target = m.score + 1;
            m.score = 0;
            m.wickets = 0;
            m.balls = 0;
            m.batting = 2;
            m.recentBalls = [];
            m.lastEvent = 'Innings Break!';
            next._temporarySpike = { zones: INITIAL_ZONES, amt: 5 };
          } else {
            m.phase = 'result';
            m.lastEvent = m.score >= m.target ? `${m.batting === 1 ? m.team1 : m.team2} won the match!` : `${m.batting === 1 ? m.team2 : m.team1} won the match!`;
            next._temporarySpike = { zones: INITIAL_ZONES, amt: -10 };
          }
          next.match = m;
          return next;
        }

        const outcomes = [
          { type: 'dot', char: '0', msg: 'Dot ball — good length delivery', w: 30 },
          { type: 'single', char: '1', msg: 'Singles down to long on', w: 25 },
          { type: 'double', char: '2', msg: 'Good running, pushed for two', w: 12 },
          { type: 'triple', char: '3', msg: 'Excellent sprint for three', w: 3 },
          { type: 'four', char: '4', msg: 'FOUR! Driven through covers', w: 18 },
          { type: 'six', char: '6', msg: 'SIX! Clears the boundary at long-on!', w: 8 },
          { type: 'wicket', char: 'W', msg: 'OUT! Caught in the deep!', w: 4 },
        ];

        let rnd = Math.random() * 100;
        let cumulative = 0;
        let selectedOutcome = outcomes[0];
        for (let out of outcomes) {
          cumulative += out.w;
          if (rnd < cumulative) {
            selectedOutcome = out;
            break;
          }
        }

        m.recentBalls = [...m.recentBalls.slice(-5), selectedOutcome.char];
        m.lastEvent = selectedOutcome.msg;
        m.balls += 1;

        if (selectedOutcome.type === 'wicket') {
          m.wickets += 1;
          next._temporarySpike = { zones: ['A', 'B', 'C'], amt: 10 };
          next.zones = { ...next.zones };
          if (next.zones.D) next.zones.D.density = Math.max(5, next.zones.D.density - 5);
          if (next.zones.E) next.zones.E.density = Math.max(5, next.zones.E.density - 5);
          next.alerts = [{ id: Date.now(), timestamp: Date.now(), msg: `WICKET! Crowd surging.`, severity: 'Critical', zone: 'All', type: 'Crowd' }, ...next.alerts].slice(0, 20);
        } else {
          let runs = parseInt(selectedOutcome.char) || 0;
          m.score += runs;
          if (selectedOutcome.type === 'six') {
            next._temporarySpike = { zones: INITIAL_ZONES, amt: +12 };
            next.alerts = [{ id: Date.now(), timestamp: Date.now(), msg: `🎉 SIX! Crowd surging in all zones — stay seated.`, severity: 'Critical', zone: 'All', type: 'Crowd' }, ...next.alerts].slice(0, 20);
          }
        }

        next.match = m;
        return next;
      });
    }, 8000);

    return () => clearInterval(matchInterval);
  }, []);

  const resolveIncident = useCallback((id) => {
    setState(prev => ({
      ...prev,
      incidents: prev.incidents.map(inc => inc.id === id ? { ...inc, status: 'Resolved' } : inc)
    }));
  }, []);

  const toggleGate = useCallback((id) => {
    setState(prev => ({
      ...prev,
      gates: {
        ...prev.gates,
        [id]: { ...prev.gates[id], open: !prev.gates[id].open, flowRate: prev.gates[id].open ? 0 : 120 }
      }
    }));
  }, []);

  const closeAllGates = useCallback(() => {
    setState(prev => {
      let nextGates = {};
      Object.keys(prev.gates).forEach(k => {
        nextGates[k] = { ...prev.gates[k], open: false, flowRate: 0 };
      });
      return { ...prev, gates: nextGates };
    });
  }, []);

  const acceptSuggestion = useCallback((id) => {
    setState(prev => ({
      ...prev,
      suggestions: prev.suggestions.map(s => s.id === id ? { ...s, deployed: true } : s)
    }));
  }, []);

  return (
    <VenueContext.Provider value={{
      ...state,
      lastTickTrigger,
      formatOvers,
      resolveIncident,
      toggleGate,
      closeAllGates,
      acceptSuggestion
    }}>
      {children}
    </VenueContext.Provider>
  );
}
