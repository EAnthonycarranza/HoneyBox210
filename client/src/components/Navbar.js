import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const Navbar = ({ onLoginClick }) => {
  const { toggleCart, getCartCount } = useCart();
  const { user } = useAuth();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const cartCount = getCartCount();

  const navLinks = [
    { to: '/shop', label: 'Shop' },
    { to: '/about', label: 'About' },
    { to: '/blog', label: 'Blog' },
    { to: '/events', label: 'Events' },
    { to: '/gallery', label: 'Gallery' },
    { to: '/contact', label: 'Contact' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <nav className="hb-nav" style={{ boxShadow: scrolled ? '0 2px 20px rgba(0,0,0,0.08)' : 'none' }}>
        <div className="hb-nav-inner">
          <Link to="/" className="hb-nav-logo">honeybox210.com</Link>

          {/* Desktop Nav Links */}
          <div className="hb-nav-links-desktop">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`hb-nav-link ${isActive(link.to) ? 'active' : ''}`}
              >
                {link.label}
              </Link>
            ))}
            {user ? (
              <>
                {user.isAdmin && (
                  <Link to="/admin" className={`hb-nav-link ${isActive('/admin') ? 'active' : ''}`}>
                    Admin
                  </Link>
                )}
                <Link to="/account" className={`hb-nav-link ${isActive('/account') ? 'active' : ''}`}>
                  Account
                </Link>
              </>
            ) : (
              <button className="hb-nav-link hb-nav-link-btn" onClick={onLoginClick}>
                Sign In
              </button>
            )}
          </div>

          <div className="hb-nav-right">
            {/* Cart */}
            <button onClick={toggleCart} className="hb-cart-btn" aria-label="Open cart">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2c2c2c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
              </svg>
              <span className="hb-cart-count">{cartCount}</span>
            </button>

            {/* Hamburger - mobile only */}
            <button
              className="hb-hamburger"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              <span style={{ transform: mobileMenuOpen ? 'rotate(45deg) translate(5px, 5px)' : 'none' }} />
              <span style={{ opacity: mobileMenuOpen ? 0 : 1 }} />
              <span style={{ transform: mobileMenuOpen ? 'rotate(-45deg) translate(5px, -5px)' : 'none' }} />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="hb-mobile-overlay" onClick={() => setMobileMenuOpen(false)} />
      )}
      <div className={`hb-mobile-menu ${mobileMenuOpen ? 'open' : ''}`}>
        {navLinks.map((link) => (
          <Link key={link.to} to={link.to} className="hb-mobile-link" onClick={() => setMobileMenuOpen(false)}>
            {link.label}
          </Link>
        ))}
        {user ? (
          <>
            {user.isAdmin && (
              <Link to="/admin" className="hb-mobile-link" onClick={() => setMobileMenuOpen(false)}>
                Admin Dashboard
              </Link>
            )}
            <Link to="/account" className="hb-mobile-link" onClick={() => setMobileMenuOpen(false)}>
              Account
            </Link>
          </>
        ) : (
          <button
            className="hb-mobile-link hb-mobile-link-btn"
            onClick={() => { setMobileMenuOpen(false); if (onLoginClick) onLoginClick(); }}
          >
            Sign In
          </button>
        )}
      </div>

      <style>{`
        .hb-nav {
          position: fixed;
          top: 0; left: 0; right: 0;
          z-index: 1000;
          background: #fff;
          transition: box-shadow 0.3s ease;
        }
        .hb-nav-inner {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 68px;
        }
        .hb-nav-logo {
          font-family: 'Playfair Display', serif;
          font-weight: 900;
          font-size: 1.35rem;
          color: #2c2c2c;
          text-decoration: none;
          white-space: nowrap;
        }
        .hb-nav-links-desktop {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .hb-nav-link {
          font-family: 'Inter', sans-serif;
          font-size: 0.88rem;
          font-weight: 500;
          color: #555;
          text-decoration: none;
          padding: 8px 14px;
          border-radius: 8px;
          transition: color 0.2s, background 0.2s;
        }
        .hb-nav-link:hover, .hb-nav-link.active {
          color: #d4a843;
          background: rgba(212,168,67,0.08);
        }
        .hb-nav-link-btn {
          background: none;
          border: none;
          cursor: pointer;
          font-family: 'Inter', sans-serif;
        }
        .hb-nav-right {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .hb-cart-btn {
          position: relative;
          background: none;
          border: none;
          cursor: pointer;
          padding: 8px;
          display: flex;
          align-items: center;
        }
        .hb-cart-count {
          font-family: 'Inter', sans-serif;
          font-size: 0.85rem;
          font-weight: 600;
          color: #2c2c2c;
          margin-left: 4px;
        }
        .hb-hamburger {
          display: none;
          flex-direction: column;
          gap: 5px;
          background: none;
          border: none;
          cursor: pointer;
          padding: 8px;
        }
        .hb-hamburger span {
          display: block;
          width: 22px;
          height: 2px;
          background: #2c2c2c;
          transition: all 0.3s ease;
        }
        .hb-mobile-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0,0,0,0.4);
          z-index: 998;
        }
        .hb-mobile-menu {
          position: fixed;
          top: 68px; right: 0;
          width: 280px;
          max-height: calc(100vh - 68px);
          background: #fff;
          z-index: 999;
          box-shadow: -4px 0 30px rgba(0,0,0,0.1);
          transform: translateX(100%);
          transition: transform 0.3s ease;
          padding: 16px 0;
          overflow-y: auto;
        }
        .hb-mobile-menu.open {
          transform: translateX(0);
        }
        .hb-mobile-link {
          display: block;
          padding: 16px 28px;
          font-family: 'Inter', sans-serif;
          font-size: 1.05rem;
          font-weight: 500;
          color: #2c2c2c;
          text-decoration: none;
          transition: background 0.2s;
        }
        .hb-mobile-link:hover {
          background: #f9f5ed;
          color: #d4a843;
        }
        .hb-mobile-link-btn {
          width: 100%;
          background: none;
          border: none;
          text-align: left;
          cursor: pointer;
        }
        @media (max-width: 768px) {
          .hb-nav-links-desktop { display: none; }
          .hb-hamburger { display: flex; }
          .hb-nav-inner { padding: 0 16px; }
        }
      `}</style>
    </>
  );
};

export default Navbar;
