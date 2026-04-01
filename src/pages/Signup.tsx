import { useState } from 'react';
import { collection, query, where, getDocs, doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import type { User } from '../types';
import PinInput from '../components/PinInput';
import { Phone, UserCircle } from 'lucide-react';

interface Props { onLogin: () => void; }

export default function Signup({ onLogin }: Props) {
  const { login } = useAuth();
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const nextStep = async () => {
    setError('');
    if (!name.trim()) { setError('Enter your full name'); return; }
    if (!/^07\d{8}$/.test(phone.trim())) { setError('Enter a valid Kenyan phone (07XXXXXXXX)'); return; }
    setLoading(true);
    const q = query(collection(db, 'users'), where('phone', '==', phone.trim()));
    const snap = await getDocs(q);
    setLoading(false);
    if (!snap.empty) { setError('Phone number already registered'); return; }
    setStep(2);
  };

  const handleSignup = async () => {
    setError('');
    if (pin.length < 4) { setError('Enter a 4-digit PIN'); return; }
    if (pin !== confirmPin) { setError('PINs do not match'); return; }
    setLoading(true);
    try {
      const id = `emp-${Date.now()}`;
      const user: User = { id, name: name.trim(), phone: phone.trim(), pin, role: 'employee', createdAt: Date.now() };
      await setDoc(doc(db, 'users', id), user);
      login(user);
    } catch {
      setError('Signup failed. Try again.');
    }
    setLoading(false);
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <h1>🌍 NgommaPay</h1>
          <p>Request Management System</p>
        </div>
        <div className="step-indicator">
          <div className={`step-dot ${step >= 1 ? 'active' : ''}`} />
          <div className={`step-dot ${step >= 2 ? 'active' : ''}`} />
        </div>

        {step === 1 ? (
          <>
            <p className="auth-title">Create Account</p>
            <p className="auth-subtitle">Step 1 of 2 — Your details</p>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <div style={{ position: 'relative' }}>
                <UserCircle size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                <input className="form-input" style={{ paddingLeft: 36 }} placeholder="e.g. Jane Wanjiku" value={name} onChange={e => setName(e.target.value)} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <div style={{ position: 'relative' }}>
                <Phone size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                <input className="form-input" style={{ paddingLeft: 36 }} type="tel" placeholder="07XXXXXXXX" value={phone} onChange={e => setPhone(e.target.value)} />
              </div>
            </div>
            {error && <p className="error-text" style={{ marginBottom: 12 }}>{error}</p>}
            <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={nextStep} disabled={loading}>
              {loading ? 'Checking...' : 'Continue →'}
            </button>
          </>
        ) : (
          <>
            <p className="auth-title">Set Your PIN</p>
            <p className="auth-subtitle">Step 2 of 2 — Choose a 4-digit PIN</p>
            <div className="form-group">
              <label className="form-label" style={{ textAlign: 'center', display: 'block' }}>Create PIN</label>
              <PinInput value={pin} onChange={setPin} />
            </div>
            <div className="form-group">
              <label className="form-label" style={{ textAlign: 'center', display: 'block' }}>Confirm PIN</label>
              <PinInput value={confirmPin} onChange={setConfirmPin} />
            </div>
            {error && <p className="error-text" style={{ textAlign: 'center', marginBottom: 12 }}>{error}</p>}
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-outline" onClick={() => setStep(1)}>← Back</button>
              <button className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }} onClick={handleSignup} disabled={loading}>
                {loading ? 'Creating...' : 'Create Account'}
              </button>
            </div>
          </>
        )}

        <div className="auth-footer">
          Already have an account?{' '}
          <button onClick={onLogin}>Sign in</button>
        </div>
      </div>
    </div>
  );
}
