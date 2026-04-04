import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Cropper from 'react-easy-crop';

const tabs = ['Orders', 'Blog', 'Events', 'Quotes', 'Products', 'Gallery', 'Customers'];

// ---- CSV EXPORT HELPER ----
const exportToCSV = (filename, headers, rows) => {
  const escapeCSV = (val) => {
    if (val == null) return '';
    const str = String(val);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };
  const csvContent = [
    headers.map(escapeCSV).join(','),
    ...rows.map(row => row.map(escapeCSV).join(','))
  ].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}-${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
  URL.revokeObjectURL(url);
};

// ---- HELPER: create cropped image from react-easy-crop output ----
const getCroppedImg = async (imageSrc, pixelCrop) => {
  // For GCS images, proxy through our backend to avoid CORS canvas taint
  let src = imageSrc;
  if (imageSrc.includes('storage.googleapis.com/')) {
    try {
      const proxyUrl = `/api/gallery/proxy-image?url=${encodeURIComponent(imageSrc)}`;
      const resp = await fetch(proxyUrl, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      const blob = await resp.blob();
      src = URL.createObjectURL(blob);
    } catch (err) {
      console.warn('Proxy fetch failed, trying direct:', err);
    }
  }

  return new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = pixelCrop.width;
      canvas.height = pixelCrop.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(
        image,
        pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height,
        0, 0, pixelCrop.width, pixelCrop.height
      );
      // Clean up blob URL if we created one
      if (src !== imageSrc) URL.revokeObjectURL(src);
      resolve(canvas.toDataURL('image/jpeg', 0.92));
    };
    image.onerror = (err) => {
      if (src !== imageSrc) URL.revokeObjectURL(src);
      reject(new Error('Failed to load image for cropping'));
    };
    image.src = src;
  });
};

// ---- CONFIRM MODAL (replaces window.confirm) ----
const ConfirmModal = ({ title, message, warning, confirmLabel, confirmColor, onConfirm, onCancel }) => {
  return (
    <div className="adm-modal-overlay" onClick={onCancel} style={{ zIndex: 1100 }}>
      <div className="adm-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 440 }}>
        <div className="adm-modal-header">
          <h3>{title || 'Confirm'}</h3>
          <button className="adm-modal-close" onClick={onCancel}>✕</button>
        </div>
        <div style={{ padding: '0 28px 12px' }}>
          {warning && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px',
              backgroundColor: '#fff3cd', border: '1px solid #ffc107', borderRadius: 8,
              marginBottom: 14, fontFamily: "'Inter', sans-serif", fontSize: '0.85rem', color: '#856404',
            }}>
              <span style={{ fontSize: '1.3rem' }}>&#9888;</span>
              <span>{warning}</span>
            </div>
          )}
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.95rem', color: '#555', lineHeight: 1.6, margin: '0 0 4px' }}>
            {message}
          </p>
        </div>
        <div style={{ padding: '8px 28px 24px', display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
          <button onClick={onCancel} style={{
            padding: '10px 24px', border: '1px solid #e0e0e0', background: '#fff', borderRadius: 8,
            cursor: 'pointer', fontFamily: "'Inter', sans-serif", fontSize: '0.88rem', fontWeight: 500,
          }}>Cancel</button>
          <button onClick={onConfirm} style={{
            padding: '10px 24px', border: 'none', background: confirmColor || '#dc2626', color: '#fff', borderRadius: 8,
            cursor: 'pointer', fontFamily: "'Inter', sans-serif", fontSize: '0.88rem', fontWeight: 700,
          }}>{confirmLabel || 'Delete'}</button>
        </div>
      </div>
    </div>
  );
};

