import React, { useState, useEffect, useMemo } from 'react';
import { Car, Train, Bus, MapPin, Clock, CreditCard, Navigation, AlertTriangle, CheckCircle, Navigation2 } from 'lucide-react';
import { parkingZones, publicTransport, userParking } from '../../data/mockData';
import { useVenue } from '../../engine/VenueContext';
import { speak } from '../../engine/voiceEngine';

const ParkingMapSVG = React.memo(({ zones }) => {
  const getColor = (occ, cap) => {
    const pct = occ / cap;
    if (pct < 0.5) return '#22c55e';
    if (pct <= 0.8) return '#eab308';
    return '#ef4444';
  };

  const getLabel = (id) => {
    const z = zones.find(z => z.id === id);
    if (!z) return '0%';
    return Math.round((z.occupied / z.capacity) * 100) + '%';
  };

  const getCol = (id) => {
    const z = zones.find(z => z.id === id);
    if (!z) return '#22c55e';
    return getColor(z.occupied, z.capacity);
  };

  return (
    <svg viewBox="0 0 300 250" className="w-full h-auto drop-shadow-2xl" role="img" aria-label="Smart Stadium Parking Occupancy SVG Map">
      {/* Stadium Oval */}
      <ellipse cx="150" cy="125" rx="60" ry="80" fill="#13131a" stroke="#374151" strokeWidth="2" />
      <text x="150" y="130" fill="#6b7280" fontSize="12" fontWeight="bold" textAnchor="middle">STADIUM</text>

      {/* P1 North */}
      <g transform="translate(100, 10)">
        <rect width="100" height="25" rx="4" fill={getCol('P1')} fillOpacity="0.2" stroke={getCol('P1')} strokeWidth="2" />
        <text x="50" y="16" fill="#fff" fontSize="10" fontWeight="bold" textAnchor="middle">P1 ({getLabel('P1')})</text>
      </g>
      {/* P3 South */}
      <g transform="translate(100, 215)">
        <rect width="100" height="25" rx="4" fill={getCol('P3')} fillOpacity="0.2" stroke={getCol('P3')} strokeWidth="2" />
        <text x="50" y="16" fill="#fff" fontSize="10" fontWeight="bold" textAnchor="middle">P3 ({getLabel('P3')})</text>
      </g>
      {/* P4 West */}
      <g transform="translate(15, 75)">
        <rect width="25" height="100" rx="4" fill={getCol('P4')} fillOpacity="0.2" stroke={getCol('P4')} strokeWidth="2" />
        <text x="12" y="52" fill="#fff" fontSize="10" fontWeight="bold" textAnchor="middle" transform="rotate(-90 12,52)">P4</text>
        <text x="12" y="65" fill="#fff" fontSize="8" textAnchor="middle" transform="rotate(-90 12,65)">({getLabel('P4')})</text>
      </g>
      {/* P2 East (User) */}
      <g transform="translate(260, 75)">
        <rect width="25" height="100" rx="4" fill={getCol('P2')} fillOpacity="0.2" stroke={getCol('P2')} strokeWidth="2" />
        <rect width="31" height="106" x="-3" y="-3" rx="6" fill="none" stroke="#6c63ff" strokeWidth="2" className="animate-pulse" />
        <text x="12" y="48" fill="#fff" fontSize="10" fontWeight="bold" textAnchor="middle" transform="rotate(90 12,48)">P2</text>
        <text x="12" y="61" fill="#fff" fontSize="8" textAnchor="middle" transform="rotate(90 12,61)">({getLabel('P2')})</text>
      </g>
      {/* P5 VIP */}
      <g transform="translate(40, 30)">
        <rect width="40" height="25" rx="4" fill={getCol('P5')} fillOpacity="0.2" stroke={getCol('P5')} strokeWidth="2" />
        <text x="20" y="16" fill="#eab308" fontSize="8" fontWeight="bold" textAnchor="middle">VIP</text>
      </g>
    </svg>
  );
});

