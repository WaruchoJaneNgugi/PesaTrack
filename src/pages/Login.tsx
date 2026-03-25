import { useState } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import type { User } from '../types';
import PinInput from '../components/PinInput';
import { Phone } from 'lucide-react';

interface Props { onSignup: () => void; }

export default function Login({ onSignup }: Props) {
  const { login } = useAuth();
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || pin.length < 4) { setError('Enter phone and 4-digit PIN'); return; }
    setLoading(true);
    setError('');
    try {
      const q = query(collection(db, 'users'), where('phone', '==', phone.trim()), where('pin', '==', pin));
      const snap = await getDocs(q);
      if (snap.empty) { setError('Invalid phone or PIN'); setLoading(false); return; }
      login({ id: snap.docs[0].id, ...snap.docs[0].data() } as User);
    } catch {
      setError('Login failed. Try again.');
    }
    setLoading(false);
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <h1>🌍 PesaTrack</h1>
          <p>Request Management System</p>
        </div>
        <p className="auth-title">Welcome back</p>
        <p className="auth-subtitle">Sign in to your account</p>
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <div style={{ position: 'relative' }}>
              <Phone size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
              <input
                className="form-input"
                style={{ paddingLeft: 36 }}
                type="tel"
                placeholder="07XXXXXXXX"
                value={phone}
                onChange={e => setPhone(e.target.value)}
              />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label" style={{ textAlign: 'center', display: 'block' }}>Enter PIN</label>
            <PinInput value={pin} onChange={setPin} />
          </div>
          {error && <p className="error-text" style={{ textAlign: 'center', marginBottom: 12 }}>{error}</p>}
          <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <div className="auth-footer">
          New employee?{' '}
          <button onClick={onSignup}>Create account</button>
        </div>
      </div>
    </div>
  );
}
