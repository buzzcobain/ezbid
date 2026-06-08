import React, { useState } from 'react';
import { Lock, Mail, AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function SignIn({ onSignIn }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Simulate login delay
    setTimeout(() => {
      if (email === 'admin@flagstaffe.com' && password === 'admin123') {
        const mockUser = {
          email,
          name: 'Dan Brownsword',
          role: 'Administrator / Director'
        };
        localStorage.setItem('ezbid_session', JSON.stringify(mockUser));
        onSignIn(mockUser);
      } else {
        setError('Invalid email or password. Please use admin@flagstaffe.com / admin123');
        setLoading(false);
      }
    }, 1000);
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#F7F5F0',
      padding: '20px'
    }}>
      <div className="glass-card animate-fade-in" style={{
        width: '100%',
        maxWidth: '440px',
        padding: '40px',
        borderRadius: '24px',
        boxShadow: '0 20px 60px rgba(26, 26, 46, 0.08)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '35px' }}>
          <img 
            src="https://flagstaffe.com/wp-content/uploads/2022/12/Color-logo-no-background.png" 
            alt="Flagstaffe Logo" 
            style={{ height: '48px', width: 'auto', marginBottom: '15px' }}
          />
          <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#1A1A2E' }}>EzBid Platform</h2>
          <p style={{ color: '#7F8C8D', fontSize: '13px', marginTop: '5px' }}>Managed Estimating & Proposal Dashboard</p>
        </div>

        {error && (
          <div style={{
            display: 'flex',
            gap: '10px',
            backgroundColor: 'rgba(231, 76, 60, 0.08)',
            border: '1px solid rgba(231, 76, 60, 0.2)',
            borderRadius: '12px',
            padding: '12px 16px',
            color: '#c0392b',
            fontSize: '13px',
            marginBottom: '25px',
            alignItems: 'center'
          }}>
            <AlertTriangle size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#1A1A2E', marginBottom: '8px' }}>
              Corporate Email Address
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{
                position: 'absolute',
                left: '14px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#7F8C8D'
              }} />
              <input
                type="email"
                required
                className="input-field"
                placeholder="you@flagstaffe.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ paddingLeft: '42px' }}
              />
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <label style={{ fontSize: '13px', fontWeight: '600', color: '#1A1A2E' }}>
                Secure Password
              </label>
            </div>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{
                position: 'absolute',
                left: '14px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#7F8C8D'
              }} />
              <input
                type="password"
                required
                className="input-field"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingLeft: '42px' }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', padding: '14px', borderRadius: '12px', marginTop: '10px' }}
          >
            {loading ? (
              <div className="spinner" style={{ width: '18px', height: '18px', borderTopColor: '#1A1A2E' }}></div>
            ) : (
              'Sign In to Dashboard'
            )}
          </button>
        </form>

        <div style={{
          marginTop: '30px',
          borderTop: '1px solid rgba(26,26,46,0.06)',
          paddingTop: '20px',
          textAlign: 'center',
          fontSize: '12px',
          color: '#7F8C8D'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', color: '#B59312' }}>
            <CheckCircle2 size={14} />
            <span>Developer credentials pre-filled in input help:</span>
          </div>
          <code style={{ display: 'inline-block', marginTop: '6px', padding: '4px 8px', background: 'rgba(26,26,46,0.04)', borderRadius: '4px', fontSize: '11px', color: '#1A1A2E' }}>
            admin@flagstaffe.com / admin123
          </code>
        </div>
      </div>
    </div>
  );
}
