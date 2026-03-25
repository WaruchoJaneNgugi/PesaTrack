import React, { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/Toast';
import type { Page } from '../../types';
import { Send } from 'lucide-react';

interface Props { onNavigate: (p: Page) => void; }

const categories = ['supplies', 'travel', 'meals', 'other'] as const;

export default function NewRequest({ onNavigate }: Props) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<typeof categories[number]>('supplies');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) { setError('Enter a valid amount'); return; }
    if (!description.trim()) { setError('Add a description'); return; }
    setLoading(true);
    try {
      await addDoc(collection(db, 'requests'), {
        employeeId: user!.id,
        employeeName: user!.name,
        employeePhone: user!.phone,
        amount: amt,
        category,
        description: description.trim(),
        status: 'pending',
        adminNote: null,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      toast('Request submitted successfully!');
      onNavigate('my-requests');
    } catch {
      setError('Failed to submit. Try again.');
    }
    setLoading(false);
  };

  return (
    <div>
      <div className="page-header">
        <h2>New Request</h2>
        <p>Submit a money request for approval</p>
      </div>
      <div className="card" style={{ maxWidth: 520 }}>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Amount (KES)</label>
            <input
              className="form-input"
              type="number"
              placeholder="e.g. 2500"
              min="1"
              value={amount}
              onChange={e => setAmount(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Category</label>
            <select className="form-select" value={category} onChange={e => setCategory(e.target.value as typeof categories[number])}>
              {categories.map(c => (
                <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className="form-textarea"
              placeholder="Describe what the money is for..."
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
          </div>
          {error && <p className="error-text" style={{ marginBottom: 12 }}>{error}</p>}
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="button" className="btn btn-outline" onClick={() => onNavigate('dashboard')}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              <Send size={15} />
              {loading ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
