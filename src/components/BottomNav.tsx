import { LayoutDashboard, PlusCircle, ClipboardList, Users, BarChart2, UserCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import type { Page } from '../types';

interface Props {
  page: Page;
  onNavigate: (p: Page) => void;
}

const employeeNav = [
  { id: 'dashboard' as Page, label: 'Home', icon: LayoutDashboard },
  { id: 'new-request' as Page, label: 'Request', icon: PlusCircle },
  { id: 'my-requests' as Page, label: 'My Requests', icon: ClipboardList },
  { id: 'profile' as Page, label: 'Profile', icon: UserCircle },
];

const adminNav = [
  { id: 'dashboard' as Page, label: 'Home', icon: LayoutDashboard },
  { id: 'all-requests' as Page, label: 'Requests', icon: ClipboardList },
  { id: 'employees' as Page, label: 'Employees', icon: Users },
  { id: 'audit' as Page, label: 'Audit', icon: BarChart2 },
  { id: 'profile' as Page, label: 'Profile', icon: UserCircle },
];

export default function BottomNav({ page, onNavigate }: Props) {
  const { user } = useAuth();
  const nav = user?.role === 'admin' ? adminNav : employeeNav;

  return (
    <nav className="bottom-nav">
      {nav.map(({ id, label, icon: Icon }) => (
        <button key={id} className={`bottom-nav-item ${page === id ? 'active' : ''}`} onClick={() => onNavigate(id)}>
          <Icon size={22} />
          {label}
        </button>
      ))}
    </nav>
  );
}
