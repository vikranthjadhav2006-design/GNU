const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || "https://gnu-2f9b.onrender.com"
).replace(/\/+$/, "");

async function request(path, signal) {
  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      headers: { Accept: "application/json" },
      signal,
    });
  } catch (error) {
    if (error.name === "AbortError") throw error;
    throw new Error("Could not reach the events service. Check your connection and try again.");
  }

  if (!response.ok) {
    let detail = "";
    try {
      const body = await response.json();
      detail = body.error || "";
    } catch {
      detail = "";
    }

    throw new Error(
      detail
        ? `${detail} (HTTP ${response.status})`
        : `The events service returned HTTP ${response.status}.`,
    );
  }

  return response.json();
}

export async function fetchEvents(signal) {
  const body = await request("/api/events", signal);
  if (!body || !Array.isArray(body.events)) {
    throw new Error("The events service returned an unexpected response.");
  }
  return body.events;
}

export async function fetchEvent(id, signal) {
  const body = await request(`/api/events/${encodeURIComponent(id)}`, signal);
  if (!body || !body.event) {
    throw new Error("The events service returned an unexpected response.");
  }
  return body.event;
}
