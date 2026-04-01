import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../context/CartContext';

const ProductDetail = () => {
  const { id } = useParams();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => { window.scrollTo(0, 0); }, []);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axios.get(`/api/products/${id}`);
        setProduct(res.data.product || res.data);
      } catch (err) {
        setError('Product not found.');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addToCart(product);
    }
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const images = product?.images && product.images.length > 0 ? product.images : [];
  const hasImages = images.length > 0;

  if (loading) {
    return (
      <div className="hb-pd-page">
        <div className="hb-pd-loading"><div className="hb-pd-spinner" /></div>
        <style>{styles}</style>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="hb-pd-page">
        <div className="hb-pd-container">
          <div className="hb-pd-error">
            <span>🍯</span>
            <h2>Product Not Found</h2>
            <p>Sorry, we couldn't find that product.</p>
            <Link to="/shop" className="hb-pd-back-btn">Back to Shop</Link>
          </div>
        </div>
        <style>{styles}</style>
      </div>
    );
  }

  return (
    <div className="hb-pd-page">
      <div className="hb-pd-container">
        <nav className="hb-pd-breadcrumb">
          <Link to="/shop">Shop</Link>
          <span>/</span>
          <span className="hb-pd-breadcrumb-current">{product.name}</span>
        </nav>

        <div className="hb-pd-layout">
          {/* Image Section */}
          <div className="hb-pd-image-section">
            <div className="hb-pd-main-image">
              {hasImages ? (
                <img src={images[currentImage]} alt={product.name} />
              ) : (
                <div className="hb-pd-placeholder">🍯</div>
              )}
              {images.length > 1 && (
                <>
                  <button
                    className="hb-pd-img-nav hb-pd-img-prev"
                    onClick={() => setCurrentImage((p) => (p - 1 + images.length) % images.length)}
                  >‹</button>
                  <button
                    className="hb-pd-img-nav hb-pd-img-next"
                    onClick={() => setCurrentImage((p) => (p + 1) % images.length)}
                  >›</button>
                  <div className="hb-pd-img-counter">{currentImage + 1} / {images.length}</div>
                </>
              )}
            </div>
            {images.length > 1 && (
              <div className="hb-pd-thumbnails">
                {images.map((img, i) => (
                  <button
                    key={i}
                    className={`hb-pd-thumb ${i === currentImage ? 'active' : ''}`}
                    onClick={() => setCurrentImage(i)}
                  >
                    <img src={img} alt={`${product.name} ${i + 1}`} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info Section */}
          <div className="hb-pd-info">
            <h1 className="hb-pd-name">{product.name}</h1>
            <p className="hb-pd-price">${product.price != null ? product.price.toFixed(2) : '0.00'}</p>

            {product.weight && (
              <span className="hb-pd-weight">{product.weight}</span>
            )}

            <div className="hb-pd-actions">
              <div className="hb-pd-qty">
                <button
                  className="hb-pd-qty-btn"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                >−</button>
                <span className="hb-pd-qty-val">{quantity}</span>
                <button
                  className="hb-pd-qty-btn"
                  onClick={() => setQuantity((q) => q + 1)}
                >+</button>
              </div>
              <button
                className={`hb-pd-add-btn ${added ? 'added' : ''}`}
                onClick={handleAddToCart}
                disabled={!product.inStock}
              >
                {!product.inStock ? 'OUT OF STOCK' : added ? 'ADDED TO CART!' : 'ADD TO CART'}
              </button>
            </div>

            {product.description && (
              <div className="hb-pd-description">
                {product.description.split('\n').map((line, i) => (
                  <p key={i}>{line}</p>
                ))}
              </div>
            )}

            {product.category && (
              <div className="hb-pd-meta">
                <span className="hb-pd-meta-label">Category:</span>
                <span className="hb-pd-meta-value">
                  {product.category.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                </span>
              </div>
            )}

            <Link to="/shop" className="hb-pd-continue">← Continue Shopping</Link>
          </div>
        </div>
      </div>
      <style>{styles}</style>
    </div>
  );
};

const styles = `
  .hb-pd-page {
    min-height: 100vh;
    padding: 110px 0 80px;
    background: #fafaf7;
  }
  .hb-pd-container {
    max-width: 1100px;
    margin: 0 auto;
    padding: 0 24px;
  }
  .hb-pd-loading {
    display: flex;
    justify-content: center;
    padding: 120px 0;
  }
  .hb-pd-spinner {
    width: 44px; height: 44px;
    border: 4px solid #f0f0f0;
    border-top-color: #d4a843;
    border-radius: 50%;
    animation: pdSpin 0.8s linear infinite;
  }
  @keyframes pdSpin { to { transform: rotate(360deg); } }

  .hb-pd-error {
    text-align: center;
    padding: 80px 20px;
  }
  .hb-pd-error span { font-size: 4rem; display: block; margin-bottom: 16px; }
  .hb-pd-error h2 {
    font-family: 'Playfair Display', serif;
    font-size: 1.8rem;
    color: #2c2c2c;
    margin-bottom: 8px;
  }
  .hb-pd-error p {
    font-family: 'Inter', sans-serif;
    color: #777;
    margin-bottom: 24px;
  }
  .hb-pd-back-btn {
    display: inline-block;
    padding: 12px 32px;
    background: #2c2c2c;
    color: #fff;
    text-decoration: none;
    border-radius: 6px;
    font-family: 'Inter', sans-serif;
    font-weight: 600;
    font-size: 0.9rem;
  }

  .hb-pd-breadcrumb {
    font-family: 'Inter', sans-serif;
    font-size: 0.85rem;
    color: #999;
    margin-bottom: 32px;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .hb-pd-breadcrumb a {
    color: #2c2c2c;
    text-decoration: none;
    font-weight: 500;
  }
  .hb-pd-breadcrumb a:hover { color: #d4a843; }
  .hb-pd-breadcrumb-current { color: #999; }

  .hb-pd-layout {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 60px;
    align-items: start;
  }

  /* Image Section */
  .hb-pd-image-section { position: relative; }
  .hb-pd-main-image {
    width: 100%;
    aspect-ratio: 1;
    border-radius: 12px;
    overflow: hidden;
    background: #f5e6c8;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
  }
  .hb-pd-main-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  .hb-pd-placeholder { font-size: 6rem; }

  .hb-pd-img-nav {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    background: rgba(255,255,255,0.85);
    border: none;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    font-size: 1.4rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #2c2c2c;
    transition: background 0.2s;
  }
  .hb-pd-img-nav:hover { background: #fff; }
  .hb-pd-img-prev { left: 12px; }
  .hb-pd-img-next { right: 12px; }
  .hb-pd-img-counter {
    position: absolute;
    top: 12px;
    right: 12px;
    background: rgba(0,0,0,0.5);
    color: #fff;
    font-family: 'Inter', sans-serif;
    font-size: 0.75rem;
    padding: 4px 10px;
    border-radius: 20px;
  }

  .hb-pd-thumbnails {
    display: flex;
    gap: 10px;
    margin-top: 14px;
  }
  .hb-pd-thumb {
    width: 70px;
    height: 70px;
    border-radius: 8px;
    overflow: hidden;
    border: 2px solid transparent;
    cursor: pointer;
    padding: 0;
    background: none;
    transition: border-color 0.2s;
  }
  .hb-pd-thumb.active { border-color: #d4a843; }
  .hb-pd-thumb img { width: 100%; height: 100%; object-fit: cover; }

  /* Info Section */
  .hb-pd-info { padding-top: 8px; }
  .hb-pd-name {
    font-family: 'Playfair Display', serif;
    font-weight: 900;
    font-size: clamp(1.8rem, 4vw, 2.5rem);
    color: #2c2c2c;
    margin-bottom: 12px;
    line-height: 1.2;
  }
  .hb-pd-price {
    font-family: 'Inter', sans-serif;
    font-size: 1.4rem;
    font-weight: 600;
    color: #2c2c2c;
    margin-bottom: 8px;
  }
  .hb-pd-weight {
    display: inline-block;
    font-family: 'Inter', sans-serif;
    font-size: 0.8rem;
    color: #999;
    font-weight: 500;
    margin-bottom: 24px;
  }

  .hb-pd-actions {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 32px;
  }
  .hb-pd-qty {
    display: flex;
    align-items: center;
    border: 2px solid #e0e0e0;
    border-radius: 8px;
    overflow: hidden;
  }
  .hb-pd-qty-btn {
    width: 44px;
    height: 44px;
    border: none;
    background: #fff;
    font-size: 1.2rem;
    cursor: pointer;
    color: #2c2c2c;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.2s;
  }
  .hb-pd-qty-btn:hover { background: #f5f5f5; }
  .hb-pd-qty-btn:disabled { opacity: 0.3; cursor: not-allowed; }
  .hb-pd-qty-val {
    width: 44px;
    text-align: center;
    font-family: 'Inter', sans-serif;
    font-weight: 600;
    font-size: 1rem;
    color: #2c2c2c;
  }

  .hb-pd-add-btn {
    flex: 1;
    height: 48px;
    border: 2px solid #d4a843;
    background: transparent;
    color: #d4a843;
    border-radius: 8px;
    font-family: 'Inter', sans-serif;
    font-weight: 700;
    font-size: 0.85rem;
    letter-spacing: 2px;
    cursor: pointer;
    transition: all 0.3s;
  }
  .hb-pd-add-btn:hover {
    background: #d4a843;
    color: #fff;
  }
  .hb-pd-add-btn.added {
    background: #2e7d32;
    border-color: #2e7d32;
    color: #fff;
  }
  .hb-pd-add-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .hb-pd-description {
    font-family: 'Inter', sans-serif;
    font-size: 1rem;
    line-height: 1.7;
    color: #555;
    margin-bottom: 24px;
  }
  .hb-pd-description p { margin-bottom: 12px; }

  .hb-pd-meta {
    font-family: 'Inter', sans-serif;
    font-size: 0.85rem;
    color: #999;
    margin-bottom: 32px;
    padding-top: 16px;
    border-top: 1px solid #eee;
  }
  .hb-pd-meta-label { font-weight: 600; margin-right: 8px; }
  .hb-pd-meta-value { color: #555; }

  .hb-pd-continue {
    font-family: 'Inter', sans-serif;
    font-size: 0.9rem;
    color: #2c2c2c;
    text-decoration: none;
    font-weight: 500;
    transition: color 0.2s;
  }
  .hb-pd-continue:hover { color: #d4a843; }

  @media (max-width: 768px) {
    .hb-pd-page { padding: 90px 0 60px; }
    .hb-pd-container { padding: 0 16px; }
    .hb-pd-layout {
      grid-template-columns: 1fr;
      gap: 32px;
    }
    .hb-pd-main-image { aspect-ratio: 1; }
    .hb-pd-actions { flex-direction: column; align-items: stretch; }
    .hb-pd-qty { align-self: flex-start; }
  }
`;

export default ProductDetail;
