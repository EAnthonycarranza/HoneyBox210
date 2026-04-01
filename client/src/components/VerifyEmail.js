import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

const VerifyEmail = () => {
  const { token } = useParams();
  const [status, setStatus] = useState('loading'); // 'loading', 'success', 'error'
  const [message, setMessage] = useState('');
  const verificationInitiated = useRef(false);

  useEffect(() => {
    const verifyToken = async () => {
      try {
        const res = await axios.get(`/api/auth/verify/${token}`);
        setStatus('success');
        setMessage(res.data.message || 'Your email has been verified successfully!');
      } catch (err) {
        setStatus('error');
        setMessage(
          err.response?.data?.message ||
            err.response?.data?.error ||
            'Verification failed. The link may be invalid or expired.'
        );
      }
    };

    if (token && !verificationInitiated.current) {
      verificationInitiated.current = true;
      verifyToken();
    } else if (!token) {
      setStatus('error');
      setMessage('No verification token provided.');
    }
  }, [token]);

  const styles = {
    page: {
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      backgroundColor: '#fafafa',
    },
    card: {
      backgroundColor: '#ffffff',
      borderRadius: '16px',
      padding: '48px 40px',
      maxWidth: '480px',
      width: '100%',
      textAlign: 'center',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
    },
    icon: {
      fontSize: '3rem',
      marginBottom: '20px',
    },
    title: {
      fontFamily: "'Playfair Display', serif",
      fontWeight: 700,
      fontSize: '1.6rem',
      color: '#2c2c2c',
      marginBottom: '12px',
    },
    message: {
      color: '#777777',
      fontSize: '1rem',
      lineHeight: 1.6,
      marginBottom: '28px',
    },
    link: {
      display: 'inline-block',
      padding: '12px 32px',
      backgroundColor: '#d4a843',
      color: '#ffffff',
      textDecoration: 'none',
      borderRadius: '8px',
      fontWeight: 700,
      fontSize: '0.95rem',
      transition: 'background-color 0.2s ease',
    },
    spinner: {
      width: '40px',
      height: '40px',
      border: '4px solid #f0f0f0',
      borderTop: '4px solid #d4a843',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite',
      margin: '0 auto 20px',
    },
    errorTitle: {
      fontFamily: "'Playfair Display', serif",
      fontWeight: 700,
      fontSize: '1.6rem',
      color: '#dc2626',
      marginBottom: '12px',
    },
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        {status === 'loading' && (
          <>
            <div style={styles.spinner} />
            <h1 style={styles.title}>Verifying your email...</h1>
            <p style={styles.message}>Please wait while we verify your email address.</p>
            <style>{`
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `}</style>
          </>
        )}

        {status === 'success' && (
          <>
            <div style={styles.icon}>&#10003;</div>
            <h1 style={styles.title}>Email Verified!</h1>
            <p style={styles.message}>{message}</p>
            <Link
              to="/"
              state={{ openLogin: true }}
              style={styles.link}
              onMouseEnter={(e) => (e.target.style.backgroundColor = '#c49935')}
              onMouseLeave={(e) => (e.target.style.backgroundColor = '#d4a843')}
            >
              Sign In to Your Account
            </Link>
          </>
        )}

        {status === 'error' && (
          <>
            <div style={styles.icon}>&#10007;</div>
            <h1 style={styles.errorTitle}>Verification Failed</h1>
            <p style={styles.message}>{message}</p>
            <Link
              to="/"
              style={styles.link}
              onMouseEnter={(e) => (e.target.style.backgroundColor = '#c49935')}
              onMouseLeave={(e) => (e.target.style.backgroundColor = '#d4a843')}
            >
              Return Home
            </Link>
          </>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
