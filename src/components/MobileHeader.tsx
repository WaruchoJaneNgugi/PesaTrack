import { LogOut, Moon, Sun } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function MobileHeader() {
  const { logout } = useAuth();
  const { dark, toggle } = useTheme();

  return (
    <header className="mobile-header">
      <span className="mobile-header-logo">💸 PesaTrack</span>
      <div style={{ display: 'flex', gap: 8 }}>
        <button className="mobile-header-theme" onClick={toggle} title="Toggle theme">
          {dark ? <Sun size={20} /> : <Moon size={20} />}
        </button>
        <button className="mobile-header-signout" onClick={logout} title="Sign out">
          <LogOut size={20} />
        </button>
      </div>
    </header>
  );
}
