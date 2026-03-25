import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getProduct } from '../api/products';
import type { Product } from '../types';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';
import LoadingSpinner from '../components/LoadingSpinner';

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  const { user } = useAuthStore();
  const { addItem } = useCartStore();

  useEffect(() => {
    if (!id) return;
    getProduct(Number(id))
      .then(setProduct)
      .finally(() => setLoading(false));
  }, [id]);

  const handleAddToCart = async () => {
    if (!user) { window.location.href = '/login'; return; }
    try {
      setAdding(true);
      await addItem(product!.id, qty);
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    } catch {
      alert('장바구니 추가에 실패했습니다.');
    } finally {
      setAdding(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!product) return <div className="text-center py-24 text-gray-400">상품을 찾을 수 없습니다.</div>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <Link to="/products" className="text-purple-600 hover:text-purple-700 text-sm mb-6 inline-flex items-center gap-1">
        ← 목록으로
      </Link>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="grid md:grid-cols-2">
          {/* 이미지 */}
          <div className="h-80 md:h-auto bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center min-h-64">
            {product.imageUrl ? (
              <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <div className="text-8xl">🛍️</div>
            )}
          </div>

          {/* 정보 */}
          <div className="p-8 flex flex-col justify-between">
            <div>
              <p className="text-sm text-purple-500 font-medium mb-2">{product.category?.name}</p>
              <h1 className="text-2xl font-bold text-gray-800 mb-4">{product.name}</h1>
              {product.description && (
                <p className="text-gray-500 text-sm leading-relaxed mb-6">{product.description}</p>
              )}
              <div className="text-4xl font-extrabold gradient-text mb-6">
                {product.price.toLocaleString()}원
              </div>

              {/* 재고 */}
              <div className="mb-6">
                {product.stock === 0 ? (
                  <span className="text-red-500 font-medium text-sm">품절</span>
                ) : (
                  <span className="text-green-600 font-medium text-sm">재고 {product.stock}개</span>
                )}
              </div>
            </div>

            {/* 수량 + 버튼 */}
            {product.stock > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-600 font-medium">수량</span>
                  <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                    <button
                      onClick={() => setQty(Math.max(1, qty - 1))}
                      className="w-10 h-10 flex items-center justify-center hover:bg-gray-50 text-gray-600"
                    >
                      −
                    </button>
                    <span className="w-12 text-center font-semibold">{qty}</span>
                    <button
                      onClick={() => setQty(Math.min(product.stock, qty + 1))}
                      className="w-10 h-10 flex items-center justify-center hover:bg-gray-50 text-gray-600"
                    >
                      +
                    </button>
                  </div>
                </div>

                <button
                  onClick={handleAddToCart}
                  disabled={adding}
                  className={`w-full py-3 rounded-xl font-bold text-lg transition-all ${
                    added
                      ? 'bg-green-500 text-white'
                      : 'btn-gradient'
                  }`}
                >
                  {added ? '✓ 장바구니에 추가됨' : adding ? '추가 중...' : '장바구니 담기'}
                </button>

                <Link
                  to="/cart"
                  className="block text-center w-full py-3 rounded-xl border-2 border-purple-300 text-purple-600 font-bold hover:bg-purple-50 transition-colors"
                >
                  장바구니 보기
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