export default function ParkingTab() {
  const { match } = useVenue();
  
  // Section A states
  const [liveCost, setLiveCost] = useState(180);
  
  // Section B states
  const [zones, setZones] = useState([...parkingZones]);

  // Section A: Track live cost +10 every 3 mins
  useEffect(() => {
    const costInt = setInterval(() => {
      setLiveCost(prev => prev + 10);
    }, 180000); // 3 mins = 180000 ms
    return () => clearInterval(costInt);
  }, []);

  // Section B: SVG interval fluctuation
  useEffect(() => {
    const occInt = setInterval(() => {
      setZones(prev => prev.map(z => {
        if ((z.occupied / z.capacity) > 0.95) return z;
        const delta = (Math.floor(Math.random() * 11) - 2) * (Math.random() > 0.5 ? 1 : -1);
        let newOcc = Math.max(0, Math.min(z.capacity, z.occupied + delta));
        return { ...z, occupied: newOcc };
      }));
    }, 10000);
    return () => clearInterval(occInt);
  }, []);

  const handleNavigateCar = () => {
    speak(`Your car is parked in Zone P2, East Stand, Spot E-47. Exit via Gate 3. Walk time to your car is approximately 2 minutes.`, { rate: 0.95, pitch: 1.0 });
  };

  const getIcon = (typeStr) => {
    if (typeStr.includes('Train') || typeStr.includes('Metro')) return <Train size={24} />;
    if (typeStr.includes('Bus')) return <Bus size={24} />;
    return <Car size={24} />;
  };

  // Section D logic
  const isMatchEnding = match.balls > 102 && match.phase !== 'result'; // Last 3 overs
  const isParkingFull = zones.some(z => (z.occupied / z.capacity) > 0.85);

  const sortedZones = [...zones].sort((a, b) => (a.occupied / a.capacity) - (b.occupied / b.capacity));

  return (
    <div className="space-y-6 pb-20 animate-fade-in-up">
      {/* Section A - Personal Card */}
      <div className="bg-[#13131a] p-5 rounded-2xl border-2 border-[#6c63ff]/50 shadow-[0_0_15px_rgba(108,99,255,0.15)] relative overflow-hidden">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center">
          <Car className="mr-2 text-[#6c63ff]" size={22} /> Your Parking Spot
        </h2>
        
        <div className="absolute top-4 right-4 flex items-center space-x-1.5 bg-green-500/10 px-2.5 py-1 rounded-full border border-green-500/20">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
          <span className="text-[10px] text-green-400 font-bold uppercase tracking-wider">Active</span>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-xs text-gray-500 uppercase font-semibold">Location</p>
            <p className="text-sm text-white font-medium">{userParking.zone} — {userParking.spot}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase font-semibold">Entry Time</p>
            <p className="text-sm text-white font-medium">{userParking.entryTime}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase font-semibold">Entry Gate</p>
            <p className="text-sm text-white font-medium">{userParking.entryGate}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase font-semibold">Walk to Exit</p>
            <p className="text-sm text-white font-medium">{userParking.walkToSeat.split(' to ')[0]}</p>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-gray-800 pt-4 mt-2">
          <div className="flex items-center text-[#f59e0b]" aria-live="polite">
            <CreditCard size={20} className="mr-2" />
            <span className="text-2xl font-bold">₹{liveCost}</span>
            <span className="text-xs text-gray-500 ml-1">est. so far</span>
          </div>
          <button onClick={handleNavigateCar} className="bg-[#6c63ff] hover:bg-[#5a52d5] text-white px-4 py-2 rounded-lg font-semibold text-sm transition-colors flex items-center focus:ring-2 focus:ring-purple-500">
            <Navigation size={16} className="mr-1.5" /> Navigate to Car
          </button>
        </div>
      </div>

      {/* Section B - Full Parking Map */}
      <h2 className="text-2xl font-bold text-white border-b border-gray-800 pb-2">Live Availability</h2>
      <div className="bg-[#13131a] p-4 rounded-xl border border-gray-800 flex flex-col items-center shadow-inner relative">
        <ParkingMapSVG zones={zones} />
        <div className="flex items-center space-x-4 text-[10px] mt-4 font-semibold uppercase tracking-wider text-gray-400">
           <span className="flex items-center"><div className="w-2 h-2 rounded-full bg-green-500 mr-1.5" /> Available</span>
           <span className="flex items-center"><div className="w-2 h-2 rounded-full bg-yellow-500 mr-1.5" /> Filling Up</span>
           <span className="flex items-center"><div className="w-2 h-2 rounded-full bg-red-500 mr-1.5" /> Nearly Full</span>
        </div>
      </div>

      {/* Section C - Detail List */}
      <div className="space-y-3">
        {sortedZones.map((z, i) => {
          const pct = z.occupied / z.capacity;
          const pctDisplay = Math.round(pct * 100);
          const statCol = pct < 0.5 ? 'bg-green-500' : pct <= 0.8 ? 'bg-yellow-500' : 'bg-red-500';
          const statTextCol = pct < 0.5 ? 'text-green-400' : pct <= 0.8 ? 'text-yellow-500' : 'text-red-500';
          const statBgCol = pct < 0.5 ? 'bg-green-500/10' : pct <= 0.8 ? 'bg-yellow-500/10' : 'bg-red-500/10';
          
          return (
            <div key={z.id} className="bg-[#13131a] p-4 rounded-xl border border-gray-800 flex flex-col shadow-sm relative overflow-hidden">
              {i === 0 && (
                <div className="absolute top-0 right-0 bg-green-500 text-[9px] text-white font-bold px-2 py-0.5 rounded-bl-lg">LEAST CROWDED</div>
              )}
              {z.id === 'P2' && (
                <div className="absolute top-0 right-0 bg-[#6c63ff] text-[9px] text-white font-bold px-2 py-0.5 rounded-bl-lg">YOUR ZONE</div>
              )}
              
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-bold text-white text-sm">{z.label}</h3>
                  <p className="text-xs text-gray-400">{z.entryGate} • {z.walkTime} walk</p>
                </div>
                <div className="text-right flex flex-col items-end">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded ${statTextCol} ${statBgCol}`}>
                    {pctDisplay}% OCCUPIED
                  </span>
                  {pct > 0.9 && (
                    <span className="text-[9px] text-red-500 animate-pulse font-bold mt-1">NEARLY FULL</span>
                  )}
                </div>
              </div>

              <div className="w-full bg-[#1a1a24] rounded-full h-1.5 mb-2 overflow-hidden flex">
                <div className={`h-1.5 rounded-full ${statCol} transition-all duration-500`} style={{ width: `${pctDisplay}%` }}></div>
              </div>
              
              <div className="flex justify-between items-center mt-1">
                <p className="text-[10px] text-gray-500 font-mono">{z.occupied} / {z.capacity} spots</p>
                <p className="text-xs text-white font-medium">₹{z.pricePerHour}/hr</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Section D - Public Transport */}
      <h2 className="text-2xl font-bold text-white pt-4 border-b border-gray-800 pb-2">🚇 Getting Here Without a Car</h2>
      
      <div className={`p-3 rounded-xl border flex items-center space-x-3 
        ${isMatchEnding ? 'bg-[#f59e0b]/10 border-[#f59e0b]/30 text-[#f59e0b]' : 
          isParkingFull ? 'bg-blue-500/10 border-blue-500/30 text-blue-400' : 
          'bg-green-500/10 border-green-500/30 text-green-400'}`}>
        {isMatchEnding ? <AlertTriangle size={20} className="animate-pulse" /> : isParkingFull ? <Train size={20} /> : <CheckCircle size={20} />}
        <p className="text-sm font-medium">
          {isMatchEnding ? "⚠️ Match ending soon — cab zones will get busy. Book your ride NOW or take the metro." :
           isParkingFull ? "🚇 Parking nearly full — metro recommended for arrivals" :
           "✅ Transport options available — low wait times expected"}
        </p>
      </div>

      <div className="space-y-3">
        {publicTransport.map(pt => (
          <div key={pt.name} className="bg-[#13131a] p-4 rounded-xl border border-gray-800 flex items-center shadow-sm">
            <div className="bg-[#1a1a24] p-3 rounded-lg mr-4 border border-gray-700 text-gray-300">
              {getIcon(pt.icon)}
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start mb-1">
                <h3 className="font-bold text-white text-sm">{pt.name}</h3>
                <span className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase tracking-wider flex items-center
                  ${pt.status === 'operational' ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-500'}`}>
                  {pt.status === 'busy' && <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse mr-1" />}
                  {pt.status === 'busy' ? 'High Demand' : 'Operational'}
                </span>
              </div>
              <p className="text-xs text-gray-400 mb-1">{pt.distance} • {pt.walkTime} walk • {pt.frequency}</p>
              <div className="flex flex-wrap gap-1 mt-1.5">
                {pt.lines.map(line => (
                  <span key={line} className="bg-[#2a2a35] text-[9px] text-gray-300 px-1.5 py-0.5 rounded">
                    {line}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-xl overflow-hidden border border-gray-800 shadow-sm relative h-48 w-full bg-[#13131a]">
        <iframe
          title="Google Map Wankhede Stadium Location"
          width="100%"
          height="100%"
          style={{ border: 0, opacity: 0.8 }}
          loading="lazy"
          allowFullScreen
          referrerPolicy="no-referrer-when-downgrade"
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3773.682662283921!2d72.82361091535798!3d18.93888366099951!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be7d1e04130f16d%3A0xeab50ef65faccc7d!2sWankhede%20Stadium!5e0!3m2!1sen!2sin!4v1689253406263!5m2!1sen!2sin"
        />
      </div>
    </div>
  );
}
