import React, { useEffect } from 'react';

const ShippingReturns = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="hb-sr-page">
      <div className="hb-sr-container">
        <h1 className="hb-sr-heading">Shipping</h1>

        <div className="hb-sr-faq">
          <div className="hb-sr-item">
            <h2 className="hb-sr-question">How long does my order take to ship?</h2>
            <p className="hb-sr-answer">
              Orders typically take about 10 business days to ship. We appreciate your
              patience as each order is prepared with care.
            </p>
          </div>

          <div className="hb-sr-item">
            <h2 className="hb-sr-question">Do you offer international shipping?</h2>
            <p className="hb-sr-answer">
              At this time, we only offer shipping within the United States.
            </p>
          </div>
        </div>
      </div>

      <style>{`
        .hb-sr-page {
          background: #fafaf7;
          min-height: 100vh;
          padding: 110px 0 80px;
        }
        .hb-sr-container {
          max-width: 780px;
          margin: 0 auto;
          padding: 0 24px;
        }
        .hb-sr-heading {
          font-family: 'Playfair Display', serif;
          font-weight: 900;
          font-size: clamp(2rem, 5vw, 3rem);
          color: #2c2c2c;
          margin-bottom: 48px;
        }
        .hb-sr-faq {
          display: flex;
          flex-direction: column;
          gap: 40px;
        }
        .hb-sr-item {
          padding-bottom: 40px;
          border-bottom: 1px solid #e0d9cc;
        }
        .hb-sr-item:last-child {
          border-bottom: none;
          padding-bottom: 0;
        }
        .hb-sr-question {
          font-family: 'Playfair Display', serif;
          font-weight: 700;
          font-size: clamp(1.2rem, 3vw, 1.5rem);
          color: #2c2c2c;
          margin-bottom: 16px;
        }
        .hb-sr-answer {
          font-family: 'Inter', sans-serif;
          color: #555;
          font-size: clamp(0.95rem, 2vw, 1.05rem);
          line-height: 1.9;
        }
        @media (max-width: 600px) {
          .hb-sr-page { padding: 90px 0 60px; }
          .hb-sr-container { padding: 0 16px; }
          .hb-sr-faq { gap: 32px; }
          .hb-sr-item { padding-bottom: 32px; }
        }
      `}</style>
    </div>
  );
};

export default ShippingReturns;
