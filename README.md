<<<<<<< HEAD
# ⚡ RentX AI — Smart Vehicle Rental Platform

```
██████╗ ███████╗███╗   ██╗████████╗██╗  ██╗     █████╗ ██╗
██╔══██╗██╔════╝████╗  ██║╚══██╔══╝╚██╗██╔╝    ██╔══██╗██║
██████╔╝█████╗  ██╔██╗ ██║   ██║    ╚███╔╝     ███████║██║
██╔══██╗██╔══╝  ██║╚██╗██║   ██║    ██╔██╗     ██╔══██║██║
██║  ██║███████╗██║ ╚████║   ██║   ██╔╝ ██╗    ██║  ██║██║
╚═╝  ╚═╝╚══════╝╚═╝  ╚═══╝   ╚═╝   ╚═╝  ╚═╝    ╚═╝  ╚═╝╚═╝
```

Production-grade full-stack smart vehicle rental platform with AI assistant, real-time GPS tracking, surge pricing, EV charging, carbon tracking, and gamification.

## ✨ Features

- 🚗 **Multi-category fleet** — Cars, bikes, EVs, scooters, luxury, trucks
- 🤖 **RentX AI Chatbot** — GPT-4o powered assistant with voice input & quick replies
- 🧠 **AI Recommendations** — Smart vehicle scoring based on weather, traffic & budget
- 🚨 **AI Safety System** — GPS pattern analysis & SOS emergency alerts
- 📡 **Real-time tracking** — Socket.io live fleet map with Leaflet.js
- ⚡ **IoT Simulation** — GPS drift, battery/fuel depletion every 10 seconds
- 💳 **Payments** — Razorpay (test mode) + wallet with loyalty points
- 🌱 **Carbon Tracker** — CO₂ savings, trees equivalent, monthly trends
- 🏆 **Gamification** — Eco score, achievements, leaderboard
- 📊 **Admin Dashboard** — Revenue charts, heatmaps, fraud detection
- 🔋 **EV Charging** — Station map, slot booking, usage analytics
- 📄 **Digital Documents** — PDF invoices, rental agreements, e-signatures

## 🛠 Tech Stack

| Layer | Technologies |
|-------|-------------|
| Frontend | React, Vite, Tailwind CSS, Framer Motion, Leaflet, Recharts |
| Backend | Node.js, Express, Prisma, Socket.io, node-cron |
| Database | PostgreSQL |
| AI Service | Python, FastAPI, OpenAI GPT-4o, Gemini fallback |
| Payments | Razorpay (test mode) |
| Maps | Leaflet.js + Google Maps API |
| Auth | JWT + Bcrypt (httpOnly cookies) |

## 📁 Project Structure

```
rentx-ai/
├── client/          # React frontend (port 3000)
├── server/          # Express API (port 5000)
├── ai-service/      # FastAPI AI microservice (port 8000)
├── docker-compose.yml
└── .env.example
```

## 🚀 Setup Instructions

### Prerequisites

- Node.js 18+
- Python 3.10+
- PostgreSQL 15+
- npm or yarn

### 1. Clone & Configure

```bash
cd "RentX AI"
cp .env.example .env
cp .env.example server/.env
```

Edit `.env` and `server/.env` with your database URL and API keys.

### 2. Database Setup

```bash
# Start PostgreSQL (or use Docker)
docker-compose up postgres -d

cd server
npm install
npx prisma generate
npx prisma db push
npm run db:seed
```

### 3. Start Backend

```bash
cd server
npm run dev
```

### 4. Start AI Service

```bash
cd ai-service
pip install -r requirements.txt
# Edit ai-service/.env with OPENAI_API_KEY
uvicorn main:app --reload --port 8000
```

### 5. Start Frontend

```bash
cd client
npm install
npm run dev
```

Open **http://localhost:3000**

### Docker (All Services)

```bash
docker-compose up --build
```

## 🔑 Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@rentx.ai | password123 |
| Fleet Manager | fleet@rentx.ai | password123 |
| User | user1@rentx.ai | password123 |

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register user |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Current user |
| GET | `/api/vehicles` | List vehicles (filters) |
| GET | `/api/vehicles/:id` | Vehicle details |
| POST | `/api/bookings` | Create booking |
| PUT | `/api/bookings/:id/cancel` | Cancel with refund |
| POST | `/api/payments/create-order` | Razorpay order |
| POST | `/api/payments/verify` | Verify payment |
| POST | `/api/payments/wallet-pay` | Wallet payment |
| GET | `/api/gps/live` | Live vehicle locations |
| POST | `/api/emergency/sos` | Trigger SOS |
| GET | `/api/admin/stats` | Admin dashboard stats |
| POST | `http://localhost:8000/api/ai/chat` | AI chatbot |
| POST | `http://localhost:8000/api/ai/recommend` | AI recommendations |
| POST | `http://localhost:8000/api/ai/safety` | Safety analysis |

## 📸 Screenshots

> Placeholder — add screenshots after running the app:
> - Home page with AI Picks carousel
> - Live tracking map
> - Admin dashboard
> - AI Chatbot drawer

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

MIT License — see LICENSE file for details.

---

Built with ❤️ for smart, sustainable mobility in India.
=======
# RENTX-AI
>>>>>>> fbfe630e4d8c200fe1a498da5dfdf223d625f0da
