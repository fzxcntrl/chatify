# Chatify

Chatify is a full-stack real-time chat application built for smooth one-to-one communication. It combines authentication, messaging, contact management, media sharing, live presence, and location-sharing features in a responsive React interface backed by Express, MongoDB, and Socket.IO.

## Features

- Real-time one-to-one messaging with Socket.IO
- User signup, login, logout, and protected routes using JWT authentication
- Friend discovery, friend requests, request acceptance, and contact removal
- Online and offline presence indicators
- Message delivery and read-status tracking
- Edit message, delete message, and delete full conversation actions
- Image sharing with Cloudinary uploads
- Profile management with avatar, bio, theme, chat background, and marker customization
- Live location request and sharing flow between users
- Optional disappearing chats when a user goes offline
- Optional welcome email support through Gmail SMTP
- Arcjet-based protection middleware on API routes
- Responsive frontend for desktop and mobile use

## Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | React 19, Vite, Tailwind CSS, Zustand |
| Backend | Node.js, Express |
| Database | MongoDB with Mongoose |
| Realtime | Socket.IO |
| Authentication | JWT, bcryptjs, cookies, auth headers |
| Media Storage | Cloudinary |
| Email | Nodemailer with Gmail SMTP |
| Security | Arcjet |

## Documentation

- [ER_Diagram.md](./ER_Diagram.md)

## Project Structure

```text
chatify/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── emails/
│   │   ├── lib/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   └── server.js
│   ├── .env
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── lib/
│   │   ├── pages/
│   │   ├── store/
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── .env
│   └── package.json
├── .github/workflows/
├── package.json
├── README.MD
└── ER_Diagram.md
```

## Prerequisites

- Node.js `>=20.0.0`
- MongoDB local instance or MongoDB Atlas
- Cloudinary account for media uploads

## Environment Setup

### Backend

Create the backend environment file:

```bash
cp backend/.env.example backend/.env
```

Configure these values in `backend/.env`:

| Variable | Required | Description |
| --- | --- | --- |
| `PORT` | No | Backend port. Default: `3000` |
| `NODE_ENV` | No | Environment name. Default: `development` |
| `MONGO_URI` | Yes | MongoDB connection string |
| `JWT_SECRET` | Yes | Secret used to sign authentication tokens |
| `CLIENT_URL` | No | Allowed frontend origin or comma-separated origins |
| `CLOUDINARY_URL` | Yes if not using keys | Full Cloudinary connection URL |
| `CLOUDINARY_CLOUD_NAME` | Yes if not using `CLOUDINARY_URL` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Yes if not using `CLOUDINARY_URL` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Yes if not using `CLOUDINARY_URL` | Cloudinary API secret |
| `GMAIL_USER` | No | Gmail address for optional welcome emails |
| `GMAIL_APP_PASSWORD` | No | Gmail app password for Nodemailer |
| `EMAIL_FROM_NAME` | No | Sender name for outgoing email |
| `ARCJET_KEY` | No | Arcjet API key |
| `ARCJET_ENV` | No | Arcjet environment. Default: `development` |

Example `CLIENT_URL` values:

```env
CLIENT_URL=http://localhost:5173
```

```env
CLIENT_URL=http://localhost:5173,https://your-frontend.vercel.app
```

### Frontend

The frontend can run without extra environment variables for local development. If you deploy the frontend separately, you can add `frontend/.env` values like:

| Variable | Required | Description |
| --- | --- | --- |
| `VITE_APP_NAME` | No | App display name |
| `VITE_API_URL` | No | Backend base URL used outside local development |

## Installation

Install dependencies from the project root:

```bash
npm run build
```

This installs backend and frontend dependencies and also builds the frontend once.

## Run Locally

Start the backend:

```bash
npm run dev:backend
```

Start the frontend in a second terminal:

```bash
npm run dev:frontend
```

Default local URLs:

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:3000`

## Important API Areas

- Auth: signup, login, logout, update profile, update password, delete account
- Friends: search users, get suggestions, send request, accept request, decline request, remove contact
- Messages: contacts, chats, send message, read receipts, update message, delete message, delete conversation
- Health: `GET /api/health`

## Database Summary

The project uses three core collections:

- `User`
- `Message`
- `FriendRequest`

For the entity relationships and attribute overview, see [ER_Diagram.md](./ER_Diagram.md).

## Deployment Notes

This repo is structured as separate frontend and backend applications.

- The frontend can be deployed on platforms like Vercel.
- The backend can be deployed on platforms like Render or Railway.
- When deployed separately, set `VITE_API_URL` on the frontend and `CLIENT_URL` on the backend to the correct deployed origins.
- The backend exposes `GET /api/health` for monitoring and keep-alive checks.
- A workflow already exists at `.github/workflows/keep-alive.yml`.

## License

ISC
