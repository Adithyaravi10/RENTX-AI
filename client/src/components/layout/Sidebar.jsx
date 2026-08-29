import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Car, Calendar, User, Wallet, MapPin, Zap, Trophy, Leaf, BarChart3, Users, Settings } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export default function Sidebar() {
  const location = useLocation();
  const { isAdmin } = useAuth();

  const userLinks = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/vehicles', icon: Car, label: 'Vehicles' },
    { to: '/bookings', icon: Calendar, label: 'My Bookings' },
    { to: '/tracking', icon: MapPin, label: 'Live Tracking' },
    { to: '/charging', icon: Zap, label: 'Charging' },
    { to: '/wallet', icon: Wallet, label: 'Wallet' },
    { to: '/carbon', icon: Leaf, label: 'Carbon Tracker' },
    { to: '/leaderboard', icon: Trophy, label: 'Leaderboard' },
    { to: '/profile', icon: User, label: 'Profile' },
  ];

  const adminLinks = [
    { to: '/admin', icon: BarChart3, label: 'Overview' },
    { to: '/admin/vehicles', icon: Car, label: 'Fleet' },
    { to: '/admin/users', icon: Users, label: 'Users' },
    { to: '/admin/analytics', icon: Settings, label: 'Analytics' },
  ];

  const links = isAdmin ? adminLinks : userLinks;

  return (
    <aside className="w-64 glass-card h-[calc(100vh-4rem)] sticky top-16 p-4 hidden lg:block">
      <nav className="space-y-1">
        {links.map(({ to, icon: Icon, label }) => (
          <Link
            key={to}
            to={to}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition ${
              location.pathname === to
                ? 'bg-brand-cyan/10 text-brand-cyan border border-brand-cyan/20'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Icon size={18} />
            {label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
