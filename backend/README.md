# Events API

## Deploy on Render

In Render, create a Web Service from this repository and set its Root
Directory to `backend`. Use `pip install -r requirements.txt` as the build
command and `gunicorn --bind 0.0.0.0:$PORT app:app` as the start command.
Set `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY` in the service's environment
variables in the Render dashboard. Do not upload or commit your local `.env`
file.

`render.yaml` contains the service configuration. The health endpoint is
`GET /`; event endpoints are:

- `GET /api/events`
- `GET /api/events/<event_id>`

The event endpoints are public and CORS allows requests from any origin.
