import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getProducts, getCategories } from '../api/products';
import type { Product, Category } from '../types';
import ProductCard from '../components/ProductCard';
import LoadingSpinner from '../components/LoadingSpinner';

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const categoryId = searchParams.get('categoryId') ? Number(searchParams.get('categoryId')) : undefined;
  const search = searchParams.get('search') ?? '';
  const sortBy = searchParams.get('sortBy') ?? 'createdAt';
  const order = (searchParams.get('order') ?? 'DESC') as 'ASC' | 'DESC';
  const page = Number(searchParams.get('page') ?? '1');
  const limit = 12;

  const fetchProducts = useCallback(() => {
    setLoading(true);
    getProducts({ categoryId, search: search || undefined, sortBy, order, page, limit })
      .then((r) => { setProducts(r.items); setTotal(r.total); })
      .finally(() => setLoading(false));
  }, [categoryId, search, sortBy, order, page]);

  useEffect(() => { getCategories().then(setCategories); }, []);
  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const setParam = (key: string, value: string | undefined) => {
    const p = new URLSearchParams(searchParams);
    if (value) p.set(key, value); else p.delete(key);
    p.delete('page');
    setSearchParams(p);
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold gradient-text mb-8">상품 목록</h1>

      {/* 필터 바 */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-8 flex flex-wrap gap-4 items-center">
        {/* 검색 */}
        <div className="flex-1 min-w-48">
          <input
            type="text"
            placeholder="상품 검색..."
            defaultValue={search}
            onKeyDown={(e) => {
              if (e.key === 'Enter') setParam('search', (e.target as HTMLInputElement).value || undefined);
            }}
            className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-purple-400"
          />
        </div>

        {/* 카테고리 */}
        <select
          value={categoryId ?? ''}
          onChange={(e) => setParam('categoryId', e.target.value || undefined)}
          className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-purple-400"
        >
          <option value="">전체 카테고리</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>

        {/* 정렬 */}
        <select
          value={`${sortBy}-${order}`}
          onChange={(e) => {
            const [s, o] = e.target.value.split('-');
            const p = new URLSearchParams(searchParams);
            p.set('sortBy', s);
            p.set('order', o);
            p.delete('page');
            setSearchParams(p);
          }}
          className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-purple-400"
        >
          <option value="createdAt-DESC">최신순</option>
          <option value="price-ASC">가격 낮은순</option>
          <option value="price-DESC">가격 높은순</option>
          <option value="name-ASC">이름순</option>
        </select>

        <span className="text-sm text-gray-500">{total}개 상품</span>
      </div>

      {/* 상품 그리드 */}
      {loading ? (
        <LoadingSpinner />
      ) : products.length === 0 ? (
        <div className="text-center py-24 text-gray-400">
          <div className="text-5xl mb-4">🔍</div>
          <p className="text-lg">검색 결과가 없습니다.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 mb-10">
          {products.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      )}

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => {
                const sp = new URLSearchParams(searchParams);
                sp.set('page', String(p));
                setSearchParams(sp);
              }}
              className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                p === page
                  ? 'btn-gradient'
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-purple-300 hover:text-purple-600'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
