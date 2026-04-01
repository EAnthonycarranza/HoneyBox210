import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import GooglePlacesInput from '../components/GooglePlacesInput';

const RequestQuote = () => {
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', phone: '', company: '', eventType: '',
    eventDate: '', eventLocation: '', guestCount: '', details: '',
  });
  const onLocationSelected = useCallback((place) => {
    setForm((prev) => ({ ...prev, eventLocation: place.formatted }));
  }, []);

  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { window.scrollTo(0, 0); }, []);

  const handleChange = (e) => {
    const { name: fieldName, value: fieldValue } = e.target;
    setForm((prev) => ({ ...prev, [fieldName]: fieldValue }));
  };

const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    if (!form.eventLocation) {
      setError('Please enter an event location.');
      setSubmitting(false);
      return;
    }
    try {
      const { firstName, lastName, ...rest } = form;
      await axios.post('/api/quotes', {
        ...rest,
        name: `${firstName} ${lastName}`.trim()
      });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="hb-rq-page">
        <div className="hb-rq-container" style={{ textAlign: 'center', paddingTop: '60px' }}>
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>✓</div>
          <h1 className="hb-rq-heading">Quote Request Submitted!</h1>
          <p style={{ fontFamily: "'Inter', sans-serif", color: '#555', fontSize: '1.05rem', marginBottom: '24px' }}>
            Thank you! We'll review your request and get back to you soon.
          </p>
        </div>
        <style>{styles}</style>
      </div>
    );
  }

  return (
    <div className="hb-rq-page">
      <div className="hb-rq-container">
        <h1 className="hb-rq-heading">Request a Quote</h1>
        <p className="hb-rq-subheading">
          Want Honey Box 210 at your next event? Fill out the form below and we'll get back to you
          with a custom quote. Perfect for corporate events, weddings, festivals, and more!
        </p>

        {error && <div className="hb-rq-error">{error}</div>}

        <form className="hb-rq-form" onSubmit={handleSubmit}>
          <div className="hb-rq-row">
            <div className="hb-rq-field">
              <label>First Name *</label>
              <input type="text" name="firstName" value={form.firstName} onChange={handleChange} required placeholder="First name" />
            </div>
            <div className="hb-rq-field">
              <label>Last Name *</label>
              <input type="text" name="lastName" value={form.lastName} onChange={handleChange} required placeholder="Last name" />
            </div>
          </div>

          <div className="hb-rq-field">
            <label>Email *</label>
            <input type="email" name="email" value={form.email} onChange={handleChange} required placeholder="your@email.com" />
          </div>

          <div className="hb-rq-row">
            <div className="hb-rq-field">
              <label>Phone</label>
              <input type="tel" name="phone" value={form.phone} onChange={handleChange} placeholder="(210) 555-0000" />
            </div>
            <div className="hb-rq-field">
              <label>Company / Organization</label>
              <input type="text" name="company" value={form.company} onChange={handleChange} placeholder="Company name" />
            </div>
          </div>

          <div className="hb-rq-row">
            <div className="hb-rq-field">
              <label>Event Type *</label>
              <select name="eventType" value={form.eventType} onChange={handleChange} required>
                <option value="">Select event type</option>
                <option value="corporate">Corporate Event</option>
                <option value="wedding">Wedding</option>
                <option value="birthday">Birthday Party</option>
                <option value="holiday">Holiday Party</option>
                <option value="fundraiser">Fundraiser</option>
                <option value="festival">Festival / Market</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="hb-rq-field">
              <label>Estimated Guest Count</label>
              <input type="text" name="guestCount" value={form.guestCount} onChange={handleChange} placeholder="e.g. 50-100" />
            </div>
          </div>

          <div className="hb-rq-row">
            <div className="hb-rq-field">
              <label>Event Date *</label>
              <input type="date" name="eventDate" value={form.eventDate} onChange={handleChange} required />
            </div>
            <div className="hb-rq-field">
              <label>Event Location *</label>
              <GooglePlacesInput
                name="eventLocation"
                value={form.eventLocation}
                onChange={handleChange}
                onPlaceSelected={onLocationSelected}
                placeholder="Start typing a venue or address..."
              />
            </div>
          </div>

          <div className="hb-rq-field">
            <label>Event Details</label>
            <textarea name="details" value={form.details} onChange={handleChange} rows="5"
              placeholder="Tell us about your event — what you're looking for, any special requests, etc." />
          </div>

          <button type="submit" className="hb-rq-btn" disabled={submitting}>
            {submitting ? 'Submitting...' : 'Submit Quote Request'}
          </button>
        </form>
      </div>
      <style>{styles}</style>
    </div>
  );
};

const styles = `
  .hb-rq-page { background: #fafaf7; min-height: 100vh; padding: 110px 0 80px; }
  .hb-rq-container { max-width: 700px; margin: 0 auto; padding: 0 24px; }
  .hb-rq-heading {
    font-family: 'Playfair Display', serif; font-weight: 900;
    font-size: clamp(2rem, 5vw, 3rem); color: #2c2c2c; margin-bottom: 12px;
  }
  .hb-rq-subheading { font-family: 'Inter', sans-serif; color: #555; font-size: 1rem; line-height: 1.7; margin-bottom: 36px; }
  .hb-rq-error {
    background: rgba(220,38,38,0.08); border: 1px solid #dc2626; color: #c62828;
    padding: 14px 20px; border-radius: 10px; font-family: 'Inter', sans-serif;
    font-size: 0.95rem; margin-bottom: 24px;
  }
  .hb-rq-form { display: flex; flex-direction: column; gap: 20px; }
  .hb-rq-row { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
  .hb-rq-field { display: flex; flex-direction: column; gap: 6px; }
  .hb-rq-field label { font-family: 'Inter', sans-serif; color: #2c2c2c; font-size: 0.85rem; font-weight: 600; }
  .hb-rq-field input, .hb-rq-field select, .hb-rq-field textarea {
    padding: 12px 16px; background: #fff; border: 2px solid #e0e0e0; border-radius: 8px;
    font-family: 'Inter', sans-serif; font-size: 1rem; color: #2c2c2c; outline: none;
    transition: border-color 0.2s; width: 100%; box-sizing: border-box;
  }
  .hb-rq-field input:focus, .hb-rq-field select:focus, .hb-rq-field textarea:focus { border-color: #d4a843; }
  .hb-rq-field textarea { resize: vertical; min-height: 120px; }
  .hb-rq-field select { appearance: auto; }
  .hb-rq-btn {
    padding: 14px 44px; border: none; background: #d4a843; color: #fff;
    border-radius: 50px; font-family: 'Inter', sans-serif; font-weight: 700;
    font-size: 0.9rem; text-transform: uppercase; letter-spacing: 2px; cursor: pointer;
    transition: all 0.3s; align-self: flex-start;
  }
  .hb-rq-btn:hover { background: #b8892b; }
  .hb-rq-btn:disabled { opacity: 0.6; cursor: not-allowed; }
  @media (max-width: 600px) {
    .hb-rq-page { padding: 90px 0 60px; }
    .hb-rq-row { grid-template-columns: 1fr; }
  }
`;

export default RequestQuote;
