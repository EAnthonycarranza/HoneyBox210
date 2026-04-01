import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  useEffect(() => {
    // Process Instagram embeds when component mounts
    if (window.instgrm && window.instgrm.Embeds) {
      window.instgrm.Embeds.process();
    }
  }, []);

  const marqueeText = 'FRESH HONEY';
  const repeated = Array(20).fill(marqueeText).join('  \u2022  ');

  return (
    <div>
      {/* Hero */}
      <section className="hb-hero">
        <div className="hb-hero-overlay" />
        <div className="hb-hero-content">
          <h1 className="hb-hero-title">Honey Box 210</h1>
          <p className="hb-hero-tagline">The Purest Drop of Nature's Gold.</p>
          <Link to="/shop" className="hb-hero-btn">SHOP NOW</Link>
        </div>
      </section>

      {/* Marquee */}
      <div className="hb-marquee">
        <div className="hb-marquee-track">
          <span>{repeated}</span>
          <span>{repeated}</span>
        </div>
      </div>

      {/* About Preview */}
      <section className="hb-home-about">
        <div className="hb-home-about-inner">
          <div className="hb-home-about-text">
            <h2>Corporate Life Was Sweet, But Beekeeping Is Sweeter.</h2>
            <p>
              Meet Mari &mdash; a San Antonio native who traded boardrooms for bee yards.
              After years in corporate America, she discovered her true calling: rescuing
              bees and producing pure, raw honey for her community.
            </p>
            <p>
              Every jar of Honey Box 210 honey is crafted with care, harvested locally,
              and delivered fresh to your door.
            </p>
            <Link to="/about" className="hb-home-about-link">Read Our Story &rarr;</Link>
          </div>
          <div className="hb-home-about-img">
            <span role="img" aria-label="honeycomb">🍯</span>
          </div>
        </div>
      </section>

      {/* Instagram */}
      <section className="hb-home-instagram">
        <h2>Follow Us on Instagram</h2>
        <p className="hb-home-ig-sub">@honeybox210</p>
        <div className="hb-home-ig-embed">
          <blockquote
            className="instagram-media"
            data-instgrm-permalink="https://www.instagram.com/honeybox210/?utm_source=ig_embed&amp;utm_campaign=loading"
            data-instgrm-version="14"
            style={{
              background: '#FFF', border: 0, borderRadius: '3px',
              boxShadow: '0 0 1px 0 rgba(0,0,0,0.5), 0 1px 10px 0 rgba(0,0,0,0.15)',
              margin: '1px auto', maxWidth: '540px', minWidth: '326px',
              padding: 0, width: '99.375%',
            }}
          >
            <div style={{ padding: '16px' }}>
              <a
                href="https://www.instagram.com/honeybox210/?utm_source=ig_embed&amp;utm_campaign=loading"
                style={{ background: '#FFFFFF', lineHeight: 0, padding: '0 0', textAlign: 'center', textDecoration: 'none', width: '100%' }}
                target="_blank"
                rel="noopener noreferrer"
              >
                <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                  <div style={{ backgroundColor: '#F4F4F4', borderRadius: '50%', flexGrow: 0, height: '40px', marginRight: '14px', width: '40px' }} />
                  <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, justifyContent: 'center' }}>
                    <div style={{ backgroundColor: '#F4F4F4', borderRadius: '4px', flexGrow: 0, height: '14px', marginBottom: '6px', width: '100px' }} />
                    <div style={{ backgroundColor: '#F4F4F4', borderRadius: '4px', flexGrow: 0, height: '14px', width: '60px' }} />
                  </div>
                </div>
                <div style={{ padding: '19% 0' }} />
                <div style={{ display: 'block', height: '50px', margin: '0 auto 12px', width: '50px' }}>
                  <svg width="50px" height="50px" viewBox="0 0 60 60" version="1.1" xmlns="https://www.w3.org/2000/svg" xmlnsXlink="https://www.w3.org/1999/xlink">
                    <g stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
                      <g transform="translate(-511.000000, -20.000000)" fill="#000000">
                        <g><path d="M556.869,30.41 C554.814,30.41 553.148,32.076 553.148,34.131 C553.148,36.186 554.814,37.852 556.869,37.852 C558.924,37.852 560.59,36.186 560.59,34.131 C560.59,32.076 558.924,30.41 556.869,30.41 M541,60.657 C535.114,60.657 530.342,55.887 530.342,50 C530.342,44.114 535.114,39.342 541,39.342 C546.887,39.342 551.658,44.114 551.658,50 C551.658,55.887 546.887,60.657 541,60.657 M541,33.886 C532.1,33.886 524.886,41.1 524.886,50 C524.886,58.899 532.1,66.113 541,66.113 C549.9,66.113 557.115,58.899 557.115,50 C557.115,41.1 549.9,33.886 541,33.886 M565.378,62.101 C565.244,65.022 564.756,66.606 564.346,67.663 C563.803,69.06 563.154,70.057 562.106,71.106 C561.058,72.155 560.06,72.803 558.662,73.347 C557.607,73.757 556.021,74.244 553.102,74.378 C549.944,74.521 548.997,74.552 541,74.552 C533.003,74.552 532.056,74.521 528.898,74.378 C525.979,74.244 524.393,73.757 523.338,73.347 C521.94,72.803 520.942,72.155 519.894,71.106 C518.846,70.057 518.197,69.06 517.654,67.663 C517.244,66.606 516.755,65.022 516.623,62.101 C516.479,58.943 516.448,57.996 516.448,50 C516.448,42.003 516.479,41.056 516.623,37.899 C516.755,34.978 517.244,33.391 517.654,32.338 C518.197,30.938 518.846,29.942 519.894,28.894 C520.942,27.846 521.94,27.196 523.338,26.654 C524.393,26.244 525.979,25.756 528.898,25.623 C532.057,25.479 533.004,25.448 541,25.448 C548.997,25.448 549.943,25.479 553.102,25.623 C556.021,25.756 557.607,26.244 558.662,26.654 C560.06,27.196 561.058,27.846 562.106,28.894 C563.154,29.942 563.803,30.938 564.346,32.338 C564.756,33.391 565.244,34.978 565.378,37.899 C565.522,41.056 565.552,42.003 565.552,50 C565.552,57.996 565.522,58.943 565.378,62.101 M570.82,37.631 C570.674,34.438 570.167,32.258 569.425,30.349 C568.659,28.377 567.633,26.702 565.965,25.035 C564.297,23.368 562.623,22.342 560.652,21.575 C558.743,20.834 556.562,20.326 553.369,20.18 C550.169,20.033 549.148,20 541,20 C532.853,20 531.831,20.033 528.631,20.18 C525.438,20.326 523.257,20.834 521.349,21.575 C519.376,22.342 517.703,23.368 516.035,25.035 C514.368,26.702 513.342,28.377 512.574,30.349 C511.834,32.258 511.326,34.438 511.181,37.631 C511.035,40.831 511,41.851 511,50 C511,58.147 511.035,59.17 511.181,62.369 C511.326,65.562 511.834,67.743 512.574,69.651 C513.342,71.625 514.368,73.296 516.035,74.965 C517.703,76.634 519.376,77.658 521.349,78.425 C523.257,79.167 525.438,79.673 528.631,79.82 C531.831,79.965 532.853,80.001 541,80.001 C549.148,80.001 550.169,79.965 553.369,79.82 C556.562,79.673 558.743,79.167 560.652,78.425 C562.623,77.658 564.297,76.634 565.965,74.965 C567.633,73.296 568.659,71.625 569.425,69.651 C570.167,67.743 570.674,65.562 570.82,62.369 C570.966,59.17 571,58.147 571,50 C571,41.851 570.966,40.831 570.82,37.631" /></g>
                      </g>
                    </g>
                  </svg>
                </div>
                <div style={{ paddingTop: '8px' }}>
                  <div style={{ color: '#3897f0', fontFamily: 'Arial,sans-serif', fontSize: '14px', fontWeight: 550, lineHeight: '18px' }}>
                    View this profile on Instagram
                  </div>
                </div>
              </a>
              <p style={{ color: '#c9c8cd', fontFamily: 'Arial,sans-serif', fontSize: '14px', lineHeight: '17px', marginBottom: 0, marginTop: '8px', overflow: 'hidden', padding: '8px 0 7px', textAlign: 'center', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                <a href="https://www.instagram.com/honeybox210/" style={{ color: '#c9c8cd', fontFamily: 'Arial,sans-serif', fontSize: '14px', fontWeight: 'normal', lineHeight: '17px' }} target="_blank" rel="noopener noreferrer">Mari</a> (@<a href="https://www.instagram.com/honeybox210/" style={{ color: '#c9c8cd', fontFamily: 'Arial,sans-serif', fontSize: '14px', fontWeight: 'normal', lineHeight: '17px' }} target="_blank" rel="noopener noreferrer">honeybox210</a>)
              </p>
            </div>
          </blockquote>
        </div>
      </section>

      {/* Page Nav Links */}
      <section className="hb-home-nav">
        <Link to="/shop">Shop</Link>
        <Link to="/about">About</Link>
        <Link to="/gallery">Gallery</Link>
        <Link to="/contact">Contact</Link>
        <Link to="/shipping-returns">Shipping and Returns</Link>
      </section>

      <style>{`
        /* HERO */
        .hb-hero {
          position: relative;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          background: linear-gradient(135deg, #f5e6c8 0%, #e8c77b 25%, #d4a843 50%, #a67c2e 100%);
          padding: 80px 24px 40px;
          overflow: hidden;
        }
        .hb-hero::before {
          content: '';
          position: absolute;
          top: -50%; left: -50%;
          width: 200%; height: 200%;
          background: radial-gradient(ellipse at 40% 40%, rgba(255,255,255,0.15) 0%, transparent 60%);
          animation: heroShimmer 8s ease-in-out infinite alternate;
        }
        @keyframes heroShimmer {
          from { transform: translate(0, 0); }
          to { transform: translate(5%, 5%); }
        }
        .hb-hero-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0,0,0,0.3);
        }
        .hb-hero-content {
          position: relative;
          z-index: 2;
          max-width: 700px;
        }
        .hb-hero-title {
          font-family: 'Playfair Display', serif;
          font-weight: 900;
          font-size: clamp(2.8rem, 8vw, 5.5rem);
          color: #fff;
          line-height: 1.05;
          margin-bottom: 20px;
          text-shadow: 0 3px 20px rgba(0,0,0,0.3);
        }
        .hb-hero-tagline {
          font-family: 'Inter', sans-serif;
          font-weight: 300;
          font-size: clamp(1rem, 2.5vw, 1.3rem);
          color: rgba(255,255,255,0.9);
          margin-bottom: 36px;
          letter-spacing: 0.5px;
        }
        .hb-hero-btn {
          display: inline-block;
          padding: 15px 48px;
          border: 2px solid #d4a843;
          background: transparent;
          color: #fff;
          text-decoration: none;
          border-radius: 50px;
          font-family: 'Inter', sans-serif;
          font-weight: 600;
          font-size: 0.9rem;
          text-transform: uppercase;
          letter-spacing: 3px;
          transition: all 0.3s ease;
        }
        .hb-hero-btn:hover {
          background: #d4a843;
          color: #fff;
        }

        /* MARQUEE */
        .hb-marquee {
          background: #fff;
          overflow: hidden;
          white-space: nowrap;
          padding: 14px 0;
          border-bottom: 1px solid #f0f0f0;
        }
        .hb-marquee-track {
          display: inline-flex;
          animation: marqueeScroll 40s linear infinite;
        }
        .hb-marquee-track span {
          font-family: 'Playfair Display', serif;
          font-weight: 700;
          font-size: 1rem;
          color: #1a1a1a;
          letter-spacing: 2px;
          padding-right: 20px;
        }
        @keyframes marqueeScroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }

        /* ABOUT PREVIEW */
        .hb-home-about {
          padding: 100px 24px;
          background: #fafaf7;
        }
        .hb-home-about-inner {
          max-width: 1100px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 60px;
          align-items: center;
        }
        .hb-home-about-text h2 {
          font-family: 'Playfair Display', serif;
          font-weight: 900;
          font-size: clamp(1.6rem, 3vw, 2.4rem);
          color: #2c2c2c;
          line-height: 1.25;
          margin-bottom: 24px;
        }
        .hb-home-about-text p {
          font-family: 'Inter', sans-serif;
          color: #666;
          font-size: 1rem;
          line-height: 1.85;
          margin-bottom: 16px;
        }
        .hb-home-about-link {
          display: inline-block;
          margin-top: 12px;
          color: #d4a843;
          text-decoration: none;
          font-family: 'Inter', sans-serif;
          font-weight: 600;
          font-size: 0.95rem;
          border-bottom: 2px solid #d4a843;
          padding-bottom: 2px;
          transition: opacity 0.2s;
        }
        .hb-home-about-link:hover { opacity: 0.7; }
        .hb-home-about-img {
          width: 100%;
          aspect-ratio: 1;
          max-height: 450px;
          background: linear-gradient(135deg, #d4a843, #a67c2e);
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: clamp(4rem, 8vw, 6rem);
        }

        /* INSTAGRAM */
        .hb-home-instagram {
          padding: 80px 24px;
          background: #fff;
          text-align: center;
        }
        .hb-home-instagram h2 {
          font-family: 'Playfair Display', serif;
          font-weight: 700;
          font-size: clamp(1.5rem, 3vw, 2rem);
          color: #2c2c2c;
          margin-bottom: 8px;
        }
        .hb-home-ig-sub {
          font-family: 'Inter', sans-serif;
          color: #999;
          font-size: 1rem;
          margin-bottom: 32px;
        }
        .hb-home-ig-embed {
          max-width: 540px;
          margin: 0 auto;
        }

        /* PAGE NAV */
        .hb-home-nav {
          padding: 48px 24px;
          background: #fafaf7;
          display: flex;
          justify-content: center;
          flex-wrap: wrap;
          gap: 12px 32px;
        }
        .hb-home-nav a {
          font-family: 'Inter', sans-serif;
          font-size: 0.95rem;
          color: #555;
          text-decoration: underline;
          text-underline-offset: 3px;
          transition: color 0.2s;
        }
        .hb-home-nav a:hover { color: #d4a843; }

        /* RESPONSIVE */
        @media (max-width: 768px) {
          .hb-home-about { padding: 60px 20px; }
          .hb-home-about-inner {
            grid-template-columns: 1fr;
            gap: 32px;
          }
          .hb-home-about-img {
            max-height: 300px;
            order: -1;
          }
          .hb-home-instagram { padding: 50px 16px; }
          .hb-home-nav { padding: 32px 16px; gap: 10px 24px; }
        }
      `}</style>
    </div>
  );
};

export default Home;
