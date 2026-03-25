import { useEffect, useState } from 'react';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../../api/products';
import type { Category } from '../../types';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<Category | null>(null);
  const [form, setForm] = useState({ name: '', description: '' });

  const fetchAll = () => {
    getCategories().then(setCategories).finally(() => setLoading(false));
  };

  useEffect(() => { fetchAll(); }, []);

  const openCreate = () => { setForm({ name: '', description: '' }); setEditItem(null); setShowForm(true); };
  const openEdit = (c: Category) => { setForm({ name: c.name, description: c.description ?? '' }); setEditItem(c); setShowForm(true); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editItem) {
        await updateCategory(editItem.id, form);
      } else {
        await createCategory(form);
      }
      setShowForm(false);
      fetchAll();
    } catch {
      alert('저장에 실패했습니다.');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('카테고리를 삭제하시겠습니까?')) return;
    try {
      await deleteCategory(id);
      fetchAll();
    } catch {
      alert('삭제에 실패했습니다.');
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-800">카테고리 관리 ({categories.length}개)</h2>
        <button onClick={openCreate} className="btn-gradient px-4 py-2 rounded-xl text-sm font-semibold">
          + 카테고리 추가
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <h3 className="font-bold text-lg mb-5">{editItem ? '카테고리 수정' : '카테고리 추가'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">카테고리명</label>
                <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-purple-400" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">설명</label>
                <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-purple-400" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="btn-gradient flex-1 py-2.5 rounded-xl font-semibold text-sm">저장</button>
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm hover:bg-gray-50">취소</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {categories.map((cat) => (
          <div key={cat.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="text-2xl mb-2">🏷️</div>
            <h3 className="font-bold text-gray-800 mb-1">{cat.name}</h3>
            {cat.description && <p className="text-xs text-gray-500 mb-3">{cat.description}</p>}
            <div className="flex gap-2">
              <button onClick={() => openEdit(cat)} className="text-purple-600 hover:text-purple-700 text-xs font-medium">수정</button>
              <button onClick={() => handleDelete(cat.id)} className="text-red-400 hover:text-red-500 text-xs font-medium">삭제</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
