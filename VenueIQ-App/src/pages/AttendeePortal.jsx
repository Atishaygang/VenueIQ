import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { Home, Map as MapIcon, Coffee, Bell, Navigation2, RefreshCw, AlertTriangle, Info, MapPin, ParkingSquare } from 'lucide-react';
import { useVenue } from '../engine/VenueContext';
import { speak } from '../engine/voiceEngine';
import VoiceControlBar from '../components/shared/VoiceControlBar';
import VoiceAssistant from '../components/attendee/VoiceAssistant';
import ParkingTab from '../components/attendee/ParkingTab';

function HomeTab() {
  const { match, formatOvers, alerts } = useVenue();
  const [tickerFlash, setTickerFlash] = useState('');
  
  // Ref tracking lastEvent to avoid generic re-speaks
  const lastEventRef = useRef(match.lastEvent);
  const lastBallsRef = useRef(match.balls);

  useEffect(() => {
    const isNewBall = match.balls !== lastBallsRef.current;
    
    if (match.lastEvent !== lastEventRef.current && isNewBall) {
      lastEventRef.current = match.lastEvent;
      lastBallsRef.current = match.balls;
      
      if (match.lastEvent.includes('SIX')) {
        setTickerFlash('bg-yellow-500/80 flash-six-anim');
        speak(`SIX! ${match.lastEvent}! The crowd goes absolutely wild!`, { rate: 1.15, pitch: 1.3, priority: 'high' });
        setTimeout(() => setTickerFlash(''), 1500);
      } 
      else if (match.lastEvent.includes('OUT')) {
        setTickerFlash('bg-red-500/80 flash-wicket-anim');
        speak(`OUT! ${match.lastEvent}! What a moment at the stadium!`, { rate: 1.0, pitch: 0.85, priority: 'high' });
        setTimeout(() => setTickerFlash(''), 1500);
      }
      else if (match.lastEvent.includes('FOUR')) {
        speak(`FOUR! ${match.lastEvent}`, { rate: 1.05, pitch: 1.1, priority: 'normal' });
      }
      else if (match.lastEvent.includes('Wide') || match.lastEvent.includes('No ball')) {
        speak(`That's a ${match.lastEvent.includes('Wide') ? 'wide' : 'no ball'} called by the umpire`, { rate: 0.95, pitch: 1.0, priority: 'normal' });
      }
      
      // End of over logic
      if (match.balls > 0 && match.balls % 6 === 0) {
        speak(`End of over ${match.balls / 6}. Score: ${match.score}.`, { rate: 1.0, pitch: 1.0, priority: 'normal' });
      }
    }
  }, [match]);

  const activeAlerts = alerts.slice(0, 5);
  const criticalAlerts = activeAlerts.filter(a => a.severity === 'Critical');
  const normalAlerts = activeAlerts.filter(a => a.severity !== 'Critical');
  const displayAlerts = [...criticalAlerts, ...normalAlerts].slice(0, 3); 

  const isExciting = match.lastEvent.includes('SIX') || match.lastEvent.includes('OUT');

  return (
    <div className="space-y-6 pb-20 animate-fade-in-up">
      <div className="ticket-gradient p-6 rounded-2xl border border-gray-800 shadow-xl relative overflow-hidden">
        <h2 className="text-sm text-[#6c63ff] font-semibold tracking-wider">WELCOME BACK</h2>
        <h1 className="text-3xl font-bold text-white mt-1">Sarah Palmer</h1>
        <div className="mt-4 flex items-center justify-between">
          <div className="bg-[#0a0a0f]/50 p-3 rounded-xl border border-gray-700">
            <p className="text-xs text-gray-400 uppercase">Your Seat</p>
            <p className="text-lg font-bold text-white">Block C, Row 12, S4</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-white">{match.team1} vs {match.team2}</p>
            <p className="text-xs text-gray-400">Phase: {match.phase}</p>
          </div>
        </div>
      </div>

      <div>
        <div className={`rounded-xl border border-gray-800 overflow-hidden flex items-center shadow-lg transition-colors duration-300 ${tickerFlash || 'bg-[#13131a]'}`}>
          <div className="bg-red-600 p-3 text-white font-bold whitespace-nowrap z-10 flex items-center animate-pulse shadow-[0_0_10px_rgba(220,38,38,0.8)]">
             <span className="w-2 h-2 rounded-full bg-white mr-2"></span> LIVE
          </div>
          <div className="flex-1 overflow-hidden relative h-12 flex items-center">
            <div className={`whitespace-nowrap text-sm font-medium text-white px-4 ${isExciting ? 'animate-marquee-fast' : 'animate-marquee'}`}>
              {match.batting === 1 ? match.team1 : match.team2}: {match.score}/{match.wickets} ({formatOvers(match.balls)} ov) | 
              {match.target ? ` Target ${match.target}` : ' 1st Innings'} | Last ball: {match.lastEvent}
            </div>
          </div>
        </div>
        <p key={match.lastEvent} className="text-center text-xs text-[#f59e0b] italic mt-2 animate-fade-in-up">
          "{match.lastEvent}"
        </p>
      </div>

      <div className="space-y-2">
        <h3 className="text-xs text-gray-400 uppercase tracking-wider font-bold mb-3">Live Updates</h3>
        {displayAlerts.map(alert => (
          <div key={alert.id} className={`p-4 rounded-xl border flex items-center space-x-3 transition-colors duration-500
            ${alert.severity === 'Critical' ? 'bg-[#f59e0b]/10 border-[#f59e0b]/30 text-[#f59e0b]' : 
              alert.severity === 'Success' ? 'bg-green-500/10 border-green-500/30 text-green-400' : 
              'bg-blue-500/10 border-blue-500/30 text-blue-400'}`}>
            <Bell size={24} className={alert.severity === 'Critical' ? 'animate-pulse' : ''} />
            <p className="text-sm font-medium">{alert.msg}</p>
          </div>
        ))}
        {displayAlerts.length === 0 && <p className="text-sm text-gray-500 italic">No recent alerts.</p>}
      </div>
    </div>
  );
}

