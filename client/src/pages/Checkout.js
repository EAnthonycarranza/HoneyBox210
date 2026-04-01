import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import GooglePlacesInput from '../components/GooglePlacesInput';

const STRIPE_PK = 'pk_test_51THGXVI7aD8zGsAg8MxzkEwptVJywfnyVUu1mTDsS41ymrkjOEM174KVAYTyzlKFg72BMhHDx5byfsM1LHtvEf2i003DPTsxo8';
const stripePromise = loadStripe(STRIPE_PK);

// ---- PAYMENT FORM (inside Stripe Elements) ----
const PaymentForm = ({ deliveryMethod, shippingAddress, pickupNote, items, onSuccess, onError, guestEmail, guestName }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [cardError, setCardError] = useState('');
  const [breakdown, setBreakdown] = useState(null);
  const [clientSecret, setClientSecret] = useState('');
  const [paymentIntentId, setPaymentIntentId] = useState('');

  useEffect(() => {
    const createIntent = async () => {
      try {
        const res = await axios.post('/api/orders/create-payment-intent', {
          items: items.map((item) => ({
            product: item.product._id,
            quantity: item.quantity,
          })),
          deliveryMethod,
        });
        setClientSecret(res.data.clientSecret);
        setPaymentIntentId(res.data.paymentIntentId);
        setBreakdown(res.data.breakdown);
      } catch (err) {
        onError(err.response?.data?.message || 'Failed to initialize payment. Please try again.');
      }
    };
    createIntent();
  }, [items, deliveryMethod, onError]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements || !clientSecret) return;

    setProcessing(true);
    setCardError('');

    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: elements.getElement(CardElement),
      },
    });

    if (error) {
      setCardError(error.message);
      setProcessing(false);
      return;
    }

    if (paymentIntent.status === 'succeeded') {
      // Create the order in the database
      try {
        const orderData = {
          items: items.map((item) => ({
            product: item.product._id,
            quantity: item.quantity,
          })),
          deliveryMethod,
          shippingAddress: deliveryMethod === 'shipping' ? {
            street: shippingAddress.address1 + (shippingAddress.address2 ? `, ${shippingAddress.address2}` : ''),
            city: shippingAddress.city,
            state: shippingAddress.state,
            zip: shippingAddress.zip,
          } : null,
          pickupNote: deliveryMethod === 'pickup' ? pickupNote : undefined,
          paymentIntentId,
          customerEmail: guestEmail,
          customerName: guestName,
        };
        const res = await axios.post('/api/orders', orderData);
        onSuccess(res.data.order);
      } catch (err) {
        onError(err.response?.data?.message || 'Payment succeeded but order creation failed. Please contact us.');
      }
    }
    setProcessing(false);
  };

  const cardStyle = {
    style: {
      base: {
        fontSize: '16px',
        fontFamily: "'Inter', sans-serif",
        color: '#2c2c2c',
        '::placeholder': { color: '#aab7c4' },
      },
      invalid: { color: '#dc2626' },
    },
  };

  return (
    <form onSubmit={handleSubmit}>
      <div style={{
        border: '2px solid #e0e0e0',
        borderRadius: '8px',
        padding: '14px 16px',
        backgroundColor: '#fff',
        marginBottom: '12px',
      }}>
        <CardElement options={cardStyle} onChange={(e) => { if (e.error) setCardError(e.error.message); else setCardError(''); }} />
      </div>
      {cardError && (
        <div style={errorStyle}>{cardError}</div>
      )}
      {breakdown && (
        <div style={{ margin: '16px 0', padding: '16px', backgroundColor: '#f9f5ed', borderRadius: '8px' }}>
          <div style={breakdownRow}><span>Subtotal</span><span>${breakdown.subtotal.toFixed(2)}</span></div>
          <div style={breakdownRow}><span>Shipping</span><span>{breakdown.shippingCost > 0 ? `$${breakdown.shippingCost.toFixed(2)}` : 'FREE'}</span></div>
          <div style={breakdownRow}><span>Tax (8.25%)</span><span>${breakdown.tax.toFixed(2)}</span></div>
          <div style={{ ...breakdownRow, fontWeight: 700, fontSize: '1.1rem', borderTop: '2px solid #d4a843', paddingTop: '10px', marginTop: '8px', color: '#2c2c2c' }}>
            <span>Total</span><span>${breakdown.total.toFixed(2)}</span>
          </div>
        </div>
      )}
      <button
        type="submit"
        disabled={processing || !stripe || !clientSecret}
        style={{
          ...placeOrderBtnStyle,
          opacity: processing || !stripe || !clientSecret ? 0.6 : 1,
          cursor: processing ? 'not-allowed' : 'pointer',
        }}
      >
        {processing ? 'Processing Payment...' : `Pay $${breakdown ? breakdown.total.toFixed(2) : '...'}`}
      </button>
      <div style={sslBadgeStyle}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
        SECURE PAYMENT VIA STRIPE
      </div>
    </form>
  );
};

