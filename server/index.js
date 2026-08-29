import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { createServer } from 'http';
import { Server } from 'socket.io';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const clientDist = path.resolve(__dirname, '../client/dist');
const hasClientBuild =
  fs.existsSync(path.join(clientDist, 'index.html')) &&
  fs.existsSync(path.join(clientDist, 'assets'));

import { errorHandler } from './src/middleware/errorHandler.js';
import { apiLimiter } from './src/middleware/rateLimiter.js';
import { initSocket } from './src/socket/socketHandler.js';
import { startIoTSimulator } from './src/jobs/iotSimulator.js';
import { ensureMinimumVehicles } from './src/utils/ensureVehicles.js';

import authRoutes from './src/routes/auth.routes.js';
import userRoutes from './src/routes/user.routes.js';
import vehicleRoutes from './src/routes/vehicle.routes.js';
import bookingRoutes from './src/routes/booking.routes.js';
import paymentRoutes from './src/routes/payment.routes.js';
import gpsRoutes from './src/routes/gps.routes.js';
import maintenanceRoutes from './src/routes/maintenance.routes.js';
import chargingRoutes from './src/routes/charging.routes.js';
import reviewRoutes from './src/routes/review.routes.js';
import notificationRoutes from './src/routes/notification.routes.js';
import adminRoutes from './src/routes/admin.routes.js';
import emergencyRoutes from './src/routes/emergency.routes.js';

const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 5000;

const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:5000',
  'http://127.0.0.1:5000',
].filter(Boolean);

const io = new Server(httpServer, {
  cors: {
    origin: (origin, cb) => {
      if (!origin) return cb(null, true);
      return cb(null, allowedOrigins.includes(origin));
    },
    credentials: true,
  },
});

app.set('io', io);

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: false,
  })
);
app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true);
      return cb(null, allowedOrigins.includes(origin));
    },
    credentials: true,
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use('/api', apiLimiter);

app.get('/health', (req, res) => {
  res.json({ success: true, message: 'RentX AI Server is running', timestamp: new Date() });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/gps', gpsRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/charging', chargingRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/emergency', emergencyRoutes);

if (hasClientBuild) {
  app.use(express.static(clientDist, { index: false }));
  app.get('*', (req, res, next) => {
    if (
      req.path.startsWith('/api') ||
      req.path.startsWith('/socket.io') ||
      req.path === '/health'
    ) {
      return next();
    }
    if (path.extname(req.path)) {
      return res.status(404).send('Not found');
    }
    res.sendFile(path.join(clientDist, 'index.html'), (err) => {
      if (err) next(err);
    });
  });
  console.log(`🌐 Serving React app from ${clientDist}`);
}

app.use(errorHandler);

initSocket(io);
startIoTSimulator(io);

httpServer.listen(PORT, async () => {
  console.log(`🚀 RentX AI Server running on port ${PORT}`);
  if (hasClientBuild) console.log(`   App UI: http://localhost:${PORT}`);
  console.log(`📡 Socket.io ready`);
  console.log(`🤖 IoT Simulator active`);
  if (!hasClientBuild) {
    console.warn(
      '⚠️  Frontend build missing or incomplete. Run: cd client && node node_modules/vite/bin/vite.js build'
    );
  }
  try {
    await ensureMinimumVehicles();
  } catch (err) {
    console.error('[DB] Vehicle bootstrap failed:', err.message);
  }
});

export default app;
