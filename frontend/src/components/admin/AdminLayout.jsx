import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { isSystemAdmin } from '../../utils/roles';
import AdminSidebar from './AdminSidebar';

export default function AdminLayout({ children }) {
  const store    = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!store.isAuthenticated || !isSystemAdmin(store)) {
      navigate('/unauthorized', { replace: true });
    }
  }, [store.isAuthenticated, store.role, navigate]);

  if (!store.isAuthenticated || !isSystemAdmin(store)) {
    return null;
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
