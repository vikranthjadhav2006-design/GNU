# Events API

## Deploy on Render

Push this folder to a Git repository and create a Render Blueprint from that
repository using `render.yaml`. Set `SUPABASE_URL` and
`SUPABASE_PUBLISHABLE_KEY` in the service's environment variables in the
Render dashboard. Do not upload or commit your local `.env` file.

Render installs the packages in `requirements.txt` and runs the app with
Gunicorn. The health endpoint is `GET /`; event endpoints are:

- `GET /api/events`
- `GET /api/events/<event_id>`

The event endpoints are public and CORS allows requests from any origin.
