import { useState } from 'react';
import type { Page } from './types';

// Employee pages
import EmployeeDashboard from './pages/employee/Dashboard';
import NewRequest from './pages/employee/NewRequest';
import MyRequests from './pages/employee/MyRequests';

// Admin pages
import AdminDashboard from './pages/admin/Dashboard';
import AllRequests from './pages/admin/AllRequests';
import Employees from './pages/admin/Employees';
import AddUser from './pages/admin/AddUser';
import Audit from './pages/admin/Audit';

// Shared pages
import Profile from './pages/Profile';

// Auth pages
import Login from './pages/Login';
import Signup from './pages/Signup';
import { useAuth } from './context/AuthContext';
import { ToastContainer } from 'react-toastify';
import Sidebar from './components/Sidebar';
import BottomNav from './components/BottomNav';
import MobileHeader from './components/MobileHeader';

export default function App() {
  const { user } = useAuth();
  const [page, setPage] = useState<Page>('dashboard');
  const [authView, setAuthView] = useState<'login' | 'signup'>('login');

  if (!user) {
    return (
      <>
        <ToastContainer />
        {authView === 'login'
          ? <Login onSignup={() => setAuthView('signup')} />
          : <Signup onLogin={() => setAuthView('login')} />
        }
      </>
    );
  }

  const renderPage = () => {
    if (page === 'profile') return <Profile />;
    if (user.role === 'employee') {
      if (page === 'dashboard') return <EmployeeDashboard onNavigate={setPage} />;
      if (page === 'new-request') return <NewRequest onNavigate={setPage} />;
      if (page === 'my-requests') return <MyRequests />;
    } else {
      if (page === 'dashboard') return <AdminDashboard onNavigate={setPage} />;
      if (page === 'all-requests') return <AllRequests />;
      if (page === 'employees') return <Employees onNavigate={setPage} />;
      if (page === 'add-user') return <AddUser onNavigate={setPage} />;
      if (page === 'audit') return <Audit />;
    }
    return null;
  };

  return (
    <>
      <ToastContainer />
      <div className="app-layout">
        <Sidebar page={page} onNavigate={setPage} />
        <MobileHeader />
        <main className="main-content">
          {renderPage()}
        </main>
        <BottomNav page={page} onNavigate={setPage} />
      </div>
    </>
  );
}
