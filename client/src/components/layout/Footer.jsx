import { Link } from 'react-router-dom';
import { Zap } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-white/10 mt-20 py-12 px-4">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-brand-cyan rounded-lg flex items-center justify-center">
              <Zap size={18} className="text-black" />
            </div>
            <span className="font-syne font-bold text-lg">RentX AI</span>
          </div>
          <p className="text-gray-500 text-sm">Smart vehicle rental powered by AI. Drive green, drive smart.</p>
        </div>
        <div>
          <h4 className="font-syne font-semibold mb-4 text-white">Platform</h4>
          <div className="space-y-2 text-sm text-gray-400">
            <Link to="/vehicles" className="block hover:text-brand-cyan">Vehicles</Link>
            <Link to="/charging" className="block hover:text-brand-cyan">EV Charging</Link>
            <Link to="/leaderboard" className="block hover:text-brand-cyan">Leaderboard</Link>
          </div>
        </div>
        <div>
          <h4 className="font-syne font-semibold mb-4 text-white">Account</h4>
          <div className="space-y-2 text-sm text-gray-400">
            <Link to="/dashboard" className="block hover:text-brand-cyan">Dashboard</Link>
            <Link to="/bookings" className="block hover:text-brand-cyan">Bookings</Link>
            <Link to="/profile" className="block hover:text-brand-cyan">Profile</Link>
          </div>
        </div>
        <div>
          <h4 className="font-syne font-semibold mb-4 text-white">Contact</h4>
          <p className="text-sm text-gray-400">Bengaluru, India</p>
          <p className="text-sm text-gray-400 mt-1">support@rentx.ai</p>
        </div>
      </div>
      <div className="max-w-7xl mx-auto mt-8 pt-8 border-t border-white/10 text-center text-sm text-gray-500">
        © 2026 RentX AI. All rights reserved. MIT License.
      </div>
    </footer>
  );
}
