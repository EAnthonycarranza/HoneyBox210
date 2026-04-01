import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const Events = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { window.scrollTo(0, 0); }, []);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await axios.get('/api/events');
        setEvents(res.data.events || []);
      } catch (err) {
        console.error('Failed to load events');
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const now = new Date();
  const upcoming = events.filter(e => new Date(e.date) >= now).sort((a, b) => new Date(a.date) - new Date(b.date));
  const past = events.filter(e => new Date(e.date) < now).sort((a, b) => new Date(b.date) - new Date(a.date));

  const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  const EventCard = ({ event, isPast }) => (
    <div className={`hb-ev-card ${isPast ? 'hb-ev-card-past' : ''}`}>
      {event.image && (
        <div className="hb-ev-card-img">
          <img src={event.image} alt={event.title} />
        </div>
      )}
      <div className="hb-ev-card-body">
        <span className="hb-ev-card-date">{formatDate(event.date)}{event.endDate ? ` – ${formatDate(event.endDate)}` : ''}</span>
        <h3 className="hb-ev-card-title">{event.title}</h3>
        <p className="hb-ev-card-location">📍 {event.location}</p>
        <p className="hb-ev-card-desc">{event.description}</p>
      </div>
    </div>
  );

  return (
    <div className="hb-ev-page">
      <div className="hb-ev-container">
        <h1 className="hb-ev-heading">Events</h1>
        <p className="hb-ev-subheading">See where Honey Box 210 will be next!</p>

        {loading ? (
          <div className="hb-ev-loading"><div className="hb-ev-spinner" /></div>
        ) : events.length === 0 ? (
          <div className="hb-ev-empty">
            <p>No events posted yet. Check back soon!</p>
          </div>
        ) : (
          <>
            {upcoming.length > 0 && (
              <section className="hb-ev-section">
                <h2 className="hb-ev-section-title">Upcoming Events</h2>
                <div className="hb-ev-grid">
                  {upcoming.map(e => <EventCard key={e._id} event={e} />)}
                </div>
              </section>
            )}

            {past.length > 0 && (
              <section className="hb-ev-section">
                <h2 className="hb-ev-section-title">Past Events</h2>
                <div className="hb-ev-grid">
                  {past.map(e => <EventCard key={e._id} event={e} isPast />)}
                </div>
              </section>
            )}
          </>
        )}

        <div className="hb-ev-cta">
          <h2 className="hb-ev-cta-title">Want Honey Box 210 at Your Event?</h2>
          <p className="hb-ev-cta-text">
            We'd love to be part of your corporate event, wedding, festival, or celebration!
          </p>
          <Link to="/request-quote" className="hb-ev-cta-btn">Request a Quote</Link>
        </div>
      </div>

      <style>{`
        .hb-ev-page { background: #fafaf7; min-height: 100vh; padding: 110px 0 80px; }
        .hb-ev-container { max-width: 1000px; margin: 0 auto; padding: 0 24px; }
        .hb-ev-heading {
          font-family: 'Playfair Display', serif; font-weight: 900;
          font-size: clamp(2rem, 5vw, 3rem); color: #2c2c2c; margin-bottom: 8px;
        }
        .hb-ev-subheading { font-family: 'Inter', sans-serif; color: #777; font-size: 1rem; margin-bottom: 48px; }
        .hb-ev-loading { display: flex; justify-content: center; padding: 80px 0; }
        .hb-ev-spinner {
          width: 44px; height: 44px; border: 4px solid #f0f0f0;
          border-top-color: #d4a843; border-radius: 50%; animation: evSpin 0.8s linear infinite;
        }
        @keyframes evSpin { to { transform: rotate(360deg); } }
        .hb-ev-empty { text-align: center; padding: 60px 20px; color: #999; font-family: 'Inter', sans-serif; }
        .hb-ev-section { margin-bottom: 48px; }
        .hb-ev-section-title {
          font-family: 'Playfair Display', serif; font-weight: 700; font-size: 1.5rem;
          color: #2c2c2c; margin-bottom: 24px; padding-bottom: 12px; border-bottom: 1px solid #e0d9cc;
        }
        .hb-ev-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 24px; }
        .hb-ev-card {
          background: #fff; border-radius: 12px; overflow: hidden;
          box-shadow: 0 2px 10px rgba(0,0,0,0.06); transition: transform 0.3s;
        }
        .hb-ev-card:hover { transform: translateY(-3px); }
        .hb-ev-card-past { opacity: 0.75; }
        .hb-ev-card-img { width: 100%; height: 200px; overflow: hidden; }
        .hb-ev-card-img img { width: 100%; height: 100%; object-fit: cover; }
        .hb-ev-card-body { padding: 20px; }
        .hb-ev-card-date {
          font-family: 'Inter', sans-serif; font-size: 0.8rem; color: #d4a843; font-weight: 600;
          text-transform: uppercase; letter-spacing: 0.5px;
        }
        .hb-ev-card-title {
          font-family: 'Playfair Display', serif; font-weight: 700; font-size: 1.2rem;
          color: #2c2c2c; margin: 8px 0;
        }
        .hb-ev-card-location { font-family: 'Inter', sans-serif; font-size: 0.85rem; color: #888; margin-bottom: 8px; }
        .hb-ev-card-desc { font-family: 'Inter', sans-serif; font-size: 0.9rem; color: #555; line-height: 1.6; }
        .hb-ev-cta {
          margin-top: 48px; padding: 48px 36px; background: #fff; border-radius: 16px;
          text-align: center; box-shadow: 0 2px 12px rgba(0,0,0,0.06);
        }
        .hb-ev-cta-title { font-family: 'Playfair Display', serif; font-weight: 700; font-size: 1.6rem; color: #2c2c2c; margin-bottom: 12px; }
        .hb-ev-cta-text { font-family: 'Inter', sans-serif; color: #666; font-size: 1rem; margin-bottom: 24px; }
        .hb-ev-cta-btn {
          display: inline-block; padding: 14px 36px; background: #d4a843; color: #fff;
          text-decoration: none; border-radius: 50px; font-family: 'Inter', sans-serif;
          font-weight: 600; font-size: 0.9rem; letter-spacing: 1px; transition: opacity 0.2s;
        }
        .hb-ev-cta-btn:hover { opacity: 0.85; }
        @media (max-width: 700px) {
          .hb-ev-page { padding: 90px 0 60px; }
          .hb-ev-grid { grid-template-columns: 1fr; }
          .hb-ev-cta { padding: 36px 24px; }
        }
      `}</style>
    </div>
  );
};

export default Events;
