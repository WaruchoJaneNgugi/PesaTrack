import { LayoutDashboard, PlusCircle, ClipboardList, Users, BarChart2, UserCircle, Moon, Sun, LogOut, Zap, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import type { Page } from '../types';

interface Props {
  page: Page;
  onNavigate: (p: Page) => void;
}

const employeeNav = [
  { id: 'dashboard' as Page, label: 'Dashboard', icon: LayoutDashboard },
  { id: 'new-request' as Page, label: 'New Request', icon: PlusCircle },
  { id: 'my-requests' as Page, label: 'My Requests', icon: ClipboardList },
  { id: 'profile' as Page, label: 'Profile', icon: UserCircle },
];

const adminNav = [
  { id: 'dashboard' as Page, label: 'Dashboard', icon: LayoutDashboard },
  { id: 'all-requests' as Page, label: 'All Requests', icon: ClipboardList },
  { id: 'employees' as Page, label: 'Employees', icon: Users },
  { id: 'audit' as Page, label: 'Audit', icon: BarChart2 },
  { id: 'profile' as Page, label: 'Profile', icon: UserCircle },
];

export default function Sidebar({ page, onNavigate }: Props) {
  const { user, logout } = useAuth();
  const { dark, toggle } = useTheme();
  const nav = user?.role === 'admin' ? adminNav : employeeNav;
  const initials = user?.name.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <h1> NgommaPay</h1>
        <p>Request Management</p>
      </div>
      <div className="sidebar-user">
        <div className="avatar">{initials}</div>
        <div className="sidebar-user-info">
          <p>{user?.name}</p>
          <span>{user?.role === 'admin' ? <><Zap size={14} /> Administrator</> : <><User size={14} /> Employee</>}</span>
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
        <button className="theme-toggle" onClick={toggle}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {dark ? <Sun size={15} /> : <Moon size={15} />}
            {dark ? 'Light Mode' : 'Dark Mode'}
          </span>
          <div className={`toggle-track ${dark ? 'on' : ''}`}>
            <div className="toggle-thumb" />
          </div>
        </button>
        <button className="nav-item" onClick={logout} style={{ color: 'var(--danger)', marginTop: 4 }}>
          <LogOut size={18} /> Sign Out
        </button>
      </div>
    </aside>
  );
}
