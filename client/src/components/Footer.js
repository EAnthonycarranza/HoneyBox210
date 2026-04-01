import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="hb-footer">
      <div className="hb-footer-inner">
        <div className="hb-footer-grid">
          <div className="hb-footer-brand">
            <h3>honeybox210.com</h3>
            <p>Fresh, sustainable honey from San Antonio, TX. Crafted with love by Mari.</p>
          </div>
          <div className="hb-footer-links">
            <h4>Navigate</h4>
            <Link to="/shop">Shop</Link>
            <Link to="/about">About</Link>
            <Link to="/blog">Blog</Link>
            <Link to="/events">Events</Link>
            <Link to="/gallery">Gallery</Link>
            <Link to="/contact">Contact</Link>
            <Link to="/request-quote">Request a Quote</Link>
            <Link to="/shipping">Shipping</Link>
          </div>
          <div className="hb-footer-social">
            <h4>Follow Us</h4>
            <a href="https://www.instagram.com/honeybox210/" target="_blank" rel="noopener noreferrer" className="hb-footer-ig">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
              <span>@honeybox210</span>
            </a>
          </div>
        </div>
        <div className="hb-footer-bottom">
          <p>&copy; 2026 Honey Box 210. All rights reserved.</p>
        </div>
      </div>
      <style>{`
        .hb-footer { background: #1a1a1a; color: #fff; padding: 60px 0 30px; }
        .hb-footer-inner { max-width: 1100px; margin: 0 auto; padding: 0 24px; }
        .hb-footer-grid { display: grid; grid-template-columns: 1.5fr 1fr 1fr; gap: 48px; margin-bottom: 40px; }
        .hb-footer-brand h3 { font-family: 'Playfair Display', serif; font-size: 1.3rem; margin-bottom: 10px; font-weight: 700; }
        .hb-footer-brand p { color: rgba(255,255,255,0.5); font-family: 'Inter', sans-serif; font-size: 0.9rem; line-height: 1.7; }
        .hb-footer-links h4, .hb-footer-social h4 { font-family: 'Inter', sans-serif; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 2px; color: rgba(255,255,255,0.4); margin-bottom: 16px; }
        .hb-footer-links a { display: block; color: rgba(255,255,255,0.7); text-decoration: none; font-family: 'Inter', sans-serif; font-size: 0.92rem; padding: 5px 0; transition: color 0.2s; }
        .hb-footer-links a:hover { color: #d4a843; }
        .hb-footer-ig { display: inline-flex; align-items: center; gap: 8px; color: rgba(255,255,255,0.7); text-decoration: none; font-family: 'Inter', sans-serif; font-size: 0.92rem; transition: color 0.2s; }
        .hb-footer-ig:hover { color: #d4a843; }
        .hb-footer-bottom { border-top: 1px solid rgba(255,255,255,0.1); padding-top: 24px; text-align: center; }
        .hb-footer-bottom p { color: rgba(255,255,255,0.3); font-family: 'Inter', sans-serif; font-size: 0.82rem; }
        @media (max-width: 768px) {
          .hb-footer { padding: 40px 0 24px; }
          .hb-footer-grid { grid-template-columns: 1fr; gap: 28px; text-align: center; }
          .hb-footer-ig { justify-content: center; }
        }
      `}</style>
    </footer>
  );
};

export default Footer;
