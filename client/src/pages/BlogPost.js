import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

const BlogPostPage = () => {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { window.scrollTo(0, 0); }, []);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await axios.get(`/api/blog/${id}`);
        setPost(res.data.post || res.data);
      } catch (err) {
        setPost(null);
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [id]);

  const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  if (loading) {
    return (
      <div className="hb-bp-page">
        <div className="hb-bp-loading"><div className="hb-bp-spinner" /></div>
        <style>{styles}</style>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="hb-bp-page">
        <div className="hb-bp-container" style={{ textAlign: 'center', paddingTop: '60px' }}>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.8rem', color: '#2c2c2c' }}>Post Not Found</h2>
          <Link to="/blog" style={{ color: '#d4a843', fontFamily: "'Inter', sans-serif" }}>← Back to Blog</Link>
        </div>
        <style>{styles}</style>
      </div>
    );
  }

  return (
    <div className="hb-bp-page">
      <div className="hb-bp-container">
        <Link to="/blog" className="hb-bp-back">← Back to Blog</Link>

        {post.image && (
          <div className="hb-bp-hero">
            <img src={post.image} alt={post.title} />
          </div>
        )}

        <span className="hb-bp-date">{formatDate(post.createdAt)} · By {post.author || 'Mari'}</span>
        <h1 className="hb-bp-title">{post.title}</h1>

        <div className="hb-bp-content">
          {post.content.split('\n').map((p, i) => (
            p.trim() ? <p key={i}>{p}</p> : <br key={i} />
          ))}
        </div>
      </div>
      <style>{styles}</style>
    </div>
  );
};

const styles = `
  .hb-bp-page { background: #fafaf7; min-height: 100vh; padding: 110px 0 80px; }
  .hb-bp-container { max-width: 780px; margin: 0 auto; padding: 0 24px; }
  .hb-bp-loading { display: flex; justify-content: center; padding: 120px 0; }
  .hb-bp-spinner {
    width: 44px; height: 44px; border: 4px solid #f0f0f0;
    border-top-color: #d4a843; border-radius: 50%; animation: bpSpin 0.8s linear infinite;
  }
  @keyframes bpSpin { to { transform: rotate(360deg); } }
  .hb-bp-back {
    display: inline-block; font-family: 'Inter', sans-serif; font-size: 0.9rem;
    color: #2c2c2c; text-decoration: none; font-weight: 500; margin-bottom: 32px;
  }
  .hb-bp-back:hover { color: #d4a843; }
  .hb-bp-hero {
    width: 100%; border-radius: 16px; overflow: hidden; margin-bottom: 32px;
    max-height: 450px;
  }
  .hb-bp-hero img { width: 100%; height: 100%; object-fit: cover; }
  .hb-bp-date { font-family: 'Inter', sans-serif; font-size: 0.85rem; color: #999; }
  .hb-bp-title {
    font-family: 'Playfair Display', serif; font-weight: 900;
    font-size: clamp(1.8rem, 4vw, 2.6rem); color: #2c2c2c;
    margin: 12px 0 32px; line-height: 1.25;
  }
  .hb-bp-content { font-family: 'Inter', sans-serif; color: #444; font-size: 1.05rem; line-height: 1.9; }
  .hb-bp-content p { margin-bottom: 20px; }
  @media (max-width: 600px) {
    .hb-bp-page { padding: 90px 0 60px; }
    .hb-bp-hero { border-radius: 12px; }
  }
`;

export default BlogPostPage;
