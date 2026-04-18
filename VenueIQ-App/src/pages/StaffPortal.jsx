import React, { useEffect, useRef } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Brain, Radio, ShieldAlert, DoorOpen, Users, AlertTriangle, CheckCircle, Send, LogOut, Check } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useVenue } from '../engine/VenueContext';
import { speak } from '../engine/voiceEngine';
import VoiceControlBar from '../components/shared/VoiceControlBar';
import { useFirebase } from '../hooks/useFirebase';
import { GOOGLE_SERVICES } from '../config/googleServices';

const MemoizedDensityChart = React.memo(({ densities }) => (
  <div role="img" aria-label="Live Zone Density Bar Chart" className="w-full h-full">
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={densities}>
        <XAxis dataKey="zone" stroke="#6b7280" />
        <YAxis stroke="#6b7280" domain={[0, 100]} />
        <Tooltip cursor={{ fill: '#1a1a24' }} contentStyle={{ backgroundColor: '#13131a', border: '1px solid #374151', borderRadius: '8px', color: '#fff' }} />
        <Bar dataKey="density" radius={[4, 4, 0, 0]}>
          {densities.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.density >= 80 ? '#ef4444' : entry.density >= 50 ? '#f59e0b' : '#3b82f6'} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  </div>
));

const MemoizedQueueChart = React.memo(({ queues }) => (
  <div role="img" aria-label="Real-time Queue Lengths Bar Chart" className="w-full h-full">
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={queues} layout="vertical" margin={{ left: 40 }}>
        <XAxis type="number" stroke="#6b7280" />
        <YAxis dataKey="name" type="category" stroke="#6b7280" fontSize={10} width={100} />
        <Tooltip cursor={{ fill: '#1a1a24' }} contentStyle={{ backgroundColor: '#13131a', border: '1px solid #374151', borderRadius: '8px', color: '#fff' }} />
        <Bar dataKey="waitTime" fill="#f59e0b" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  </div>
));

