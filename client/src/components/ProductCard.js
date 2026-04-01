import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);
  const [hovered, setHovered] = useState(false);

  const handleAddToCart = () => {
    addToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const styles = {
    card: {
      backgroundColor: '#ffffff',
      borderRadius: '12px',
      overflow: 'hidden',
      transition: 'transform 0.3s ease, box-shadow 0.3s ease',
      transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
      boxShadow: hovered
        ? '0 12px 30px rgba(0, 0, 0, 0.12)'
        : '0 2px 10px rgba(0, 0, 0, 0.06)',
      cursor: 'default',
    },
    imageContainer: {
      width: '100%',
      height: '260px',
      overflow: 'hidden',
      backgroundColor: '#f5e6c8',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    image: {
      width: '100%',
      height: '100%',
      objectFit: 'cover',
    },
    placeholder: {
      fontSize: '4rem',
      userSelect: 'none',
    },
    content: {
      padding: '0 20px 20px',
    },
    name: {
      fontFamily: "'Playfair Display', serif",
      fontWeight: 600,
      fontSize: '1.15rem',
      color: '#2c2c2c',
      marginBottom: '8px',
    },
    description: {
      color: '#777777',
      fontSize: '0.85rem',
      lineHeight: 1.5,
      marginBottom: '16px',
      display: '-webkit-box',
      WebkitLineClamp: 2,
      WebkitBoxOrient: 'vertical',
      overflow: 'hidden',
    },
    footer: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '12px',
    },
    price: {
      fontWeight: 700,
      fontSize: '1.2rem',
      color: '#2c2c2c',
    },
    button: {
      backgroundColor: added ? '#2e7d32' : '#2c2c2c',
      color: '#ffffff',
      border: 'none',
      padding: '10px 20px',
      borderRadius: '6px',
      fontSize: '0.85rem',
      fontWeight: 600,
      cursor: 'pointer',
      transition: 'background-color 0.3s ease',
      whiteSpace: 'nowrap',
    },
  };

  return (
    <div
      style={styles.card}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Link to={`/product/${product._id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
        <div style={styles.imageContainer}>
          {product.images && product.images.length > 0 ? (
            <img
              src={product.images[0]}
              alt={product.name}
              style={styles.image}
            />
          ) : (
            <span style={styles.placeholder}>🍯</span>
          )}
        </div>
        <div style={{ padding: '20px 20px 0' }}>
          <h3 style={styles.name}>{product.name}</h3>
        </div>
      </Link>
      <div style={styles.content}>
        {product.weight && (
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.75rem', color: '#999', fontWeight: 500, marginBottom: '6px', display: 'inline-block' }}>
            {product.weight}
          </span>
        )}
        {product.description && (
          <p style={styles.description}>{product.description}</p>
        )}
        <div style={styles.footer}>
          <span style={styles.price}>
            ${product.price != null ? product.price.toFixed(2) : '0.00'}
          </span>
          <button
            style={styles.button}
            onClick={handleAddToCart}
            onMouseEnter={(e) => {
              if (!added) e.target.style.backgroundColor = '#d4a843';
            }}
            onMouseLeave={(e) => {
              if (!added) e.target.style.backgroundColor = '#2c2c2c';
            }}
          >
            {added ? 'Added!' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
