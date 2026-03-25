import { Link } from 'react-router-dom';
import type { Product } from '../types';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';

interface Props {
  product: Product;
}

export default function ProductCard({ product }: Props) {
  const { user } = useAuthStore();
  const { addItem } = useCartStore();

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) {
      window.location.href = '/login';
      return;
    }
    try {
      await addItem(product.id);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '장바구니 추가에 실패했습니다.';
      alert(msg);
    }
  };

  return (
    <Link to={`/products/${product.id}`} className="block">
      <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 card-hover">
        {/* 이미지 영역 */}
        <div className="h-52 bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center relative">
          {product.imageUrl ? (
            <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
          ) : (
            <div className="text-6xl">🛍️</div>
          )}
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <span className="bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-full">품절</span>
            </div>
          )}
          {product.stock > 0 && product.stock <= 5 && (
            <span className="absolute top-3 right-3 bg-orange-400 text-white text-xs font-bold px-2 py-1 rounded-full">
              재고 {product.stock}개
            </span>
          )}
        </div>

        {/* 정보 영역 */}
        <div className="p-4">
          <p className="text-xs text-purple-500 font-medium mb-1">{product.category?.name}</p>
          <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2 leading-tight">{product.name}</h3>
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold gradient-text">
              {product.price.toLocaleString()}원
            </span>
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="btn-gradient text-sm px-3 py-1.5 rounded-full disabled:opacity-40 disabled:cursor-not-allowed"
            >
              담기
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}