function Overview() {
  const { zones, stalls, incidents, gates, totalAttendees, lastTickTrigger } = useVenue();
  const { connected } = useFirebase();

  const densitiesArr = Object.keys(zones).map(z => ({ zone: z, density: zones[z].density }));
  const queuesArr = Object.keys(stalls).map(s => ({ name: s, waitTime: stalls[s].waitTime }));
  
  const highDensityCount = densitiesArr.filter(d => d.density >= 80).length;
  const activeIncidentsCount = incidents.filter(i => i.status !== 'Resolved').length;
  const gatesOpenCount = Object.values(gates).filter(g => g.open).length;

  const [timeSinceTick, setTimeSinceTick] = React.useState(0);
  React.useEffect(() => {
    setTimeSinceTick(0);
    const int = setInterval(() => {
      setTimeSinceTick(prev => prev + 1);
    }, 1000);
    return () => clearInterval(int);
  }, [lastTickTrigger]);

  return (
    <div className="space-y-6 animate-fade-in-up pb-[100px]">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <h2 className="text-3xl font-bold text-white">System Overview</h2>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-800 bg-[#13131a] shadow-sm">
            {connected ? (
              <>
                <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span>
                <span className="text-xs text-green-500 font-bold tracking-wider uppercase">🔴 Firebase Live</span>
              </>
            ) : (
              <>
                <span className="w-2.5 h-2.5 rounded-full bg-gray-500"></span>
                <span className="text-xs text-gray-500 font-bold tracking-wider uppercase">⚪ Offline Mode</span>
              </>
            )}
          </div>
        </div>
        <p className="text-sm text-gray-400 italic">Last updated: {timeSinceTick} seconds ago</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4" role="status" aria-live="polite">
        {[
          { label: 'Total Attendees', val: totalAttendees.toLocaleString(), icon: <Users className="text-blue-500" /> },
          { label: 'High Density Zones', val: highDensityCount, icon: <AlertTriangle className="text-red-500" /> },
          { label: 'Active Incidents', val: activeIncidentsCount, icon: <ShieldAlert className="text-yellow-500" /> },
          { label: 'Gates Open', val: `${gatesOpenCount}/12`, icon: <DoorOpen className="text-green-500" /> },
        ].map((k, i) => (
          <div key={i} className="bg-[#13131a] p-6 rounded-xl border border-gray-800 flex items-center justify-between shadow-md hover:border-[#f59e0b] transition-colors">
            <div>
              <p className="text-gray-400 text-sm mb-1">{k.label}</p>
              <p className="text-3xl font-bold text-white">{k.val}</p>
            </div>
            <div className="bg-[#1a1a24] p-3 rounded-xl">{k.icon}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#13131a] p-6 rounded-xl border border-gray-800">
          <h3 className="text-lg font-bold text-white mb-4">Live Zone Density (%)</h3>
          <div className="h-64">
            <MemoizedDensityChart densities={densitiesArr} />
          </div>
        </div>

        <div className="bg-[#13131a] p-6 rounded-xl border border-gray-800">
          <h3 className="text-lg font-bold text-white mb-4">Real-time Queue Lengths (Mins)</h3>
          <div className="h-64">
            <MemoizedQueueChart queues={queuesArr} />
          </div>
        </div>
      </div>

      <div className="mt-8 bg-[#13131a] p-6 rounded-xl border border-gray-800">
        <h3 className="text-lg font-bold text-white mb-4">⚡ Powered by Google</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.values(GOOGLE_SERVICES).map((service, i) => (
            <div key={i} className="flex items-start p-4 bg-[#1a1a24] rounded-lg border border-gray-800">
              <div className="w-2 h-2 mt-1.5 mr-3 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
              <div>
                <p className="text-sm font-bold text-white">{service.name}</p>
                <p className="text-xs text-gray-400 mt-1">{service.usage}</p>
              </div>
              <div className="ml-auto">
                 <span className="text-[10px] uppercase font-bold text-green-400 tracking-wider">Active</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AIRedeployment() {
  const { zones, suggestions: engineSuggestions, acceptSuggestion } = useVenue();
  const [loadingObj, setLoading] = React.useState(false);
  const [geminiSuggestions, setGeminiSuggestions] = React.useState(null);

  const activeSuggestions = geminiSuggestions || engineSuggestions;

  const handleAccept = (s) => {
    acceptSuggestion(s.id);
    speak(`Deployment confirmed. ${s.action}. Staff units have been notified.`, { rate: 1.0, pitch: 0.9 });
  };

  const handleGenerateGemini = async () => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("No VITE_GEMINI_API_KEY found, falling back to local engine.");
      setGeminiSuggestions(null);
      return;
    }
    
    setLoading(true);
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: `You are a stadium crowd management AI. Current zone densities: ${JSON.stringify(zones)}. Generate 3 specific staff redeployment suggestions. Format as a JSON array where each object has: id (unique numerical timestamp-like id), zone (string, e.g., "Zone B"), action (string description of redeployment), confidence (number from 0-100). Do not use markdown backticks, just raw JSON array.` }]
          }]
        })
      });

      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      let parsed = [];
      if (rawText) {
        const cleanText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
        parsed = JSON.parse(cleanText);
      }
      
      if (Array.isArray(parsed) && parsed.length > 0) {
        setGeminiSuggestions(parsed.map((p, i) => ({...p, id: p.id || Date.now()+i, isGemini: true})));
      } else {
        setGeminiSuggestions(null);
      }
    } catch (e) {
      console.error(e);
      setGeminiSuggestions(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in-up pb-[100px]">
      <div className="flex justify-between items-center mb-6 border-b border-gray-800 pb-4 relative overflow-visible">
        <h2 className="text-3xl font-bold text-white flex items-center">
          <Brain className="mr-3 text-[#f59e0b]" size={36} />
          AI Staff Suggestions
        </h2>
        <div className="flex space-x-4 items-center">
          <button 
            onClick={handleGenerateGemini}
            disabled={loadingObj}
            className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg font-bold transition-colors flex items-center shadow-lg focus:ring-2 focus:ring-purple-500"
          >
            {loadingObj ? 'Thinking...' : 'Generate with Gemini ✨'}
          </button>
          <span className="bg-gradient-to-r from-pink-500 to-orange-400 text-xs px-3 py-1 rounded-full text-white font-bold tracking-widest shadow-lg hidden md:block">
            🧠 VenueIQ AI Engine
          </span>
        </div>
      </div>

      <div className="space-y-4">
        {activeSuggestions.map(s => (
          <div key={s.id} className="bg-[#13131a] p-6 rounded-xl border border-gray-800 flex flex-col md:flex-row md:items-center justify-between shadow-lg">
            <div className="mb-4 md:mb-0">
              <div className="flex items-center space-x-2">
                <span className="bg-[#f59e0b]/20 text-[#f59e0b] text-xs font-bold px-2 py-1 rounded uppercase tracking-wider">{s.zone}</span>
                {s.isGemini && <span className="bg-purple-500/20 text-purple-400 text-xs font-bold px-2 py-1 rounded uppercase tracking-wider">✨ Gemini</span>}
              </div>
              <p className="text-lg text-white mt-3 font-medium">{s.action}</p>
              <div className="flex items-center mt-2 text-sm">
                <span className="text-gray-400 mr-2">Model Confidence:</span>
                <span className={s.confidence > 90 ? 'text-green-400' : 'text-yellow-400'}>{s.confidence}%</span>
              </div>
            </div>
            
            <div>
              {s.deployed ? (
                <div className="flex items-center text-green-500 bg-green-500/10 px-4 py-2 rounded-lg border border-green-500/20">
                  <CheckCircle size={20} className="mr-2" /> Deployed
                </div>
              ) : (
                <div className="flex space-x-3">
                  <button onClick={() => handleAccept(s)} className="bg-[#f59e0b] hover:bg-[#d97706] text-black font-semibold px-6 py-2 rounded-lg transition-colors flex items-center focus:ring-2 focus:ring-purple-500">
                    <Check size={18} className="mr-2" /> Accept
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Broadcast() {
  const [logs, setLogs] = React.useState([]);
  
  const handleSend = (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const z = fd.get('zone');
    const msg = fd.get('message');
    const newLog = {
      id: Date.now(),
      zone: z,
      severity: fd.get('severity'),
      msg,
      time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
    };
    setLogs([newLog, ...logs].slice(0, 5));
    e.target.reset();

    speak(`Broadcast sent to ${z}. Message: ${msg}`, { rate: 0.95, pitch: 0.9 });
  };

  return (
    <div className="space-y-8 animate-fade-in-up pb-[100px]">
      <h2 className="text-3xl font-bold text-white mb-6 border-b border-gray-800 pb-4">Broadcast Alerts</h2>
      
      <div className="bg-[#13131a] p-6 rounded-xl border border-gray-800 w-full max-w-2xl">
        <form onSubmit={handleSend} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="target-zone" className="block text-sm text-gray-400 mb-1">Target Zone</label>
              <select id="target-zone" name="zone" className="w-full bg-[#1a1a24] border border-gray-700 text-white rounded-lg p-2.5 focus:border-[#f59e0b] focus:ring-1 focus:ring-[#f59e0b] outline-none">
                <option>All Zones</option>
                <option>Zone A</option>
                <option>Zone B</option>
                <option>Zone C</option>
                <option>Gate 3</option>
              </select>
            </div>
            <div>
              <label htmlFor="target-severity" className="block text-sm text-gray-400 mb-1">Severity</label>
              <select id="target-severity" name="severity" className="w-full bg-[#1a1a24] border border-gray-700 text-white rounded-lg p-2.5 focus:border-[#f59e0b] focus:ring-1 focus:ring-[#f59e0b] outline-none">
                <option>Info</option>
                <option>Warning</option>
                <option>Critical</option>
              </select>
            </div>
          </div>
          <div>
            <label htmlFor="broadcast-msg" className="block text-sm text-gray-400 mb-1">Message</label>
            <textarea id="broadcast-msg" name="message" required rows={3} className="w-full bg-[#1a1a24] border border-gray-700 text-white rounded-lg p-3 focus:border-[#f59e0b] outline-none resize-none focus:ring-2 focus:ring-[#f59e0b]" placeholder="Type broadcast message here..."></textarea>
          </div>
          <button type="submit" className="bg-[#f59e0b] hover:bg-[#d97706] text-black font-bold px-6 py-2.5 rounded-lg flex items-center justify-center w-full transition-colors focus:ring-2 focus:ring-purple-500">
            <Send size={18} className="mr-2" /> Send Broadcast
          </button>
        </form>
      </div>

      {logs.length > 0 && (
        <div className="w-full max-w-2xl">
          <h3 className="text-xl font-bold text-white mb-4">Recent Broadcasts</h3>
          <div className="space-y-3" role="log" aria-live="polite">
            {logs.map(lg => (
              <div key={lg.id} role="alert" className="bg-[#13131a] p-4 rounded-xl border border-gray-800 flex items-start space-x-4">
                <div className={`mt-1 px-2 py-1 text-[10px] uppercase font-bold rounded
                  ${lg.severity === 'Critical' ? 'bg-red-500/20 text-red-500' : lg.severity === 'Warning' ? 'bg-yellow-500/20 text-yellow-500' : 'bg-blue-500/20 text-blue-400'}`}>
                  {lg.severity}
                </div>
                <div>
                  <p className="text-gray-400 text-xs mb-1">{lg.zone} • {lg.time}</p>
                  <p className="text-white text-sm">{lg.msg}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Incidents() {
  const { incidents, resolveIncident } = useVenue();
  
  // Track new additions for voice TTS
  const lenRef = useRef(incidents.length);
  
  useEffect(() => {
    if (incidents.length > lenRef.current) {
       // New incidents were added (assume they are unshifted into the front)
       const newest = incidents[0];
       speak(`New incident logged. ${newest.zone}. Type: ${newest.type}. Awaiting staff response.`, { rate: 1.0, pitch: 0.85, priority: 'high' });
    }
    lenRef.current = incidents.length;
  }, [incidents]);

  return (
    <div className="space-y-6 animate-fade-in-up pb-[100px]">
      <div className="flex justify-between items-center mb-6 border-b border-gray-800 pb-4">
        <h2 className="text-3xl font-bold text-white">Incident Tracker</h2>
        <button className="bg-[#1a1a24] border border-gray-700 hover:border-[#f59e0b] text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium">+ Log Incident</button>
      </div>

      <div className="bg-[#13131a] rounded-xl border border-gray-800 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-[#1a1a24] border-b border-gray-800 text-xs uppercase font-semibold text-gray-400">
            <tr>
              <th className="p-4">ID</th>
              <th className="p-4">Zone</th>
              <th className="p-4">Type</th>
              <th className="p-4">Description</th>
              <th className="p-4">Status</th>
              <th className="p-4">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {incidents.map(inc => (
              <tr key={inc.id} className="hover:bg-[#1a1a24]/50 transition-colors">
                <td className="p-4 text-gray-300 font-mono text-sm">{inc.id}</td>
                <td className="p-4 text-white">{inc.zone}</td>
                <td className="p-4 text-gray-400">{inc.type}</td>
                <td className="p-4 text-white max-w-xs truncate">{inc.desc}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 text-xs rounded-full border
                    ${inc.status === 'Open' ? 'bg-red-500/10 border-red-500/20 text-red-400' :
                      inc.status === 'In Progress' ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-500' :
                      'bg-green-500/10 border-green-500/20 text-green-500'}`}>
                    {inc.status}
                  </span>
                </td>
                <td className="p-4">
                  {inc.status !== 'Resolved' && (
                    <button 
                      onClick={() => resolveIncident(inc.id)}
                      className="text-xs bg-[#f59e0b] hover:bg-[#d97706] text-black px-3 py-1 rounded font-semibold transition focus:ring-2 focus:ring-purple-500"
                    >
                      Resolve
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {incidents.length === 0 && (
              <tr>
                <td colSpan="6" className="p-8 text-center text-gray-500">No active incidents recorded.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Gates() {
  const { gates, toggleGate, closeAllGates } = useVenue();

  const handleCloseAll = () => {
    closeAllGates();
    speak("Emergency protocol activated. All gates are now closing. Please follow emergency procedures.", { rate: 0.9, pitch: 0.75, priority: 'high' });
  };

  return (
    <div className="space-y-6 animate-fade-in-up pb-[100px]">
      <div className="flex justify-between items-center mb-6 border-b border-gray-800 pb-4">
        <h2 className="text-3xl font-bold text-white">Gate Control</h2>
        <button onClick={handleCloseAll} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors text-sm font-bold shadow-lg flex items-center focus:ring-2 focus:ring-purple-500">
          <AlertTriangle size={18} className="mr-2" /> EMERGENCY: CLOSE ALL
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {Object.keys(gates).map(id => {
          const g = gates[id];
          const status = g.open ? 'Open' : 'Closed';
          return (
            <div key={id} className={`p-5 rounded-xl border transition-all ${g.open ? 'bg-[#13131a] border-gray-800' : 'bg-red-500/5 border-red-500/20'}`}>
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-white">Gate {id}</h3>
                <span className={`px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded
                  ${g.open ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-500'}`}>
                  {status}
                </span>
              </div>
              
              <p className="text-3xl font-mono font-light text-white mb-1">{g.flowRate}</p>
              <p className="text-xs text-gray-500 mb-6 uppercase tracking-wider">People / Min</p>

              <button 
                onClick={() => toggleGate(id)}
                aria-pressed={g.open}
                className={`w-full py-2 rounded font-semibold text-sm transition-colors focus:ring-2 focus:ring-purple-500
                  ${g.open ? 'bg-[#1a1a24] text-white hover:bg-red-500/20 hover:text-red-400 border border-gray-700 hover:border-red-500/50' : 
                  'bg-[#f59e0b] hover:bg-[#d97706] text-black border border-transparent'}`}
              >
                {g.open ? 'Close Gate' : 'Open Gate'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function StaffPortal() {
  const location = useLocation();
  const path = location.pathname.split('/')[2] || '';

  const navs = [
    { id: '', label: 'Overview', icon: <LayoutDashboard size={20} /> },
    { id: 'ai', label: 'AI Redeployment', icon: <Brain size={20} /> },
    { id: 'broadcast', label: 'Broadcast', icon: <Radio size={20} /> },
    { id: 'incidents', label: 'Incidents', icon: <ShieldAlert size={20} /> },
    { id: 'gates', label: 'Gate Control', icon: <DoorOpen size={20} /> },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white font-sans flex relative">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[110] focus:bg-white focus:text-black focus:p-2 focus:rounded">Skip to main content</a>
      <VoiceControlBar isMobile={false} />
      <div className="absolute top-0 w-full h-[40px] bg-[#1a1a24] border-b border-gray-800 flex items-center justify-center z-50 text-xs text-gray-400 uppercase tracking-widest font-bold" role="status" aria-live="polite">
        🔊 Voice Alerts Active
      </div>

      <div className="fixed bottom-4 right-4 z-40 animate-pulse pointer-events-none opacity-50">
          <p className="text-[10px] text-[#f59e0b] font-bold">⚡ VenueIQ Engine v2.0</p>
      </div>

      {/* Sidebar */}
      <nav aria-label="Sidebar Navigation" className="w-64 bg-[#13131a] border-r border-gray-800 flex flex-col hidden md:flex sticky top-[40px] h-[calc(100vh-40px)]">
        <div className="p-6">
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#f59e0b] to-[#fbbf24]">VenueIQ Staff</h1>
          <p className="text-xs text-gray-500 mt-1 uppercase tracking-widest font-semibold">Command Center</p>
        </div>
        
        <div className="flex-1 px-4 py-4 space-y-2">
          {navs.map(n => {
            const isActive = path === n.id;
            return (
              <Link 
                key={n.id} 
                to={`/staff${n.id ? '/' + n.id : ''}`}
                className={`flex items-center px-4 py-3 rounded-lg transition-all duration-200 focus:ring-2 focus:ring-purple-500 ${isActive ? 'bg-[#f59e0b]/10 text-[#f59e0b] font-semibold' : 'text-gray-400 hover:bg-[#1a1a24] hover:text-white'}`}
              >
                <div className="mr-3">{n.icon}</div>
                {n.label}
              </Link>
            )
          })}
        </div>

        <div className="p-4 border-t border-gray-800">
          <Link to="/" className="flex items-center justify-center w-full py-2.5 px-4 rounded border border-gray-700 text-gray-400 hover:bg-[#1a1a24] hover:text-white transition-colors text-sm focus:ring-2 focus:ring-purple-500">
            <LogOut size={16} className="mr-2" /> Exit Portal
          </Link>
        </div>
      </nav>

      {/* Main Content Area */}
      <main id="main-content" className="flex-1 overflow-y-auto mt-[40px]">
        <div className="p-8 max-w-7xl mx-auto min-h-[calc(100vh-40px)]">
          <Routes>
            <Route path="/" element={<Overview />} />
            <Route path="/ai" element={<AIRedeployment />} />
            <Route path="/broadcast" element={<Broadcast />} />
            <Route path="/incidents" element={<Incidents />} />
            <Route path="/gates" element={<Gates />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}
