import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getProducts, getCategories } from '../api/products';
import type { Product, Category } from '../types';
import ProductCard from '../components/ProductCard';
import LoadingSpinner from '../components/LoadingSpinner';

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getProducts({ limit: 8, sortBy: 'createdAt', order: 'DESC' }),
      getCategories(),
    ]).then(([pResult, cats]) => {
      setProducts(pResult.items);
      setCategories(cats);
    }).finally(() => setLoading(false));
  }, []);

  return (
    <div>
      {/* 히어로 배너 */}
      <section
        className="relative overflow-hidden py-24 px-4 text-white text-center"
        style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
      >
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-48 h-48 bg-white rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-3xl mx-auto">
          <h1 className="text-5xl font-extrabold mb-4 tracking-tight">
            ✦ ShopVibe
          </h1>
          <p className="text-xl text-white/80 mb-8">
            트렌디한 상품을 한 곳에서. 지금 바로 쇼핑을 시작해보세요.
          </p>
          <Link
            to="/products"
            className="inline-block bg-white text-purple-700 font-bold px-8 py-3 rounded-full text-lg hover:bg-white/90 transition-colors shadow-lg"
          >
            쇼핑 시작하기 →
          </Link>
        </div>
      </section>

      {/* 카테고리 */}
      {categories.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">카테고리</h2>
          <div className="flex gap-3 flex-wrap">
            <Link
              to="/products"
              className="px-5 py-2 rounded-full border-2 border-purple-300 text-purple-600 font-medium hover:bg-purple-50 transition-colors"
            >
              전체
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat.id}
                to={`/products?categoryId=${cat.id}`}
                className="px-5 py-2 rounded-full border-2 border-gray-200 text-gray-600 font-medium hover:border-purple-300 hover:text-purple-600 transition-colors"
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* 신상품 */}
      <section className="max-w-7xl mx-auto px-4 pb-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">최신 상품</h2>
          <Link to="/products" className="text-purple-600 font-medium hover:text-purple-700 text-sm">
            전체보기 →
          </Link>
        </div>
        {loading ? (
          <LoadingSpinner />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
