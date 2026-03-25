import { useState, useEffect, useRef } from 'react';
import { useRequests } from '../../hooks/useRequests';
import RequestCard from '../../components/RequestCard';
import { ClipboardList } from 'lucide-react';
import { useToast } from '../../components/Toast';

type Filter = 'all' | 'pending' | 'approved' | 'rejected';

export default function AllRequests() {
  const { requests, loading } = useRequests();
  const [filter, setFilter] = useState<Filter>('all');
  const { toast } = useToast();
  const seenReceipts = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (loading) return;
    requests.forEach(r => {
      if (r.receiptUrl && !seenReceipts.current.has(r.id)) {
        if (seenReceipts.current.size > 0) {
          // only notify after initial load
          toast(`📎 ${r.employeeName} uploaded a receipt`, 'info');
        }
        seenReceipts.current.add(r.id);
      }
    });
  }, [requests, loading]);

  const filtered = filter === 'all' ? requests : requests.filter(r => r.status === filter);

  return (
    <div>
      <div className="page-header">
        <h2>All Requests</h2>
        <p>Manage and review all employee requests</p>
      </div>
      <div className="filter-tabs">
        {(['all', 'pending', 'approved', 'rejected'] as Filter[]).map(f => (
          <button key={f} className={`filter-tab ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
            <span style={{ marginLeft: 4 }}>({f === 'all' ? requests.length : requests.filter(r => r.status === f).length})</span>
          </button>
        ))}
      </div>
      {loading ? (
        <div className="loading"><div className="spinner" /></div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <ClipboardList size={40} />
          <p>No {filter === 'all' ? '' : filter} requests found.</p>
        </div>
      ) : (
        filtered.map(r => <RequestCard key={r.id} request={r} isAdmin />)
      )}
    </div>
  );
}
