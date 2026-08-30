import { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Bell, Wallet, Menu, X, Cloud, LogOut, User, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useWeather } from '../../hooks/useWeather';
import { formatPrice } from '../../utils/pricing';
import { isPeakHour, isFestivalDay } from '../../utils/pricing';
import api from '../../utils/api';

export default function Navbar() {
  const { user, logout, isAuthenticated, isAdmin } = useAuth();
  const { weather } = useWeather();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const onFilm = pathname === '/';
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (isAuthenticated) {
      api.get('/notifications').then(({ data }) => {
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }).catch(() => {});
    }
  }, [isAuthenticated]);

  const navLinks = [
    { to: '/vehicles', label: 'Vehicles' },
    { to: '/tracking', label: 'Track' },
    { to: '/charging', label: 'Charging' },
    { to: '/leaderboard', label: 'Leaderboard' },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <>
      {(isPeakHour() || isFestivalDay() || weather.isRaining || weather.isHot) && (
        <motion.div
          initial={{ y: -40 }}
          animate={{ y: 0 }}
          className="bg-gradient-to-r from-brand-violet/20 to-brand-cyan/20 border-b border-white/10 py-2 px-4 text-center text-sm"
        >
          {weather.isRaining && '🌧 Rain detected — Car recommended over bike today'}
          {!weather.isRaining && weather.isHot && '🌡 Hot day — EV & AC car options highlighted'}
          {!weather.isRaining && !weather.isHot && isPeakHour() && '⚡ Peak hours active — 1.5x surge pricing in effect'}
          {!weather.isRaining && !weather.isHot && !isPeakHour() && isFestivalDay() && '🎉 Festival pricing active today'}
        </motion.div>
      )}

      <nav className={`sticky top-0 z-40 border-b border-white/10 ${onFilm ? 'nav-glass nav-glass--film' : 'nav-glass'}`}>
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <motion.div
              className="w-8 h-8 bg-brand-cyan rounded-lg flex items-center justify-center"
              whileHover={{ scale: 1.08, rotate: -8 }}
              whileTap={{ scale: 0.94 }}
              transition={{ type: 'spring', stiffness: 400, damping: 18 }}
            >
              <Zap size={18} className="text-black" />
            </motion.div>
            <span className="font-syne font-bold text-xl text-white">
              RentX <span className="text-brand-cyan">AI</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `nav-link px-4 py-2 text-sm font-medium ${isActive ? 'text-brand-cyan' : 'text-gray-400 hover:text-white'}`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-gray-400 glass-card px-3 py-1.5 rounded-full">
              <Cloud size={14} className="text-brand-cyan" />
              <span>{Math.round(weather.temp)}°C</span>
            </div>

            {isAuthenticated ? (
              <>
                <div className="relative">
                  <button onClick={() => setNotifOpen(!notifOpen)} className="relative p-2 text-gray-400 hover:text-white">
                    <Bell size={20} />
                    {unreadCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-brand-red rounded-full text-xs flex items-center justify-center text-white">
                        {unreadCount}
                      </span>
                    )}
                  </button>
                  <AnimatePresence>
                    {notifOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute right-0 top-12 w-80 glass-card p-4 max-h-96 overflow-y-auto"
                      >
                        {notifications.length === 0 ? (
                          <p className="text-gray-400 text-sm text-center py-4">No notifications</p>
                        ) : (
                          notifications.slice(0, 5).map((n) => (
                            <div key={n.id} className="py-2 border-b border-white/5 text-sm">
                              <p className="text-white">{n.message}</p>
                              <p className="text-gray-500 text-xs mt-1">{n.type}</p>
                            </div>
                          ))
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <Link to="/wallet" className="hidden sm:flex items-center gap-1.5 glass-card px-3 py-1.5 rounded-full text-sm text-brand-green">
                  <Wallet size={14} />
                  {formatPrice(user?.walletBalance || 0)}
                </Link>

                <div className="relative group">
                  <button className="w-8 h-8 rounded-full bg-brand-violet flex items-center justify-center text-white font-bold text-sm">
                    {user?.name?.[0]?.toUpperCase()}
                  </button>
                  <div className="absolute right-0 top-10 w-48 glass-card py-2 hidden group-hover:block">
                    <Link to="/dashboard" className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-white/5">
                      <LayoutDashboard size={16} /> Dashboard
                    </Link>
                    <Link to="/profile" className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-white/5">
                      <User size={16} /> Profile
                    </Link>
                    {isAdmin && (
                      <Link to="/admin" className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-white/5 text-brand-cyan">
                        Admin Panel
                      </Link>
                    )}
                    <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-white/5 w-full text-brand-red">
                      <LogOut size={16} /> Logout
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex gap-2">
                <Link to="/login" className="text-sm text-gray-400 hover:text-white px-3 py-1.5 transition-colors">Login</Link>
                <motion.div whileHover={{ scale: 1.05, y: -1 }} whileTap={{ scale: 0.97 }}>
                  <Link to="/register" className="neon-button text-sm px-4 py-1.5 block">Sign Up</Link>
                </motion.div>
              </div>
            )}

            <button className="md:hidden text-gray-400" onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              className="fixed inset-0 top-16 bg-brand-dark z-50 p-6 md:hidden"
            >
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMenuOpen(false)}
                  className="block py-4 text-xl font-syne border-b border-white/10"
                >
                  {link.label}
                </Link>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </>
  );
}