const HeatmapSVG = React.memo(({ zones }) => {
  const getColor = (density) => {
    if (density < 40) return '#22c55e';
    if (density < 75) return '#eab308';
    return '#ef4444';
  };

  return (
    <svg viewBox="0 0 200 150" className="w-full h-auto max-h-64 drop-shadow-2xl">
      {Object.keys(zones).map((zone, i) => {
        const density = zones[zone].density;
        const trend = zones[zone].trend;
        const colors = getColor(density);
        const isRising = trend === 'rising';
        
        const x = (i % 4) * 45 + 10;
        const y = Math.floor(i / 4) * 65 + 10;
        return (
          <g key={zone} className="transition-all duration-1000 ease-in-out">
            <rect 
              x={x} y={y} width="40" height="55" rx="8" 
              fill={colors} fillOpacity="0.4" 
              stroke={colors} strokeWidth="2" 
              className={isRising ? 'animate-pulse' : ''}
              style={{ filter: isRising ? `drop-shadow(0 0 4px ${colors})` : 'none' }}
            />
            <text x={x + 20} y={y + 25} fill="#fff" fontSize="12" fontWeight="bold" textAnchor="middle" opacity="0.9">
              {zone}
            </text>
            <text x={x + 20} y={y + 42} fill="#bbb" fontSize="9" fontWeight="bold" textAnchor="middle">
              {density}%
            </text>
            {density >= 85 && (
              <text x={x + 30} y={y + 15} fill="#ffeb3b" fontSize="10">⚠️</text>
            )}
          </g>
        );
      })}
      <path d="M30 65 Q 100 120 165 35" fill="none" stroke="#6c63ff" strokeWidth="3" strokeDasharray="5,5" className="animate-pulse" />
      <circle cx="30" cy="65" r="4" fill="#6c63ff" />
      <circle cx="165" cy="35" r="4" fill="#6c63ff" />
    </svg>
  );
});

