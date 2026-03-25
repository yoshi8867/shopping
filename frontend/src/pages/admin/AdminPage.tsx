import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useEffect } from 'react';

const TABS = [
  { to: '/admin', label: '주문 관리', icon: '📦', exact: true },
  { to: '/admin/products', label: '상품 관리', icon: '🛍️', exact: false },
  { to: '/admin/categories', label: '카테고리', icon: '🏷️', exact: false },
];

export default function AdminPage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (user && user.role !== 'ADMIN') navigate('/');
    if (!user) navigate('/login');
  }, [user]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold gradient-text mb-8">관리자 대시보드</h1>

      <div className="flex gap-2 mb-8 border-b border-gray-200">
        {TABS.map((tab) => {
          const isActive = tab.exact
            ? location.pathname === tab.to
            : location.pathname.startsWith(tab.to);
          return (
            <Link
              key={tab.to}
              to={tab.to}
              className={`px-5 py-3 text-sm font-semibold border-b-2 transition-colors ${
                isActive
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.icon} {tab.label}
            </Link>
          );
        })}
      </div>

      <Outlet />
    </div>
  );
}
