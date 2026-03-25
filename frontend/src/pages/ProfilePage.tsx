import { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { updateMe } from '../api/auth';

export default function ProfilePage() {
  const { user, fetchMe } = useAuthStore();
  const [form, setForm] = useState({
    name: user?.name ?? '',
    phone: user?.phone ?? '',
    address: user?.address ?? '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      setLoading(true);
      const data: Record<string, string> = {};
      if (form.name) data.name = form.name;
      if (form.phone) data.phone = form.phone;
      if (form.address) data.address = form.address;
      if (form.password) data.password = form.password;
      await updateMe(data);
      await fetchMe();
      setSaved(true);
      setForm((f) => ({ ...f, password: '' }));
      setTimeout(() => setSaved(false), 2000);
    } catch {
      setError('정보 수정에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold gradient-text mb-8">프로필</h1>

      <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
        {/* 아바타 */}
        <div className="flex items-center gap-4 mb-8 pb-6 border-b">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-bold"
            style={{ background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)' }}
          >
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <p className="font-bold text-gray-800 text-lg">{user?.name}</p>
            <p className="text-sm text-gray-500">{user?.email}</p>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
              user?.role === 'ADMIN' ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-500'
            }`}>
              {user?.role === 'ADMIN' ? '관리자' : '일반회원'}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">이름</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">전화번호</label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="010-0000-0000"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">기본 배송지</label>
            <input
              type="text"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              placeholder="서울시 강남구..."
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">새 비밀번호 (선택)</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="변경하려면 입력"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-400"
            />
          </div>

          {error && <div className="bg-red-50 text-red-500 text-sm rounded-xl px-4 py-3">{error}</div>}

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-xl font-bold transition-all ${
              saved ? 'bg-green-500 text-white' : 'btn-gradient'
            } disabled:opacity-60`}
          >
            {saved ? '✓ 저장되었습니다' : loading ? '저장 중...' : '정보 수정'}
          </button>
        </form>
      </div>
    </div>
  );
}
