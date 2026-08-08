import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Bell, Check, MailOpen, AlertCircle, Award, BookOpen, Clock } from 'lucide-react';

export default function NotificationDropdown() {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data.notifications || []);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Poll notifications every 10 seconds for real-time simulation
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await api.post('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const getIcon = (type) => {
    switch (type) {
      case 'assignment': return <BookOpen size={14} style={{ color: 'var(--accent-primary)' }} />;
      case 'grade': return <Award size={14} style={{ color: 'var(--color-success)' }} />;
      case 'certificate': return <Award size={14} style={{ color: 'var(--color-warning)' }} />;
      default: return <Bell size={14} style={{ color: 'var(--text-secondary)' }} />;
    }
  };

  return (
    <div style={{ position: 'relative' }}>
      
      {/* Bell Trigger */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid var(--glass-border)',
          borderRadius: '50%',
          width: '38px',
          height: '38px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          position: 'relative',
          color: unreadCount > 0 ? '#fff' : 'var(--text-secondary)',
          transition: 'var(--transition-fast)'
        }}
        onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--accent-primary)'}
        onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--glass-border)'}
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute',
            top: '-2px',
            right: '-2px',
            backgroundColor: 'var(--accent-primary)',
            color: '#fff',
            fontSize: '9px',
            fontWeight: 'bold',
            borderRadius: '50%',
            minWidth: '16px',
            height: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2px',
            boxShadow: '0 0 8px var(--accent-primary)'
          }}>
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <>
          {/* Overlay to close */}
          <div 
            onClick={() => setIsOpen(false)} 
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 999 }} 
          />
          
          <div 
            className="glass-panel" 
            style={{
              position: 'absolute',
              top: '120%',
              right: 0,
              width: '320px',
              maxHeight: '400px',
              borderRadius: '16px',
              border: '1px solid var(--glass-border)',
              backgroundColor: 'var(--bg-secondary)',
              boxShadow: 'var(--shadow-lg)',
              zIndex: 1000,
              display: 'flex',
              flexDirection: 'column',
              padding: 0,
              overflow: 'hidden'
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderBottom: '1px solid var(--glass-border)' }}>
              <span style={{ fontWeight: 600, fontSize: '13px', color: '#fff' }}>Notifications</span>
              {unreadCount > 0 && (
                <button 
                  onClick={handleMarkAllRead}
                  style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', fontSize: '11px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
                >
                  <MailOpen size={12} /> Mark all read
                </button>
              )}
            </div>

            {/* List */}
            <div style={{ overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column' }}>
              {notifications.length === 0 ? (
                <div style={{ padding: '24px 16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px' }}>
                  No new announcements
                </div>
              ) : (
                notifications.map(n => (
                  <div 
                    key={n.id}
                    onClick={() => {
                      if (!n.read) handleMarkRead(n.id);
                    }}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '24px 1fr 20px',
                      gap: 8,
                      padding: '12px 16px',
                      borderBottom: '1px solid rgba(255,255,255,0.02)',
                      background: n.read ? 'transparent' : 'rgba(255, 51, 68, 0.02)',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.01)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = n.read ? 'transparent' : 'rgba(255, 51, 68, 0.02)'}
                  >
                    <div style={{ marginTop: 2 }}>{getIcon(n.type)}</div>
                    <div>
                      <p style={{ fontSize: '12px', color: n.read ? 'var(--text-secondary)' : '#fff', lineHeight: 1.4, fontWeight: n.read ? 400 : 500 }}>
                        {n.message}
                      </p>
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
                        <Clock size={10} />
                        {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div>
                      {!n.read && (
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMarkRead(n.id);
                          }}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--color-success)',
                            cursor: 'pointer',
                            padding: 0
                          }}
                        >
                          <Check size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}

    </div>
  );
}
