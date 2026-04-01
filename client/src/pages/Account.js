import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const Account = () => {
  const { user, loading, logout, resendVerification, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [resendStatus, setResendStatus] = useState('');

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phoneNumber || '');
  const [isEditing, setIsEditing] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateStatus, setUpdateStatus] = useState({ type: '', message: '' });

  // Change Password State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordStatus, setPasswordStatus] = useState({ type: '', message: '' });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPhone(user.phoneNumber || '');
    }
  }, [user]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setUpdateLoading(true);
    setUpdateStatus({ type: '', message: '' });

    try {
      await updateProfile({ name, phoneNumber: phone });
      setUpdateStatus({ type: 'success', message: 'Profile updated successfully!' });
      setIsEditing(false);
    } catch (err) {
      setUpdateStatus({
        type: 'error',
        message: err.response?.data?.message || 'Failed to update profile.'
      });
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordStatus({ type: '', message: '' });

    if (newPassword !== confirmPassword) {
      setPasswordStatus({ type: 'error', message: 'New passwords do not match.' });
      return;
    }

    if (newPassword.length < 6) {
      setPasswordStatus({ type: 'error', message: 'New password must be at least 6 characters.' });
      return;
    }

    setPasswordLoading(true);
    try {
      await axios.put('/api/auth/change-password', {
        currentPassword,
        newPassword
      });
      setPasswordStatus({ type: 'success', message: 'Password updated successfully!' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setIsChangingPassword(false), 2000);
    } catch (err) {
      setPasswordStatus({
        type: 'error',
        message: err.response?.data?.message || 'Failed to change password.'
      });
    } finally {
      setPasswordLoading(false);
    }
  };

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return;
      try {
        const res = await axios.get('/api/orders');
        setOrders(res.data.orders || []);
      } catch (err) {
        // silently fail
      } finally {
        setOrdersLoading(false);
      }
    };
    fetchOrders();
  }, [user]);

  const handleResendVerification = async () => {
    try {
      await resendVerification();
      setResendStatus('Verification email sent! Check your inbox.');
    } catch (err) {
      setResendStatus('Failed to resend. Please try again.');
    }
  };

  const handleSignOut = () => {
    logout();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="acct-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p className="acct-loading-text">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const firstName = user.name ? user.name.split(' ')[0] : 'there';
  const memberSince = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : '';

  const statusColors = {
    pending: { bg: '#fef3c7', color: '#92400e', label: 'Pending' },
    processing: { bg: '#dbeafe', color: '#1e40af', label: 'Processing' },
    shipped: { bg: '#ede9fe', color: '#5b21b6', label: 'Shipped' },
    delivered: { bg: '#d1fae5', color: '#065f46', label: 'Delivered' },
    'ready-for-pickup': { bg: '#d1fae5', color: '#065f46', label: 'Ready for Pickup' },
    cancelled: { bg: '#fee2e2', color: '#991b1b', label: 'Cancelled' },
  };

  return (
    <div className="acct-page">
      <div className="acct-container">
        {/* Header */}
        <div className="acct-header">
          <div>
            <h1 className="acct-heading">My Account</h1>
            {memberSince && <p className="acct-member-since">Member since {memberSince}</p>}
          </div>
          <Link to="/" className="acct-close-link">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </Link>
        </div>

        {/* Verification Banner */}
        {user.isVerified === false && (
          <div className="acct-verify-banner">
            <div className="acct-verify-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1565c0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
            </div>
            <div>
              <p className="acct-verify-text">
                Your email is not verified yet. Please check <strong>{user.email}</strong> for a verification link.
              </p>
              <button className="acct-verify-btn" onClick={handleResendVerification}>
                Resend Verification Email
              </button>
              {resendStatus && <p className="acct-verify-status">{resendStatus}</p>}
            </div>
          </div>
        )}

        {/* Greeting Card */}
        <div className="acct-greeting-card">
          <div className="acct-avatar">
            {firstName.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="acct-greeting">Welcome back, {firstName}!</h2>
            <p className="acct-email">{user.email}</p>
          </div>
          <button className="acct-signout-btn" onClick={handleSignOut}>
            Sign Out
          </button>
        </div>

        {/* Main Grid */}
        <div className="acct-grid">
          {/* Orders Section */}
          <div className="acct-section acct-section-full">
            <div className="acct-section-header">
              <div className="acct-section-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#d4a843" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/>
                </svg>
              </div>
              <h3 className="acct-section-title">Order History</h3>
              <span className="acct-section-count">{orders.length} order{orders.length !== 1 ? 's' : ''}</span>
            </div>
            {ordersLoading ? (
              <p className="acct-loading-text">Loading orders...</p>
            ) : orders.length === 0 ? (
              <div className="acct-empty-state">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ddd" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/>
                </svg>
                <p>No orders yet</p>
                <Link to="/shop" className="acct-shop-link">Browse Our Shop</Link>
              </div>
            ) : (
              <div className="acct-orders-list">
                {orders.map((order) => {
                  const orderNum = order.orderNumber || `#${order._id.slice(-8).toUpperCase()}`;
                  const status = statusColors[order.status] || { bg: '#f3f4f6', color: '#6b7280', label: order.status };
                  return (
                    <div key={order._id} className="acct-order-card">
                      <div className="acct-order-top">
                        <div>
                          <span className="acct-order-number">{orderNum}</span>
                          <span className="acct-order-date">{new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        </div>
                        <span className="acct-order-status" style={{ backgroundColor: status.bg, color: status.color }}>
                          {status.label}
                        </span>
                      </div>
                      <div className="acct-order-details">
                        <div className="acct-order-items">
                          {order.items?.map((item, idx) => (
                            <span key={idx} className="acct-order-item-name">
                              {item.name || item.product?.name || 'Item'}{item.quantity > 1 ? ` x${item.quantity}` : ''}
                            </span>
                          ))}
                        </div>
                        <div className="acct-order-bottom">
                          <span className="acct-order-delivery">
                            {order.deliveryMethod === 'pickup' ? (
                              <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg> Store Pickup</>
                            ) : (
                              <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg> Shipped</>
                            )}
                          </span>
                          <span className="acct-order-total">${order.total != null ? order.total.toFixed(2) : '0.00'}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Profile Section */}
          <div className="acct-section">
            <div className="acct-section-header">
              <div className="acct-section-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#d4a843" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
                </svg>
              </div>
              <h3 className="acct-section-title">Profile</h3>
            </div>
            {isEditing ? (
              <form onSubmit={handleUpdateProfile} className="acct-profile-form">
                <div className="acct-form-group">
                  <label className="acct-label">Full Name</label>
                  <input
                    className="acct-input"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your Name"
                    required
                  />
                </div>
                <div className="acct-form-group">
                  <label className="acct-label">Phone Number</label>
                  <input
                    className="acct-input"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="(555) 000-0000"
                  />
                </div>
                <div className="acct-form-actions">
                  <button type="submit" className="acct-save-btn" disabled={updateLoading}>
                    {updateLoading ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    type="button"
                    className="acct-cancel-btn"
                    onClick={() => {
                      setIsEditing(false);
                      setName(user.name || '');
                      setPhone(user.phoneNumber || '');
                      setUpdateStatus({ type: '', message: '' });
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="acct-profile-info">
                <div className="acct-info-row">
                  <span className="acct-info-label">Email</span>
                  <span className="acct-info-value">{user.email}</span>
                </div>
                <div className="acct-info-row">
                  <span className="acct-info-label">Full Name</span>
                  <span className="acct-info-value">{user.name || 'Not provided'}</span>
                </div>
                <div className="acct-info-row">
                  <span className="acct-info-label">Phone</span>
                  <span className="acct-info-value">{user.phoneNumber || 'Not provided'}</span>
                </div>
                <div className="acct-info-row">
                  <span className="acct-info-label">Status</span>
                  <span className={`acct-verified-badge ${user.isVerified ? 'verified' : 'unverified'}`}>
                    {user.isVerified ? 'Verified' : 'Unverified'}
                  </span>
                </div>
                <button className="acct-edit-btn" onClick={() => setIsEditing(true)}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                  Edit Profile
                </button>
              </div>
            )}

            {updateStatus.message && (
              <div className={`acct-status-msg ${updateStatus.type}`}>
                {updateStatus.message}
              </div>
            )}
          </div>

          {/* Security / Password Section */}
          <div className="acct-section">
            <div className="acct-section-header">
              <div className="acct-section-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#d4a843" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
                </svg>
              </div>
              <h3 className="acct-section-title">Security</h3>
            </div>
            
            {!isChangingPassword ? (
              <div className="acct-profile-info">
                <p style={{ color: '#777', fontSize: '0.85rem', marginBottom: '16px' }}>
                  Update your account password to keep your account secure.
                </p>
                <button className="acct-edit-btn" onClick={() => setIsChangingPassword(true)}>
                  Change Password
                </button>
              </div>
            ) : (
              <form onSubmit={handleChangePassword} className="acct-profile-form">
                <div className="acct-form-group">
                  <label className="acct-label">Current Password</label>
                  <input
                    className="acct-input"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="acct-form-group">
                  <label className="acct-label">New Password</label>
                  <input
                    className="acct-input"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="acct-form-group">
                  <label className="acct-label">Confirm New Password</label>
                  <input
                    className="acct-input"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="acct-form-actions">
                  <button type="submit" className="acct-save-btn" disabled={passwordLoading}>
                    {passwordLoading ? 'Updating...' : 'Update Password'}
                  </button>
                  <button
                    type="button"
                    className="acct-cancel-btn"
                    onClick={() => {
                      setIsChangingPassword(false);
                      setCurrentPassword('');
                      setNewPassword('');
                      setConfirmPassword('');
                      setPasswordStatus({ type: '', message: '' });
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {passwordStatus.message && (
              <div className={`acct-status-msg ${passwordStatus.type}`}>
                {passwordStatus.message}
              </div>
            )}
          </div>

          {/* Saved Addresses */}
          <div className="acct-section">
            <div className="acct-section-header">
              <div className="acct-section-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#d4a843" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
                </svg>
              </div>
              <h3 className="acct-section-title">Addresses</h3>
            </div>
            <div className="acct-empty-small">
              <p>No saved addresses</p>
              <span>Addresses will be saved from your orders.</span>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .acct-page {
          min-height: 100vh;
          padding-top: 100px;
          padding-bottom: 80px;
          background: linear-gradient(180deg, #fafaf8 0%, #f5f5f0 100%);
        }
        .acct-container {
          max-width: 900px;
          margin: 0 auto;
          padding: 0 20px;
        }

        /* Header */
        .acct-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 28px;
        }
        .acct-heading {
          font-family: 'Playfair Display', serif;
          font-weight: 800;
          font-size: 2.2rem;
          color: #2c2c2c;
          margin: 0 0 4px;
        }
        .acct-member-since {
          font-family: 'Inter', sans-serif;
          font-size: 0.85rem;
          color: #999;
          margin: 0;
        }
        .acct-close-link {
          color: #999;
          text-decoration: none;
          padding: 8px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }
        .acct-close-link:hover {
          background: #f0f0f0;
          color: #555;
        }

        /* Verification Banner */
        .acct-verify-banner {
          display: flex;
          align-items: flex-start;
          gap: 14px;
          background: linear-gradient(135deg, #e3f2fd, #e8f4fe);
          border: 1px solid #90caf9;
          border-radius: 12px;
          padding: 18px 22px;
          margin-bottom: 24px;
        }
        .acct-verify-icon {
          flex-shrink: 0;
          margin-top: 2px;
        }
        .acct-verify-text {
          font-family: 'Inter', sans-serif;
          font-size: 0.88rem;
          color: #1565c0;
          line-height: 1.5;
          margin: 0 0 10px;
        }
        .acct-verify-btn {
          color: #fff;
          background: #1976d2;
          border: none;
          padding: 8px 18px;
          border-radius: 6px;
          font-family: 'Inter', sans-serif;
          font-size: 0.82rem;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
        }
        .acct-verify-btn:hover { background: #1565c0; }
        .acct-verify-status {
          margin-top: 8px;
          font-size: 0.82rem;
          color: #2e7d32;
          font-family: 'Inter', sans-serif;
        }

        /* Greeting Card */
        .acct-greeting-card {
          display: flex;
          align-items: center;
          gap: 16px;
          background: #fff;
          border-radius: 16px;
          padding: 24px 28px;
          margin-bottom: 28px;
          box-shadow: 0 2px 12px rgba(0,0,0,0.04);
          border: 1px solid #f0f0ec;
        }
        .acct-avatar {
          width: 52px;
          height: 52px;
          border-radius: 50%;
          background: linear-gradient(135deg, #d4a843, #e8c36a);
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Playfair Display', serif;
          font-weight: 700;
          font-size: 1.3rem;
          color: #fff;
          flex-shrink: 0;
        }
        .acct-greeting {
          font-family: 'Playfair Display', serif;
          font-weight: 700;
          font-size: 1.35rem;
          color: #2c2c2c;
          margin: 0 0 2px;
        }
        .acct-email {
          font-family: 'Inter', sans-serif;
          font-size: 0.85rem;
          color: #999;
          margin: 0;
        }
        .acct-signout-btn {
          margin-left: auto;
          background: none;
          border: 1px solid #e0e0e0;
          color: #777;
          font-family: 'Inter', sans-serif;
          font-size: 0.82rem;
          font-weight: 500;
          padding: 8px 18px;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
          white-space: nowrap;
        }
        .acct-signout-btn:hover {
          border-color: #dc2626;
          color: #dc2626;
          background: #fef2f2;
        }

        /* Grid Layout */
        .acct-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }
        .acct-section-full {
          grid-column: 1 / -1;
        }

        /* Section Cards */
        .acct-section {
          background: #fff;
          border-radius: 16px;
          padding: 24px 28px;
          box-shadow: 0 2px 12px rgba(0,0,0,0.04);
          border: 1px solid #f0f0ec;
        }
        .acct-section-header {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 20px;
          padding-bottom: 14px;
          border-bottom: 1px solid #f0f0ec;
        }
        .acct-section-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          background: #fffbf0;
          border-radius: 10px;
          flex-shrink: 0;
        }
        .acct-section-title {
          font-family: 'Inter', sans-serif;
          font-weight: 700;
          font-size: 1rem;
          color: #2c2c2c;
          margin: 0;
          letter-spacing: -0.01em;
        }
        .acct-section-count {
          font-family: 'Inter', sans-serif;
          font-size: 0.78rem;
          color: #999;
          margin-left: auto;
        }

        /* Empty States */
        .acct-empty-state {
          text-align: center;
          padding: 30px 0;
        }
        .acct-empty-state svg { margin-bottom: 12px; }
        .acct-empty-state p {
          font-family: 'Inter', sans-serif;
          color: #bbb;
          font-size: 0.9rem;
          margin: 0 0 14px;
        }
        .acct-shop-link {
          display: inline-block;
          padding: 10px 24px;
          background: #d4a843;
          color: #fff;
          text-decoration: none;
          border-radius: 8px;
          font-family: 'Inter', sans-serif;
          font-size: 0.85rem;
          font-weight: 600;
          transition: background 0.2s;
        }
        .acct-shop-link:hover { background: #b8892b; }
        .acct-empty-small {
          text-align: center;
          padding: 20px 0;
        }
        .acct-empty-small p {
          font-family: 'Inter', sans-serif;
          color: #bbb;
          font-size: 0.9rem;
          margin: 0 0 4px;
        }
        .acct-empty-small span {
          font-family: 'Inter', sans-serif;
          color: #ccc;
          font-size: 0.8rem;
        }

        /* Orders */
        .acct-orders-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .acct-order-card {
          border: 1px solid #f0f0ec;
          border-radius: 12px;
          overflow: hidden;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .acct-order-card:hover {
          border-color: #e0ddd5;
          box-shadow: 0 2px 8px rgba(0,0,0,0.04);
        }
        .acct-order-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 14px 18px;
          background: #fafaf8;
          border-bottom: 1px solid #f0f0ec;
        }
        .acct-order-number {
          font-family: 'Inter', sans-serif;
          font-weight: 700;
          font-size: 0.9rem;
          color: #2c2c2c;
          letter-spacing: 0.5px;
          margin-right: 12px;
        }
        .acct-order-date {
          font-family: 'Inter', sans-serif;
          font-size: 0.8rem;
          color: #999;
        }
        .acct-order-status {
          padding: 4px 12px;
          border-radius: 20px;
          font-family: 'Inter', sans-serif;
          font-size: 0.72rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.3px;
          white-space: nowrap;
        }
        .acct-order-details {
          padding: 14px 18px;
        }
        .acct-order-items {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-bottom: 10px;
        }
        .acct-order-item-name {
          font-family: 'Inter', sans-serif;
          font-size: 0.82rem;
          color: #666;
          background: #f5f5f2;
          padding: 3px 10px;
          border-radius: 6px;
        }
        .acct-order-bottom {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .acct-order-delivery {
          font-family: 'Inter', sans-serif;
          font-size: 0.8rem;
          color: #999;
          display: flex;
          align-items: center;
          gap: 5px;
        }
        .acct-order-total {
          font-family: 'Inter', sans-serif;
          font-weight: 700;
          font-size: 1rem;
          color: #2c2c2c;
        }

        /* Profile */
        .acct-profile-info {
          display: flex;
          flex-direction: column;
          gap: 0;
        }
        .acct-info-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 0;
          border-bottom: 1px solid #f5f5f2;
        }
        .acct-info-row:last-of-type {
          border-bottom: none;
        }
        .acct-info-label {
          font-family: 'Inter', sans-serif;
          font-size: 0.82rem;
          font-weight: 600;
          color: #999;
          text-transform: uppercase;
          letter-spacing: 0.3px;
        }
        .acct-info-value {
          font-family: 'Inter', sans-serif;
          font-size: 0.9rem;
          color: #2c2c2c;
        }
        .acct-verified-badge {
          font-family: 'Inter', sans-serif;
          font-size: 0.75rem;
          font-weight: 600;
          padding: 3px 10px;
          border-radius: 20px;
        }
        .acct-verified-badge.verified {
          background: #d1fae5;
          color: #065f46;
        }
        .acct-verified-badge.unverified {
          background: #fee2e2;
          color: #991b1b;
        }
        .acct-edit-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          margin-top: 16px;
          background: none;
          border: 1px solid #e0e0e0;
          color: #d4a843;
          font-family: 'Inter', sans-serif;
          font-size: 0.82rem;
          font-weight: 600;
          padding: 8px 18px;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .acct-edit-btn:hover {
          border-color: #d4a843;
          background: #fffbf0;
        }

        /* Profile Form */
        .acct-profile-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .acct-form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .acct-label {
          font-family: 'Inter', sans-serif;
          font-size: 0.82rem;
          font-weight: 600;
          color: #2c2c2c;
        }
        .acct-input {
          padding: 10px 14px;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          font-family: 'Inter', sans-serif;
          font-size: 0.9rem;
          color: #2c2c2c;
          outline: none;
          transition: border-color 0.2s;
          width: 100%;
          box-sizing: border-box;
        }
        .acct-input:focus {
          border-color: #d4a843;
        }
        .acct-form-actions {
          display: flex;
          gap: 10px;
          margin-top: 4px;
        }
        .acct-save-btn {
          background: #2c2c2c;
          color: #fff;
          border: none;
          padding: 10px 22px;
          border-radius: 8px;
          font-family: 'Inter', sans-serif;
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
        }
        .acct-save-btn:hover { background: #d4a843; }
        .acct-save-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .acct-cancel-btn {
          background: #f5f5f5;
          color: #555;
          border: 1px solid #e0e0e0;
          padding: 10px 22px;
          border-radius: 8px;
          font-family: 'Inter', sans-serif;
          font-size: 0.85rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }
        .acct-cancel-btn:hover { background: #eee; }

        /* Status Messages */
        .acct-status-msg {
          margin-top: 14px;
          font-family: 'Inter', sans-serif;
          font-size: 0.85rem;
          padding: 10px 14px;
          border-radius: 8px;
        }
        .acct-status-msg.success {
          color: #065f46;
          background: #d1fae5;
        }
        .acct-status-msg.error {
          color: #991b1b;
          background: #fee2e2;
        }

        .acct-loading-text {
          font-family: 'Inter', sans-serif;
          font-size: 0.95rem;
          color: #999;
          text-align: center;
          padding: 20px;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .acct-page { padding-top: 90px; padding-bottom: 60px; }
          .acct-heading { font-size: 1.6rem; }
          .acct-grid { grid-template-columns: 1fr; }
          .acct-greeting-card { flex-wrap: wrap; padding: 20px; }
          .acct-signout-btn { margin-left: 0; width: 100%; text-align: center; margin-top: 8px; }
          .acct-section { padding: 20px; }
          .acct-order-top { flex-direction: column; align-items: flex-start; gap: 8px; }
        }
      `}</style>
    </div>
  );
};

export default Account;
