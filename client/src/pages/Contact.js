import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Contact = () => {
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', message: '' });
  const [status, setStatus] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { window.scrollTo(0, 0); }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setStatus('');
    try {
      await axios.post('/api/contact', {
        name: `${form.firstName} ${form.lastName}`.trim(),
        email: form.email,
        message: form.message,
      });
      setStatus('success');
      setStatusMessage("Thank you! Your message has been sent. We'll get back to you soon.");
      setForm({ firstName: '', lastName: '', email: '', message: '' });
    } catch (err) {
      setStatus('error');
      setStatusMessage(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="hb-contact-page">
      <div className="hb-contact-container">
        <h1 className="hb-contact-heading">Contact me</h1>

        {status === 'success' && <div className="hb-contact-success">{statusMessage}</div>}
        {status === 'error' && <div className="hb-contact-error">{statusMessage}</div>}

        <form className="hb-contact-form" onSubmit={handleSubmit}>
          <div className="hb-contact-row">
            <div className="hb-contact-field">
              <label>Name</label>
              <label className="hb-contact-sublabel">First Name <span>(required)</span></label>
              <input type="text" name="firstName" value={form.firstName} onChange={handleChange} required />
            </div>
            <div className="hb-contact-field">
              <label>&nbsp;</label>
              <label className="hb-contact-sublabel">Last Name <span>(required)</span></label>
              <input type="text" name="lastName" value={form.lastName} onChange={handleChange} required />
            </div>
          </div>
          <div className="hb-contact-field">
            <label>Email <span>(required)</span></label>
            <input type="email" name="email" value={form.email} onChange={handleChange} required />
          </div>
          <div className="hb-contact-field">
            <label>Message <span>(required)</span></label>
            <textarea name="message" value={form.message} onChange={handleChange} required rows="6" />
          </div>
          <button type="submit" className="hb-contact-btn" disabled={submitting}>
            {submitting ? 'SENDING...' : 'SEND'}
          </button>
        </form>
      </div>

      <style>{`
        .hb-contact-page {
          background: #fafaf7;
          min-height: 100vh;
          padding: 110px 0 80px;
        }
        .hb-contact-container {
          max-width: 600px;
          margin: 0 auto;
          padding: 0 24px;
        }
        .hb-contact-heading {
          font-family: 'Playfair Display', serif;
          font-weight: 900;
          font-size: clamp(2rem, 5vw, 3rem);
          color: #2c2c2c;
          margin-bottom: 36px;
        }
        .hb-contact-success {
          background: rgba(46,125,50,0.1);
          border: 1px solid #2e7d32;
          color: #2e7d32;
          padding: 14px 20px;
          border-radius: 10px;
          font-family: 'Inter', sans-serif;
          font-size: 0.95rem;
          margin-bottom: 24px;
        }
        .hb-contact-error {
          background: rgba(220,38,38,0.08);
          border: 1px solid #dc2626;
          color: #c62828;
          padding: 14px 20px;
          border-radius: 10px;
          font-family: 'Inter', sans-serif;
          font-size: 0.95rem;
          margin-bottom: 24px;
        }
        .hb-contact-form {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }
        .hb-contact-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }
        .hb-contact-field {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .hb-contact-field label {
          font-family: 'Inter', sans-serif;
          color: #2c2c2c;
          font-size: 0.85rem;
          font-weight: 600;
        }
        .hb-contact-sublabel {
          font-weight: 500 !important;
          font-size: 0.8rem !important;
        }
        .hb-contact-field label span {
          font-weight: 400;
          color: #888;
          font-size: 0.8rem;
        }
        .hb-contact-field input,
        .hb-contact-field textarea {
          padding: 12px 16px;
          background: #fff;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          font-family: 'Inter', sans-serif;
          font-size: 1rem;
          color: #2c2c2c;
          outline: none;
          transition: border-color 0.2s;
          width: 100%;
          box-sizing: border-box;
        }
        .hb-contact-field input:focus,
        .hb-contact-field textarea:focus {
          border-color: #d4a843;
        }
        .hb-contact-field textarea {
          min-height: 140px;
          resize: vertical;
        }
        .hb-contact-btn {
          padding: 14px 44px;
          border: 2px solid #d4a843;
          background: #d4a843;
          color: #fff;
          border-radius: 50px;
          font-family: 'Inter', sans-serif;
          font-weight: 700;
          font-size: 0.9rem;
          text-transform: uppercase;
          letter-spacing: 3px;
          cursor: pointer;
          transition: all 0.3s;
          align-self: flex-start;
        }
        .hb-contact-btn:hover {
          background: #b8892b;
          border-color: #b8892b;
          color: #fff;
        }
        .hb-contact-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        @media (max-width: 560px) {
          .hb-contact-page { padding: 90px 0 60px; }
          .hb-contact-container { padding: 0 16px; }
          .hb-contact-row { grid-template-columns: 1fr; gap: 20px; }
        }
      `}</style>
    </div>
  );
};

export default Contact;
