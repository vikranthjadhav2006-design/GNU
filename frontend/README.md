# Gather frontend

React + Vite event browser connected to the public Flask API.

## Run locally

1. Copy `.env.example` to `.env.local` and set `VITE_API_BASE_URL` to the backend URL.
2. Install dependencies with `npm install`.
3. Start the development server with `npm run dev`.

The app reads `GET /api/events` and `GET /api/events/<event_id>`. No login,
authentication, or registration flow is included. `.env.local` is local-only
and ignored by Git.

## Build

Run `npm run build`; Vite writes the static site to `dist/`. When deploying
the frontend separately, set `VITE_API_BASE_URL` to the backend URL in the
frontend host's build-time environment.
