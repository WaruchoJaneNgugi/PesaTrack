import React, { useState } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { useToast } from '../../components/Toast';
import type { Page } from '../../types';
import { UserPlus } from 'lucide-react';

interface Props { onNavigate: (p: Page) => void; }

export default function AddUser({ onNavigate }: Props) {
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!name.trim()) { setError('Name is required'); return; }
    if (!phone.trim()) { setError('Phone is required'); return; }
    setLoading(true);
    try {
      const id = `emp-${Date.now()}`;
      await setDoc(doc(db, 'users', id), {
        id,
        name: name.trim(),
        phone: phone.trim(),
        pin: '0000',
        role: 'employee',
        createdAt: Date.now(),
      });
      toast(`${name} added! Default PIN: 0000`, 'success');
      setName('');
      setPhone('');
      onNavigate('employees');
    } catch {
      setError('Failed to add user. Try again.');
    }
    setLoading(false);
  };

  return (
    <div>
      <div className="page-header">
        <h2>Add Employee</h2>
        <p>Create a new employee account. Default PIN is 0000.</p>
      </div>
      <div className="card" style={{ maxWidth: 480 }}>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              className="form-input"
              placeholder="e.g. Jane Doe"
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <input
              className="form-input"
              placeholder="e.g. 0712345678"
              value={phone}
              onChange={e => setPhone(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Default PIN</label>
            <input className="form-input" value="0000" disabled style={{ opacity: 0.6 }} />
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: 4 }}>
              Employee can change their PIN after first login.
            </p>
          </div>
          {error && <p className="error-text" style={{ marginBottom: 12 }}>{error}</p>}
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="button" className="btn btn-outline" onClick={() => onNavigate('employees')}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              <UserPlus size={15} />
              {loading ? 'Adding...' : 'Add Employee'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
