import { useState, useMemo } from 'react';
import { useRequests } from '../../hooks/useRequests';
import { TrendingUp, TrendingDown, DollarSign, CheckCircle, XCircle, Clock, Users } from 'lucide-react';

type Period = 'week' | 'month' | 'all';

function startOf(period: Period): number {
  const now = new Date();
  if (period === 'week') {
    const d = new Date(now); d.setDate(now.getDate() - 7); d.setHours(0,0,0,0); return d.getTime();
  }
  if (period === 'month') {
    const d = new Date(now); d.setDate(now.getDate() - 30); d.setHours(0,0,0,0); return d.getTime();
  }
  return 0;
}


function Bar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div style={{ background: 'var(--border)', borderRadius: 4, height: 8, flex: 1 }}>
      <div style={{ width: `${pct}%`, background: color, height: '100%', borderRadius: 4, transition: 'width 0.4s' }} />
    </div>
  );
}

export default function Audit() {
  const { requests, loading } = useRequests();
  const [period, setPeriod] = useState<Period>('month');

  const filtered = useMemo(() => {
    const since = startOf(period);
    return requests.filter(r => r.createdAt >= since);
  }, [requests, period]);

  const approved = filtered.filter(r => r.status === 'approved');
  const rejected = filtered.filter(r => r.status === 'rejected');
  const pending = filtered.filter(r => r.status === 'pending');
  const totalSpend = approved.reduce((s, r) => s + r.amount, 0);
  const totalRequested = filtered.reduce((s, r) => s + r.amount, 0);
  const approvalRate = filtered.length > 0 ? Math.round((approved.length / filtered.length) * 100) : 0;

  // by category
  const byCategory = useMemo(() => {
    const map: Record<string, number> = {};
    approved.forEach(r => { map[r.category] = (map[r.category] || 0) + r.amount; });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [approved]);

  const maxCat = byCategory[0]?.[1] || 1;

  // by employee
  const byEmployee = useMemo(() => {
    const map: Record<string, { name: string; amount: number; count: number }> = {};
    approved.forEach(r => {
      if (!map[r.employeeId]) map[r.employeeId] = { name: r.employeeName, amount: 0, count: 0 };
      map[r.employeeId].amount += r.amount;
      map[r.employeeId].count += 1;
    });
    return Object.values(map).sort((a, b) => b.amount - a.amount);
  }, [approved]);

  const maxEmp = byEmployee[0]?.amount || 1;

  // weekly breakdown (last 8 weeks)
  const weeklyData = useMemo(() => {
    const weeks: { label: string; amount: number }[] = [];
    for (let i = 7; i >= 0; i--) {
      const end = new Date(); end.setDate(end.getDate() - i * 7); end.setHours(23,59,59,999);
      const start = new Date(end); start.setDate(end.getDate() - 6); start.setHours(0,0,0,0);
      const amt = requests
        .filter(r => r.status === 'approved' && r.createdAt >= start.getTime() && r.createdAt <= end.getTime())
        .reduce((s, r) => s + r.amount, 0);
      weeks.push({ label: `W${8 - i}`, amount: amt });
    }
    return weeks;
  }, [requests]);

  const maxWeek = Math.max(...weeklyData.map(w => w.amount), 1);

  if (loading) return <div className="loading"><div className="spinner" /></div>;

  return (
    <div>
      <div className="page-header audit-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2>Audit Report</h2>
          <p>Expense analysis and spending breakdown</p>
        </div>
        <div className="filter-tabs" style={{ margin: 0 }}>
          {(['week', 'month', 'all'] as Period[]).map(p => (
            <button key={p} className={`filter-tab ${period === p ? 'active' : ''}`} onClick={() => setPeriod(p)}>
              {p === 'week' ? 'This Week' : p === 'month' ? 'This Month' : 'All Time'}
            </button>
          ))}
        </div>
      </div>

      {/* KPI cards */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))' }}>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--success-bg)' }}><DollarSign size={18} color="var(--success)" /></div>
          <div className="stat-label">Total Approved</div>
          <div className="stat-value" style={{ color: 'var(--success)', fontSize: '1.3rem' }}>KES {totalSpend.toLocaleString()}</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--primary-bg)' }}><TrendingUp size={18} color="var(--primary)" /></div>
          <div className="stat-label">Total Requested</div>
          <div className="stat-value" style={{ fontSize: '1.3rem' }}>KES {totalRequested.toLocaleString()}</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--success-bg)' }}><CheckCircle size={18} color="var(--success)" /></div>
          <div className="stat-label">Approval Rate</div>
          <div className="stat-value" style={{ color: 'var(--success)' }}>{approvalRate}%</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--accent-bg)' }}><Clock size={18} color="var(--accent)" /></div>
          <div className="stat-label">Pending</div>
          <div className="stat-value" style={{ color: 'var(--accent)' }}>{pending.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--danger-bg)' }}><XCircle size={18} color="var(--danger)" /></div>
          <div className="stat-label">Rejected</div>
          <div className="stat-value" style={{ color: 'var(--danger)' }}>{rejected.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--primary-bg)' }}><TrendingDown size={18} color="var(--primary)" /></div>
          <div className="stat-label">Avg per Request</div>
          <div className="stat-value" style={{ fontSize: '1.1rem' }}>
            KES {approved.length > 0 ? Math.round(totalSpend / approved.length).toLocaleString() : 0}
          </div>
        </div>
      </div>

      <div className="grid-2col">
        {/* Weekly spend chart */}
        <div className="card">
          <p className="section-title">Weekly Spend (Last 8 Weeks)</p>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 120, marginTop: 8 }}>
            {weeklyData.map((w, i) => (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <div style={{ fontSize: '0.6rem', color: 'var(--text-secondary)' }}>
                  {w.amount > 0 ? `${(w.amount/1000).toFixed(0)}k` : ''}
                </div>
                <div style={{
                  width: '100%',
                  height: `${Math.max((w.amount / maxWeek) * 90, w.amount > 0 ? 4 : 0)}px`,
                  background: w.amount > 0 ? 'linear-gradient(180deg, var(--primary), var(--primary-light))' : 'var(--border)',
                  borderRadius: '4px 4px 0 0',
                  transition: 'height 0.4s',
                }} />
                <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>{w.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Status breakdown */}
        <div className="card">
          <p className="section-title">Request Status Breakdown</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 12 }}>
            {[
              { label: 'Approved', count: approved.length, color: 'var(--success)' },
              { label: 'Pending', count: pending.length, color: 'var(--accent)' },
              { label: 'Rejected', count: rejected.length, color: 'var(--danger)' },
            ].map(({ label, count, color }) => (
              <div key={label}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: 4 }}>
                  <span style={{ color: 'var(--text-secondary)' }}>{label}</span>
                  <span style={{ fontWeight: 700, color }}>{count}</span>
                </div>
                <Bar value={count} max={filtered.length || 1} color={color} />
              </div>
            ))}
            <div style={{ marginTop: 4, fontSize: '0.78rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
              {filtered.length} total requests
            </div>
          </div>
        </div>
      </div>

      <div className="grid-2col" style={{ marginBottom: 0 }}>
        {/* By category */}
        <div className="card">
          <p className="section-title">Spend by Category</p>
          {byCategory.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: 8 }}>No approved requests yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 12 }}>
              {byCategory.map(([cat, amt]) => (
                <div key={cat}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: 4 }}>
                    <span style={{ textTransform: 'capitalize', color: 'var(--text)' }}>{cat}</span>
                    <span style={{ fontWeight: 700, color: 'var(--primary)' }}>KES {amt.toLocaleString()}</span>
                  </div>
                  <Bar value={amt} max={maxCat} color="var(--primary)" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* By employee */}
        <div className="card">
          <p className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Users size={16} /> Top Spenders
          </p>
          {byEmployee.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: 8 }}>No approved requests yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 12 }}>
              {byEmployee.map((emp, i) => (
                <div key={emp.name}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: 4 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{
                        width: 20, height: 20, borderRadius: '50%',
                        background: i === 0 ? 'var(--accent)' : 'var(--primary-bg)',
                        color: i === 0 ? '#fff' : 'var(--primary)',
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.65rem', fontWeight: 700
                      }}>{i + 1}</span>
                      {emp.name}
                    </span>
                    <span style={{ fontWeight: 700, color: 'var(--success)' }}>KES {emp.amount.toLocaleString()}</span>
                  </div>
                  <Bar value={emp.amount} max={maxEmp} color={i === 0 ? 'var(--accent)' : 'var(--success)'} />
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: 2 }}>{emp.count} approved request{emp.count !== 1 ? 's' : ''}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
