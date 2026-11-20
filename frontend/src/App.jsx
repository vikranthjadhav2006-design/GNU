import { useEffect, useMemo, useState } from "react";
import { fetchEvent, fetchEvents } from "./api.js";

function ArrowIcon({ diagonal = false }) {
  return diagonal ? (
    <svg aria-hidden="true" viewBox="0 0 20 20" fill="none">
      <path d="M5 15 15 5M6 5h9v9" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  ) : (
    <svg aria-hidden="true" viewBox="0 0 20 20" fill="none">
      <path d="M3.5 10h12m-5-5 5 5-5 5" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
      <circle cx="10.8" cy="10.8" r="6.8" stroke="currentColor" strokeWidth="1.7" />
      <path d="m16 16 4 4" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" fill="none">
      <path d="m5 5 10 10M15 5 5 15" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  );
}

function formatStatus(status) {
  if (!status) return "Status unavailable";
  return status.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function EventDialog({ eventId, onClose }) {
  const [event, setEvent] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    setEvent(null);
    setError("");

    fetchEvent(eventId, controller.signal)
      .then(setEvent)
      .catch((requestError) => {
        if (requestError.name !== "AbortError") setError(requestError.message);
      });

    return () => controller.abort();
  }, [eventId]);

  useEffect(() => {
    function closeOnEscape(event) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [onClose]);

  return (
    <div
      className="dialog-backdrop"
      onMouseDown={(mouseEvent) => {
        if (mouseEvent.target === mouseEvent.currentTarget) onClose();
      }}
    >
      <section
        className="event-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
      >
        <button className="icon-button dialog-close" onClick={onClose} aria-label="Close details">
          <CloseIcon />
        </button>
        <span className="eyebrow">EVENT DETAILS</span>
        {error ? (
          <div className="dialog-message error-message" role="alert">
            <p>{error}</p>
            <button className="text-button" onClick={onClose}>Close</button>
          </div>
        ) : event ? (
          <>
            <h2 id="dialog-title">{event.title}</h2>
            <p className="dialog-intro">Here are the details currently available for this event.</p>
            <div className="detail-grid">
              <div className="detail-tile">
                <span className="detail-label">STATUS</span>
                <span className="detail-value">
                  <i className={`status-dot ${String(event.status).toLowerCase()}`} />
                  {formatStatus(event.status)}
                </span>
              </div>
              <div className="detail-tile">
                <span className="detail-label">CAPACITY</span>
                <span className="detail-value">
                  {Number.isFinite(event.capacity) ? event.capacity : "Not specified"}
                </span>
              </div>
            </div>
          </>
        ) : (
          <div className="dialog-loading" role="status">
            <span className="spinner" />
            Loading event details…
          </div>
        )}
      </section>
    </div>
  );
}

function EventCard({ event, index, onSelect }) {
  const status = String(event.status || "unknown").toLowerCase();
  return (
    <article className={`event-card card-tone-${index % 3}`}>
      <div className="card-art" aria-hidden="true">
        <span className="art-orbit orbit-one" />
        <span className="art-orbit orbit-two" />
        <span className="art-shape">{String(event.title || "E").slice(0, 1).toUpperCase()}</span>
        <span className="art-caption">GATHER / {String(index + 1).padStart(2, "0")}</span>
      </div>
      <div className="card-content">
        <div className="card-meta">
          <span className="status-label">
            <i className={`status-dot ${status}`} />
            {formatStatus(event.status)}
          </span>
          <span className="capacity-label">
            {Number.isFinite(event.capacity) ? `${event.capacity} capacity` : "Capacity n/a"}
          </span>
        </div>
        <h3>{event.title || "Untitled event"}</h3>
        <button className="card-link" onClick={() => onSelect(event.id)}>
          Explore event <ArrowIcon diagonal />
        </button>
      </div>
    </article>
  );
}

