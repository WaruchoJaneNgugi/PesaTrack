import { LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function MobileHeader() {
  const { logout } = useAuth();
  return (
    <header className="mobile-header">
      <span className="mobile-header-logo">💸 PesaTrack</span>
      <button className="mobile-header-signout" onClick={logout} title="Sign out">
        <LogOut size={20} />
      </button>
    </header>
  );
}
