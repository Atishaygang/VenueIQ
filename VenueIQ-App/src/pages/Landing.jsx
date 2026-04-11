import { Link } from 'react-router-dom';
import { User, ShieldCheck } from 'lucide-react';

export default function Landing() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#1d1d2b] via-[#0a0a0f] to-[#0a0a0f] pointer-events-none" />

      <div className="z-10 text-center mb-12 animate-fade-in-up">
        <h1 className="text-5xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#6c63ff] to-[#f59e0b] mb-4">
          VenueIQ
        </h1>
        <p className="text-xl text-gray-400">Your smart stadium companion</p>
      </div>

      <div className="z-10 grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
        <Link 
          to="/attendee"
          className="group relative bg-[#13131a] border border-[#2a2a35] hover:border-[#6c63ff] rounded-2xl p-8 flex flex-col items-center justify-center transition-all duration-300 hover:shadow-[0_0_30px_rgba(108,99,255,0.2)] hover:-translate-y-2"
        >
          <div className="bg-gradient-to-br from-[#6c63ff] to-[#4b45bd] p-5 rounded-full mb-6 group-hover:scale-110 transition-transform duration-300">
            <User size={40} className="text-white" />
          </div>
          <h2 className="text-2xl font-semibold text-white mb-2">I'm an Attendee</h2>
          <p className="text-gray-400 text-center">Navigate the venue, check wait times, and get live updates.</p>
        </Link>
        
        <Link 
          to="/staff"
          className="group relative bg-[#13131a] border border-[#2a2a35] hover:border-[#f59e0b] rounded-2xl p-8 flex flex-col items-center justify-center transition-all duration-300 hover:shadow-[0_0_30px_rgba(245,158,11,0.2)] hover:-translate-y-2"
        >
          <div className="bg-gradient-to-br from-[#f59e0b] to-[#d97706] p-5 rounded-full mb-6 group-hover:scale-110 transition-transform duration-300">
            <ShieldCheck size={40} className="text-white" />
          </div>
          <h2 className="text-2xl font-semibold text-white mb-2">I'm Staff</h2>
          <p className="text-gray-400 text-center">Monitor crowd density, manage incidents, and deploy resources.</p>
        </Link>
      </div>

      {/* Cool decorative elements */}
      <div className="absolute bottom-0 w-full h-32 bg-gradient-to-t from-[#6c63ff]/10 to-transparent pointer-events-none" />
      <div className="absolute top-0 w-full h-32 bg-gradient-to-b from-[#f59e0b]/5 to-transparent pointer-events-none" />
    </div>
  );
}
