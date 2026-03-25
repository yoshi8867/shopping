import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { createOrder } from '../api/orders';
import { requestPayment } from '../api/payments';
import type { PaymentMethod } from '../types';
import { useCartStore } from '../store/cartStore';

const PAYMENT_METHODS: { value: PaymentMethod; label: string; icon: string }[] = [
  { value: 'CARD', label: '신용카드', icon: '💳' },
  { value: 'BANK_TRANSFER', label: '계좌이체', icon: '🏦' },
  { value: 'VIRTUAL_ACCOUNT', label: '가상계좌', icon: '🧾' },
];

export default function CheckoutPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const address = (location.state as { address?: string })?.address ?? '';

  const [method, setMethod] = useState<PaymentMethod>('CARD');
  const [loading, setLoading] = useState(false);
  const { clearCart } = useCartStore();

  const handlePay = async () => {
    if (!address.trim()) { alert('배송 주소가 없습니다.'); return; }
    try {
      setLoading(true);
      const order = await createOrder(address);
      await requestPayment(order.id, method);
      clearCart();
      navigate(`/orders/${order.id}`, { state: { success: true } });
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? '결제에 실패했습니다.';
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold gradient-text mb-8">결제</h1>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-6">
        {/* 배송지 */}
        <div>
          <h2 className="font-semibold text-gray-800 mb-2">배송 주소</h2>
          <p className="text-sm text-gray-600 bg-gray-50 rounded-xl p-3">{address || '주소 없음'}</p>
        </div>

        {/* 결제 수단 */}
        <div>
          <h2 className="font-semibold text-gray-800 mb-3">결제 수단</h2>
          <div className="grid grid-cols-3 gap-3">
            {PAYMENT_METHODS.map((m) => (
              <button
                key={m.value}
                onClick={() => setMethod(m.value)}
                className={`p-3 rounded-xl border-2 text-center transition-all ${
                  method === m.value
                    ? 'border-purple-400 bg-purple-50'
                    : 'border-gray-200 hover:border-purple-200'
                }`}
              >
                <div className="text-2xl mb-1">{m.icon}</div>
                <div className="text-xs font-medium text-gray-700">{m.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Mock 안내 */}
        <div className="bg-blue-50 rounded-xl p-4 text-sm text-blue-600">
          ℹ️ 이 서비스는 <strong>Mock 결제</strong>를 사용합니다. 실제 결제가 발생하지 않습니다.
        </div>

        <button
          onClick={handlePay}
          disabled={loading}
          className="btn-gradient w-full py-4 rounded-xl font-bold text-lg disabled:opacity-60"
        >
          {loading ? '처리 중...' : '결제 완료하기'}
        </button>
      </div>
    </div>
  );
}
