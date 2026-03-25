import { useEffect, useState } from 'react';
import { getProducts, getCategories, createProduct, updateProduct, deleteProduct } from '../../api/products';
import type { Product, Category } from '../../types';
import LoadingSpinner from '../../components/LoadingSpinner';

const EMPTY_FORM = { name: '', description: '', price: '', stock: '', imageUrl: '', categoryId: '', isActive: true };

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const fetchAll = () => {
    Promise.all([
      getProducts({ limit: 100 }),
      getCategories(),
    ]).then(([pResult, cats]) => {
      setProducts(pResult.items);
      setCategories(cats);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { fetchAll(); }, []);

  const openCreate = () => { setForm(EMPTY_FORM); setEditId(null); setShowForm(true); };
  const openEdit = (p: Product) => {
    setForm({
      name: p.name,
      description: p.description ?? '',
      price: String(p.price),
      stock: String(p.stock),
      imageUrl: p.imageUrl ?? '',
      categoryId: String(p.categoryId),
      isActive: p.isActive,
    });
    setEditId(p.id);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      name: form.name,
      description: form.description,
      price: Number(form.price),
      stock: Number(form.stock),
      imageUrl: form.imageUrl || undefined,
      categoryId: Number(form.categoryId),
      isActive: form.isActive,
    };
    try {
      if (editId) {
        await updateProduct(editId, data);
      } else {
        await createProduct(data);
      }
      setShowForm(false);
      fetchAll();
    } catch {
      alert('저장에 실패했습니다.');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('상품을 삭제하시겠습니까?')) return;
    try {
      await deleteProduct(id);
      fetchAll();
    } catch {
      alert('삭제에 실패했습니다.');
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-800">상품 관리 ({products.length}개)</h2>
        <button onClick={openCreate} className="btn-gradient px-4 py-2 rounded-xl text-sm font-semibold">
          + 상품 추가
        </button>
      </div>

      {/* 상품 폼 모달 */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-xl">
            <h3 className="font-bold text-lg mb-5">{editId ? '상품 수정' : '상품 추가'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-sm font-medium text-gray-700 block mb-1">상품명</label>
                  <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-purple-400" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">가격</label>
                  <input required type="number" min="0" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-purple-400" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">재고</label>
                  <input required type="number" min="0" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-purple-400" />
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium text-gray-700 block mb-1">카테고리</label>
                  <select required value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-purple-400">
                    <option value="">선택</option>
                    {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium text-gray-700 block mb-1">이미지 URL</label>
                  <input value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-purple-400" />
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium text-gray-700 block mb-1">설명</label>
                  <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-purple-400 resize-none" />
                </div>
                <div className="col-span-2 flex items-center gap-2">
                  <input type="checkbox" id="isActive" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
                  <label htmlFor="isActive" className="text-sm text-gray-700">판매 중</label>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="btn-gradient flex-1 py-2.5 rounded-xl font-semibold text-sm">저장</button>
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm hover:bg-gray-50">취소</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-5 py-3 text-left font-semibold text-gray-600">상품명</th>
              <th className="px-5 py-3 text-left font-semibold text-gray-600">카테고리</th>
              <th className="px-5 py-3 text-left font-semibold text-gray-600">가격</th>
              <th className="px-5 py-3 text-left font-semibold text-gray-600">재고</th>
              <th className="px-5 py-3 text-left font-semibold text-gray-600">상태</th>
              <th className="px-5 py-3 text-left font-semibold text-gray-600">작업</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                <td className="px-5 py-3 font-medium text-gray-800">{p.name}</td>
                <td className="px-5 py-3 text-gray-500">{p.category?.name ?? '-'}</td>
                <td className="px-5 py-3 font-semibold">{p.price.toLocaleString()}원</td>
                <td className="px-5 py-3">
                  <span className={p.stock === 0 ? 'text-red-500 font-semibold' : 'text-gray-600'}>{p.stock}</span>
                </td>
                <td className="px-5 py-3">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${p.isActive ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                    {p.isActive ? '판매중' : '판매중지'}
                  </span>
                </td>
                <td className="px-5 py-3">
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(p)} className="text-purple-600 hover:text-purple-700 text-xs font-medium">수정</button>
                    <button onClick={() => handleDelete(p.id)} className="text-red-400 hover:text-red-500 text-xs font-medium">삭제</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
