import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState('idle'); // 'idle', 'loading', 'success', 'error'
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setStatus('error');
      setMessage('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setStatus('error');
      setMessage('Password must be at least 6 characters.');
      return;
    }

    setStatus('loading');
    try {
      const res = await axios.post(`/api/auth/reset-password/${token}`, { password });
      setStatus('success');
      setMessage(res.data.message);
      
      // Auto-redirect to home after 3 seconds
      setTimeout(() => {
        navigate('/', { state: { openLogin: true } });
      }, 3000);
    } catch (err) {
      setStatus('error');
      setMessage(err.response?.data?.message || 'Something went wrong. Link may be invalid or expired.');
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
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>Reset Password</h1>
        
        {status === 'success' ? (
          <>
            <div style={{...styles.message, ...styles.successMessage}}>
              {message} Redirecting to login...
            </div>
            <Link to="/" state={{ openLogin: true }} style={{ display: 'block', textAlign: 'center', color: '#d4a843', textDecoration: 'none' }}>
              Click here if not redirected
            </Link>
          </>
        ) : (
          <>
            <p style={styles.subtitle}>
              Enter your new password below.
            </p>
            
            {status === 'error' && (
              <div style={{...styles.message, ...styles.errorMessage}}>
                {message}
              </div>
            )}
            
            <form style={styles.form} onSubmit={handleSubmit}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>New Password</label>
                <input
                  style={styles.input}
                  type="password"
                  placeholder="Min 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Confirm New Password</label>
                <input
                  style={styles.input}
                  type="password"
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
              <button 
                style={styles.button} 
                type="submit"
                disabled={status === 'loading'}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#c49935'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#d4a843'}
              >
                {status === 'loading' ? 'Resetting...' : 'Update Password'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
