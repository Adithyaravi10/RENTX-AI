import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { BookingProvider } from './context/BookingContext';
import { SocketProvider } from './context/SocketContext';
import { useAuth } from './hooks/useAuth';
import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';
import Footer from './components/layout/Footer';
import Toast from './components/ui/Toast';
import ChatbotWidget from './components/ai/ChatbotWidget';
import PageTransition from './components/landing/PageTransition';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Vehicles from './pages/Vehicles';
import VehicleDetail from './pages/VehicleDetail';
import BookingHistory from './pages/BookingHistory';
import Profile from './pages/Profile';
import Wallet from './pages/Wallet';
import Tracking from './pages/Tracking';
import ChargingStations from './pages/ChargingStations';
import Leaderboard from './pages/Leaderboard';
import CarbonTracker from './pages/CarbonTracker';
import AdminDashboard from './pages/AdminDashboard';
import AdminVehicles from './pages/AdminVehicles';
import AdminUsers from './pages/AdminUsers';
import AdminAnalytics from './pages/AdminAnalytics';
import NotFound from './pages/NotFound';

function ProtectedRoute({ children, adminOnly = false }) {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-400">Loading...</div>;
  if (!isAuthenticated) return <Navigate to="/login" />;
  if (adminOnly && !isAdmin) return <Navigate to="/dashboard" />;
  return children;
}

function AppLayout({ children, showSidebar = false, fullWidth = false }) {
  return (
    <div className="min-h-screen flex flex-col bg-brand-dark">
      <Navbar />
      <div className={`flex flex-1 w-full ${fullWidth ? '' : 'max-w-7xl mx-auto'}`}>
        {showSidebar && <Sidebar />}
        <PageTransition>{children}</PageTransition>
      </div>
      <Footer />
      <ChatbotWidget />
    </div>
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<AppLayout fullWidth><Home /></AppLayout>} />
      <Route path="/login" element={<AppLayout><Login /></AppLayout>} />
      <Route path="/register" element={<AppLayout><Register /></AppLayout>} />
      <Route path="/vehicles" element={<AppLayout showSidebar><Vehicles /></AppLayout>} />
      <Route path="/vehicles/:id" element={<AppLayout><VehicleDetail /></AppLayout>} />
      <Route path="/tracking" element={<AppLayout showSidebar><Tracking /></AppLayout>} />
      <Route path="/charging" element={<AppLayout showSidebar><ChargingStations /></AppLayout>} />
      <Route path="/leaderboard" element={<AppLayout><Leaderboard /></AppLayout>} />

      <Route path="/dashboard" element={<ProtectedRoute><AppLayout showSidebar><Dashboard /></AppLayout></ProtectedRoute>} />
      <Route path="/bookings" element={<ProtectedRoute><AppLayout showSidebar><BookingHistory /></AppLayout></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><AppLayout showSidebar><Profile /></AppLayout></ProtectedRoute>} />
      <Route path="/wallet" element={<ProtectedRoute><AppLayout showSidebar><Wallet /></AppLayout></ProtectedRoute>} />
      <Route path="/carbon" element={<ProtectedRoute><AppLayout showSidebar><CarbonTracker /></AppLayout></ProtectedRoute>} />

      <Route path="/admin" element={<ProtectedRoute adminOnly><AppLayout showSidebar><AdminDashboard /></AppLayout></ProtectedRoute>} />
      <Route path="/admin/vehicles" element={<ProtectedRoute adminOnly><AppLayout showSidebar><AdminVehicles /></AppLayout></ProtectedRoute>} />
      <Route path="/admin/users" element={<ProtectedRoute adminOnly><AppLayout showSidebar><AdminUsers /></AppLayout></ProtectedRoute>} />
      <Route path="/admin/analytics" element={<ProtectedRoute adminOnly><AppLayout showSidebar><AdminAnalytics /></AppLayout></ProtectedRoute>} />

      <Route path="*" element={<AppLayout><NotFound /></AppLayout>} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SocketProvider>
          <BookingProvider>
            <AppRoutes />
            <Toast />
          </BookingProvider>
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