function NavigateTab() {
  const { zones } = useVenue();
  const [routeDesc, setRouteDesc] = useState("Routing via recommended path.");
  const [rerouting, setRerouting] = useState(false);

  const bestZone = useMemo(() => {
    let minDens = 100;
    let bz = 'A';
    Object.keys(zones).forEach(z => {
      if(zones[z].density < minDens) {
        minDens = zones[z].density;
        bz = z;
      }
    });
    return { name: bz, density: minDens };
  }, [zones]);

  useEffect(() => {
    if(!rerouting) {
       setRouteDesc(`Routing via corridor Zone ${bestZone.name} — currently at ${bestZone.density}% capacity ✓`);
    }
  }, [bestZone.name, bestZone.density, rerouting]);

  const handleReroute = () => {
    setRerouting(true);
    setTimeout(() => {
      setRerouting(false);
    }, 1000);
  };

  return (
    <div className="space-y-6 pb-20 animate-fade-in-up">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-2xl font-bold text-white relative">
          Live Heatmap
          <span className="absolute -top-3 -right-24 bg-gradient-to-r from-pink-500 to-orange-400 text-[10px] px-2 py-0.5 rounded-full text-white font-bold tracking-widest shadow-lg animate-pulse">
            PHASE 2: ML
          </span>
        </h2>
        <div className="flex items-center space-x-2 text-xs">
          <div className="w-2 h-2 rounded-full bg-green-500" /> <span className="text-gray-400">Low</span>
          <div className="w-2 h-2 rounded-full bg-yellow-500 ml-2" /> <span className="text-gray-400">Med</span>
          <div className="w-2 h-2 rounded-full bg-red-500 ml-2" /> <span className="text-gray-400">High</span>
        </div>
      </div>
      
      <div className="bg-[#13131a] rounded-2xl border border-gray-800 p-4 flex justify-center items-center shadow-inner relative overflow-hidden">
        <HeatmapSVG zones={zones} />
      </div>

      <div className="bg-[#13131a] p-5 rounded-xl border border-gray-800">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-white flex items-center"><Navigation2 size={16} className="mr-2 text-[#6c63ff]"/> Optimal Auto-Route</h3>
          <button onClick={handleReroute} disabled={rerouting} className="text-xs bg-[#2a2a35] hover:bg-[#3a3a45] text-white px-3 py-1.5 rounded flex items-center transition">
            <RefreshCw size={12} className={`mr-1 ${rerouting ? 'animate-spin' : ''}`} /> Reroute
          </button>
        </div>
        <div className="space-y-4 relative">
          <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-gray-800"></div>
          
          <div className="flex items-center space-x-4 relative z-10 transition-opacity">
             <div className="w-6 h-6 rounded-full bg-[#1a1a24] border-2 border-[#6c63ff] flex items-center justify-center text-[10px] font-bold">1</div>
             <p className="text-sm text-green-400 font-medium">{routeDesc}</p>
          </div>
          <div className="flex items-center space-x-4 relative z-10">
             <div className="w-6 h-6 rounded-full bg-[#1a1a24] border-2 border-gray-500 flex items-center justify-center text-[10px] font-bold">2</div>
             <p className="text-sm text-gray-300 font-medium">Proceed to Block C, Row 12</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function FacilitiesTab() {
  const { stalls, restrooms, zones } = useVenue();
  const stallList = Object.keys(stalls).map(s => ({ name: s, ...stalls[s] }));
  const nearestToC = stallList.filter(s => s.zone === 'C').slice(0, 3);

  return (
    <div className="space-y-6 pb-20 animate-fade-in-up">
      <div className="bg-[#13131a] p-5 rounded-2xl border border-gray-800 flex items-center shadow-lg">
        <MapPin className="text-[#6c63ff] mr-4" size={32} />
        <div>
          <h3 className="font-bold text-white text-lg">My Area: Block C</h3>
          <p className="text-sm text-gray-400">Zone C Density: {zones['C'].density}%</p>
        </div>
      </div>

      <h3 className="font-bold text-xl text-white mt-8 mb-4">Nearby Recommended (Zone C)</h3>
      <div className="space-y-3 mb-8">
        {nearestToC.map(stall => {
          const status = stall.waitTime < 5 ? 'Free' : stall.waitTime <= 10 ? 'Busy' : 'Very Busy';
          return (
             <div key={stall.name} className="bg-[#13131a] p-4 rounded-xl border border-gray-800 flex items-center justify-between">
                <div>
                  <p className="text-white font-medium text-sm">{stall.name}</p>
                  <span className={`text-[10px] px-2 py-0.5 rounded uppercase font-bold tracking-wider
                    ${status === 'Free' ? 'bg-green-500/20 text-green-400' :
                      status === 'Busy' ? 'bg-yellow-500/20 text-yellow-500' :
                      'bg-red-500/20 text-red-500'}`}>
                    {status}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-white flex items-center justify-end">
                    {stall.waitTime}
                    <span className={`text-sm ml-1 ${stall.trend === 'rising' ? 'text-red-500' : stall.trend === 'falling' ? 'text-green-500' : 'text-gray-500'}`}>
                      {stall.trend === 'rising' ? '↑' : stall.trend === 'falling' ? '↓' : '→'}
                    </span>
                  </p>
                </div>
             </div>
          );
        })}
      </div>

      <h3 className="font-bold text-xl text-white mt-8 mb-4">All Concessions</h3>
      
      <div className="space-y-3">
        {stallList.map(stall => {
          const status = stall.waitTime < 5 ? 'Free' : stall.waitTime <= 10 ? 'Busy' : 'Very Busy';
          return (
            <div key={stall.name} className="bg-[#13131a] p-4 rounded-xl border border-gray-800 flex items-center justify-between shadow-sm">
              <div>
                <p className="text-white font-medium text-sm">{stall.name} <span className="text-xs text-gray-500">(Zone {stall.zone})</span></p>
                <div className="flex items-center mt-1">
                  <span className={`text-[10px] px-2 py-0.5 rounded uppercase font-bold tracking-wider
                    ${status === 'Free' ? 'bg-green-500/20 text-green-400' :
                      status === 'Busy' ? 'bg-yellow-500/20 text-yellow-500' :
                      'bg-red-500/20 text-red-500'}`}>
                    {status}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-white flex items-center justify-end">
                  {stall.waitTime}
                  <span className={`text-sm ml-1 ${stall.trend === 'rising' ? 'text-red-500' : stall.trend === 'falling' ? 'text-green-500' : 'text-gray-500'}`}>
                    {stall.trend === 'rising' ? '↑' : stall.trend === 'falling' ? '↓' : '→'}
                  </span>
                </p>
                <p className="text-[10px] text-gray-500 uppercase font-semibold tracking-wider">Mins Wait</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AlertsTab() {
  const { alerts } = useVenue();
  const [filter, setFilter] = useState('All');

  const filtered = alerts.filter(a => filter === 'All' || a.type === filter);

  return (
    <div className="space-y-6 pb-20 animate-fade-in-up">
      <h2 className="text-2xl font-bold text-white border-b border-gray-800 pb-4">Notification Center</h2>
      
      <div className="flex space-x-2 overflow-x-auto no-scrollbar py-1">
        {['All', 'Crowd', 'Food', 'Safety'].map(f => (
          <button 
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap
              ${filter === f ? 'bg-[#6c63ff] text-white' : 'bg-[#13131a] border border-gray-800 text-gray-400 hover:text-white'}`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map(alert => (
          <div key={alert.id} className="bg-[#13131a] p-4 rounded-xl border border-gray-800 flex space-x-4 shadow">
            <div className="pt-1">
              {['Info', 'Success'].includes(alert.severity) && <Info className="text-blue-400" size={20} />}
              {alert.severity === 'Warning' && <AlertTriangle className="text-yellow-500" size={20} />}
              {alert.severity === 'Critical' && <AlertTriangle className="text-red-500" size={20} />}
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start mb-1">
                <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase
                  ${['Info', 'Success'].includes(alert.severity) ? 'bg-blue-500/20 text-blue-400' : 
                    alert.severity === 'Warning' ? 'bg-yellow-500/20 text-yellow-500' : 
                    'bg-red-500/20 text-red-500'}`}>
                  {alert.zone || alert.type}
                </span>
                <span className="text-xs text-gray-500">{new Date(alert.timestamp).toLocaleTimeString()}</span>
              </div>
              <p className="text-sm text-gray-200 mt-2">{alert.msg}</p>
            </div>
          </div>
        ))}
        {filtered.length === 0 && <p className="text-gray-400 text-sm mt-4 text-center">No alerts for this category yet.</p>}
      </div>
    </div>
  );
}

export default function AttendeePortal() {
  const location = useLocation();
  const venueState = useVenue();

  // Proactive Voice Tips - every 45s
  useEffect(() => {
    const tipInterval = setInterval(() => {
      const cZoneDens = venueState.zones['C'].density;
      const cStalls = Object.keys(venueState.stalls).filter(s => venueState.stalls[s].zone === 'C');
      const nearestStall = cStalls.length > 0 ? cStalls[0] : null;

      if (cZoneDens > 75) {
        speak("Tip: Your zone is getting crowded. Consider visiting facilities now before density increases further.", { rate: 0.92, pitch: 1.05, priority: 'normal' });
        return;
      }

      if (venueState.match && venueState.match.balls > 108 && venueState.match.phase !== 'result') { 
        speak("Parking tip: Head to your car after the next over to beat the exit rush. Zone P2 exit via Gate 3.", { rate: 0.92, pitch: 1.05, priority: 'normal' });
        return;
      }

      const p2Occupancy = 180 / 400; // static approximation matching mockData
      if (p2Occupancy > 0.8) {
        speak("Your parking zone is filling up nearby. Your spot E-47 is reserved — no need to rush.", { rate: 0.92, pitch: 1.05, priority: 'normal' });
        return;
      }

      const cabsBusy = true; // static approx matching mockData alpha zone
      if (cabsBusy) {
        speak("Cab pickup zones are currently busy. Consider the metro at 350 metres for a faster exit.", { rate: 0.92, pitch: 1.05, priority: 'normal' });
        return;
      }

      if (nearestStall && venueState.stalls[nearestStall].waitTime > 10) {
        // find alternative
        let minWait = 100;
        let minStall = null;
        Object.keys(venueState.stalls).forEach(s => {
          if (venueState.stalls[s].zone !== 'C' && venueState.stalls[s].waitTime < minWait) {
            minWait = venueState.stalls[s].waitTime;
            minStall = s;
          }
        });
        if(minStall) {
          speak(`Heads up! ${nearestStall} near you has a ${venueState.stalls[nearestStall].waitTime} minute wait. ${minStall} currently has only ${minWait} minutes.`, { rate: 0.92, pitch: 1.05, priority: 'normal' });
          return;
        }
      }

      if (venueState.match && venueState.match.balls > 102 && venueState.match.phase !== 'result') { // Last 3 overs (120 balls total)
        speak("Final overs approaching. Plan your exit route now to avoid post-match crowd surge.", { rate: 0.92, pitch: 1.05, priority: 'normal' });
        return;
      }

      const isRecentSix = venueState.match.lastEvent.includes('SIX') && Math.random() > 0.5; // Simulate recent context easily
      if (isRecentSix) {
        speak("Crowd energy is high after that boundary. Stay aware of your surroundings.", { rate: 0.92, pitch: 1.05, priority: 'normal' });
        return;
      }

      let bestGate = '1';
      let minFlow = 9999;
      Object.keys(venueState.gates).forEach(g => {
        if(venueState.gates[g].open && venueState.gates[g].flowRate < minFlow) {
          minFlow = venueState.gates[g].flowRate;
          bestGate = g;
        }
      });
      speak(`Enjoying the match? Your nearest exit is Gate ${bestGate}, currently at low capacity.`, { rate: 0.92, pitch: 1.05, priority: 'normal' });

    }, 45000);

    return () => clearInterval(tipInterval);
  }, [venueState]); // Add venueState to pick live values per interval tick or use Refs if performance needed.

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white font-sans md:max-w-md md:mx-auto md:border-x md:border-gray-800 md:shadow-2xl relative pt-4 overflow-hidden">
      <VoiceControlBar isMobile={true} />
      
      <div className="px-5 pb-[160px] overflow-y-auto h-screen">
        <Routes>
          <Route path="/" element={<HomeTab />} />
          <Route path="/navigate" element={<NavigateTab />} />
          <Route path="/facilities" element={<FacilitiesTab />} />
          <Route path="/alerts" element={<AlertsTab />} />
          <Route path="/parking" element={<ParkingTab />} />
        </Routes>
      </div>

      <VoiceAssistant />

      <div className="fixed bottom-[72px] right-2 z-30 animate-pulse pointer-events-none opacity-50">
          <p className="text-[10px] text-[#6c63ff] font-bold">⚡ VenueIQ Engine v2.0</p>
      </div>

      {/* Bottom Navigation */}
      <div className="absolute bottom-0 w-full md:max-w-md bg-[#13131a] border-t border-gray-800 py-3 px-6 flex justify-between items-center z-50">
        <Link to="/attendee" className={`flex flex-col items-center space-y-1 ${location.pathname === '/attendee' ? 'text-[#6c63ff]' : 'text-gray-500 hover:text-gray-300'}`}>
          <Home size={24} />
          <span className="text-[10px] font-medium">Home</span>
        </Link>
        <Link to="/attendee/navigate" className={`flex flex-col items-center space-y-1 ${location.pathname.includes('/navigate') ? 'text-[#6c63ff]' : 'text-gray-500 hover:text-gray-300'}`}>
          <MapIcon size={24} />
          <span className="text-[10px] font-medium">Navigate</span>
        </Link>
        <Link to="/attendee/facilities" className={`flex flex-col items-center space-y-1 ${location.pathname.includes('/facilities') ? 'text-[#6c63ff]' : 'text-gray-500 hover:text-gray-300'}`}>
          <Coffee size={24} />
          <span className="text-[10px] font-medium">Facilities</span>
        </Link>
        <Link to="/attendee/alerts" className={`flex flex-col items-center space-y-1 ${location.pathname.includes('/alerts') ? 'text-[#6c63ff]' : 'text-gray-500 hover:text-gray-300'}`}>
          <Bell size={24} />
          <span className="text-[10px] font-medium">Alerts</span>
        </Link>
        <Link to="/attendee/parking" className={`flex flex-col items-center space-y-1 ${location.pathname.includes('/parking') ? 'text-[#6c63ff]' : 'text-gray-500 hover:text-gray-300'}`}>
          <ParkingSquare size={24} />
          <span className="text-[10px] font-medium">Parking</span>
        </Link>
      </div>
    </div>
  );
}
