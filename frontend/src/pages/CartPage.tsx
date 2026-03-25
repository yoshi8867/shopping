import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import LoadingSpinner from '../components/LoadingSpinner';

export default function CartPage() {
  const { user } = useAuthStore();
  const { cart, loading, fetchCart, updateItem, removeItem } = useCartStore();
  const navigate = useNavigate();
  const [checkoutAddr, setCheckoutAddr] = useState('');
  const [showCheckout, setShowCheckout] = useState(false);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    fetchCart();
  }, [user]);

  const total = cart?.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0) ?? 0;

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold gradient-text mb-8">장바구니</h1>

      {!cart || cart.items.length === 0 ? (
        <div className="text-center py-24">
          <div className="text-6xl mb-4">🛒</div>
          <p className="text-gray-400 text-lg mb-6">장바구니가 비어있습니다.</p>
          <Link to="/products" className="btn-gradient px-6 py-3 rounded-full font-semibold inline-block">
            쇼핑 계속하기
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">
          {/* 상품 목록 */}
          <div className="md:col-span-2 space-y-3">
            {cart.items.map((item) => (
              <div key={item.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex gap-4">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  {item.product.imageUrl
                    ? <img src={item.product.imageUrl} alt={item.product.name} className="w-full h-full object-cover rounded-xl" />
                    : <span className="text-3xl">🛍️</span>
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800 truncate">{item.product.name}</p>
                  <p className="text-purple-600 font-bold mt-1">{item.product.price.toLocaleString()}원</p>
                  <div className="flex items-center gap-3 mt-2">
                    <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                      <button
                        onClick={() => item.quantity > 1 && updateItem(item.id, item.quantity - 1)}
                        className="w-7 h-7 flex items-center justify-center hover:bg-gray-50 text-sm"
                      >−</button>
                      <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                      <button
                        onClick={() => updateItem(item.id, item.quantity + 1)}
                        className="w-7 h-7 flex items-center justify-center hover:bg-gray-50 text-sm"
                      >+</button>
                    </div>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-gray-400 hover:text-red-400 text-xs transition-colors"
                    >
                      삭제
                    </button>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-bold text-gray-800">
                    {(item.product.price * item.quantity).toLocaleString()}원
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* 주문 요약 */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 sticky top-24">
              <h2 className="font-bold text-gray-800 text-lg mb-4">주문 요약</h2>
              <div className="space-y-2 mb-4 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>상품금액</span>
                  <span>{total.toLocaleString()}원</span>
                </div>
                <div className="flex justify-between">
                  <span>배송비</span>
                  <span className="text-green-600">무료</span>
                </div>
              </div>
              <div className="border-t pt-4 mb-6">
                <div className="flex justify-between font-bold text-lg">
                  <span>합계</span>
                  <span className="gradient-text">{total.toLocaleString()}원</span>
                </div>
              </div>

              {!showCheckout ? (
                <button
                  onClick={() => setShowCheckout(true)}
                  className="btn-gradient w-full py-3 rounded-xl font-bold text-lg"
                >
                  주문하기
                </button>
              ) : (
                <div className="space-y-3">
                  <textarea
                    placeholder="배송 주소를 입력하세요"
                    value={checkoutAddr}
                    onChange={(e) => setCheckoutAddr(e.target.value)}
                    rows={3}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-purple-400 resize-none"
                  />
                  <button
                    onClick={() => navigate('/checkout', { state: { address: checkoutAddr } })}
                    disabled={!checkoutAddr.trim()}
                    className="btn-gradient w-full py-3 rounded-xl font-bold disabled:opacity-50"
                  >
                    결제하기
                  </button>
                  <button
                    onClick={() => setShowCheckout(false)}
                    className="w-full py-2 text-gray-500 text-sm hover:text-gray-700"
                  >
                    취소
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