// ---- IMAGE CROP MODAL (react-easy-crop) ----
const CropModal = ({ imageSrc, onCrop, onCancel }) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [aspect, setAspect] = useState(4 / 3);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [saving, setSaving] = useState(false);

  const onCropComplete = useCallback((_, croppedPixels) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const handleSave = async () => {
    if (!croppedAreaPixels) return;
    setSaving(true);
    try {
      const croppedData = await getCroppedImg(imageSrc, croppedAreaPixels);
      onCrop(croppedData);
    } catch (err) {
      console.error('Crop error:', err);
    }
    setSaving(false);
  };

  return (
    <div className="adm-modal-overlay" onClick={onCancel} style={{ zIndex: 1050 }}>
      <div className="adm-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 600 }}>
        <div className="adm-modal-header">
          <h3>Crop Image</h3>
          <button className="adm-modal-close" onClick={onCancel}>✕</button>
        </div>
        <div style={{ position: 'relative', width: '100%', height: 360, background: '#1a1a1a' }}>
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={aspect}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
        </div>
        <div style={{ padding: '16px 28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 12 }}>
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.8rem', color: '#777', whiteSpace: 'nowrap' }}>Zoom</span>
            <input type="range" min={1} max={3} step={0.1} value={zoom} onChange={e => setZoom(Number(e.target.value))}
              style={{ flex: 1, accentColor: '#d4a843' }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.8rem', color: '#777' }}>Aspect:</span>
            {[
              { label: '4:3', val: 4 / 3 },
              { label: '1:1', val: 1 },
              { label: '16:9', val: 16 / 9 },
              { label: 'Free', val: undefined },
            ].map(a => (
              <button key={a.label} type="button" onClick={() => setAspect(a.val)}
                style={{
                  padding: '4px 12px', borderRadius: 6, border: '1px solid #e0e0e0', cursor: 'pointer',
                  fontFamily: "'Inter', sans-serif", fontSize: '0.78rem', fontWeight: 600,
                  background: aspect === a.val ? '#d4a843' : '#fff', color: aspect === a.val ? '#fff' : '#555',
                }}>{a.label}</button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
            <button onClick={onCancel} style={{
              padding: '10px 24px', border: '1px solid #e0e0e0', background: '#fff', borderRadius: 8,
              cursor: 'pointer', fontFamily: "'Inter', sans-serif", fontSize: '0.85rem',
            }}>Cancel</button>
            <button onClick={handleSave} disabled={saving} className="adm-save-btn" style={{ alignSelf: 'auto' }}>
              {saving ? 'Saving...' : 'Crop & Save'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ---- GALLERY PREVIEW MODAL ----
const GalleryPreview = ({ images, onClose }) => {
  return (
    <div className="adm-modal-overlay" onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#fafaf7', borderRadius: 16, maxWidth: 900, width: '100%', maxHeight: '90vh', overflow: 'auto', padding: 32 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontWeight: 900, fontSize: '1.8rem', color: '#2c2c2c', margin: 0 }}>Gallery Preview</h2>
          <button className="adm-modal-close" onClick={onClose}>✕</button>
        </div>
        <p style={{ fontFamily: "'Inter', sans-serif", color: '#777', marginBottom: 24, fontSize: '0.9rem' }}>This is how users will see your gallery.</p>
        {images.filter(i => i.published).length === 0 ? (
          <p style={{ textAlign: 'center', fontFamily: "'Inter', sans-serif", color: '#999', padding: 40 }}>No published images to preview.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            {images.filter(i => i.published).map(img => (
              <div key={img._id} style={{ borderRadius: 12, overflow: 'hidden', boxShadow: '0 4px 16px rgba(0,0,0,0.08)', position: 'relative' }}>
                <img src={img.imageUrl} alt={img.title} style={{ width: '100%', aspectRatio: '4/3', objectFit: 'cover', display: 'block' }} />
                {(img.title || img.caption) && (
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(transparent, rgba(0,0,0,0.7))', padding: '30px 12px 12px' }}>
                    {img.title && <div style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, color: '#fff', fontSize: '0.95rem' }}>{img.title}</div>}
                    {img.caption && <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.75rem', color: 'rgba(255,255,255,0.8)' }}>{img.caption}</div>}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ---- GALLERY TAB COMPONENT ----
const GalleryTab = ({ images, onRefresh }) => {
  const [uploading, setUploading] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [cropSrc, setCropSrc] = useState(null);
  const [cropItemId, setCropItemId] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [addForm, setAddForm] = useState({ title: '', caption: '', imageUrl: '', published: true, order: 0 });
  const [showAddForm, setShowAddForm] = useState(false);
  const [galleryConfirm, setGalleryConfirm] = useState(null);
  const fileInputRef = React.useRef(null);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      const res = await axios.post('/api/gallery/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      const imageUrl = res.data.imageUrl;
      await axios.post('/api/gallery', { imageUrl, title: '', caption: '', published: true });
      onRefresh();
    } catch (err) {
      alert(err.response?.data?.message || 'Upload failed.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleAddByUrl = async (e) => {
    e.preventDefault();
    if (!addForm.imageUrl) return alert('Image URL is required.');
    try {
      await axios.post('/api/gallery', addForm);
      setAddForm({ title: '', caption: '', imageUrl: '', published: true, order: 0 });
      setShowAddForm(false);
      onRefresh();
    } catch (err) {
      alert('Failed to add image.');
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`/api/gallery/${editItem._id}`, editItem);
      setEditItem(null);
      onRefresh();
    } catch (err) {
      alert('Failed to update.');
    }
  };

  const requestGalleryDelete = (id) => {
    setGalleryConfirm({
      title: 'Delete Gallery Image',
      message: 'Are you sure you want to delete this gallery image? This cannot be undone.',
      confirmLabel: 'Delete',
      confirmColor: '#dc2626',
      onConfirm: async () => {
        setGalleryConfirm(null);
        try {
          await axios.delete(`/api/gallery/${id}`);
          onRefresh();
        } catch (err) {
          setGalleryConfirm({
            title: 'Error', message: 'Failed to delete image.', confirmLabel: 'OK', confirmColor: '#2c2c2c',
            onConfirm: () => setGalleryConfirm(null),
          });
        }
      },
    });
  };

  const handleCropSave = async (croppedData) => {
    try {
      const res = await axios.post('/api/gallery/upload-cropped', { imageData: croppedData });
      if (cropItemId) {
        await axios.put(`/api/gallery/${cropItemId}`, { imageUrl: res.data.imageUrl });
      }
      setCropSrc(null);
      setCropItemId(null);
      onRefresh();
    } catch (err) {
      alert('Failed to save cropped image.');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} style={{ display: 'none' }} />
        <button className="adm-new-btn" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
          {uploading ? 'Uploading...' : '+ Upload Image'}
        </button>
        <button className="adm-new-btn" style={{ background: '#555' }} onClick={() => setShowAddForm(f => !f)}>
          + Add by URL
        </button>
        <button className="adm-new-btn" style={{ background: '#2c2c2c', marginLeft: 'auto' }} onClick={() => setShowPreview(true)}>
          Preview Gallery
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleAddByUrl} style={{ background: '#f9f9f9', borderRadius: 10, padding: 20, marginBottom: 20 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
            <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontFamily: "'Inter', sans-serif", fontSize: '0.85rem', fontWeight: 600 }}>
              Image URL *
              <input value={addForm.imageUrl} onChange={e => setAddForm(f => ({ ...f, imageUrl: e.target.value }))} placeholder="/images/gallery/photo.jpg" required
                style={{ padding: '8px 12px', border: '2px solid #e0e0e0', borderRadius: 6, fontSize: '0.9rem', fontFamily: "'Inter', sans-serif" }} />
            </label>
            <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontFamily: "'Inter', sans-serif", fontSize: '0.85rem', fontWeight: 600 }}>
              Title
              <input value={addForm.title} onChange={e => setAddForm(f => ({ ...f, title: e.target.value }))} placeholder="Image title"
                style={{ padding: '8px 12px', border: '2px solid #e0e0e0', borderRadius: 6, fontSize: '0.9rem', fontFamily: "'Inter', sans-serif" }} />
            </label>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: 12, alignItems: 'end' }}>
            <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontFamily: "'Inter', sans-serif", fontSize: '0.85rem', fontWeight: 600 }}>
              Caption
              <input value={addForm.caption} onChange={e => setAddForm(f => ({ ...f, caption: e.target.value }))} placeholder="Short description"
                style={{ padding: '8px 12px', border: '2px solid #e0e0e0', borderRadius: 6, fontSize: '0.9rem', fontFamily: "'Inter', sans-serif" }} />
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: "'Inter', sans-serif", fontSize: '0.85rem', fontWeight: 600, paddingBottom: 4 }}>
              <input type="checkbox" checked={addForm.published} onChange={e => setAddForm(f => ({ ...f, published: e.target.checked }))} style={{ accentColor: '#d4a843' }} /> Published
            </label>
            <button type="submit" className="adm-save-btn" style={{ alignSelf: 'auto', padding: '8px 20px' }}>Add</button>
          </div>
        </form>
      )}

      {images.length === 0 ? (
        <p className="adm-empty">No gallery images yet. Upload your first image above!</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
          {images.map(img => (
            <div key={img._id} style={{ border: '1px solid #f0f0f0', borderRadius: 12, overflow: 'hidden', background: '#fff' }}>
              <div style={{ position: 'relative' }}>
                <img src={img.imageUrl} alt={img.title || 'Gallery'} style={{ width: '100%', aspectRatio: '4/3', objectFit: 'cover', display: 'block' }} />
                <span style={{
                  position: 'absolute', top: 8, right: 8, fontSize: '0.65rem', padding: '2px 8px', borderRadius: 20,
                  fontWeight: 600, fontFamily: "'Inter', sans-serif",
                  background: img.published ? '#e8f5e9' : '#fff3e0', color: img.published ? '#2e7d32' : '#e65100'
                }}>
                  {img.published ? 'Published' : 'Hidden'}
                </span>
              </div>
              <div style={{ padding: '12px 14px' }}>
                <div style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: '0.95rem', color: '#2c2c2c', marginBottom: 2 }}>
                  {img.title || '(Untitled)'}
                </div>
                {img.caption && <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.75rem', color: '#888', marginBottom: 8 }}>{img.caption}</div>}
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  <button onClick={() => setEditItem({ ...img })}
                    style={{ padding: '4px 12px', border: '1px solid #e0e0e0', background: '#fff', borderRadius: 6, fontSize: '0.75rem', cursor: 'pointer', fontFamily: "'Inter', sans-serif" }}>
                    Edit
                  </button>
                  <button onClick={() => { setCropSrc(img.imageUrl); setCropItemId(img._id); }}
                    style={{ padding: '4px 12px', border: '1px solid #e0e0e0', background: '#fff', borderRadius: 6, fontSize: '0.75rem', cursor: 'pointer', fontFamily: "'Inter', sans-serif" }}>
                    Crop
                  </button>
                  <button onClick={() => requestGalleryDelete(img._id)}
                    style={{ padding: '4px 12px', border: '1px solid #fecaca', background: '#fff', borderRadius: 6, fontSize: '0.75rem', cursor: 'pointer', fontFamily: "'Inter', sans-serif", color: '#dc2626' }}>
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {editItem && (
        <div className="adm-modal-overlay" onClick={() => setEditItem(null)}>
          <div className="adm-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 500 }}>
            <div className="adm-modal-header">
              <h3>Edit Gallery Image</h3>
              <button className="adm-modal-close" onClick={() => setEditItem(null)}>✕</button>
            </div>
            <form className="adm-modal-form" onSubmit={handleEdit}>
              <div style={{ textAlign: 'center', marginBottom: 8 }}>
                <img src={editItem.imageUrl} alt="" style={{ maxWidth: '100%', maxHeight: 200, borderRadius: 8, objectFit: 'contain' }} />
              </div>
              <label>Image URL<input value={editItem.imageUrl} onChange={e => setEditItem(f => ({ ...f, imageUrl: e.target.value }))} /></label>
              <label>Title<input value={editItem.title || ''} onChange={e => setEditItem(f => ({ ...f, title: e.target.value }))} placeholder="Image title" /></label>
              <label>Caption<input value={editItem.caption || ''} onChange={e => setEditItem(f => ({ ...f, caption: e.target.value }))} placeholder="Short description" /></label>
              <label>Display Order<input type="number" value={editItem.order || 0} onChange={e => setEditItem(f => ({ ...f, order: parseInt(e.target.value) || 0 }))} /></label>
              <label className="adm-checkbox"><input type="checkbox" checked={editItem.published} onChange={e => setEditItem(f => ({ ...f, published: e.target.checked }))} /> Published</label>
              <button type="submit" className="adm-save-btn">Save Changes</button>
            </form>
          </div>
        </div>
      )}

      {/* Crop Modal */}
      {cropSrc && (
        <CropModal imageSrc={cropSrc} onCrop={handleCropSave} onCancel={() => { setCropSrc(null); setCropItemId(null); }} />
      )}

      {/* Preview Modal */}
      {showPreview && (
        <GalleryPreview images={images} onClose={() => setShowPreview(false)} />
      )}

      {/* Gallery Confirm Modal */}
      {galleryConfirm && (
        <ConfirmModal {...galleryConfirm} onCancel={() => setGalleryConfirm(null)} />
      )}
    </div>
  );
};

const Admin = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Orders');
  const [data, setData] = useState({ orders: [], posts: [], events: [], quotes: [], products: [], gallery: [], users: [] });
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // { type, mode, item }
  const [orderSearch, setOrderSearch] = useState('');
  const [confirmDialog, setConfirmDialog] = useState(null); // { title, message, warning, confirmLabel, confirmColor, onConfirm }
  const [customerDetail, setCustomerDetail] = useState(null); // { user, orders }
  const [customerLoading, setCustomerLoading] = useState(false);
  const [orderDetail, setOrderDetail] = useState(null); // single order object

  useEffect(() => { window.scrollTo(0, 0); }, []);

  useEffect(() => {
    if (authLoading) return; // Wait for auth to finish loading
    if (!user?.isAdmin) { navigate('/'); return; }
    fetchAll();
  }, [user, authLoading, navigate]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [orders, posts, events, quotes, products, gallery, users] = await Promise.all([
        axios.get('/api/orders/admin/all').catch(() => ({ data: { orders: [] } })),
        axios.get('/api/blog/all').catch(() => ({ data: { posts: [] } })),
        axios.get('/api/events/all').catch(() => ({ data: { events: [] } })),
        axios.get('/api/quotes').catch(() => ({ data: { quotes: [] } })),
        axios.get('/api/products?all=true').catch(() => ({ data: { products: [] } })),
        axios.get('/api/gallery/all').catch(() => ({ data: { images: [] } })),
        axios.get('/api/auth/admin/users').catch(() => ({ data: { users: [] } })),
      ]);
      setData({
        orders: orders.data.orders || [],
        posts: posts.data.posts || [],
        events: events.data.events || [],
        quotes: quotes.data.quotes || [],
        products: products.data.products || products.data || [],
        gallery: gallery.data.images || [],
        users: users.data.users || [],
      });
    } catch (err) {
      console.error('Admin fetch error');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '';

  const requestDelete = (type, id, itemLabel) => {
    const labels = {
      blog: { title: 'Delete Blog Post', message: `Are you sure you want to delete this blog post?` },
      events: { title: 'Delete Event', message: `Are you sure you want to delete this event?` },
      products: { title: 'Delete Product', message: `Are you sure you want to delete this product? This will also remove it from the shop.` },
      quotes: { title: 'Delete Quote', message: `Are you sure you want to permanently delete this quote request from ${itemLabel || 'this customer'}?` },
      orders: {
        title: 'Delete Order',
        message: `Are you sure you want to permanently delete order ${itemLabel}? This cannot be undone.`,
        warning: 'This will permanently remove the order from the database. The customer will no longer be able to see this order in their account.',
        confirmLabel: 'Yes, Delete Order',
      },
      gallery: { title: 'Delete Image', message: `Are you sure you want to delete this gallery image?` },
      users: {
        title: 'Delete Customer Account',
        message: `Are you sure you want to permanently delete the account for ${itemLabel}?`,
        warning: 'This will permanently remove this user from the database. They will no longer be able to log in or see their order history.',
        confirmLabel: 'Delete User',
      },
    };
    const config = labels[type] || { title: 'Delete', message: 'Are you sure?' };
    setConfirmDialog({
      title: config.title,
      message: config.message,
      warning: config.warning || null,
      confirmLabel: config.confirmLabel || 'Delete',
      confirmColor: '#dc2626',
      onConfirm: async () => {
        setConfirmDialog(null);
        try {
          if (type === 'orders') {
            await axios.delete(`/api/orders/admin/${id}`);
          } else if (type === 'users') {
            await axios.delete(`/api/auth/admin/users/${id}`);
          } else {
            await axios.delete(`/api/${type}/${id}`);
          }
          fetchAll();
        } catch (err) {
          setConfirmDialog({
            title: 'Error',
            message: err.response?.data?.message || 'Failed to delete. Please try again.',
            confirmLabel: 'OK',
            confirmColor: '#2c2c2c',
            onConfirm: () => setConfirmDialog(null),
          });
        }
      },
    });
  };

  const handleStatusUpdate = async (type, id, updates) => {
    try {
      if (type === 'orders') {
        await axios.put(`/api/orders/admin/${id}`, updates);
      } else {
        await axios.put(`/api/${type}/${id}`, updates);
      }
      fetchAll();
    } catch (err) {
      alert('Failed to update.');
    }
  };

  // ---- CSV EXPORTS ----
  const exportOrdersCSV = () => {
    const headers = ['Order #', 'Customer Name', 'Customer Email', 'Items', 'Subtotal', 'Shipping', 'Tax', 'Total', 'Delivery Method', 'Status', 'Shipping Address', 'Date'];
    const rows = data.orders.map(o => [
      o.orderNumber || o._id.slice(-6),
      o.user?.name || 'Guest',
      o.user?.email || '',
      (o.items || []).map(i => `${i.name || 'Item'} x${i.quantity}`).join('; '),
      o.subtotal?.toFixed(2) || '0.00',
      o.shippingCost?.toFixed(2) || '0.00',
      o.tax?.toFixed(2) || '0.00',
      o.total?.toFixed(2) || '0.00',
      o.deliveryMethod || '',
      o.status || '',
      o.shippingAddress ? `${o.shippingAddress.street}, ${o.shippingAddress.city}, ${o.shippingAddress.state} ${o.shippingAddress.zip}` : (o.deliveryMethod === 'pickup' ? 'Store Pickup' : ''),
      o.createdAt ? new Date(o.createdAt).toLocaleDateString() : '',
    ]);
    exportToCSV('honeybox210-orders', headers, rows);
  };

  const exportQuotesCSV = () => {
    const headers = ['Name', 'Email', 'Phone', 'Company', 'Event Type', 'Event Date', 'Location', 'Guest Count', 'Details', 'Status', 'Admin Notes', 'Submitted'];
    const rows = data.quotes.map(q => [
      q.name, q.email, q.phone || '', q.company || '',
      q.eventType, q.eventDate ? new Date(q.eventDate).toLocaleDateString() : '',
      q.eventLocation || '', q.guestCount || '', q.details || '',
      q.status, q.adminNotes || '',
      q.createdAt ? new Date(q.createdAt).toLocaleDateString() : '',
    ]);
    exportToCSV('honeybox210-quotes', headers, rows);
  };

  const exportCustomersCSV = () => {
    const headers = ['Name', 'Email', 'Phone', 'Verified', 'Admin', 'Joined', 'Total Orders', 'Total Spent'];
    const rows = data.users.map(u => {
      const userOrders = data.orders.filter(o => o.user?._id === u._id || o.user?.id === u._id);
      const totalSpent = userOrders.reduce((sum, o) => sum + (o.total || 0), 0);
      return [
        u.name, u.email, u.phoneNumber || '',
        u.isVerified ? 'Yes' : 'No', u.isAdmin ? 'Yes' : 'No',
        u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '',
        userOrders.length, totalSpent.toFixed(2),
      ];
    });
    exportToCSV('honeybox210-customers', headers, rows);
  };

  // ---- VIEW CUSTOMER DETAIL ----
  const viewCustomer = async (userId) => {
    setCustomerLoading(true);
    setCustomerDetail(null);
    try {
      const userInfo = data.users.find(u => u._id === userId);
      const res = await axios.get(`/api/orders/admin/user/${userId}`);
      setCustomerDetail({ user: userInfo, orders: res.data.orders || [] });
    } catch (err) {
      console.error('Failed to load customer detail');
    } finally {
      setCustomerLoading(false);
    }
  };

  // ---- MODAL FORM ----
  const ModalForm = () => {
    if (!modal) return null;
    const { type, mode, item } = modal;
    const isEdit = mode === 'edit';

    const defaults = {
      blog: { title: '', content: '', excerpt: '', image: '', published: true },
      events: { title: '', description: '', image: '', date: '', endDate: '', location: '', published: true },
      products: { name: '', description: '', price: '', weight: '', category: 'raw-honey', images: [''], inStock: true, isVisible: true },
      quotes: { name: '', email: '', phone: '', company: '', eventType: 'corporate', eventDate: '', eventLocation: '', guestCount: '', details: '', status: 'new', adminNotes: '' },
    };

    const [form, setForm] = useState(isEdit ? {
      ...defaults[type],
      ...item,
      date: item?.date ? new Date(item.date).toISOString().split('T')[0] : '',
      endDate: item?.endDate ? new Date(item.endDate).toISOString().split('T')[0] : '',
      eventDate: item?.eventDate ? new Date(item.eventDate).toISOString().split('T')[0] : '',
      images: item?.images?.length ? item.images : [''],
    } : defaults[type]);
    const [saving, setSaving] = useState(false);

    const handleChange = (e) => {
      const { name, value, type: inputType, checked } = e.target;
      setForm(f => ({ ...f, [name]: inputType === 'checkbox' ? checked : value }));
    };

    const handleImageChange = (i, val) => {
      const imgs = [...(form.images || [''])];
      imgs[i] = val;
      setForm(f => ({ ...f, images: imgs }));
    };

    const handleSave = async (e) => {
      e.preventDefault();
      setSaving(true);
      try {
        const payload = { ...form };
        if (type === 'products') {
          payload.price = parseFloat(payload.price);
          // Set primary image from first in images array
          if (payload.images && payload.images.length > 0 && payload.images[0]) {
            payload.image = payload.images[0];
          }
        }
        if (isEdit) {
          await axios.put(`/api/${type}/${item._id}`, payload);
        } else {
          await axios.post(`/api/${type}`, payload);
        }
        setModal(null);
        fetchAll();
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to save.');
      } finally {
        setSaving(false);
      }
    };

    return (
      <div className="adm-modal-overlay" onClick={() => setModal(null)}>
        <div className="adm-modal" onClick={e => e.stopPropagation()}>
          <div className="adm-modal-header">
            <h3>{isEdit ? 'Edit' : 'New'} {type === 'blog' ? 'Blog Post' : type === 'events' ? 'Event' : type === 'quotes' ? 'Quote' : 'Product'}</h3>
            <button className="adm-modal-close" onClick={() => setModal(null)}>✕</button>
          </div>
          <form className="adm-modal-form" onSubmit={handleSave}>
            {type === 'blog' && (
              <>
                <label>Title<input name="title" value={form.title} onChange={handleChange} required /></label>
                <div>
                  <span style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: 6, display: 'block', color: '#2c2c2c', fontFamily: "'Inter', sans-serif" }}>Cover Image</span>
                  <div className="adm-img-slot">
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                      {form.image && (form.image.startsWith('http') || form.image.startsWith('/images')) ? (
                        <img src={form.image} alt="" className="adm-img-thumb" />
                      ) : (
                        <div className="adm-img-placeholder">
                          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                        </div>
                      )}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <input name="image" value={form.image} onChange={handleChange} placeholder="Paste image URL..." style={{ width: '100%', marginBottom: 6 }} />
                        <label className="adm-upload-label">
                          <input type="file" accept="image/*" style={{ display: 'none' }} onChange={async (e) => {
                            const file = e.target.files[0];
                            if (!file) return;
                            const fd = new FormData();
                            fd.append('image', file);
                            try {
                              const res = await axios.post('/api/gallery/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
                              setForm(f => ({ ...f, image: res.data.imageUrl }));
                            } catch (err) {
                              alert('Upload failed.');
                            }
                          }} />
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                          <span>Choose File</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
                <label>Excerpt<input name="excerpt" value={form.excerpt} onChange={handleChange} placeholder="Short preview text" /></label>
                <label>Content<textarea name="content" value={form.content} onChange={handleChange} required rows="8" /></label>
                <label className="adm-checkbox"><input type="checkbox" name="published" checked={form.published} onChange={handleChange} /> Published</label>
              </>
            )}
            {type === 'events' && (
              <>
                <label>Title<input name="title" value={form.title} onChange={handleChange} required /></label>
                <div>
                  <span style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: 6, display: 'block', color: '#2c2c2c', fontFamily: "'Inter', sans-serif" }}>Event Image</span>
                  <div className="adm-img-slot">
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                      {form.image && (form.image.startsWith('http') || form.image.startsWith('/images')) ? (
                        <img src={form.image} alt="" className="adm-img-thumb" />
                      ) : (
                        <div className="adm-img-placeholder">
                          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                        </div>
                      )}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <input name="image" value={form.image} onChange={handleChange} placeholder="Paste image URL..." style={{ width: '100%', marginBottom: 6 }} />
                        <label className="adm-upload-label">
                          <input type="file" accept="image/*" style={{ display: 'none' }} onChange={async (e) => {
                            const file = e.target.files[0];
                            if (!file) return;
                            const fd = new FormData();
                            fd.append('image', file);
                            try {
                              const res = await axios.post('/api/gallery/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
                              setForm(f => ({ ...f, image: res.data.imageUrl }));
                            } catch (err) {
                              alert('Upload failed.');
                            }
                          }} />
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                          <span>Choose File</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="adm-row">
                  <label>Start Date<input type="date" name="date" value={form.date} onChange={handleChange} required /></label>
                  <label>End Date<input type="date" name="endDate" value={form.endDate} onChange={handleChange} /></label>
                </div>
                <label>Location<input name="location" value={form.location} onChange={handleChange} required /></label>
                <label>Description<textarea name="description" value={form.description} onChange={handleChange} required rows="4" /></label>
                <label className="adm-checkbox"><input type="checkbox" name="published" checked={form.published} onChange={handleChange} /> Published</label>
              </>
            )}
            {type === 'products' && (
              <>
                <label>Name<input name="name" value={form.name} onChange={handleChange} required /></label>
                <div className="adm-row">
                  <label>Price ($)<input type="number" step="0.01" name="price" value={form.price} onChange={handleChange} required /></label>
                  <label>Weight<input name="weight" value={form.weight} onChange={handleChange} /></label>
                </div>
                <label>Category
                  <select name="category" value={form.category} onChange={handleChange}>
                    <option value="raw-honey">Raw Honey</option>
                    <option value="honeycomb">Honeycomb</option>
                    <option value="creamed-honey">Creamed Honey</option>
                    <option value="infused-honey">Infused Honey</option>
                    <option value="gift-box">Gift Box</option>
                    <option value="seasonal">Seasonal</option>
                  </select>
                </label>
                <label>Description<textarea name="description" value={form.description} onChange={handleChange} required rows="4" /></label>
                <div>
                  <span style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: 10, display: 'block', color: '#2c2c2c' }}>Product Images</span>
                  {(form.images || ['']).map((img, i) => (
                    <div key={i} className="adm-img-slot">
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        {img && (img.startsWith('http') || img.startsWith('/images')) ? (
                          <img src={img} alt="" className="adm-img-thumb" />
                        ) : (
                          <div className="adm-img-placeholder">
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                          </div>
                        )}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <input value={img} onChange={e => handleImageChange(i, e.target.value)} placeholder="Paste image URL..." style={{ width: '100%', marginBottom: 6 }} />
                          <label className="adm-upload-label">
                            <input type="file" accept="image/*" style={{ display: 'none' }} onChange={async (e) => {
                              const file = e.target.files[0];
                              if (!file) return;
                              const fd = new FormData();
                              fd.append('image', file);
                              const label = e.target.closest('.adm-upload-label');
                              const span = label?.querySelector('.adm-upload-text');
                              if (span) span.textContent = 'Uploading...';
                              try {
                                const res = await axios.post('/api/products/upload-image', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
                                handleImageChange(i, res.data.imageUrl);
                              } catch (err) {
                                alert('Upload failed: ' + (err.response?.data?.message || err.message));
                              } finally {
                                if (span) span.textContent = 'Choose File';
                              }
                            }} />
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                            <span className="adm-upload-text">Choose File</span>
                          </label>
                        </div>
                        {form.images.length > 1 && (
                          <button type="button" onClick={() => setForm(f => ({ ...f, images: f.images.filter((_, j) => j !== i) }))}
                            className="adm-img-remove" title="Remove image">✕</button>
                        )}
                      </div>
                    </div>
                  ))}
                  <button type="button" onClick={() => setForm(f => ({ ...f, images: [...(f.images || []), ''] }))} className="adm-add-img-btn">+ Add Image</button>
                </div>
                <div className="adm-row">
                  <label className="adm-checkbox"><input type="checkbox" name="inStock" checked={form.inStock} onChange={handleChange} /> In Stock</label>
                  <label className="adm-checkbox"><input type="checkbox" name="isVisible" checked={form.isVisible} onChange={handleChange} /> Visible in Shop</label>
                </div>
              </>
            )}
            {type === 'quotes' && (
              <>
                <div className="adm-row">
                  <label>Name<input name="name" value={form.name} onChange={handleChange} required /></label>
                  <label>Email<input name="email" value={form.email} onChange={handleChange} required type="email" /></label>
                </div>
                <div className="adm-row">
                  <label>Phone<input name="phone" value={form.phone || ''} onChange={handleChange} /></label>
                  <label>Company<input name="company" value={form.company || ''} onChange={handleChange} /></label>
                </div>
                <div className="adm-row">
                  <label>Event Type
                    <select name="eventType" value={form.eventType} onChange={handleChange}>
                      <option value="corporate">Corporate</option>
                      <option value="wedding">Wedding</option>
                      <option value="birthday">Birthday</option>
                      <option value="holiday">Holiday</option>
                      <option value="fundraiser">Fundraiser</option>
                      <option value="festival">Festival</option>
                      <option value="other">Other</option>
                    </select>
                  </label>
                  <label>Event Date<input type="date" name="eventDate" value={form.eventDate} onChange={handleChange} required /></label>
                </div>
                <label>Event Location<input name="eventLocation" value={form.eventLocation} onChange={handleChange} required /></label>
                <label>Guest Count<input name="guestCount" value={form.guestCount || ''} onChange={handleChange} /></label>
                <label>Event Details<textarea name="details" value={form.details || ''} onChange={handleChange} rows="3" /></label>
                <label>Status
                  <select name="status" value={form.status} onChange={handleChange}>
                    <option value="new">New</option>
                    <option value="reviewed">Reviewed</option>
                    <option value="quoted">Quoted</option>
                    <option value="booked">Booked</option>
                    <option value="declined">Declined</option>
                  </select>
                </label>
                <label>Admin Notes<textarea name="adminNotes" value={form.adminNotes || ''} onChange={handleChange} rows="3" placeholder="Internal notes about this quote..." /></label>
              </>
            )}
            <button type="submit" className="adm-save-btn" disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
          </form>
        </div>
      </div>
    );
  };

  if (authLoading) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div className="adm-spinner" style={{ width: 40, height: 40, border: '4px solid #e0e0e0', borderTopColor: '#d4a843', borderRadius: '50%', animation: 'admSpin 0.8s linear infinite' }} /></div>;
  if (!user?.isAdmin) return null;

  return (
    <div className="adm-page">
      <div className="adm-container">
        <h1 className="adm-heading">Admin Dashboard</h1>

        <div className="adm-tabs">
          {tabs.map(t => (
            <button key={t} className={`adm-tab ${activeTab === t ? 'active' : ''}`} onClick={() => setActiveTab(t)}>
              {t}
              {t === 'Orders' && data.orders.length > 0 && <span className="adm-badge">{data.orders.length}</span>}
              {t === 'Quotes' && data.quotes.filter(q => q.status === 'new').length > 0 && <span className="adm-badge">{data.quotes.filter(q => q.status === 'new').length}</span>}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="adm-loading"><div className="adm-spinner" /></div>
        ) : (
          <div className="adm-content">
            {/* ORDERS TAB */}
            {activeTab === 'Orders' && (
              <div>
                <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
                  <input
                    type="text"
                    placeholder="Search by order number, name, or email..."
                    value={orderSearch || ''}
                    onChange={(e) => setOrderSearch(e.target.value)}
                    style={{ flex: 1, minWidth: '200px', padding: '10px 14px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '0.9rem', fontFamily: "'Inter', sans-serif" }}
                  />
                  <button
                    onClick={async () => {
                      if (!orderSearch.trim()) { fetchAll(); return; }
                      try {
                        const res = await axios.get(`/api/orders/admin/search?q=${encodeURIComponent(orderSearch.trim())}`);
                        setData(prev => ({ ...prev, orders: res.data.orders || [] }));
                      } catch (err) { /* ignore */ }
                    }}
                    style={{ padding: '10px 20px', backgroundColor: '#2c2c2c', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}
                  >
                    Search
                  </button>
                  {orderSearch && (
                    <button
                      onClick={() => { setOrderSearch(''); fetchAll(); }}
                      style={{ padding: '10px 16px', backgroundColor: '#eee', color: '#555', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' }}
                    >
                      Clear
                    </button>
                  )}
                  {data.orders.length > 0 && (
                    <button onClick={exportOrdersCSV} className="adm-export-btn" title="Export Orders to CSV">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                      Export CSV
                    </button>
                  )}
                </div>
                {data.orders.length === 0 ? <p className="adm-empty">No orders found.</p> : (
                  <div className="adm-table-wrap">
                    <table className="adm-table">
                      <thead>
                        <tr><th>Order #</th><th>Customer</th><th>Items</th><th>Total</th><th>Delivery</th><th>Status</th><th>Date</th><th></th></tr>
                      </thead>
                      <tbody>
                        {data.orders.map(o => (
                          <tr key={o._id} className="adm-clickable-row">
                            <td className="adm-mono" style={{ fontWeight: 700, color: '#d4a843', cursor: 'pointer' }} onClick={() => setOrderDetail(o)}>{o.orderNumber || `#${o._id.slice(-6)}`}</td>
                            <td>
                              <div style={{ cursor: 'pointer', color: '#2c2c2c' }} onClick={() => o.user?._id && viewCustomer(o.user._id)}>{o.user?.name || 'Guest'}</div>
                              <div style={{ fontSize: '0.75rem', color: '#999' }}>{o.user?.email || ''}</div>
                            </td>
                            <td>{o.items?.length || 0} items</td>
                            <td style={{ fontWeight: 600 }}>${o.total?.toFixed(2)}</td>
                            <td>{o.deliveryMethod === 'pickup' ? 'Pickup' : 'Ship'}</td>
                            <td>
                              <select value={o.status} onChange={e => handleStatusUpdate('orders', o._id, { status: e.target.value })} className={`adm-status adm-status-${o.status}`}>
                                <option value="pending">Pending</option>
                                <option value="processing">Processing</option>
                                <option value="shipped">Shipped</option>
                                <option value="delivered">Delivered</option>
                                <option value="ready-for-pickup">Ready for Pickup</option>
                                <option value="cancelled">Cancelled</option>
                              </select>
                            </td>
                            <td>{formatDate(o.createdAt)}</td>
                            <td style={{ display: 'flex', gap: 4 }}>
                              <button onClick={() => setOrderDetail(o)}
                                style={{ padding: '4px 10px', border: '1px solid #e0e0e0', background: '#fff', borderRadius: 6, fontSize: '0.72rem', cursor: 'pointer', fontFamily: "'Inter', sans-serif", color: '#2c2c2c' }}>
                                View
                              </button>
                              <button onClick={() => requestDelete('orders', o._id, o.orderNumber || `#${o._id.slice(-6)}`)}
                                style={{ padding: '4px 10px', border: '1px solid #fecaca', background: '#fff', borderRadius: 6, fontSize: '0.72rem', cursor: 'pointer', fontFamily: "'Inter', sans-serif", color: '#dc2626' }}>
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* BLOG TAB */}
            {activeTab === 'Blog' && (
              <div>
                <button className="adm-new-btn" onClick={() => setModal({ type: 'blog', mode: 'create' })}>+ New Blog Post</button>
                {data.posts.length === 0 ? <p className="adm-empty">No blog posts yet.</p> : (
                  <div className="adm-cards">
                    {data.posts.map(p => (
                      <div key={p._id} className="adm-card">
                        <div className="adm-card-top">
                          <h4>{p.title}</h4>
                          <span className={`adm-pub ${p.published ? 'on' : 'off'}`}>{p.published ? 'Published' : 'Draft'}</span>
                        </div>
                        <p className="adm-card-meta">{formatDate(p.createdAt)} · By {p.author}</p>
                        <p className="adm-card-excerpt">{p.excerpt || p.content?.substring(0, 100)}...</p>
                        <div className="adm-card-actions">
                          <button onClick={() => setModal({ type: 'blog', mode: 'edit', item: p })}>Edit</button>
                          <button className="adm-del" onClick={() => requestDelete('blog', p._id, p.title)}>Delete</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* EVENTS TAB */}
            {activeTab === 'Events' && (
              <div>
                <button className="adm-new-btn" onClick={() => setModal({ type: 'events', mode: 'create' })}>+ New Event</button>
                {data.events.length === 0 ? <p className="adm-empty">No events yet.</p> : (
                  <div className="adm-cards">
                    {data.events.map(e => (
                      <div key={e._id} className="adm-card">
                        <div className="adm-card-top">
                          <h4>{e.title}</h4>
                          <span className={`adm-pub ${e.published ? 'on' : 'off'}`}>{e.published ? 'Published' : 'Hidden'}</span>
                        </div>
                        <p className="adm-card-meta">{formatDate(e.date)}{e.endDate ? ` – ${formatDate(e.endDate)}` : ''} · {e.location}</p>
                        <p className="adm-card-excerpt">{e.description?.substring(0, 120)}...</p>
                        <div className="adm-card-actions">
                          <button onClick={() => setModal({ type: 'events', mode: 'edit', item: e })}>Edit</button>
                          <button className="adm-del" onClick={() => requestDelete('events', e._id, e.title)}>Delete</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* QUOTES TAB */}
            {activeTab === 'Quotes' && (
              <div>
                {data.quotes.length > 0 && (
                  <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
                    <button onClick={exportQuotesCSV} className="adm-export-btn">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                      Export CSV
                    </button>
                  </div>
                )}
                {data.quotes.length === 0 ? <p className="adm-empty">No quote requests yet.</p> : (
                  <div className="adm-cards">
                    {data.quotes.map(q => {
                      const statusColors = { new: '#f59e0b', reviewed: '#3b82f6', quoted: '#8b5cf6', booked: '#22c55e', declined: '#ef4444' };
                      return (
                        <div key={q._id} className="adm-card" style={{ borderLeft: `4px solid ${statusColors[q.status] || '#ddd'}` }}>
                          <div className="adm-card-top">
                            <h4>{q.name}</h4>
                            <select value={q.status} onChange={e => handleStatusUpdate('quotes', q._id, { status: e.target.value })} className={`adm-status adm-status-${q.status}`} style={{ fontSize: '0.75rem' }}>
                              <option value="new">New</option>
                              <option value="reviewed">Reviewed</option>
                              <option value="quoted">Quoted</option>
                              <option value="booked">Booked</option>
                              <option value="declined">Declined</option>
                            </select>
                          </div>
                          <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.8rem', color: '#888', marginBottom: 6 }}>
                            <a href={`mailto:${q.email}`} style={{ color: '#d4a843' }}>{q.email}</a>
                            {q.phone && <span> &bull; {q.phone}</span>}
                            {q.company && <span> &bull; {q.company}</span>}
                          </div>
                          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', fontFamily: "'Inter', sans-serif", fontSize: '0.85rem', color: '#555', marginBottom: 6 }}>
                            <span><strong>Event:</strong> <span style={{ textTransform: 'capitalize' }}>{q.eventType}</span></span>
                            <span><strong>Date:</strong> {formatDate(q.eventDate)}</span>
                            <span><strong>Guests:</strong> {q.guestCount || '—'}</span>
                          </div>
                          <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.85rem', color: '#555', marginBottom: 6 }}>
                            <strong>Location:</strong> {q.eventLocation}
                          </div>
                          {q.details && (
                            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.82rem', color: '#666', backgroundColor: '#f9f9f5', padding: '8px 10px', borderRadius: 6, marginBottom: 6, whiteSpace: 'pre-wrap' }}>
                              {q.details}
                            </div>
                          )}
                          {q.adminNotes && (
                            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.8rem', color: '#b8860b', backgroundColor: '#fffbf0', padding: '6px 10px', borderRadius: 6, marginBottom: 6 }}>
                              <strong>Admin Notes:</strong> {q.adminNotes}
                            </div>
                          )}
                          <p className="adm-card-meta">Submitted {formatDate(q.createdAt)}</p>
                          <div className="adm-card-actions">
                            <button onClick={() => setModal({ type: 'quotes', mode: 'edit', item: q })}>Edit / Notes</button>
                            <button className="adm-del" onClick={() => requestDelete('quotes', q._id, q.name)}>Delete</button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* PRODUCTS TAB */}
            {activeTab === 'Products' && (
              <div>
                <button className="adm-new-btn" onClick={() => setModal({ type: 'products', mode: 'create' })}>+ New Product</button>
                {data.products.length === 0 ? <p className="adm-empty">No products yet.</p> : (
                  <div className="adm-cards">
                    {data.products.map(p => (
                      <div key={p._id} className="adm-card" style={{ display: 'flex', flexDirection: 'column' }}>
                        {p.image && (
                          <div style={{ height: 160, marginBottom: 16, borderRadius: 8, overflow: 'hidden', background: '#f9f9f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <img src={p.image} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          </div>
                        )}
                        <div className="adm-card-top" style={{ marginTop: 'auto' }}>
                          <h4>{p.name}</h4>
                          <span className="adm-price">${p.price?.toFixed(2)}</span>
                        </div>
                        <div style={{ display: 'flex', gap: 6, marginBottom: 8, flexWrap: 'wrap' }}>
                          <span className={`adm-pub ${p.inStock ? 'on' : 'off'}`}>{p.inStock ? 'In Stock' : 'Out of Stock'}</span>
                          <span className={`adm-pub ${p.isVisible !== false ? 'on' : 'off'}`}>{p.isVisible !== false ? 'Visible' : 'Hidden'}</span>
                        </div>
                        <p className="adm-card-meta">{p.weight} · {p.category}</p>
                        <div className="adm-card-actions">
                          <button onClick={() => setModal({ type: 'products', mode: 'edit', item: p })}>Edit</button>
                          <button className="adm-del" onClick={() => requestDelete('products', p._id, p.name)}>Delete</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            {/* GALLERY TAB */}
            {activeTab === 'Gallery' && <GalleryTab images={data.gallery} onRefresh={fetchAll} />}

            {/* CUSTOMERS TAB */}
            {activeTab === 'Customers' && (
              <div>
                {data.users.length > 0 && (
                  <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
                    <button onClick={exportCustomersCSV} className="adm-export-btn">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                      Export CSV
                    </button>
                  </div>
                )}
                {data.users.length === 0 ? <p className="adm-empty">No customers found.</p> : (
                  <div className="adm-table-wrap">
                    <table className="adm-table">
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Email</th>
                          <th>Phone</th>
                          <th>Orders</th>
                          <th>Joined</th>
                          <th>Status</th>
                          <th>Admin</th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.users.map(u => {
                          const userOrderCount = data.orders.filter(o => o.user?._id === u._id).length;
                          return (
                            <tr key={u._id} className="adm-clickable-row">
                              <td style={{ fontWeight: 600, cursor: 'pointer', color: '#2c2c2c' }} onClick={() => viewCustomer(u._id)}>{u.name}</td>
                              <td>{u.email}</td>
                              <td>{u.phoneNumber || '—'}</td>
                              <td>
                                <span style={{ background: userOrderCount > 0 ? '#fffbf0' : '#f5f5f5', color: userOrderCount > 0 ? '#b8860b' : '#999', padding: '2px 10px', borderRadius: 12, fontSize: '0.78rem', fontWeight: 600 }}>
                                  {userOrderCount}
                                </span>
                              </td>
                              <td>{formatDate(u.createdAt)}</td>
                              <td>
                                <span className={`adm-pub ${u.isVerified ? 'on' : 'off'}`}>
                                  {u.isVerified ? 'Verified' : 'Unverified'}
                                </span>
                              </td>
                              <td>{u.isAdmin ? 'Yes' : 'No'}</td>
                              <td style={{ display: 'flex', gap: 4 }}>
                                <button onClick={() => viewCustomer(u._id)}
                                  style={{ padding: '4px 10px', border: '1px solid #e0e0e0', background: '#fff', borderRadius: 6, fontSize: '0.72rem', cursor: 'pointer', fontFamily: "'Inter', sans-serif", color: '#d4a843', fontWeight: 600 }}>
                                  View
                                </button>
                                {!u.isAdmin && (
                                  <button onClick={() => requestDelete('users', u._id, u.name)}
                                    style={{ padding: '4px 10px', border: '1px solid #fecaca', background: '#fff', borderRadius: 6, fontSize: '0.72rem', cursor: 'pointer', fontFamily: "'Inter', sans-serif", color: '#dc2626' }}>
                                    Delete
                                  </button>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <ModalForm />

      {/* Order Detail Modal */}
      {orderDetail && (
        <div className="adm-modal-overlay" onClick={() => setOrderDetail(null)}>
          <div className="adm-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 640 }}>
            <div className="adm-modal-header">
              <h3>Order {orderDetail.orderNumber || `#${orderDetail._id?.slice(-6)}`}</h3>
              <button className="adm-modal-close" onClick={() => setOrderDetail(null)}>✕</button>
            </div>
            <div style={{ padding: '0 28px 28px' }}>
              {/* Status badge */}
              <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 20, flexWrap: 'wrap' }}>
                <span className={`adm-status adm-status-${orderDetail.status}`} style={{ padding: '5px 14px', borderRadius: 20, fontWeight: 600, fontSize: '0.8rem', textTransform: 'uppercase' }}>
                  {orderDetail.status}
                </span>
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.82rem', color: '#999' }}>
                  {formatDate(orderDetail.createdAt)}
                </span>
                {orderDetail.paymentIntentId && (
                  <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.72rem', color: '#bbb', fontFamily: 'monospace' }}>
                    {orderDetail.paymentIntentId}
                  </span>
                )}
              </div>

              {/* Customer info */}
              <div style={{ background: '#f9f9f5', borderRadius: 10, padding: '14px 18px', marginBottom: 16 }}>
                <div style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: '0.82rem', color: '#999', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>Customer</div>
                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.9rem', color: '#2c2c2c', fontWeight: 600 }}>{orderDetail.user?.name || 'Guest'}</div>
                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.85rem', color: '#666' }}>{orderDetail.user?.email || ''}</div>
              </div>

              {/* Items */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: '0.82rem', color: '#999', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 10 }}>Items</div>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: "'Inter', sans-serif", fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #f0f0ec' }}>
                      <th style={{ textAlign: 'left', padding: '8px 0', color: '#999', fontSize: '0.75rem', fontWeight: 600 }}>Product</th>
                      <th style={{ textAlign: 'center', padding: '8px 0', color: '#999', fontSize: '0.75rem', fontWeight: 600 }}>Qty</th>
                      <th style={{ textAlign: 'right', padding: '8px 0', color: '#999', fontSize: '0.75rem', fontWeight: 600 }}>Price</th>
                      <th style={{ textAlign: 'right', padding: '8px 0', color: '#999', fontSize: '0.75rem', fontWeight: 600 }}>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(orderDetail.items || []).map((item, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid #f5f5f2' }}>
                        <td style={{ padding: '10px 0', color: '#2c2c2c' }}>{item.name || 'Item'}</td>
                        <td style={{ textAlign: 'center', padding: '10px 0', color: '#666' }}>{item.quantity}</td>
                        <td style={{ textAlign: 'right', padding: '10px 0', color: '#666' }}>${item.price?.toFixed(2) || '0.00'}</td>
                        <td style={{ textAlign: 'right', padding: '10px 0', color: '#2c2c2c', fontWeight: 600 }}>${((item.price || 0) * (item.quantity || 1)).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals */}
              <div style={{ borderTop: '2px solid #f0f0ec', paddingTop: 14, marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: "'Inter', sans-serif", fontSize: '0.85rem', marginBottom: 4 }}>
                  <span style={{ color: '#777' }}>Subtotal</span><span style={{ color: '#2c2c2c' }}>${orderDetail.subtotal?.toFixed(2) || '0.00'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: "'Inter', sans-serif", fontSize: '0.85rem', marginBottom: 4 }}>
                  <span style={{ color: '#777' }}>Shipping</span><span style={{ color: '#2c2c2c' }}>{orderDetail.shippingCost > 0 ? `$${orderDetail.shippingCost.toFixed(2)}` : 'FREE'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: "'Inter', sans-serif", fontSize: '0.85rem', marginBottom: 8 }}>
                  <span style={{ color: '#777' }}>Tax (8.25%)</span><span style={{ color: '#2c2c2c' }}>${orderDetail.tax?.toFixed(2) || '0.00'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: "'Inter', sans-serif", fontSize: '1.05rem', fontWeight: 700, borderTop: '2px solid #d4a843', paddingTop: 10 }}>
                  <span>Total</span><span>${orderDetail.total?.toFixed(2) || '0.00'}</span>
                </div>
              </div>

              {/* Delivery info */}
              <div style={{ background: '#f9f9f5', borderRadius: 10, padding: '14px 18px' }}>
                <div style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: '0.82rem', color: '#999', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>
                  {orderDetail.deliveryMethod === 'pickup' ? 'Store Pickup' : 'Shipping Address'}
                </div>
                {orderDetail.deliveryMethod === 'pickup' ? (
                  <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.88rem', color: '#2c2c2c' }}>
                    North San Antonio, TX (Alta Vista)
                    {orderDetail.pickupNote && <div style={{ color: '#666', marginTop: 4, fontSize: '0.82rem' }}>Note: {orderDetail.pickupNote}</div>}
                  </div>
                ) : orderDetail.shippingAddress ? (
                  <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.88rem', color: '#2c2c2c', lineHeight: 1.5 }}>
                    {orderDetail.shippingAddress.street}<br />
                    {orderDetail.shippingAddress.city}, {orderDetail.shippingAddress.state} {orderDetail.shippingAddress.zip}
                  </div>
                ) : (
                  <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.85rem', color: '#999' }}>No address provided</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Customer Detail Modal */}
      {(customerDetail || customerLoading) && (
        <div className="adm-modal-overlay" onClick={() => { setCustomerDetail(null); setCustomerLoading(false); }}>
          <div className="adm-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 720 }}>
            <div className="adm-modal-header">
              <h3>{customerLoading ? 'Loading...' : `Customer: ${customerDetail?.user?.name || 'Unknown'}`}</h3>
              <button className="adm-modal-close" onClick={() => { setCustomerDetail(null); setCustomerLoading(false); }}>✕</button>
            </div>
            {customerLoading ? (
              <div style={{ padding: 40, textAlign: 'center' }}><div className="adm-spinner" style={{ margin: '0 auto' }} /></div>
            ) : customerDetail && (
              <div style={{ padding: '0 28px 28px' }}>
                {/* Customer info card */}
                <div style={{ background: '#f9f9f5', borderRadius: 12, padding: '20px 22px', marginBottom: 24, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 30px' }}>
                  <div>
                    <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.72rem', fontWeight: 600, color: '#999', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 3 }}>Name</div>
                    <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.92rem', color: '#2c2c2c', fontWeight: 600 }}>{customerDetail.user?.name}</div>
                  </div>
                  <div>
                    <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.72rem', fontWeight: 600, color: '#999', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 3 }}>Email</div>
                    <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.92rem', color: '#2c2c2c' }}>
                      <a href={`mailto:${customerDetail.user?.email}`} style={{ color: '#d4a843', textDecoration: 'none' }}>{customerDetail.user?.email}</a>
                    </div>
                  </div>
                  <div>
                    <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.72rem', fontWeight: 600, color: '#999', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 3 }}>Phone</div>
                    <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.92rem', color: '#2c2c2c' }}>{customerDetail.user?.phoneNumber || '—'}</div>
                  </div>
                  <div>
                    <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.72rem', fontWeight: 600, color: '#999', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 3 }}>Member Since</div>
                    <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.92rem', color: '#2c2c2c' }}>{formatDate(customerDetail.user?.createdAt)}</div>
                  </div>
                  <div>
                    <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.72rem', fontWeight: 600, color: '#999', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 3 }}>Status</div>
                    <span className={`adm-pub ${customerDetail.user?.isVerified ? 'on' : 'off'}`}>
                      {customerDetail.user?.isVerified ? 'Verified' : 'Unverified'}
                    </span>
                  </div>
                  <div>
                    <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.72rem', fontWeight: 600, color: '#999', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 3 }}>Total Spent</div>
                    <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.92rem', color: '#2c2c2c', fontWeight: 700 }}>
                      ${customerDetail.orders.reduce((sum, o) => sum + (o.total || 0), 0).toFixed(2)}
                    </div>
                  </div>
                </div>

                {/* Orders list */}
                <div style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: '0.92rem', color: '#2c2c2c', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#d4a843" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
                  Order History ({customerDetail.orders.length})
                </div>

                {customerDetail.orders.length === 0 ? (
                  <p style={{ fontFamily: "'Inter', sans-serif", color: '#999', textAlign: 'center', padding: 30 }}>This customer has no orders yet.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxHeight: 400, overflowY: 'auto' }}>
                    {customerDetail.orders.map(o => {
                      const statusColors = { pending: '#f59e0b', processing: '#3b82f6', shipped: '#8b5cf6', delivered: '#22c55e', 'ready-for-pickup': '#22c55e', cancelled: '#ef4444' };
                      return (
                        <div key={o._id} style={{ border: '1px solid #f0f0ec', borderRadius: 10, padding: '14px 18px', cursor: 'pointer', transition: 'border-color 0.2s' }}
                          onClick={() => { setCustomerDetail(null); setOrderDetail(o); }}
                          onMouseEnter={e => e.currentTarget.style.borderColor = '#d4a843'}
                          onMouseLeave={e => e.currentTarget.style.borderColor = '#f0f0ec'}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <span style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: '0.88rem', color: '#d4a843', letterSpacing: '0.5px' }}>
                                {o.orderNumber || `#${o._id.slice(-6)}`}
                              </span>
                              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.78rem', color: '#999' }}>
                                {formatDate(o.createdAt)}
                              </span>
                            </div>
                            <span style={{
                              padding: '3px 10px', borderRadius: 12, fontSize: '0.68rem', fontWeight: 600,
                              fontFamily: "'Inter', sans-serif", textTransform: 'uppercase',
                              color: '#fff', backgroundColor: statusColors[o.status] || '#999'
                            }}>
                              {o.status === 'ready-for-pickup' ? 'Ready' : o.status}
                            </span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                              {(o.items || []).map((item, i) => (
                                <span key={i} style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.78rem', color: '#666', background: '#f5f5f2', padding: '2px 8px', borderRadius: 4 }}>
                                  {item.name || 'Item'}{item.quantity > 1 ? ` x${item.quantity}` : ''}
                                </span>
                              ))}
                            </div>
                            <span style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: '0.92rem', color: '#2c2c2c', whiteSpace: 'nowrap', marginLeft: 12 }}>
                              ${o.total?.toFixed(2) || '0.00'}
                            </span>
                          </div>
                          <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.75rem', color: '#999', marginTop: 6 }}>
                            {o.deliveryMethod === 'pickup' ? 'Store Pickup' : 'Shipped'}
                            {o.shippingAddress ? ` to ${o.shippingAddress.city}, ${o.shippingAddress.state}` : ''}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Confirm Dialog */}
      {confirmDialog && (
        <ConfirmModal {...confirmDialog} onCancel={() => setConfirmDialog(null)} />
      )}

      <style>{`
        .adm-page { background: #f5f5f0; min-height: 100vh; padding: 100px 0 60px; }
        .adm-container { max-width: 1100px; margin: 0 auto; padding: 0 20px; }
        .adm-heading { font-family: 'Playfair Display', serif; font-weight: 900; font-size: 2rem; color: #2c2c2c; margin-bottom: 24px; }
        .adm-tabs { display: flex; gap: 4px; margin-bottom: 24px; overflow-x: auto; }
        .adm-tab {
          padding: 10px 20px; border: none; background: #fff; border-radius: 8px 8px 0 0;
          font-family: 'Inter', sans-serif; font-size: 0.9rem; font-weight: 500; color: #777;
          cursor: pointer; position: relative; transition: all 0.2s;
        }
        .adm-tab.active { background: #fff; color: #2c2c2c; font-weight: 700; box-shadow: 0 -2px 0 #d4a843 inset; }
        .adm-badge {
          display: inline-flex; align-items: center; justify-content: center;
          background: #d4a843; color: #fff; border-radius: 50%; width: 20px; height: 20px;
          font-size: 0.7rem; font-weight: 700; margin-left: 6px;
        }
        .adm-loading { display: flex; justify-content: center; padding: 60px; }
        .adm-spinner { width: 40px; height: 40px; border: 4px solid #e0e0e0; border-top-color: #d4a843; border-radius: 50%; animation: admSpin 0.8s linear infinite; }
        @keyframes admSpin { to { transform: rotate(360deg); } }
        .adm-content { background: #fff; border-radius: 0 12px 12px 12px; padding: 28px; box-shadow: 0 2px 8px rgba(0,0,0,0.04); }
        .adm-empty { font-family: 'Inter', sans-serif; color: #999; text-align: center; padding: 40px; }
        .adm-new-btn {
          display: inline-block; padding: 10px 24px; background: #d4a843; color: #fff;
          border: none; border-radius: 8px; font-family: 'Inter', sans-serif; font-weight: 600;
          font-size: 0.85rem; cursor: pointer; margin-bottom: 20px; transition: background 0.2s;
        }
        .adm-new-btn:hover { background: #b8892b; }

        /* Table */
        .adm-table-wrap { overflow-x: auto; }
        .adm-table { width: 100%; border-collapse: collapse; font-family: 'Inter', sans-serif; font-size: 0.85rem; }
        .adm-table th { text-align: left; padding: 10px 12px; color: #999; font-weight: 600; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid #f0f0f0; }
        .adm-table td { padding: 12px; border-bottom: 1px solid #f5f5f5; color: #2c2c2c; }
        .adm-mono { font-family: monospace; font-size: 0.8rem; }
        .adm-status { padding: 4px 8px; border-radius: 6px; border: 1px solid #e0e0e0; font-size: 0.8rem; font-family: 'Inter', sans-serif; cursor: pointer; }
        .adm-status-pending { color: #e67e22; }
        .adm-status-processing { color: #3498db; }
        .adm-status-shipped { color: #2980b9; }
        .adm-status-delivered { color: #27ae60; }
        .adm-status-cancelled { color: #e74c3c; }
        .adm-status-new { color: #d4a843; font-weight: 600; }
        .adm-status-reviewed { color: #3498db; }
        .adm-status-quoted { color: #8e44ad; }
        .adm-status-booked { color: #27ae60; }
        .adm-status-declined { color: #e74c3c; }

        /* Cards */
        .adm-cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 16px; }
        .adm-card { border: 1px solid #f0f0f0; border-radius: 10px; padding: 20px; }
        .adm-card-top { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; margin-bottom: 8px; }
        .adm-card-top h4 { font-family: 'Playfair Display', serif; font-size: 1.1rem; color: #2c2c2c; margin: 0; }
        .adm-pub { font-size: 0.7rem; padding: 3px 8px; border-radius: 20px; font-weight: 600; white-space: nowrap; }
        .adm-pub.on { background: #e8f5e9; color: #2e7d32; }
        .adm-pub.off { background: #fff3e0; color: #e65100; }
        .adm-price { font-weight: 700; color: #2c2c2c; font-size: 1rem; white-space: nowrap; }
        .adm-card-meta { font-family: 'Inter', sans-serif; font-size: 0.8rem; color: #999; margin-bottom: 8px; }
        .adm-card-excerpt { font-family: 'Inter', sans-serif; font-size: 0.85rem; color: #666; line-height: 1.5; margin-bottom: 12px; }
        .adm-card-actions { display: flex; gap: 8px; }
        .adm-card-actions button {
          padding: 6px 16px; border: 1px solid #e0e0e0; background: #fff; border-radius: 6px;
          font-family: 'Inter', sans-serif; font-size: 0.8rem; cursor: pointer; transition: all 0.2s;
        }
        .adm-card-actions button:hover { border-color: #d4a843; color: #d4a843; }
        .adm-del { color: #dc2626 !important; }
        .adm-del:hover { border-color: #dc2626 !important; }

        /* Modal */
        .adm-modal-overlay {
          position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 1000;
          display: flex; align-items: center; justify-content: center; padding: 20px;
        }
        .adm-modal {
          background: #fff; border-radius: 16px; width: 100%; max-width: 600px;
          max-height: 90vh; overflow-y: auto; box-shadow: 0 20px 60px rgba(0,0,0,0.2);
        }
        .adm-modal-header {
          display: flex; justify-content: space-between; align-items: center;
          padding: 24px 28px 0; margin-bottom: 20px;
        }
        .adm-modal-header h3 { font-family: 'Playfair Display', serif; font-size: 1.4rem; color: #2c2c2c; margin: 0; }
        .adm-modal-close { background: none; border: none; font-size: 1.2rem; cursor: pointer; color: #999; padding: 4px; }
        .adm-modal-form { padding: 0 28px 28px; display: flex; flex-direction: column; gap: 16px; }
        .adm-modal-form label { display: flex; flex-direction: column; gap: 6px; font-family: 'Inter', sans-serif; font-size: 0.85rem; font-weight: 600; color: #2c2c2c; }
        .adm-modal-form input, .adm-modal-form textarea, .adm-modal-form select {
          padding: 10px 14px; border: 2px solid #e0e0e0; border-radius: 8px;
          font-family: 'Inter', sans-serif; font-size: 0.95rem; color: #2c2c2c; outline: none; transition: border-color 0.2s;
        }
        .adm-modal-form input:focus, .adm-modal-form textarea:focus, .adm-modal-form select:focus { border-color: #d4a843; }
        .adm-modal-form textarea { resize: vertical; }
        .adm-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .adm-checkbox { flex-direction: row !important; align-items: center !important; gap: 8px !important; }
        .adm-checkbox input { width: 18px; height: 18px; accent-color: #d4a843; }
        .adm-img-slot {
          background: #fafaf8; border: 1px solid #f0f0ec; border-radius: 10px;
          padding: 12px 14px; margin-bottom: 10px;
        }
        .adm-img-thumb {
          width: 56px; height: 56px; object-fit: cover; border-radius: 8px;
          border: 1px solid #e0e0e0; flex-shrink: 0;
        }
        .adm-img-placeholder {
          width: 56px; height: 56px; border-radius: 8px; border: 2px dashed #e0e0e0;
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
          background: #fff;
        }
        .adm-upload-label {
          display: inline-flex; align-items: center; gap: 6px; padding: 6px 14px;
          background: #fff; border: 1px solid #d4a843; border-radius: 6px;
          font-family: 'Inter', sans-serif; font-size: 0.78rem; font-weight: 600;
          color: #d4a843; cursor: pointer; transition: all 0.2s;
        }
        .adm-upload-label:hover { background: #fffbf0; }
        .adm-img-remove {
          width: 30px; height: 30px; border-radius: 50%; border: 1px solid #fecaca;
          background: #fff; color: #dc2626; font-size: 0.8rem; cursor: pointer;
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
          transition: all 0.2s;
        }
        .adm-img-remove:hover { background: #fef2f2; border-color: #dc2626; }
        .adm-add-img-btn {
          background: none; border: 1px dashed #ccc; border-radius: 6px; padding: 8px 16px;
          font-family: 'Inter', sans-serif; font-size: 0.82rem; color: #888; cursor: pointer;
          transition: all 0.2s;
        }
        .adm-add-img-btn:hover { border-color: #d4a843; color: #d4a843; }
        .adm-save-btn {
          padding: 12px 32px; background: #d4a843; color: #fff; border: none; border-radius: 8px;
          font-family: 'Inter', sans-serif; font-weight: 700; font-size: 0.9rem; cursor: pointer;
          align-self: flex-end; transition: background 0.2s;
        }
        .adm-save-btn:hover { background: #b8892b; }
        .adm-save-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .adm-export-btn {
          display: inline-flex; align-items: center; gap: 6px; padding: 10px 18px;
          background: #fff; border: 1px solid #d4a843; border-radius: 6px;
          font-family: 'Inter', sans-serif; font-size: 0.82rem; font-weight: 600;
          color: #d4a843; cursor: pointer; transition: all 0.2s; white-space: nowrap;
        }
        .adm-export-btn:hover { background: #fffbf0; border-color: #b8892b; color: #b8892b; }
        .adm-clickable-row:hover { background: #fafaf8; }

        @media (max-width: 768px) {
          .adm-page { padding: 90px 0 40px; }
          .adm-content { padding: 20px 16px; }
          .adm-tabs { gap: 2px; }
          .adm-tab { padding: 8px 14px; font-size: 0.8rem; }
          .adm-cards { grid-template-columns: 1fr; }
          .adm-row { grid-template-columns: 1fr; }
          .adm-table { font-size: 0.75rem; }
        }
      `}</style>
    </div>
  );
};

export default Admin;
