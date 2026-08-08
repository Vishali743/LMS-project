import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Settings as SettingsIcon, Bell, Eye, ShieldAlert, CheckCircle2, UserCheck } from 'lucide-react';

export default function Settings() {
  const { dbUser, refreshProfile } = useAuth();
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [marketingMails, setMarketingMails] = useState(false);
  
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Dynamic Dev Utility: Switch Role
  const handleRoleSwitch = async () => {
    if (!dbUser) return;
    const targetRole = dbUser.role === 'student' ? 'instructor' : 'student';
    try {
      setLoading(true);
      setSuccess('');
      await api.post('/auth/sync', { role: targetRole });
      await refreshProfile();
      setSuccess(`Account role successfully toggled to: ${targetRole}!`);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-wide" style={{ maxWidth: '640px', paddingBottom: '60px' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <SettingsIcon size={26} className="text-gradient" />
          Settings
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>Manage your interface preferences and account configurations.</p>
      </div>

      {success && <div className="alert alert-success" style={{ marginBottom: 20 }}><CheckCircle2 size={16} /><span>{success}</span></div>}

      <div style={{ display: 'grid', gap: 24 }}>
        
        {/* Notifications config */}
        <div className="glass-panel" style={{ padding: '30px', borderRadius: '16px' }}>
          <h3 style={{ fontSize: '18px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <Bell size={18} color="var(--accent-primary)" />
            Notifications
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 600 }}>Email Announcements</div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Receive alerts when modules or quizzes are graded.</div>
              </div>
              <input 
                type="checkbox" 
                checked={emailNotifications} 
                onChange={(e) => setEmailNotifications(e.target.checked)} 
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 600 }}>Marketing Emails</div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Receive promotional newsletters or catalog discounts.</div>
              </div>
              <input 
                type="checkbox" 
                checked={marketingMails} 
                onChange={(e) => setMarketingMails(e.target.checked)} 
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
            </div>
          </div>
        </div>

        {/* Development sandbox tools */}
        <div className="glass-panel" style={{ padding: '30px', borderRadius: '16px', border: '1px dashed rgba(168, 85, 247, 0.3)' }}>
          <h3 style={{ fontSize: '18px', color: '#d8b4fe', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <ShieldAlert size={18} color="#c084fc" />
            Sandbox Developer Tools
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px', lineHeight: 1.5, marginBottom: '20px' }}>
            Switching your account role updates your entry status in the MySQL database. This lets you toggle dashboard dashboards without logging out.
          </p>

          <button 
            onClick={handleRoleSwitch} 
            className="btn btn-primary" 
            style={{ 
              width: '100%', 
              background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)', 
              boxShadow: '0 4px 15px -3px rgba(168, 85, 247, 0.4)',
              display: 'flex',
              gap: 8,
              justifyContent: 'center'
            }}
            disabled={loading}
          >
            <UserCheck size={18} />
            {loading ? 'Updating permissions...' : `Switch to ${dbUser?.role === 'student' ? 'Instructor' : 'Student'} role`}
          </button>
        </div>

      </div>
    </div>
  );
}
