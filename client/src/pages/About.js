import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

const About = () => {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <div className="hb-about-page">
      <div className="hb-about-container">
        {/* Hero Image */}
        <div className="hb-about-hero-img">
          <span role="img" aria-label="honey">🍯</span>
        </div>

        <h1 className="hb-about-heading">
          Corporate Life Was Sweet, But Beekeeping Is Sweeter.
        </h1>

        <p className="hb-about-text">
          Hi! I'm <span className="hb-about-hl">Mari</span>, a proud San Antonio native
          with a deep passion for bees and their interesting role in our ecosystem. After
          years in corporate America, I made the bold decision to follow my heart and
          dedicate myself to <span className="hb-about-hl">bee rescue and conservation</span>.
          My journey began with a fascination for these essential pollinators and has evolved
          into a mission to protect them and promote sustainable beekeeping practices.
        </p>

        <p className="hb-about-text">
          Through my business, I aim to bring awareness to the importance of bees while
          providing you with the purest, most natural honey harvested with care. Every jar
          of honey I offer is a product of my commitment to conservation, quality, and the
          preservation of these tiny creatures who play such a big role in our world.
        </p>

        <p className="hb-about-text">
          By choosing <span className="hb-about-hl">HoneyBox</span>, you're not only
          enjoying delicious, locally sourced honey&mdash; you're also supporting a cause
          close to my heart. Thank you for being part of this journey with me!
        </p>

        <p className="hb-about-tagline">From Hive to Jar.</p>

        <hr className="hb-about-divider" />

        <h2 className="hb-about-subheading">About Us</h2>

        <p className="hb-about-text">
          At our core, we're dedicated to producing 100% local, raw, organic honey from
          rescued bees saved from extermination. As a <span className="hb-about-hl">women-owned
          business</span> built with love and care, we celebrate the art of beekeeping while
          preserving these essential tiny creatures. Our honey is a testament to sustainability,
          quality, and community.
        </p>

        <p className="hb-about-text">
          We offer beautifully customized honey boxes, perfect for personal gifts, special
          occasions, promotional events, and corporate celebrations. Every jar represents
          our passion for the planet, a commitment to ethical practices, and a sweet reminder
          of nature's wonders. Taste the difference and join us in supporting the bees that
          make it all possible.
        </p>

        <div className="hb-about-cta">
          <Link to="/shop" className="hb-about-btn">Shop Our Honey</Link>
          <Link to="/contact" className="hb-about-btn-outline">Get in Touch</Link>
        </div>

        {/* Bottom Image */}
        <div className="hb-about-bottom-img">
          <span role="img" aria-label="bee">🐝</span>
        </div>
      </div>

      <style>{`
        .hb-about-page {
          background: #fafaf7;
          min-height: 100vh;
          padding: 100px 0 80px;
        }
        .hb-about-container {
          max-width: 780px;
          margin: 0 auto;
          padding: 0 24px;
        }
        .hb-about-hero-img {
          width: 100%;
          aspect-ratio: 16 / 9;
          max-height: 340px;
          background: linear-gradient(135deg, #d4a843, #e8c77b);
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: clamp(3.5rem, 8vw, 5.5rem);
          margin-bottom: 48px;
          box-shadow: 0 8px 30px rgba(212,168,67,0.15);
        }
        .hb-about-heading {
          font-family: 'Playfair Display', serif;
          font-weight: 900;
          font-size: clamp(1.8rem, 4vw, 2.8rem);
          color: #2c2c2c;
          line-height: 1.25;
          margin-bottom: 36px;
        }
        .hb-about-text {
          font-family: 'Inter', sans-serif;
          color: #555;
          font-size: clamp(0.95rem, 2vw, 1.05rem);
          line-height: 1.9;
          margin-bottom: 24px;
        }
        .hb-about-hl {
          color: #b8892b;
          font-weight: 600;
        }
        .hb-about-tagline {
          font-family: 'Playfair Display', serif;
          font-style: italic;
          font-size: clamp(1.3rem, 3vw, 1.8rem);
          color: #b8892b;
          text-align: center;
          margin: 40px 0;
          letter-spacing: 1px;
        }
        .hb-about-divider {
          border: none;
          border-top: 1px solid #e0d9cc;
          margin: 8px 0 40px;
        }
        .hb-about-subheading {
          font-family: 'Playfair Display', serif;
          font-weight: 900;
          font-size: clamp(1.5rem, 3vw, 2.2rem);
          color: #2c2c2c;
          margin-bottom: 24px;
        }
        .hb-about-cta {
          display: flex;
          gap: 16px;
          margin: 40px 0 48px;
          flex-wrap: wrap;
        }
        .hb-about-btn {
          display: inline-block;
          padding: 14px 36px;
          background: #d4a843;
          color: #fff;
          text-decoration: none;
          border-radius: 50px;
          font-family: 'Inter', sans-serif;
          font-weight: 600;
          font-size: 0.9rem;
          letter-spacing: 1px;
          transition: opacity 0.2s;
        }
        .hb-about-btn:hover { opacity: 0.85; }
        .hb-about-btn-outline {
          display: inline-block;
          padding: 14px 36px;
          border: 2px solid #2c2c2c;
          color: #2c2c2c;
          text-decoration: none;
          border-radius: 50px;
          font-family: 'Inter', sans-serif;
          font-weight: 600;
          font-size: 0.9rem;
          letter-spacing: 1px;
          transition: all 0.2s;
        }
        .hb-about-btn-outline:hover {
          background: #2c2c2c;
          color: #fff;
        }
        .hb-about-bottom-img {
          width: 100%;
          aspect-ratio: 16 / 10;
          max-height: 420px;
          background: linear-gradient(135deg, #e8c77b, #d4a843);
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: clamp(3.5rem, 8vw, 5.5rem);
          box-shadow: 0 8px 30px rgba(212,168,67,0.15);
        }
        @media (max-width: 600px) {
          .hb-about-page { padding: 80px 0 60px; }
          .hb-about-container { padding: 0 16px; }
          .hb-about-hero-img { border-radius: 14px; margin-bottom: 32px; }
          .hb-about-bottom-img { border-radius: 14px; }
          .hb-about-cta { flex-direction: column; }
          .hb-about-btn, .hb-about-btn-outline { text-align: center; }
        }
      `}</style>
    </div>
  );
};

export default About;
