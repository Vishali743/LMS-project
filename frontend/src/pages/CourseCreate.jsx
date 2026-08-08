import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Save, ArrowLeft, Layers, Image, CreditCard } from 'lucide-react';

export default function CourseCreate() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [price, setPrice] = useState('0.00');
  const [isPublished, setIsPublished] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Load categories
  useEffect(() => {
    async function loadCategories() {
      try {
        const response = await api.get('/courses/categories');
        setCategories(response.data.categories);
        if (response.data.categories.length > 0) {
          setCategoryId(response.data.categories[0].id);
        }
      } catch (err) {
        console.error('Failed to load categories:', err);
      }
    }
    loadCategories();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !categoryId) {
      return setError('Please provide a course title and select a category.');
    }

    try {
      setLoading(true);
      setError('');
      
      const payload = {
        title,
        description,
        category_id: parseInt(categoryId),
        thumbnail_url: thumbnailUrl,
        price: parseFloat(price) || 0.00,
        is_published: isPublished
      };

      const response = await api.post('/courses', payload);
      // Navigate to course management page
      navigate(`/courses/${response.data.courseId}/manage`);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Failed to create course. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-wide" style={{ maxWidth: '720px' }}>
      {/* Header */}
      <button 
        onClick={() => navigate('/dashboard')} 
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          background: 'none',
          border: 'none',
          color: 'var(--text-secondary)',
          cursor: 'pointer',
          marginBottom: '20px',
          fontSize: '14px'
        }}
      >
        <ArrowLeft size={16} />
        Back to Dashboard
      </button>

      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', marginBottom: '8px' }}>Create a New Course</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Fill out the details below. You can upload lessons and build assessments next.</p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <form onSubmit={handleSubmit} className="glass-panel" style={{ padding: '30px', borderRadius: '16px' }}>
        {/* Title */}
        <div className="form-group">
          <label className="form-label">Course Title *</label>
          <input 
            type="text" 
            className="form-input" 
            placeholder="e.g. Master modern JavaScript from scratch"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={loading}
            required
          />
        </div>

        {/* Description */}
        <div className="form-group">
          <label className="form-label">Course Description</label>
          <textarea 
            className="form-textarea" 
            placeholder="Provide a comprehensive summary of what students will learn, target audience, and pre-requisites..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={loading}
          />
        </div>

        {/* Category & Price Split */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div className="form-group">
            <label className="form-label">Course Topic *</label>
            <div style={{ position: 'relative' }}>
              <Layers size={16} style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--text-muted)' }} />
              <select 
                className="form-select"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                style={{ paddingLeft: '38px', appearance: 'none' }}
                disabled={loading}
                required
              >
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Price (USD) *</label>
            <div style={{ position: 'relative' }}>
              <CreditCard size={16} style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--text-muted)' }} />
              <input 
                type="number" 
                step="0.01"
                min="0"
                className="form-input"
                placeholder="0.00"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                style={{ paddingLeft: '38px' }}
                disabled={loading}
                required
              />
            </div>
          </div>
        </div>

        {/* Thumbnail URL */}
        <div className="form-group">
          <label className="form-label">Course Thumbnail URL</label>
          <div style={{ position: 'relative' }}>
            <Image size={16} style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--text-muted)' }} />
            <input 
              type="url" 
              className="form-input" 
              placeholder="https://images.unsplash.com/... (Image URL link)"
              value={thumbnailUrl}
              onChange={(e) => setThumbnailUrl(e.target.value)}
              style={{ paddingLeft: '38px' }}
              disabled={loading}
            />
          </div>
        </div>

        {/* Publish Checkbox */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 10, 
          margin: '24px 0',
          padding: '16px',
          borderRadius: '12px',
          background: 'rgba(255,255,255,0.01)',
          border: '1px solid var(--glass-border)'
        }}>
          <input 
            type="checkbox" 
            id="isPublished"
            checked={isPublished}
            onChange={(e) => setIsPublished(e.target.checked)}
            style={{ width: '18px', height: '18px', cursor: 'pointer' }}
            disabled={loading}
          />
          <label htmlFor="isPublished" style={{ fontSize: '13px', cursor: 'pointer', userSelect: 'none' }}>
            <strong>Publish Immediately</strong> — Check this to make the course visible in the public catalog.
          </label>
        </div>

        <button 
          type="submit" 
          className="btn btn-primary" 
          style={{ width: '100%', display: 'flex', gap: 8, justifyContent: 'center' }}
          disabled={loading}
        >
          <Save size={18} />
          {loading ? 'Creating course...' : 'Create Course & Continue'}
        </button>
      </form>
    </div>
  );
}
