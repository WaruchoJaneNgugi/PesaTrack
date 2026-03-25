import { useAuth } from '../../context/AuthContext';
import { useRequests } from '../../hooks/useRequests';
import type { Page } from '../../types';
import { PlusCircle, Clock, CheckCircle, XCircle } from 'lucide-react';
import RequestCard from '../../components/RequestCard';

interface Props { onNavigate: (p: Page) => void; }

export default function EmployeeDashboard({ onNavigate }: Props) {
  const { user } = useAuth();
  const { requests, loading } = useRequests(user?.id);

  const pending = requests.filter(r => r.status === 'pending').length;
  const approved = requests.filter(r => r.status === 'approved').length;
  const rejected = requests.filter(r => r.status === 'rejected').length;
  const recent = requests.slice(0, 3);

  return (
    <div>
      <div className="page-header">
        <h2>Hello, {user?.name.split(' ')[0]} 👋</h2>
        <p>Here's a summary of your requests</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--accent-bg)' }}><Clock size={18} color="var(--accent)" /></div>
          <div className="stat-label">Pending</div>
          <div className="stat-value" style={{ color: 'var(--accent)' }}>{pending}</div>
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
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <p className="section-title" style={{ margin: 0 }}>Recent Requests</p>
        <button className="btn btn-primary btn-sm" onClick={() => onNavigate('new-request')}>
          <PlusCircle size={14} /> New Request
        </button>
      </div>

      {loading ? (
        <div className="loading"><div className="spinner" /></div>
      ) : recent.length === 0 ? (
        <div className="empty-state">
          <PlusCircle size={40} />
          <p>No requests yet. Submit your first request!</p>
          <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => onNavigate('new-request')}>
            Make a Request
          </button>
        </div>
      ) : (
        recent.map(r => <RequestCard key={r.id} request={r} />)
      )}
    </div>
  );
}
