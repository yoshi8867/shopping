import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const itemCount = useCartStore((s) => s.itemCount());
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav style={{ background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)' }} className="sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* 로고 */}
        <Link to="/" className="text-white text-xl font-bold tracking-tight hover:opacity-90 transition-opacity">
          ✦ ShopVibe
        </Link>

        {/* 네비 링크 */}
        <div className="flex items-center gap-6">
          <Link to="/products" className="text-white/90 hover:text-white text-sm font-medium transition-colors">
            상품
          </Link>
          {user && (
            <Link to="/orders" className="text-white/90 hover:text-white text-sm font-medium transition-colors">
              주문내역
            </Link>
          )}
          {user?.role === 'ADMIN' && (
            <Link to="/admin" className="text-yellow-300 hover:text-yellow-200 text-sm font-bold transition-colors">
              관리자
            </Link>
          )}
        </div>

        {/* 우측 버튼 그룹 */}
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <Link to="/cart" className="relative text-white/90 hover:text-white transition-colors p-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M3 3h2l.4 2M7 13h10l4-9H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-yellow-400 text-gray-900 text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                    {itemCount > 9 ? '9+' : itemCount}
                  </span>
                )}
              </Link>
              <Link to="/profile" className="text-white/90 hover:text-white text-sm font-medium transition-colors">
                {user.name}
              </Link>
              <button
                onClick={handleLogout}
                className="bg-white/20 hover:bg-white/30 text-white text-sm px-4 py-1.5 rounded-full transition-colors"
              >
                로그아웃
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-white/90 hover:text-white text-sm font-medium transition-colors"
              >
                로그인
              </Link>
              <Link
                to="/register"
                className="bg-white text-purple-600 text-sm font-semibold px-4 py-1.5 rounded-full hover:bg-white/90 transition-colors"
              >
                회원가입
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