// ---- MAIN CHECKOUT COMPONENT ----
const Checkout = () => {
  const { items, removeFromCart, getCartTotal, clearCart } = useCart();
  const { user, logout } = useAuth();

  const [deliveryMethod, setDeliveryMethod] = useState('shipping');
  const [shippingAddress, setShippingAddress] = useState({
    fullName: '',
    address1: '',
    address2: '',
    city: '',
    state: 'TX',
    zip: '',
    });
    const [guestEmail, setGuestEmail] = useState('');

    const [pickupNote, setPickupNote] = useState('');

  const onAddressSelected = useCallback((place) => {
    setShippingAddress((prev) => ({
      ...prev,
      address1: place.street || place.formatted || prev.address1,
      city: place.city || prev.city,
      state: place.state || prev.state,
      zip: place.zip || prev.zip,
    }));
  }, []);

  const [step, setStep] = useState('delivery'); // delivery, payment
  const [orderError, setOrderError] = useState('');
  const [completedOrder, setCompletedOrder] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const subtotal = getCartTotal();

  const handleAddressChange = (e) => {
    const { name: fieldName, value: fieldValue } = e.target;
    setShippingAddress((prev) => ({ ...prev, [fieldName]: fieldValue }));
  };

  const handleContinueToPayment = () => {
    setOrderError('');

    if (!user) {
      if (!guestEmail || !guestEmail.includes('@')) {
        setOrderError('Please enter a valid email address.');
        return;
      }
      if (!shippingAddress.fullName) {
        setOrderError('Please enter your full name.');
        return;
      }
    }

    if (deliveryMethod === 'shipping') {
      if (!shippingAddress.fullName) { setOrderError('Please enter your full name.'); return; }
      if (!shippingAddress.address1) { setOrderError('Please enter your address.'); return; }
      if (!shippingAddress.city) { setOrderError('Please enter your city.'); return; }
      if (!shippingAddress.zip) { setOrderError('Please enter your ZIP code.'); return; }
    }
    setStep('payment');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOrderSuccess = (order) => {
    setCompletedOrder(order);
    clearCart();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOrderError = useCallback((msg) => {
    setOrderError(msg);
  }, []);

  // Success page
  if (completedOrder) {
    const orderNum = completedOrder.orderNumber || `#${completedOrder._id?.slice(-8).toUpperCase()}`;
    return (
      <div style={styles.successPage}>
        <div style={{ fontSize: '3rem', marginBottom: '16px', color: '#2e7d32' }}>&#10003;</div>
        <h1 style={styles.successHeading}>Order Confirmed!</h1>
        <div style={{
          display: 'inline-block',
          backgroundColor: '#fff',
          border: '2px solid #d4a843',
          borderRadius: '12px',
          padding: '20px 40px',
          margin: '20px 0',
        }}>
          <p style={{ margin: 0, fontSize: '0.85rem', color: '#888', fontFamily: "'Inter', sans-serif" }}>Your Order Number</p>
          <p style={{ margin: '6px 0 0', fontSize: '1.8rem', fontWeight: 700, color: '#2c2c2c', letterSpacing: '3px', fontFamily: "'Inter', sans-serif" }}>
            {orderNum}
          </p>
        </div>
        <p style={styles.successText}>
          Thank you for your purchase! A confirmation email with your order details has been sent.
        </p>
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/account" style={{ ...styles.successLink, backgroundColor: '#2c2c2c' }}>
            View My Orders
          </Link>
          <Link to="/shop" style={styles.successLink}>
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div style={styles.emptyCart}>
        <div style={{ fontSize: '3rem', marginBottom: '16px' }}>&#128722;</div>
        <h1 style={styles.emptyHeading}>Your cart is empty</h1>
        <p style={{ color: '#777', fontFamily: "'Inter', sans-serif" }}>
          Add some honey to get started!
        </p>
        <Link to="/shop" style={styles.emptyLink}>
          Shop Now
        </Link>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.container} className="checkout-grid">
        {/* Main Column */}
        <div style={styles.mainColumn}>
          <h1 style={styles.heading}>Checkout</h1>

          {/* Step indicator */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', fontFamily: "'Inter', sans-serif", fontSize: '0.85rem' }}>
            <span
              style={{ ...stepStyle, ...(step === 'delivery' ? stepActive : stepDone) }}
              onClick={() => step === 'payment' ? setStep('delivery') : null}
            >
              1. Delivery
            </span>
            <span style={{ color: '#ccc' }}>/</span>
            <span style={{ ...stepStyle, ...(step === 'payment' ? stepActive : {}) }}>
              2. Payment
            </span>
          </div>

          {/* Your Account Section */}
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Your Account</h2>
            {user ? (
              <div style={styles.accountRow}>
                <span style={styles.accountEmail}>{user.email}</span>
                <button style={styles.signOutButton} onClick={logout}>
                  SIGN OUT
                </button>
              </div>
            ) : (
              <p style={styles.signInPrompt}>
                <Link to="/" state={{ openLogin: true }} style={styles.signInLink}>Sign in</Link> for a faster checkout experience.
              </p>
            )}
          </div>

          {orderError && <div style={styles.error}>{orderError}</div>}

          {/* Delivery Section */}
          {step === 'delivery' && (
            <div style={styles.section}>
              <h2 style={styles.sectionTitle}>Delivery</h2>

              {!user && (
                <div style={{ marginBottom: '24px', paddingBottom: '24px', borderBottom: '1px solid #eee' }}>
                  <h3 style={{ ...styles.sectionTitle, fontSize: '1rem', marginBottom: '12px' }}>Contact Information</h3>
                  <div>
                    <label style={styles.inputLabel}>Email Address</label>
                    <input
                      type="email"
                      value={guestEmail}
                      onChange={(e) => setGuestEmail(e.target.value)}
                      style={styles.input}
                      placeholder="email@example.com"
                    />
                  </div>
                </div>
              )}

              <div style={styles.radioGroup}>
                <label
                  style={{
                    ...styles.radioLabel,
                    ...(deliveryMethod === 'shipping' ? styles.radioLabelActive : {}),
                  }}
                >
                  <input
                    type="radio"
                    name="delivery"
                    value="shipping"
                    checked={deliveryMethod === 'shipping'}
                    onChange={() => setDeliveryMethod('shipping')}
                    style={styles.radioInput}
                  />
                  <span style={styles.radioText}>Shipping</span>
                  <span style={styles.radioPrice}>$8.99</span>
                </label>

                <label
                  style={{
                    ...styles.radioLabel,
                    ...(deliveryMethod === 'pickup' ? styles.radioLabelActive : {}),
                  }}
                >
                  <input
                    type="radio"
                    name="delivery"
                    value="pickup"
                    checked={deliveryMethod === 'pickup'}
                    onChange={() => setDeliveryMethod('pickup')}
                    style={styles.radioInput}
                  />
                  <span style={styles.radioText}>Store Pickup</span>
                  <span style={{ ...styles.radioPrice, color: '#2e7d32' }}>FREE</span>
                </label>
              </div>

              {deliveryMethod === 'pickup' && (
                <div style={styles.pickupInfo}>
                  <strong>Local Pickup</strong> - North San Antonio, Texas (Alta Vista)
                  <div style={{ marginTop: '16px' }}>
                    <label style={styles.inputLabel}>Full Name</label>
                    <input
                      type="text"
                      name="fullName"
                      value={shippingAddress.fullName}
                      onChange={handleAddressChange}
                      style={styles.input}
                      placeholder="Your Full Name"
                    />
                  </div>
                  <div style={{ marginTop: '10px' }}>
                    <label style={styles.inputLabel}>Pickup Note (optional)</label>
                    <input
                      type="text"
                      value={pickupNote}
                      onChange={(e) => setPickupNote(e.target.value)}
                      style={styles.input}
                      placeholder="Any notes for pickup..."
                    />
                  </div>
                </div>
              )}

              {deliveryMethod === 'shipping' && (
                <div style={styles.addressForm}>
                  <div>
                    <label style={styles.inputLabel}>Full Name</label>
                    <input
                      type="text"
                      name="fullName"
                      value={shippingAddress.fullName}
                      onChange={handleAddressChange}
                      style={styles.input}
                      placeholder="Full name"
                    />
                  </div>
                  <div>
                    <label style={styles.inputLabel}>Address Line 1</label>
                    <GooglePlacesInput
                      name="address1"
                      value={shippingAddress.address1}
                      onChange={handleAddressChange}
                      onPlaceSelected={onAddressSelected}
                      placeholder="Start typing an address..."
                      style={styles.input}
                    />
                  </div>
                  <div>
                    <label style={styles.inputLabel}>Address Line 2</label>
                    <input
                      type="text"
                      name="address2"
                      value={shippingAddress.address2}
                      onChange={handleAddressChange}
                      style={styles.input}
                      placeholder="Apt, suite, etc. (optional)"
                    />
                  </div>
                  <div style={styles.inputRow} className="checkout-address-row">
                    <div>
                      <label style={styles.inputLabel}>City</label>
                      <input
                        type="text"
                        name="city"
                        value={shippingAddress.city}
                        onChange={handleAddressChange}
                        style={styles.input}
                        placeholder="City"
                      />
                    </div>
                    <div>
                      <label style={styles.inputLabel}>State</label>
                      <input
                        type="text"
                        name="state"
                        value={shippingAddress.state}
                        onChange={handleAddressChange}
                        style={styles.input}
                        placeholder="TX"
                      />
                    </div>
                    <div>
                      <label style={styles.inputLabel}>ZIP Code</label>
                      <input
                        type="text"
                        name="zip"
                        value={shippingAddress.zip}
                        onChange={handleAddressChange}
                        style={styles.input}
                        placeholder="78201"
                      />
                    </div>
                  </div>
                </div>
              )}

              <button
                style={styles.continueButton}
                onClick={handleContinueToPayment}
                onMouseEnter={(e) => (e.target.style.backgroundColor = '#444444')}
                onMouseLeave={(e) => (e.target.style.backgroundColor = '#2c2c2c')}
              >
                Continue to Payment
              </button>
            </div>
          )}

          {/* Payment Section */}
          {step === 'payment' && (
            <div style={styles.section}>
              <h2 style={styles.sectionTitle}>Payment</h2>
              {deliveryMethod === 'shipping' && (
                <div style={{ backgroundColor: '#f9f5ed', borderRadius: '8px', padding: '12px 16px', marginBottom: '16px', fontFamily: "'Inter', sans-serif", fontSize: '0.9rem' }}>
                  <strong>Shipping to:</strong> {shippingAddress.address1}{shippingAddress.address2 ? `, ${shippingAddress.address2}` : ''}, {shippingAddress.city}, {shippingAddress.state} {shippingAddress.zip}
                  <button
                    onClick={() => setStep('delivery')}
                    style={{ background: 'none', border: 'none', color: '#d4a843', fontWeight: 600, cursor: 'pointer', marginLeft: '12px', fontSize: '0.85rem' }}
                  >
                    Edit
                  </button>
                </div>
              )}
              <Elements stripe={stripePromise}>
                <PaymentForm
                  deliveryMethod={deliveryMethod}
                  shippingAddress={shippingAddress}
                  pickupNote={pickupNote}
                  items={items}
                  onSuccess={handleOrderSuccess}
                  onError={handleOrderError}
                  guestEmail={guestEmail}
                  guestName={shippingAddress.fullName}
                />
              </Elements>
            </div>
          )}
        </div>

        {/* Sidebar - Order Summary */}
        <div style={styles.sidebarColumn}>
          <div style={styles.sidebar}>
            <h2 style={styles.sidebarTitle}>Order Summary</h2>

            {items.map((item) => (
              <div key={item.product._id} style={styles.cartItem}>
                <div style={styles.cartItemImage}>
                  {item.product.images && item.product.images.length > 0 ? (
                    <img
                      src={item.product.images[0]}
                      alt={item.product.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }}
                    />
                  ) : (
                    <span>&#127855;</span>
                  )}
                </div>
                <div style={styles.cartItemInfo}>
                  <div style={styles.cartItemName}>{item.product.name}</div>
                  <div style={styles.cartItemQty}>Qty: {item.quantity}</div>
                  <button
                    style={styles.removeButton}
                    onClick={() => removeFromCart(item.product._id)}
                  >
                    Remove
                  </button>
                </div>
                <div style={styles.cartItemPrice}>
                  ${(item.product.price * item.quantity).toFixed(2)}
                </div>
              </div>
            ))}

            <div style={styles.summaryRow}>
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div style={styles.summaryRow}>
              <span>Shipping</span>
              <span>{deliveryMethod === 'pickup' ? 'FREE' : '$8.99'}</span>
            </div>
            <div style={styles.summaryRow}>
              <span>Tax (8.25%)</span>
              <span>Calculated at payment</span>
            </div>
            <div style={styles.summaryTotal}>
              <span>Estimated Total</span>
              <span>${(subtotal + (deliveryMethod === 'pickup' ? 0 : 8.99)).toFixed(2)}+</span>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 820px) {
          .checkout-grid {
            grid-template-columns: 1fr !important;
          }
          .checkout-address-row {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

// Shared styles
const errorStyle = {
  backgroundColor: 'rgba(220, 38, 38, 0.1)',
  border: '1px solid #dc2626',
  color: '#dc2626',
  padding: '10px 14px',
  borderRadius: '8px',
  fontSize: '0.88rem',
  fontFamily: "'Inter', sans-serif",
  marginBottom: '12px',
};

const breakdownRow = {
  display: 'flex',
  justifyContent: 'space-between',
  fontFamily: "'Inter', sans-serif",
  fontSize: '0.9rem',
  color: '#555',
  marginBottom: '6px',
};

const placeOrderBtnStyle = {
  display: 'block',
  width: '100%',
  padding: '16px',
  backgroundColor: '#d4a843',
  color: '#ffffff',
  border: 'none',
  borderRadius: '8px',
  fontSize: '1.05rem',
  fontWeight: 700,
  cursor: 'pointer',
  fontFamily: "'Inter', sans-serif",
  textTransform: 'uppercase',
  letterSpacing: '1px',
  transition: 'background-color 0.2s ease',
};

const sslBadgeStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  marginTop: '16px',
  padding: '10px',
  backgroundColor: '#f9f9f9',
  borderRadius: '8px',
  fontFamily: "'Inter', sans-serif",
  fontSize: '0.75rem',
  color: '#999999',
  letterSpacing: '0.5px',
};

const stepStyle = {
  padding: '4px 12px',
  borderRadius: '20px',
  fontWeight: 500,
  color: '#999',
  cursor: 'default',
};

const stepActive = {
  backgroundColor: '#d4a843',
  color: '#fff',
  fontWeight: 600,
};

const stepDone = {
  backgroundColor: '#e8e0d0',
  color: '#666',
  cursor: 'pointer',
};

const styles = {
  page: {
    minHeight: '100vh',
    paddingTop: '90px',
    paddingBottom: '60px',
    backgroundColor: '#f5f5f5',
  },
  container: {
    maxWidth: '1100px',
    margin: '0 auto',
    padding: '0 20px',
    display: 'grid',
    gridTemplateColumns: '1fr 380px',
    gap: '40px',
    alignItems: 'start',
  },
  mainColumn: {},
  sidebarColumn: {
    position: 'sticky',
    top: '100px',
  },
  heading: {
    fontFamily: "'Playfair Display', serif",
    fontWeight: 700,
    fontSize: '2rem',
    color: '#2c2c2c',
    marginBottom: '10px',
  },
  section: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '28px',
    marginBottom: '20px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
  },
  sectionTitle: {
    fontFamily: "'Playfair Display', serif",
    fontWeight: 700,
    fontSize: '1.2rem',
    color: '#2c2c2c',
    marginBottom: '16px',
  },
  accountRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '12px',
    flexWrap: 'wrap',
  },
  accountEmail: {
    fontFamily: "'Inter', sans-serif",
    fontSize: '0.95rem',
    color: '#555555',
  },
  signOutButton: {
    background: 'none',
    border: 'none',
    color: '#d4a843',
    fontWeight: 600,
    fontSize: '0.85rem',
    cursor: 'pointer',
    textTransform: 'uppercase',
    letterSpacing: '1px',
  },
  signInPrompt: {
    fontFamily: "'Inter', sans-serif",
    fontSize: '0.95rem',
    color: '#555555',
  },
  signInLink: {
    color: '#d4a843',
    textDecoration: 'none',
    fontWeight: 600,
  },
  radioGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  radioLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '14px 16px',
    border: '2px solid #e0e0e0',
    borderRadius: '8px',
    cursor: 'pointer',
    fontFamily: "'Inter', sans-serif",
    fontSize: '0.95rem',
    color: '#2c2c2c',
    transition: 'border-color 0.2s ease',
  },
  radioLabelActive: {
    borderColor: '#d4a843',
  },
  radioInput: {
    accentColor: '#d4a843',
    width: '18px',
    height: '18px',
  },
  radioText: {
    flex: 1,
  },
  radioPrice: {
    fontWeight: 600,
    color: '#2c2c2c',
  },
  pickupInfo: {
    padding: '12px 16px',
    backgroundColor: '#f9f5ed',
    borderRadius: '8px',
    marginTop: '12px',
    fontFamily: "'Inter', sans-serif",
    fontSize: '0.9rem',
    color: '#555555',
  },
  addressForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
    marginTop: '16px',
  },
  inputLabel: {
    fontFamily: "'Inter', sans-serif",
    fontSize: '0.8rem',
    fontWeight: 500,
    color: '#777777',
    marginBottom: '4px',
    display: 'block',
  },
  input: {
    padding: '11px 14px',
    border: '1px solid #ddd',
    borderRadius: '6px',
    fontSize: '0.95rem',
    fontFamily: "'Inter', sans-serif",
    color: '#2c2c2c',
    backgroundColor: '#ffffff',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
  },
  inputRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr',
    gap: '14px',
  },
  continueButton: {
    display: 'block',
    width: '100%',
    padding: '14px',
    backgroundColor: '#2c2c2c',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '0.95rem',
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: "'Inter', sans-serif",
    textTransform: 'uppercase',
    letterSpacing: '1px',
    marginTop: '16px',
    transition: 'background-color 0.2s ease',
  },
  error: {
    backgroundColor: 'rgba(220, 38, 38, 0.1)',
    border: '1px solid #dc2626',
    color: '#dc2626',
    padding: '12px 16px',
    borderRadius: '8px',
    fontSize: '0.9rem',
    fontFamily: "'Inter', sans-serif",
    marginBottom: '16px',
  },
  // Sidebar
  sidebar: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '28px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
  },
  sidebarTitle: {
    fontFamily: "'Playfair Display', serif",
    fontWeight: 700,
    fontSize: '1.2rem',
    color: '#2c2c2c',
    marginBottom: '20px',
  },
  cartItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    paddingBottom: '14px',
    marginBottom: '14px',
    borderBottom: '1px solid #f0f0f0',
  },
  cartItemImage: {
    width: '50px',
    height: '50px',
    borderRadius: '8px',
    backgroundColor: '#f5e6c8',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.5rem',
    flexShrink: 0,
  },
  cartItemInfo: {
    flex: 1,
    minWidth: 0,
  },
  cartItemName: {
    fontFamily: "'Inter', sans-serif",
    fontSize: '0.9rem',
    fontWeight: 500,
    color: '#2c2c2c',
    marginBottom: '2px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  cartItemQty: {
    fontFamily: "'Inter', sans-serif",
    fontSize: '0.8rem',
    color: '#999999',
  },
  cartItemPrice: {
    fontFamily: "'Inter', sans-serif",
    fontSize: '0.9rem',
    fontWeight: 600,
    color: '#2c2c2c',
    whiteSpace: 'nowrap',
  },
  removeButton: {
    background: 'none',
    border: 'none',
    color: '#cc0000',
    fontSize: '0.75rem',
    cursor: 'pointer',
    padding: '2px 0',
    fontFamily: "'Inter', sans-serif",
  },
  summaryRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontFamily: "'Inter', sans-serif",
    fontSize: '0.9rem',
    color: '#555555',
    marginBottom: '10px',
  },
  summaryTotal: {
    display: 'flex',
    justifyContent: 'space-between',
    fontFamily: "'Inter', sans-serif",
    fontSize: '1.1rem',
    fontWeight: 700,
    color: '#2c2c2c',
    paddingTop: '14px',
    marginTop: '14px',
    borderTop: '2px solid #2c2c2c',
  },
  // Success page
  successPage: {
    minHeight: '100vh',
    paddingTop: '120px',
    textAlign: 'center',
    backgroundColor: '#fafafa',
    padding: '120px 20px 60px',
  },
  successHeading: {
    fontFamily: "'Playfair Display', serif",
    fontWeight: 700,
    fontSize: '2rem',
    color: '#2c2c2c',
    marginBottom: '8px',
  },
  successText: {
    fontFamily: "'Inter', sans-serif",
    color: '#555555',
    fontSize: '1.05rem',
    marginBottom: '30px',
  },
  successLink: {
    display: 'inline-block',
    padding: '12px 32px',
    backgroundColor: '#d4a843',
    color: '#ffffff',
    textDecoration: 'none',
    borderRadius: '8px',
    fontWeight: 600,
    fontFamily: "'Inter', sans-serif",
  },
  // Empty cart
  emptyCart: {
    minHeight: '100vh',
    paddingTop: '120px',
    textAlign: 'center',
    backgroundColor: '#fafafa',
    padding: '120px 20px 60px',
  },
  emptyHeading: {
    fontFamily: "'Playfair Display', serif",
    fontWeight: 700,
    fontSize: '1.8rem',
    color: '#2c2c2c',
    marginBottom: '16px',
  },
  emptyLink: {
    display: 'inline-block',
    padding: '12px 32px',
    backgroundColor: '#2c2c2c',
    color: '#ffffff',
    textDecoration: 'none',
    borderRadius: '8px',
    fontWeight: 600,
    marginTop: '12px',
  },
};

export default Checkout;
