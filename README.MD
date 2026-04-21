# Chatify

Real-time messaging, beautifully simple. A full-stack chat application with custom authentication, live presence indicators, image sharing, and a warm, distinctive UI.

## Features

- **Real-time messaging** — instant delivery via Socket.IO
- **Custom JWT auth** — httpOnly cookies, no third-party auth dependency
- **Online/offline presence** — live indicators across contacts and conversations
- **Image sharing** — upload and send images inline via Cloudinary
- **Profile photos** — upload and change your avatar anytime
- **Notification sounds** — keystroke and message sounds with a toggle
- **Welcome emails** — branded onboarding email sent via Resend (optional)
- **Rate limiting & bot protection** — powered by Arcjet (optional)
- **Optimistic messaging** — messages appear instantly before server confirmation
- **Responsive design** — sidebar collapses on mobile with back navigation
- **Keyboard shortcuts** — ESC to close a conversation

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite, Tailwind CSS, Zustand |
| Backend | Node.js, Express |
| Database | MongoDB (Mongoose) |
| Real-time | Socket.IO |
| Auth | JWT (httpOnly cookies, bcrypt) |
| File uploads | Cloudinary |
| Email | Resend |
| Security | Arcjet (rate limiting, bot detection, shield) |

## Prerequisites

- **Node.js** ≥ 20.0.0
- **MongoDB** — local instance or [MongoDB Atlas](https://www.mongodb.com/atlas) (free tier works)

## Getting Started

### 1. Clone & install

```bash
git clone <your-repo-url>
cd chatify
npm run build    # installs both backend + frontend deps, builds frontend
```

### 2. Configure environment

```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env` and fill in the required values:

| Variable | Required | Description |
|----------|----------|-------------|
| `MONGO_URI` | ✅ | MongoDB connection string |
| `JWT_SECRET` | ✅ | Random secret for signing tokens |
| `CLOUDINARY_CLOUD_NAME` | ✅ | Cloudinary dashboard → cloud name |
| `CLOUDINARY_API_KEY` | ✅ | Cloudinary dashboard → API key |
| `CLOUDINARY_API_SECRET` | ✅ | Cloudinary dashboard → API secret |
| `CLIENT_URL` | — | Frontend URL (default: `http://localhost:5173`) |
| `PORT` | — | Backend port (default: `3000`) |
| `NODE_ENV` | — | `development` or `production` |
| `RESEND_API_KEY` | — | Optional — enables welcome emails |
| `EMAIL_FROM` | — | Sender address for emails |
| `EMAIL_FROM_NAME` | — | Sender display name (default: `Chatify`) |
| `ARCJET_KEY` | — | Optional — enables rate limiting |

**Generate a JWT secret:**

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 3. MongoDB setup

**Local MongoDB:**
```bash
# macOS (Homebrew)
brew services start mongodb-community
# Use: MONGO_URI=mongodb://localhost:27017/chatify
```

**MongoDB Atlas (cloud):**
1. Create a free cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Add your IP to the whitelist (or use `0.0.0.0/0` for development)
3. Create a database user
4. Copy the connection string → set as `MONGO_URI`

### 4. Run locally

```bash
# Terminal 1 — Backend (port 3000)
npm run dev:backend

# Terminal 2 — Frontend (port 5173)
npm run dev:frontend
```

### 5. Production build & start

```bash
npm run build   # installs deps + builds frontend
npm start       # starts backend, serves frontend from dist/
```

The app will be available at `http://localhost:3000`.

## Project Structure

```
chatify/
├── backend/
│   ├── src/
│   │   ├── controllers/     # Route handlers
│   │   ├── emails/          # Email templates & handlers
│   │   ├── lib/             # DB, env, socket, cloudinary, utils
│   │   ├── middleware/      # Auth, socket auth, rate limiting
│   │   ├── models/          # Mongoose schemas (User, Message)
│   │   ├── routes/          # Express route definitions
│   │   └── server.js        # App entry point
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── public/              # Static assets (favicon, sounds, avatar)
│   ├── src/
│   │   ├── components/      # UI components
│   │   ├── hooks/           # Custom hooks
│   │   ├── lib/             # Axios instance
│   │   ├── pages/           # Route pages
│   │   ├── store/           # Zustand stores
│   │   ├── App.jsx
│   │   ├── index.css        # Design system tokens
│   │   └── main.jsx
│   └── package.json
├── package.json              # Root scripts (build, start, dev)
└── README.md
```

## Deployment

This project is ready for single-server deployment on platforms like [Render](https://render.com), [Railway](https://railway.app), or [Sevalla](https://sevalla.com):

1. Set the **build command** to `npm run build`
2. Set the **start command** to `npm start`
3. Configure all required env vars in the platform's dashboard
4. Set `NODE_ENV=production`
5. Set `CLIENT_URL` to your deployed URL (or leave unset — production serves the frontend from the same origin)

The backend will serve the built frontend assets in production mode automatically.

### Keep-alive health checks

The API now exposes `GET /api/health` for uptime checks.

If you use GitHub Actions, add a repository secret named `KEEP_ALIVE_URL` with your deployed health-check URL, for example:

```bash
https://your-backend.example.com/api/health
```

The bundled workflow at `.github/workflows/keep-alive.yml` pings that endpoint every 12 minutes so low-traffic deployments are less likely to idle.

## License

ISC
# chatify
