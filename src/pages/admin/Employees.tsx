import { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase';
import type { User } from '../../types';
import { Users, Phone } from 'lucide-react';

export default function Employees() {
  const [employees, setEmployees] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'users'), where('role', '==', 'employee'));
    return onSnapshot(q, snap => {
      setEmployees(snap.docs.map(d => ({ id: d.id, ...d.data() } as User)));
      setLoading(false);
    });
  }, []);

  return (
    <div>
      <div className="page-header">
        <h2>Employees</h2>
        <p>{employees.length} registered employee{employees.length !== 1 ? 's' : ''}</p>
      </div>
      {loading ? (
        <div className="loading"><div className="spinner" /></div>
      ) : employees.length === 0 ? (
        <div className="empty-state">
          <Users size={40} />
          <p>No employees registered yet.</p>
        </div>
      ) : (
        employees.map(emp => (
          <div key={emp.id} className="employee-item">
            <div className="avatar">{emp.name.split(' ').map(n => n[0]).join('').toUpperCase()}</div>
            <div className="employee-info">
              <p>{emp.name}</p>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Phone size={11} />{emp.phone}</span>
            </div>
            <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              Joined {new Date(emp.createdAt).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
          </div>
        ))
      )}
    </div>
  );
}
