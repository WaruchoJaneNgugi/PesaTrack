import { useRequests } from '../../hooks/useRequests';
import type { Page } from '../../types';
import { Clock, CheckCircle, XCircle, ClipboardList } from 'lucide-react';
import RequestCard from '../../components/RequestCard';

interface Props { onNavigate: (p: Page) => void; }

export default function AdminDashboard({ onNavigate }: Props) {
  const { requests, loading } = useRequests();

  const pending = requests.filter(r => r.status === 'pending');
  const approved = requests.filter(r => r.status === 'approved').length;
  const rejected = requests.filter(r => r.status === 'rejected').length;
  const totalAmt = requests.filter(r => r.status === 'approved').reduce((s, r) => s + r.amount, 0);

  return (
    <div>
      <div className="page-header">
        <h2>Admin Dashboard</h2>
        <p>Overview of all employee requests</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--accent-bg)' }}><Clock size={18} color="var(--accent)" /></div>
          <div className="stat-label">Pending</div>
          <div className="stat-value" style={{ color: 'var(--accent)' }}>{pending.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--primary-bg)' }}><CheckCircle size={18} color="var(--primary)" /></div>
          <div className="stat-label">Approved</div>
          <div className="stat-value" style={{ color: 'var(--primary)' }}>{approved}</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--danger-bg)' }}><XCircle size={18} color="var(--danger)" /></div>
          <div className="stat-label">Rejected</div>
          <div className="stat-value" style={{ color: 'var(--danger)' }}>{rejected}</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--primary-bg)' }}><ClipboardList size={18} color="var(--primary)" /></div>
          <div className="stat-label">Total Approved</div>
          <div className="stat-value" style={{ fontSize: '1.1rem' }}>KES {totalAmt.toLocaleString()}</div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <p className="section-title" style={{ margin: 0 }}>Pending Approvals</p>
        {pending.length > 0 && (
          <button className="btn btn-outline btn-sm" onClick={() => onNavigate('all-requests')}>View all</button>
        )}
      </div>

      {loading ? (
        <div className="loading"><div className="spinner" /></div>
      ) : pending.length === 0 ? (
        <div className="empty-state">
          <CheckCircle size={40} />
          <p>All caught up! No pending requests.</p>
        </div>
      ) : (
        pending.slice(0, 5).map(r => <RequestCard key={r.id} request={r} isAdmin />)
      )}
    </div>
  );
}
