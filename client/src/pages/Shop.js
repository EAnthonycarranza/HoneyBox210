import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ProductCard from '../components/ProductCard';

const Shop = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => { window.scrollTo(0, 0); }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get('/api/products');
        setProducts(res.data.products || res.data);
      } catch (err) {
        setError('Failed to load products. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  return (
    <div className="hb-shop-page">
      <div className="hb-shop-container">
        <div className="hb-shop-header">
          <h1>Our Honey</h1>
          <p>Pure, raw, locally harvested honey from San Antonio, TX</p>
        </div>

        {loading ? (
          <div className="hb-shop-loading">
            <div className="hb-spinner" />
          </div>
        ) : error ? (
          <div className="hb-shop-error">{error}</div>
        ) : products.length === 0 ? (
          <div className="hb-shop-empty">
            <span>🍯</span>
            <p>No products available yet. Check back soon!</p>
          </div>
        ) : (
          <div className="hb-shop-grid">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </div>

      <style>{`
        .hb-shop-page {
          min-height: 100vh;
          padding: 110px 0 80px;
          background: #fafaf7;
        }
        .hb-shop-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 24px;
        }
        .hb-shop-header {
          text-align: center;
          margin-bottom: 50px;
        }
        .hb-shop-header h1 {
          font-family: 'Playfair Display', serif;
          font-weight: 900;
          font-size: clamp(2rem, 5vw, 3rem);
          color: #2c2c2c;
          margin-bottom: 12px;
        }
        .hb-shop-header p {
          font-family: 'Inter', sans-serif;
          color: #777;
          font-size: clamp(0.95rem, 2vw, 1.1rem);
        }
        .hb-shop-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 28px;
        }
        .hb-shop-loading {
          display: flex;
          justify-content: center;
          padding: 80px 0;
        }
        .hb-spinner {
          width: 44px; height: 44px;
          border: 4px solid #f0f0f0;
          border-top-color: #d4a843;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .hb-shop-error {
          text-align: center;
          padding: 60px 20px;
          color: #dc2626;
          font-family: 'Inter', sans-serif;
        }
        .hb-shop-empty {
          text-align: center;
          padding: 60px 20px;
        }
        .hb-shop-empty span {
          font-size: 3rem;
          display: block;
          margin-bottom: 16px;
        }
        .hb-shop-empty p {
          color: #999;
          font-family: 'Inter', sans-serif;
          font-size: 1.1rem;
        }
        @media (max-width: 900px) {
          .hb-shop-grid { grid-template-columns: repeat(2, 1fr); gap: 20px; }
        }
        @media (max-width: 560px) {
          .hb-shop-page { padding: 90px 0 60px; }
          .hb-shop-container { padding: 0 16px; }
          .hb-shop-grid { grid-template-columns: 1fr; gap: 20px; max-width: 400px; margin: 0 auto; }
        }
      `}</style>
    </div>
  );
};

export default Shop;
