import { LayoutDashboard, PlusCircle, ClipboardList, Users, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import type { Page } from '../types';

interface Props {
  page: Page;
  onNavigate: (p: Page) => void;
}

const employeeNav = [
  { id: 'dashboard' as Page, label: 'Dashboard', icon: LayoutDashboard },
  { id: 'new-request' as Page, label: 'New Request', icon: PlusCircle },
  { id: 'my-requests' as Page, label: 'My Requests', icon: ClipboardList },
];

const adminNav = [
  { id: 'dashboard' as Page, label: 'Dashboard', icon: LayoutDashboard },
  { id: 'all-requests' as Page, label: 'All Requests', icon: ClipboardList },
  { id: 'employees' as Page, label: 'Employees', icon: Users },
];

export default function Sidebar({ page, onNavigate }: Props) {
  const { user, logout } = useAuth();
  const nav = user?.role === 'admin' ? adminNav : employeeNav;
  const initials = user?.name.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <h1>🌍 PesaTrack</h1>
        <p>Request Management</p>
      </div>
      <div className="sidebar-user">
        <div className="avatar">{initials}</div>
        <div className="sidebar-user-info">
          <p>{user?.name}</p>
          <span>{user?.role === 'admin' ? 'Administrator' : 'Employee'}</span>
        </div>
      </div>
      <nav className="sidebar-nav">
        {nav.map(({ id, label, icon: Icon }) => (
          <button key={id} className={`nav-item ${page === id ? 'active' : ''}`} onClick={() => onNavigate(id)}>
            <Icon size={18} />
            {label}
          </button>
        ))}
      </nav>
      <div className="sidebar-logout">
        <button className="nav-item" onClick={logout} style={{ color: '#C62828' }}>
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </aside>
  );
}
