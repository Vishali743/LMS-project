import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, AlertCircle, CheckCircle2, Navigation } from 'lucide-react';

export default function Contact() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !email || !message) {
      return setError('Please fill in all inputs.');
    }
    if (!email.includes('@')) {
      return setError('Please provide a valid email address.');
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      // Simulate form submission
      setTimeout(() => {
        setSuccess('Message sent successfully! We will get back to you shortly.');
        setName('');
        setEmail('');
        setMessage('');
        setLoading(false);
      }, 1000);
    } catch (err) {
      setError('Form submission failed.');
      setLoading(false);
    }
  };

  const handleDirectionsClick = () => {
    window.open('https://www.google.com/maps/dir/?api=1&destination=Skein+TechPro+SRM+Complex+Trichy+Road+Coimbatore+Tamil+Nadu+India+641018', '_blank');
  };

  return (
    <div className="container-wide" style={{ paddingBottom: '60px' }}>
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <span className="badge badge-instructor" style={{ marginBottom: 12 }}>GET IN TOUCH</span>
        <h1 style={{ fontSize: '36px', marginBottom: 12 }}>Contact Support</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Have questions about course enrollments or certification validation? Drop us a note.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '40px', alignItems: 'start', flexWrap: 'wrap' }} className="catalog-layout">
        {/* Contact Form */}
        <form onSubmit={handleSubmit} className="glass-panel" style={{ padding: '30px', borderRadius: '16px', border: '1px solid var(--glass-border)' }}>
          <h3 style={{ fontSize: '18px', marginBottom: '20px', color: '#fff' }}>Send a Message</h3>
          
          {error && (
            <div className="alert alert-error" style={{ marginBottom: 16 }}>
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="alert alert-success" style={{ marginBottom: 16 }}>
              <CheckCircle2 size={16} />
              <span>{success}</span>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Your Name</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="Jane Doe" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              disabled={loading}
              required 
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input 
              type="email" 
              className="form-input" 
              placeholder="jane@example.com" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              disabled={loading}
              required 
            />
          </div>

          <div className="form-group" style={{ marginBottom: '24px' }}>
            <label className="form-label">Message Details</label>
            <textarea 
              className="form-input" 
              placeholder="Type your questions or feedback here..." 
              value={message} 
              onChange={(e) => setMessage(e.target.value)} 
              style={{ minHeight: '120px' }}
              disabled={loading}
              required 
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', display: 'flex', gap: 8, justifyContent: 'center' }}
            disabled={loading}
          >
            {loading ? 'Sending message...' : 'Send Message'}
            <Send size={16} />
          </button>
        </form>

        {/* Info panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          
          <div className="glass-card" style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
            <MapPin size={20} style={{ color: 'var(--color-success)', marginTop: 3, flexShrink: 0 }} />
            <div>
              <h4 style={{ fontSize: '15px', color: '#fff', marginBottom: 4 }}>Our Location</h4>
              <p style={{ color: 'var(--text-primary)', fontSize: '13px', fontWeight: 600, marginBottom: 4 }}>Skein TechPro</p>
              <p style={{ color: 'var(--text-secondary)', fontSize: '13px', lineHeight: 1.5 }}>
                14/15, 2nd Floor, SRM Complex,<br />
                Opp. to SRM Sweets,<br />
                2nd Layout, Trichy Road,<br />
                Coimbatore, Tamil Nadu, India – 641018
              </p>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: 8 }}>
                Coordinates: 11.0022° N, 76.9744° E
              </div>
            </div>
          </div>

          <div className="glass-card" style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
            <Mail size={20} style={{ color: 'var(--accent-primary)', flexShrink: 0 }} />
            <div>
              <h4 style={{ fontSize: '15px', color: '#fff', marginBottom: 2 }}>Email Address</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>support@skeinlms.com</p>
            </div>
          </div>

          <div className="glass-card" style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
            <Phone size={20} style={{ color: 'var(--accent-secondary)', flexShrink: 0 }} />
            <div>
              <h4 style={{ fontSize: '15px', color: '#fff', marginBottom: 2 }}>Phone Support</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>+91 422 555-0199</p>
            </div>
          </div>

          {/* Embedded Google Maps & Get Directions */}
          <div className="glass-panel" style={{ padding: '16px', borderRadius: '16px', border: '1px solid var(--glass-border)', display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ width: '100%', height: '220px', borderRadius: '10px', overflow: 'hidden' }}>
              <iframe
                title="Skein TechPro Location Map"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3916.3315805562145!2d76.97230491480282!3d11.011899192161749!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ba859f9c73e13d9%3A0xc31cb8015f8e5f1b!2sTrichy%20Rd%2C%20Coimbatore%2C%20Tamil%20Nadu!5e0!3m2!1sen!2sin!4v1659012345678!5m2!1sen!2sin"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
            <button 
              onClick={handleDirectionsClick}
              className="btn btn-secondary btn-small"
              style={{ display: 'flex', gap: 8, justifyContent: 'center', alignItems: 'center', width: '100%', background: 'rgba(255,255,255,0.02)' }}
            >
              <Navigation size={14} style={{ color: 'var(--accent-primary)' }} />
              Get Directions on Google Maps
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
