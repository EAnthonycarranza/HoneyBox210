import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LoginModal = ({ isOpen, onClose }) => {
  const { login, register } = useAuth();
  const [mode, setMode] = useState('signin'); // 'signin' or 'register'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showResendVerification, setShowResendVerification] = useState(false);
  const [resendEmail, setResendEmail] = useState('');

  const resetForm = () => {
    setName('');
    setEmail('');
    setPhone('');
    setPassword('');
    setConfirmPassword('');
    setError('');
    setSuccessMessage('');
    setLoading(false);
    setShowResendVerification(false);
    setResendEmail('');
  };

  const switchMode = (newMode) => {
    resetForm();
    setMode(newMode);
  };

  const handleClose = () => {
    resetForm();
    setMode('signin');
    onClose();
  };

  const handleResendVerification = async () => {
    setLoading(true);
    setError('');
    setSuccessMessage('');
    try {
      const res = await axios.post('/api/auth/resend-verification-public', { email: resendEmail });
      setSuccessMessage(res.data.message || 'Verification email sent! Check your inbox.');
      setShowResendVerification(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend verification email.');
    } finally {
      setLoading(false);
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      handleClose();
    } catch (err) {
      if (err.response?.data?.isNotVerified) {
        setError(err.response.data.message);
        setShowResendVerification(true);
        setResendEmail(err.response.data.email || email);
      } else {
        setError(
          err.response?.data?.message ||
            err.response?.data?.error ||
            'Invalid email or password. Please try again.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);

    try {
      const result = await register(name, email, password, phone);
      setSuccessMessage(result.message || 'Account created! Please check your email to verify.');
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          'Registration failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const styles = {
    overlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      zIndex: 3000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
    },
    modal: {
      backgroundColor: '#ffffff',
      borderRadius: '16px',
      width: '100%',
      maxWidth: '420px',
      padding: '40px 36px',
      position: 'relative',
      maxHeight: '90vh',
      overflowY: 'auto',
    },
    closeButton: {
      position: 'absolute',
      top: '16px',
      right: '16px',
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      padding: '4px',
      color: '#999999',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    title: {
      fontFamily: "'Playfair Display', serif",
      fontWeight: 700,
      fontSize: '1.5rem',
      color: '#2c2c2c',
      textAlign: 'center',
      marginBottom: '8px',
    },
    subtitle: {
      textAlign: 'center',
      color: '#999999',
      fontSize: '0.9rem',
      marginBottom: '28px',
    },
    form: {
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
    },
    inputGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: '6px',
    },
    label: {
      fontSize: '0.85rem',
      fontWeight: 600,
      color: '#2c2c2c',
    },
    input: {
      padding: '12px 14px',
      border: '1px solid #ddd',
      borderRadius: '8px',
      fontSize: '0.95rem',
      outline: 'none',
      transition: 'border-color 0.2s ease',
      color: '#2c2c2c',
    },
    error: {
      backgroundColor: '#fef2f2',
      color: '#dc2626',
      padding: '10px 14px',
      borderRadius: '8px',
      fontSize: '0.85rem',
      textAlign: 'center',
      marginBottom: '16px',
    },
    success: {
      backgroundColor: '#f0fdf4',
      color: '#16a34a',
      padding: '10px 14px',
      borderRadius: '8px',
      fontSize: '0.85rem',
      textAlign: 'center',
      marginBottom: '16px',
    },
    submitButton: {
      padding: '14px',
      backgroundColor: '#2c2c2c',
      color: '#ffffff',
      border: 'none',
      borderRadius: '8px',
      fontSize: '1rem',
      fontWeight: 700,
      cursor: 'pointer',
      transition: 'background-color 0.2s ease',
      marginTop: '4px',
      opacity: loading ? 0.7 : 1,
    },
    linkRow: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: '8px',
    },
    textButton: {
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      color: '#d4a843',
      fontSize: '0.85rem',
      fontWeight: 600,
      padding: 0,
      textDecoration: 'none',
    },
    switchText: {
      textAlign: 'center',
      marginTop: '16px',
      fontSize: '0.85rem',
      color: '#777777',
    },
  };

  return (
    <div style={styles.overlay} onClick={handleOverlayClick}>
      <div style={styles.modal}>
        {/* Close Button */}
        <button
          style={styles.closeButton}
          onClick={handleClose}
          aria-label="Close modal"
        >
          <svg
            width="20"
            height="20"
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

        {/* Title */}
        <h2 style={styles.title}>Welcome to honeybox210.com</h2>
        <p style={styles.subtitle}>
          {mode === 'signin' ? 'Sign in to your account' : 'Create your account'}
        </p>

        {/* Error Message */}
        {error && <div style={styles.error}>{error}</div>}

        {/* Resend Verification */}
        {showResendVerification && (
          <div style={{
            backgroundColor: '#fffbf0',
            border: '1px solid #f5a623',
            borderRadius: '8px',
            padding: '14px 16px',
            marginBottom: '16px',
            textAlign: 'center',
          }}>
            <p style={{ fontSize: '0.85rem', color: '#8b6914', margin: '0 0 10px', lineHeight: 1.5 }}>
              A verification email was sent to <strong>{resendEmail}</strong>. Didn't receive it?
            </p>
            <button
              type="button"
              onClick={handleResendVerification}
              disabled={loading}
              style={{
                padding: '8px 20px',
                backgroundColor: '#f5a623',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                fontSize: '0.85rem',
                fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? 'Sending...' : 'Resend Verification Email'}
            </button>
          </div>
        )}

        {/* Success Message */}
        {successMessage && <div style={styles.success}>{successMessage}</div>}

        {/* Sign In Form */}
        {mode === 'signin' && (
          <form style={styles.form} onSubmit={handleSignIn}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Email</label>
              <input
                type="email"
                style={styles.input}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                onFocus={(e) => (e.target.style.borderColor = '#d4a843')}
                onBlur={(e) => (e.target.style.borderColor = '#ddd')}
              />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Password</label>
              <input
                type="password"
                style={styles.input}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                onFocus={(e) => (e.target.style.borderColor = '#d4a843')}
                onBlur={(e) => (e.target.style.borderColor = '#ddd')}
              />
            </div>
            <button
              type="submit"
              style={styles.submitButton}
              disabled={loading}
              onMouseEnter={(e) => {
                if (!loading) e.target.style.backgroundColor = '#d4a843';
              }}
              onMouseLeave={(e) => {
                if (!loading) e.target.style.backgroundColor = '#2c2c2c';
              }}
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
            <div style={styles.linkRow}>
              <Link
                to="/forgot-password"
                style={styles.textButton}
                onClick={handleClose}
              >
                Forgot Password?
              </Link>
              <button
                type="button"
                style={styles.textButton}
                onClick={() => switchMode('register')}
              >
                Create account
              </button>
            </div>
          </form>
        )}

        {/* Register Form */}
        {mode === 'register' && (
          <form style={styles.form} onSubmit={handleRegister}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Name</label>
              <input
                type="text"
                style={styles.input}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
                required
                onFocus={(e) => (e.target.style.borderColor = '#d4a843')}
                onBlur={(e) => (e.target.style.borderColor = '#ddd')}
              />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Email</label>
              <input
                type="email"
                style={styles.input}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                onFocus={(e) => (e.target.style.borderColor = '#d4a843')}
                onBlur={(e) => (e.target.style.borderColor = '#ddd')}
              />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Phone Number</label>
              <input
                type="tel"
                style={styles.input}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(555) 000-0000"
                required
                onFocus={(e) => (e.target.style.borderColor = '#d4a843')}
                onBlur={(e) => (e.target.style.borderColor = '#ddd')}
              />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Password</label>
              <input
                type="password"
                style={styles.input}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                required
                onFocus={(e) => (e.target.style.borderColor = '#d4a843')}
                onBlur={(e) => (e.target.style.borderColor = '#ddd')}
              />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Confirm Password</label>
              <input
                type="password"
                style={styles.input}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter your password"
                required
                onFocus={(e) => (e.target.style.borderColor = '#d4a843')}
                onBlur={(e) => (e.target.style.borderColor = '#ddd')}
              />
            </div>
            <button
              type="submit"
              style={styles.submitButton}
              disabled={loading}
              onMouseEnter={(e) => {
                if (!loading) e.target.style.backgroundColor = '#d4a843';
              }}
              onMouseLeave={(e) => {
                if (!loading) e.target.style.backgroundColor = '#2c2c2c';
              }}
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
            <div style={styles.switchText}>
              Already have an account?{' '}
              <button
                type="button"
                style={styles.textButton}
                onClick={() => switchMode('signin')}
              >
                Sign in
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default LoginModal;
