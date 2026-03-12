# 🔍 GlitchCraft CTF Platform

> A structured cybersecurity investigation platform for running real-time Capture The Flag events across multiple forensic domains.

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────┐
│                    GlitchCraft CTF                   │
├──────────────┬──────────────────┬───────────────────┤
│   Frontend   │    Backend API   │    PostgreSQL DB   │
│  React/Vite  │  Node.js/Express │    (via Prisma)   │
│  Port: 80    │   Port: 5000     │   Port: 5432      │
│              │   Socket.IO      │                   │
└──────────────┴──────────────────┴───────────────────┘
```

## 🚀 Quick Start

### Option 1: Docker (Recommended)

```bash
# Clone and configure
cp backend/.env.example backend/.env
# Edit backend/.env with your secrets

# Start everything
docker compose up -d

# Platform available at http://localhost
# Admin: admin@glitchcraft.io / glitchcraft_admin_2024
```

### Option 2: Local Development

**Prerequisites:** Node.js 20+, PostgreSQL 14+

```bash
# Backend
cd backend
npm install
cp .env.example .env
# Edit .env (set DATABASE_URL)

npx prisma migrate dev
node prisma/seed.js
npm run dev          # Starts on :5000

# Frontend (separate terminal)
cd frontend
npm install
npm run dev          # Starts on :5173
```

---

## 📁 Project Structure

```
glitchcraft/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma       # Database schema
│   │   └── seed.js             # Sample challenges + admin
│   ├── src/
│   │   ├── app.js              # Express entry point
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── challengeController.js
│   │   │   ├── submissionController.js
│   │   │   ├── scoreController.js
│   │   │   ├── hintController.js
│   │   │   └── adminController.js
│   │   ├── middleware/
│   │   │   └── auth.js         # JWT middleware
│   │   ├── routes/             # Express routers
│   │   └── socket/
│   │       └── scoreSocket.js  # Socket.IO real-time
│   └── Dockerfile
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── ChallengeCard.jsx
│   │   │   ├── GlitchText.jsx   # Scramble animation
│   │   │   └── Terminal.jsx     # Typewriter terminal
│   │   ├── pages/
│   │   │   ├── Landing.jsx      # Hero landing page
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Dashboard.jsx    # Challenge browser
│   │   │   ├── Challenge.jsx    # Challenge detail + submit
│   │   │   ├── Scoreboard.jsx   # Live rankings + chart
│   │   │   ├── Profile.jsx
│   │   │   └── Admin.jsx        # Full admin panel
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── hooks/
│   │   │   └── useSocket.js     # Socket.IO hook
│   │   └── services/
│   │       └── api.js           # Axios API layer
│   ├── nginx.conf
│   └── Dockerfile
│
└── docker-compose.yml
```

---

## 🎯 Challenge Categories (Pre-seeded)

| Category | Icon | Description |
|----------|------|-------------|
| Web Forensics | 🌐 | Source, cookies, headers |
| Steganography | 🖼️ | LSB, spectrogram, audio |
| Metadata | 📋 | EXIF, DOCX properties |
| Cryptography | 🔐 | Caesar, XOR, encoding |
| OSINT | 🔍 | Username enumeration, digital footprints |
| Digital Forensics | 🧪 | Memory dumps, PCAP analysis |

---

## 🔌 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register team |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/profile` | Get profile (auth) |

### Challenges
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/challenges` | List all active challenges |
| GET | `/api/challenges/:id` | Get challenge detail |
| GET | `/api/challenges/categories` | Get categories |

### Submissions
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/submissions` | Submit flag (auth) |
| GET | `/api/submissions/mine` | Team's submissions (auth) |

### Scores
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/scores` | Live scoreboard |
| GET | `/api/scores/history` | Score time series |
| GET | `/api/scores/stats` | Event stats |

### Admin (requires `isAdmin: true`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/POST | `/api/admin/challenges` | Manage challenges |
| GET/POST | `/api/admin/categories` | Manage categories |
| GET | `/api/admin/teams` | List teams |
| POST | `/api/admin/teams/:id/reset` | Reset team score |
| PUT | `/api/admin/config` | Update event settings |
| POST | `/api/admin/upload` | Upload challenge files |

---

## ⚡ Real-Time Events (Socket.IO)

| Event | Direction | Payload |
|-------|-----------|---------|
| `score:update` | Server → Client | `{ teamId, teamName, newScore, challenge }` |
| `scoreboard:update` | Server → Client | Full scoreboard array |
| `announcement` | Server → Client | `{ message, timestamp }` |

---

## 🔧 Environment Variables

```env
DATABASE_URL=postgresql://user:pass@localhost:5432/glitchcraft_db
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
ADMIN_SETUP_KEY=glitchcraft-admin-2024
MAX_FILE_SIZE=52428800
```

---

## 🎨 Design System

- **Fonts:** Orbitron (display) + Share Tech Mono (code) + Rajdhani (body)
- **Theme:** Deep void black with neon cyan/green/pink accents
- **Effects:** Scanlines, grid background, glitch animations, glow shadows
- **Colors:** `--neon-green`, `--neon-cyan`, `--neon-pink`, `--neon-orange`

---

## 🛡️ Security Features

- JWT authentication with auto-refresh
- Rate limiting on all endpoints (10 flag submissions/minute)
- Bcrypt password hashing (12 rounds)
- Helmet.js HTTP security headers
- Admin-only routes with middleware protection
- Flag never exposed in API responses

---

## 🏆 Scoring

- Points awarded immediately on correct submission
- Hints deduct points from team score if they have a cost
- Ties broken by alphabetical team name
- Real-time score updates via Socket.IO

---

**Built for GlitchCraft CTF 2024** | MIT License
