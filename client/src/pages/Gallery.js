import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Gallery = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchImages = async () => {
      try {
        const res = await axios.get('/api/gallery');
        setImages(res.data.images || []);
      } catch (err) {
        // silently fail
      } finally {
        setLoading(false);
      }
    };
    fetchImages();
  }, []);

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>Gallery</h1>
          <p style={styles.subtitle}>
            A peek inside our hives and the honey-making process
          </p>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <div style={{ width: 40, height: 40, border: '4px solid #e0e0e0', borderTopColor: '#d4a843', borderRadius: '50%', animation: 'galleryFadeIn 0.8s linear infinite', margin: '0 auto' }} />
          </div>
        ) : images.length === 0 ? (
          <p style={{ textAlign: 'center', fontFamily: "'Inter', sans-serif", color: '#999', padding: '60px 0' }}>
            No gallery images yet. Check back soon!
          </p>
        ) : (
          <div style={styles.grid} className="gallery-grid">
            {images.map((item, index) => (
              <div
                key={item._id}
                style={{ ...styles.card, animationDelay: `${index * 0.05}s` }}
                className="gallery-card"
                onClick={() => setSelectedItem(item)}
              >
                <img
                  src={item.imageUrl}
                  alt={item.title || 'Gallery image'}
                  style={styles.cardImage}
                />
                {(item.title || item.caption) && (
                  <div style={styles.cardOverlay}>
                    {item.title && <h3 style={styles.cardTitle}>{item.title}</h3>}
                    {item.caption && <p style={styles.cardDesc}>{item.caption}</p>}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {selectedItem && (
        <div style={styles.lightboxOverlay} onClick={() => setSelectedItem(null)}>
          <div style={styles.lightbox} onClick={(e) => e.stopPropagation()}>
            <button style={styles.lightboxClose} onClick={() => setSelectedItem(null)}>
              &times;
            </button>
            <img
              src={selectedItem.imageUrl}
              alt={selectedItem.title || 'Gallery image'}
              style={styles.lightboxImage}
            />
            {(selectedItem.title || selectedItem.caption) && (
              <div style={styles.lightboxInfo}>
                {selectedItem.title && <h2 style={styles.lightboxTitle}>{selectedItem.title}</h2>}
                {selectedItem.caption && <p style={styles.lightboxDesc}>{selectedItem.caption}</p>}
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`
        .gallery-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
        }
        .gallery-card {
          animation: galleryFadeIn 0.5s ease both;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .gallery-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 40px rgba(0,0,0,0.15);
        }
        @keyframes galleryFadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @media (max-width: 900px) {
          .gallery-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 14px !important;
          }
        }
        @media (max-width: 520px) {
          .gallery-grid {
            grid-template-columns: 1fr !important;
            gap: 16px !important;
          }
        }
      `}</style>
    </div>
  );
};

const styles = {
  page: { minHeight: '100vh', paddingTop: '100px', paddingBottom: '80px', backgroundColor: '#fafaf7' },
  container: { maxWidth: '1100px', margin: '0 auto', padding: '0 20px' },
  header: { textAlign: 'center', marginBottom: '50px' },
  title: { fontFamily: "'Playfair Display', serif", fontWeight: 900, fontSize: 'clamp(2rem, 5vw, 3rem)', color: '#2c2c2c', marginBottom: '12px' },
  subtitle: { fontFamily: "'Inter', sans-serif", color: '#777', fontSize: 'clamp(0.95rem, 2vw, 1.1rem)', maxWidth: '500px', margin: '0 auto' },
  grid: {},
  card: { position: 'relative', borderRadius: '16px', overflow: 'hidden', cursor: 'pointer', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' },
  cardImage: { width: '100%', aspectRatio: '4 / 3', objectFit: 'cover', display: 'block' },
  cardOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(transparent, rgba(0,0,0,0.75))', padding: '40px 16px 16px' },
  cardTitle: { fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: '1.05rem', color: '#fff', marginBottom: '4px' },
  cardDesc: { fontFamily: "'Inter', sans-serif", fontSize: '0.8rem', color: 'rgba(255,255,255,0.8)' },
  lightboxOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 5000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' },
  lightbox: { backgroundColor: '#fff', borderRadius: '20px', overflow: 'hidden', maxWidth: '700px', width: '100%', position: 'relative' },
  lightboxClose: { position: 'absolute', top: '12px', right: '16px', background: 'rgba(0,0,0,0.5)', border: 'none', color: '#fff', fontSize: '1.8rem', width: '40px', height: '40px', borderRadius: '50%', cursor: 'pointer', zIndex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 },
  lightboxImage: { width: '100%', maxHeight: '500px', objectFit: 'contain', display: 'block', backgroundColor: '#f5f5f5' },
  lightboxInfo: { padding: '24px' },
  lightboxTitle: { fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: '1.5rem', color: '#2c2c2c', marginBottom: '8px' },
  lightboxDesc: { fontFamily: "'Inter', sans-serif", fontSize: '1rem', color: '#777' },
};

export default Gallery;
