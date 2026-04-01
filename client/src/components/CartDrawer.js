import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const CartDrawer = () => {
  const {
    items,
    isCartOpen,
    toggleCart,
    removeFromCart,
    updateQuantity,
    getCartTotal,
  } = useCart();

  const subtotal = getCartTotal();

  const styles = {
    overlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      zIndex: 2000,
      opacity: isCartOpen ? 1 : 0,
      pointerEvents: isCartOpen ? 'auto' : 'none',
      transition: 'opacity 0.3s ease',
    },
    drawer: {
      position: 'fixed',
      top: 0,
      right: 0,
      bottom: 0,
      width: '400px',
      maxWidth: '90vw',
      backgroundColor: '#ffffff',
      zIndex: 2001,
      transform: isCartOpen ? 'translateX(0)' : 'translateX(100%)',
      transition: 'transform 0.3s ease',
      display: 'flex',
      flexDirection: 'column',
    },
    header: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '20px 24px',
      borderBottom: '1px solid #eaeaea',
    },
    headerTitle: {
      fontFamily: "'Playfair Display', serif",
      fontWeight: 700,
      fontSize: '1.3rem',
      color: '#2c2c2c',
    },
    closeButton: {
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      padding: '4px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#2c2c2c',
    },
    body: {
      flex: 1,
      overflowY: 'auto',
      padding: '20px 24px',
    },
    emptyState: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      textAlign: 'center',
      color: '#999999',
    },
    emptyText: {
      fontSize: '1.1rem',
      marginBottom: '20px',
      color: '#777777',
    },
    continueLink: {
      color: '#d4a843',
      textDecoration: 'none',
      fontWeight: 600,
      fontSize: '0.95rem',
    },
    cartItem: {
      display: 'flex',
      gap: '16px',
      padding: '16px 0',
      borderBottom: '1px solid #f0f0f0',
    },
    itemImage: {
      width: '70px',
      height: '70px',
      borderRadius: '8px',
      backgroundColor: '#f5e6c8',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
      overflow: 'hidden',
    },
    itemImageImg: {
      width: '100%',
      height: '100%',
      objectFit: 'cover',
    },
    itemDetails: {
      flex: 1,
      minWidth: 0,
    },
    itemName: {
      fontWeight: 600,
      fontSize: '0.9rem',
      color: '#2c2c2c',
      marginBottom: '4px',
    },
    itemPrice: {
      color: '#777777',
      fontSize: '0.85rem',
      marginBottom: '10px',
    },
    quantityControls: {
      display: 'flex',
      alignItems: 'center',
      gap: '0',
    },
    qtyButton: {
      width: '30px',
      height: '30px',
      border: '1px solid #ddd',
      backgroundColor: '#ffffff',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '1rem',
      color: '#2c2c2c',
      transition: 'background-color 0.2s ease',
    },
    qtyDisplay: {
      width: '36px',
      height: '30px',
      border: '1px solid #ddd',
      borderLeft: 'none',
      borderRight: 'none',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '0.85rem',
      fontWeight: 600,
      color: '#2c2c2c',
    },
    removeButton: {
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      color: '#cc0000',
      fontSize: '0.78rem',
      padding: '4px 0',
      marginTop: '4px',
      textDecoration: 'underline',
    },
    footer: {
      padding: '20px 24px',
      borderTop: '1px solid #eaeaea',
    },
    subtotalRow: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '16px',
    },
    subtotalLabel: {
      fontSize: '1rem',
      fontWeight: 600,
      color: '#2c2c2c',
    },
    subtotalValue: {
      fontSize: '1.15rem',
      fontWeight: 700,
      color: '#2c2c2c',
    },
    checkoutButton: {
      display: 'block',
      width: '100%',
      padding: '14px',
      backgroundColor: '#d4a843',
      color: '#ffffff',
      border: 'none',
      borderRadius: '8px',
      fontSize: '1rem',
      fontWeight: 700,
      cursor: 'pointer',
      textAlign: 'center',
      textDecoration: 'none',
      transition: 'background-color 0.2s ease',
    },
  };

  return (
    <>
      {/* Overlay */}
      <div style={styles.overlay} onClick={toggleCart} />

      {/* Drawer */}
      <div style={styles.drawer}>
        {/* Header */}
        <div style={styles.header}>
          <h2 style={styles.headerTitle}>Your Cart</h2>
          <button
            style={styles.closeButton}
            onClick={toggleCart}
            aria-label="Close cart"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div style={styles.body}>
          {items.length === 0 ? (
            <div style={styles.emptyState}>
              <p style={styles.emptyText}>Your cart is empty</p>
              <Link
                to="/shop"
                style={styles.continueLink}
                onClick={toggleCart}
              >
                Continue Shopping
              </Link>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.product._id} style={styles.cartItem}>
                <div style={styles.itemImage}>
                  {item.product.images && item.product.images.length > 0 ? (
                    <img
                      src={item.product.images[0]}
                      alt={item.product.name}
                      style={styles.itemImageImg}
                    />
                  ) : (
                    <span style={{ fontSize: '1.8rem' }}>🍯</span>
                  )}
                </div>
                <div style={styles.itemDetails}>
                  <div style={styles.itemName}>{item.product.name}</div>
                  <div style={styles.itemPrice}>
                    ${item.product.price.toFixed(2)}
                  </div>
                  <div style={styles.quantityControls}>
                    <button
                      style={{ ...styles.qtyButton, borderRadius: '4px 0 0 4px' }}
                      onClick={() =>
                        updateQuantity(item.product._id, item.quantity - 1)
                      }
                    >
                      -
                    </button>
                    <div style={styles.qtyDisplay}>{item.quantity}</div>
                    <button
                      style={{ ...styles.qtyButton, borderRadius: '0 4px 4px 0' }}
                      onClick={() =>
                        updateQuantity(item.product._id, item.quantity + 1)
                      }
                    >
                      +
                    </button>
                  </div>
                  <button
                    style={styles.removeButton}
                    onClick={() => removeFromCart(item.product._id)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div style={styles.footer}>
            <div style={styles.subtotalRow}>
              <span style={styles.subtotalLabel}>Subtotal</span>
              <span style={styles.subtotalValue}>
                ${subtotal.toFixed(2)}
              </span>
            </div>
            <Link
              to="/checkout"
              style={styles.checkoutButton}
              onClick={toggleCart}
              onMouseEnter={(e) =>
                (e.target.style.backgroundColor = '#c49935')
              }
              onMouseLeave={(e) =>
                (e.target.style.backgroundColor = '#d4a843')
              }
            >
              Checkout
            </Link>
          </div>
        )}
      </div>
    </>
  );
};

export default CartDrawer;
