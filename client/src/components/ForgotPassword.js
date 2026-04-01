import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // 'idle', 'loading', 'success', 'error'
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    try {
      const res = await axios.post('/api/auth/forgot-password', { email });
      setStatus('success');
      setMessage(res.data.message);
    } catch (err) {
      setStatus('error');
      setMessage(err.response?.data?.message || 'Something went wrong. Please try again.');
    }
  };

  const styles = {
    page: {
      minHeight: '80vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      backgroundColor: '#fafafa',
    },
    card: {
      backgroundColor: '#ffffff',
      borderRadius: '16px',
      padding: '40px',
      maxWidth: '450px',
      width: '100%',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
    },
    title: {
      fontFamily: "'Playfair Display', serif",
      fontSize: '1.8rem',
      color: '#2c2c2c',
      marginBottom: '10px',
      textAlign: 'center',
    },
    subtitle: {
      color: '#666',
      fontSize: '0.95rem',
      marginBottom: '25px',
      textAlign: 'center',
      lineHeight: '1.5',
    },
    form: {
      display: 'flex',
      flexDirection: 'column',
      gap: '15px',
    },
    inputGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: '5px',
    },
    label: {
      fontSize: '0.85rem',
      fontWeight: '600',
      color: '#444',
    },
    input: {
      padding: '12px 15px',
      borderRadius: '8px',
      border: '1px solid #ddd',
      fontSize: '1rem',
      outline: 'none',
      transition: 'border-color 0.2s',
    },
    button: {
      padding: '12px',
      backgroundColor: '#d4a843',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      fontSize: '1rem',
      fontWeight: '600',
      cursor: 'pointer',
      marginTop: '10px',
      transition: 'background-color 0.2s',
    },
    message: {
      padding: '12px',
      borderRadius: '8px',
      fontSize: '0.9rem',
      marginBottom: '20px',
      textAlign: 'center',
    },
    successMessage: {
      backgroundColor: '#ecfdf5',
      color: '#065f46',
      border: '1px solid #a7f3d0',
    },
    errorMessage: {
      backgroundColor: '#fef2f2',
      color: '#991b1b',
      border: '1px solid #fecaca',
    },
    backLink: {
      display: 'block',
      textAlign: 'center',
      marginTop: '20px',
      color: '#d4a843',
      textDecoration: 'none',
      fontSize: '0.9rem',
      fontWeight: '500',
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>Forgot Password</h1>
        
        {status === 'success' ? (
          <>
            <div style={{...styles.message, ...styles.successMessage}}>
              {message}
            </div>
            <Link to="/" style={styles.backLink}>Return to Home</Link>
          </>
        ) : (
          <>
            <p style={styles.subtitle}>
              Enter your email address and we'll send you a link to reset your password.
            </p>
            
            {status === 'error' && (
              <div style={{...styles.message, ...styles.errorMessage}}>
                {message}
              </div>
            )}
            
            <form style={styles.form} onSubmit={handleSubmit}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Email Address</label>
                <input
                  style={styles.input}
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  onFocus={(e) => e.target.style.borderColor = '#d4a843'}
                  onBlur={(e) => e.target.style.borderColor = '#ddd'}
                />
              </div>
              <button 
                style={styles.button} 
                type="submit"
                disabled={status === 'loading'}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#c49935'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#d4a843'}
              >
                {status === 'loading' ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>
            <Link to="/" style={styles.backLink}>Back to Login</Link>
          </>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
