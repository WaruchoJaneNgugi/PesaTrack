import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRequests } from '../../hooks/useRequests';
import RequestCard from '../../components/RequestCard';
import { ClipboardList } from 'lucide-react';

type Filter = 'all' | 'pending' | 'approved' | 'rejected';

export default function MyRequests() {
  const { user } = useAuth();
  const { requests, loading } = useRequests(user?.id);
  const [filter, setFilter] = useState<Filter>('all');

  const filtered = filter === 'all' ? requests : requests.filter(r => r.status === filter);

  return (
    <div>
      <div className="page-header">
        <h2>My Requests</h2>
        <p>Track all your submitted requests</p>
      </div>
      <div className="filter-tabs">
        {(['all', 'pending', 'approved', 'rejected'] as Filter[]).map(f => (
          <button key={f} className={`filter-tab ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
            {f !== 'all' && <span style={{ marginLeft: 4 }}>({requests.filter(r => r.status === f).length})</span>}
          </button>
        ))}
      </div>
      {loading ? (
        <div className="loading"><div className="spinner" /></div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <ClipboardList size={40} />
          <p>{filter === 'all' ? 'No requests yet.' : `No ${filter} requests.`}</p>
        </div>
      ) : (
        filtered.map(r => <RequestCard key={r.id} request={r} isEmployee />)
      )}
    </div>
  );
}
