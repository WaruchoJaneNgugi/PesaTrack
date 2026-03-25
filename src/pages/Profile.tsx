import { useState } from 'react';
import { User, KeyRound, LogOut, Save } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { toast } from 'react-toastify';
import PinInput from '../components/PinInput';

export default function Profile() {
  const { user, login, logout } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!user) return;
    if (name.trim().length < 2) return toast.error('Name too short');
    if (newPin && newPin.length !== 4) return toast.error('PIN must be 4 digits');
    if (newPin && newPin !== confirmPin) return toast.error('PINs do not match');

    setSaving(true);
    try {
      const updates: Record<string, string> = { name: name.trim() };
      if (newPin) updates.pin = newPin;
      await updateDoc(doc(db, 'users', user.id), updates);
      login({ ...user, ...updates });
      setNewPin('');
      setConfirmPin('');
      toast.success('Profile updated');
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const initials = user?.name.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';

  return (
    <div>
      <div className="page-header">
        <h2>My Profile</h2>
        <p>Update your username and PIN</p>
      </div>

      <div className="card" style={{ maxWidth: 480 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24 }}>
          <div className="avatar" style={{ width: 52, height: 52, fontSize: '1.1rem' }}>{initials}</div>
          <div>
            <p style={{ fontWeight: 700 }}>{user?.name}</p>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              {user?.role === 'admin' ? '⚡ Administrator' : '👤 Employee'}
            </span>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">
            <User size={14} style={{ display: 'inline', marginRight: 4 }} />
            Username
          </label>
          <input
            className="form-input"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Your name"
          />
        </div>

        <div className="divider" />

        <p className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <KeyRound size={15} /> Change PIN
        </p>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: 12 }}>
          Leave blank to keep current PIN
        </p>

        <div className="form-group">
          <label className="form-label">New PIN</label>
          <PinInput value={newPin} onChange={setNewPin} />
        </div>

        <div className="form-group">
          <label className="form-label">Confirm New PIN</label>
          <PinInput value={confirmPin} onChange={setConfirmPin} />
        </div>

        <button className="btn btn-primary" style={{ width: '100%', marginTop: 8 }} onClick={handleSave} disabled={saving}>
          <Save size={16} />
          {saving ? 'Saving…' : 'Save Changes'}
        </button>

        {/* Sign out — mobile only */}
        <button
          className="btn btn-danger"
          style={{ width: '100%', marginTop: 10, display: 'flex' }}
          onClick={logout}
          id="profile-signout"
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </div>

      <style>{`
        @media (min-width: 769px) {
          #profile-signout { display: none !important; }
        }
      `}</style>
    </div>
  );
}
