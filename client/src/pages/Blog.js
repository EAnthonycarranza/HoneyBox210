import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const Blog = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { window.scrollTo(0, 0); }, []);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await axios.get('/api/blog');
        setPosts(res.data.posts || []);
      } catch (err) {
        console.error('Failed to load blog posts');
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="hb-blog-page">
      <div className="hb-blog-container">
        <h1 className="hb-blog-heading">Blog</h1>
        <p className="hb-blog-subheading">News, stories, and updates from Honey Box 210</p>

        {loading ? (
          <div className="hb-blog-loading"><div className="hb-blog-spinner" /></div>
        ) : posts.length === 0 ? (
          <div className="hb-blog-empty">
            <p>No blog posts yet. Check back soon!</p>
          </div>
        ) : (
          <div className="hb-blog-grid">
            {posts.map((post) => (
              <Link to={`/blog/${post._id}`} key={post._id} className="hb-blog-card">
                <div className="hb-blog-card-img">
                  {post.image ? (
                    <img src={post.image} alt={post.title} />
                  ) : (
                    <div className="hb-blog-card-placeholder">🍯</div>
                  )}
                </div>
                <div className="hb-blog-card-body">
                  <span className="hb-blog-card-date">{formatDate(post.createdAt)}</span>
                  <h2 className="hb-blog-card-title">{post.title}</h2>
                  <p className="hb-blog-card-excerpt">
                    {post.excerpt || post.content.substring(0, 150) + '...'}
                  </p>
                  <span className="hb-blog-card-link">Read More →</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <style>{`
        .hb-blog-page { background: #fafaf7; min-height: 100vh; padding: 110px 0 80px; }
        .hb-blog-container { max-width: 1000px; margin: 0 auto; padding: 0 24px; }
        .hb-blog-heading {
          font-family: 'Playfair Display', serif; font-weight: 900;
          font-size: clamp(2rem, 5vw, 3rem); color: #2c2c2c; margin-bottom: 8px;
        }
        .hb-blog-subheading {
          font-family: 'Inter', sans-serif; color: #777; font-size: 1rem; margin-bottom: 48px;
        }
        .hb-blog-loading { display: flex; justify-content: center; padding: 80px 0; }
        .hb-blog-spinner {
          width: 44px; height: 44px; border: 4px solid #f0f0f0;
          border-top-color: #d4a843; border-radius: 50%; animation: blogSpin 0.8s linear infinite;
        }
        @keyframes blogSpin { to { transform: rotate(360deg); } }
        .hb-blog-empty { text-align: center; padding: 60px 20px; color: #999; font-family: 'Inter', sans-serif; }
        .hb-blog-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 32px; }
        .hb-blog-card {
          background: #fff; border-radius: 12px; overflow: hidden; text-decoration: none; color: inherit;
          box-shadow: 0 2px 10px rgba(0,0,0,0.06); transition: transform 0.3s, box-shadow 0.3s;
        }
        .hb-blog-card:hover { transform: translateY(-4px); box-shadow: 0 8px 25px rgba(0,0,0,0.1); }
        .hb-blog-card-img { width: 100%; height: 220px; overflow: hidden; background: #f5e6c8; }
        .hb-blog-card-img img { width: 100%; height: 100%; object-fit: cover; }
        .hb-blog-card-placeholder {
          width: 100%; height: 100%; display: flex; align-items: center;
          justify-content: center; font-size: 3rem;
        }
        .hb-blog-card-body { padding: 24px; }
        .hb-blog-card-date { font-family: 'Inter', sans-serif; font-size: 0.8rem; color: #999; }
        .hb-blog-card-title {
          font-family: 'Playfair Display', serif; font-weight: 700; font-size: 1.3rem;
          color: #2c2c2c; margin: 8px 0 12px; line-height: 1.3;
        }
        .hb-blog-card-excerpt {
          font-family: 'Inter', sans-serif; font-size: 0.9rem; color: #666;
          line-height: 1.6; margin-bottom: 16px;
        }
        .hb-blog-card-link {
          font-family: 'Inter', sans-serif; font-size: 0.85rem; color: #d4a843;
          font-weight: 600; letter-spacing: 0.5px;
        }
        @media (max-width: 700px) {
          .hb-blog-page { padding: 90px 0 60px; }
          .hb-blog-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
};

export default Blog;
