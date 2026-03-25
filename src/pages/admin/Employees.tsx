import { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase';
import type { User } from '../../types';
import type { Page } from '../../types';
import { Users, Phone, UserPlus, Trash2 } from 'lucide-react';
import { useToast } from '../../components/Toast';

interface Props { onNavigate: (p: Page) => void; }

export default function Employees({ onNavigate }: Props) {
  const [employees, setEmployees] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState<User | null>(null);
  const [deleting, setDeleting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const q = query(collection(db, 'users'), where('role', '==', 'employee'));
    return onSnapshot(q, snap => {
      setEmployees(snap.docs.map(d => ({ id: d.id, ...d.data() } as User)));
      setLoading(false);
    });
  }, []);

  const handleDelete = async () => {
    if (!confirmDelete) return;
    setDeleting(true);
    try {
      await deleteDoc(doc(db, 'users', confirmDelete.id));
      toast(`${confirmDelete.name} removed.`, 'info');
      setConfirmDelete(null);
    } catch {
      toast('Failed to delete user.', 'error');
    }
    setDeleting(false);
  };

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2>Employees</h2>
          <p>{employees.length} registered employee{employees.length !== 1 ? 's' : ''}</p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => onNavigate('add-user')}>
          <UserPlus size={15} /> Add Employee
        </button>
      </div>

      {loading ? (
        <div className="loading"><div className="spinner" /></div>
      ) : employees.length === 0 ? (
        <div className="empty-state">
          <Users size={40} />
          <p>No employees yet.</p>
          <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => onNavigate('add-user')}>
            <UserPlus size={15} /> Add First Employee
          </button>
        </div>
      ) : (
        employees.map(emp => (
          <div key={emp.id} className="employee-item">
            <div className="avatar">{emp.name.split(' ').map(n => n[0]).join('').toUpperCase()}</div>
            <div className="employee-info">
              <p>{emp.name}</p>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Phone size={11} />{emp.phone}</span>
            </div>
            <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: 'var(--text-secondary)', marginRight: 12 }}>
              Joined {new Date(emp.createdAt).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
            <button className="btn btn-sm" style={{ padding: '5px 9px', color: 'var(--danger)', background: 'var(--danger-bg)', border: 'none' }}
              onClick={() => setConfirmDelete(emp)}>
              <Trash2 size={14} />
            </button>
          </div>
        ))
      )}

      {confirmDelete && (
        <div className="modal-overlay" onClick={() => setConfirmDelete(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>🗑️ Remove Employee?</h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: 20 }}>
              This will permanently remove <strong>{confirmDelete.name}</strong>. Their requests will remain. This cannot be undone.
            </p>
            <div className="action-btns">
              <button className="btn btn-danger" onClick={handleDelete} disabled={deleting}>
                {deleting ? 'Removing...' : 'Yes, Remove'}
              </button>
              <button className="btn btn-outline" onClick={() => setConfirmDelete(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