export default function App() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError("");

    fetchEvents(controller.signal)
      .then(setEvents)
      .catch((requestError) => {
        if (requestError.name !== "AbortError") setError(requestError.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [reloadKey]);

  const statuses = useMemo(
    () => [...new Set(events.map((event) => String(event.status || "").toLowerCase()).filter(Boolean))],
    [events],
  );

  const filteredEvents = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return events.filter((event) => {
      const matchesQuery = String(event.title || "").toLowerCase().includes(normalizedQuery);
      const matchesStatus =
        selectedStatus === "all" || String(event.status || "").toLowerCase() === selectedStatus;
      return matchesQuery && matchesStatus;
    });
  }, [events, query, selectedStatus]);

  return (
    <div className="site-shell">
      <header className="topbar">
        <a className="brand" href="#" aria-label="Gather home">
          <span className="brand-mark" aria-hidden="true">g</span>
          <span>gather<span className="brand-period">.</span></span>
        </a>
        <nav className="top-nav" aria-label="Main navigation">
          <a className="nav-active" href="#events">Discover</a>
          <a href="#about">About</a>
        </nav>
        <a className="nav-cta" href="#events">
          Find an event <ArrowIcon />
        </a>
      </header>

      <main>
        <section className="hero" id="about">
          <div className="hero-copy">
            <span className="eyebrow"><span className="eyebrow-star">✳</span> GOOD THINGS HAPPEN TOGETHER</span>
            <h1>Make room<br />for <em>something</em><br />good.</h1>
            <p className="hero-description">
              Find a gathering worth showing up for. Browse what’s happening and pick your next experience.
            </p>
            <a className="primary-button" href="#events">
              Explore events <ArrowIcon />
            </a>
            <div className="hero-note">
              <span className="note-line" />
              <span>Curated for curious people</span>
            </div>
          </div>
          <div className="hero-visual" aria-hidden="true">
            <div className="visual-sun" />
            <div className="visual-ring ring-a" />
            <div className="visual-ring ring-b" />
            <div className="visual-card">
              <span className="visual-card-kicker">YOUR NEXT<br />GOOD THING</span>
              <span className="visual-card-star">✳</span>
              <span className="visual-card-footer">IS CLOSER THAN YOU THINK</span>
            </div>
            <span className="visual-side-note">SHOW UP / OPEN UP / JOIN IN</span>
            <span className="visual-index">01 — ∞</span>
          </div>
          <a className="scroll-cue" href="#events"><span /> SCROLL TO DISCOVER</a>
        </section>

        <section className="events-section" id="events">
          <div className="section-heading">
            <div>
              <span className="eyebrow">THE GOOD STUFF</span>
              <h2>Find your <em>people.</em></h2>
            </div>
            <p className="section-aside">A little curiosity goes a long way.<br />See what’s waiting for you.</p>
          </div>

          <div className="events-toolbar">
            <div className="events-count">
              <span className="count-number">{loading ? "—" : String(filteredEvents.length).padStart(2, "0")}</span>
              <span>{loading ? "Loading events" : filteredEvents.length === 1 ? "EVENT TO EXPLORE" : "EVENTS TO EXPLORE"}</span>
            </div>
            <div className="filter-controls">
              <label className="search-field">
                <SearchIcon />
                <input
                  type="search"
                  placeholder="Find an event"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  aria-label="Search events"
                />
              </label>
              <label className="status-select-label">
                <span className="sr-only">Filter by status</span>
                <select value={selectedStatus} onChange={(event) => setSelectedStatus(event.target.value)}>
                  <option value="all">All statuses</option>
                  {statuses.map((status) => (
                    <option key={status} value={status}>{formatStatus(status)}</option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          {error ? (
            <div className="state-panel error-panel" role="alert">
              <span className="state-icon">!</span>
              <div>
                <h3>Events aren’t available right now.</h3>
                <p>{error}</p>
              </div>
              <button className="secondary-button" onClick={() => setReloadKey((key) => key + 1)}>
                Try again <ArrowIcon />
              </button>
            </div>
          ) : loading ? (
            <div className="state-panel loading-panel" role="status">
              <span className="spinner" />
              <span>Finding the good stuff…</span>
            </div>
          ) : filteredEvents.length > 0 ? (
            <div className="event-grid">
              {filteredEvents.map((event, index) => (
                <EventCard key={event.id} event={event} index={index} onSelect={setSelectedEventId} />
              ))}
            </div>
          ) : (
            <div className="state-panel empty-panel">
              <span className="state-icon">✳</span>
              <div>
                <h3>{events.length ? "No events match that search." : "The calendar is taking a breather."}</h3>
                <p>{events.length ? "Try a different name or status." : "Check back soon for something good."}</p>
              </div>
              {(query || selectedStatus !== "all") && (
                <button className="text-button" onClick={() => { setQuery(""); setSelectedStatus("all"); }}>
                  Clear filters
                </button>
              )}
            </div>
          )}
        </section>
      </main>

      <footer className="footer">
        <a className="brand footer-brand" href="#" aria-label="Gather home">
          <span className="brand-mark" aria-hidden="true">g</span>
          <span>gather<span className="brand-period">.</span></span>
        </a>
        <span>Make a little space for good things.</span>
        <a href="#events">BACK TO EVENTS ↑</a>
      </footer>

      {selectedEventId && (
        <EventDialog eventId={selectedEventId} onClose={() => setSelectedEventId(null)} />
      )}
    </div>
  );
}
