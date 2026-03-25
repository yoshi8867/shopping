import { useEffect, useState } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { getOrder, cancelOrder } from '../api/orders';
import type { Order } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';
import OrderStatusBadge from '../components/OrderStatusBadge';

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const isSuccess = (location.state as { success?: boolean })?.success;
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (!id) return;
    getOrder(Number(id)).then(setOrder).finally(() => setLoading(false));
  }, [id]);

  const handleCancel = async () => {
    if (!order || !confirm('주문을 취소하시겠습니까?')) return;
    try {
      setCancelling(true);
      const updated = await cancelOrder(order.id);
      setOrder(updated);
    } catch {
      alert('주문 취소에 실패했습니다.');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!order) return <div className="text-center py-24 text-gray-400">주문을 찾을 수 없습니다.</div>;

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      {isSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-4 mb-6 text-center">
          <div className="text-3xl mb-2">🎉</div>
          <p className="font-bold text-green-700">결제가 완료되었습니다!</p>
          <p className="text-sm text-green-600 mt-1">주문이 성공적으로 접수되었습니다.</p>
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold gradient-text">주문 #{order.id}</h1>
        <OrderStatusBadge status={order.status} />
      </div>

      <div className="space-y-4">
        {/* 주문 상품 */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h2 className="font-bold text-gray-800 mb-4">주문 상품</h2>
          <div className="space-y-3">
            {order.items.map((item) => (
              <div key={item.id} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                <div>
                  <p className="font-medium text-gray-800">{item.product?.name ?? `상품 #${item.productId}`}</p>
                  <p className="text-sm text-gray-500">{item.price.toLocaleString()}원 × {item.quantity}</p>
                </div>
                <p className="font-bold text-gray-800">{(item.price * item.quantity).toLocaleString()}원</p>
              </div>
            ))}
          </div>
          <div className="flex justify-between font-bold text-lg mt-4 pt-4 border-t">
            <span>합계</span>
            <span className="gradient-text">{order.totalAmount.toLocaleString()}원</span>
          </div>
        </div>

        {/* 배송 정보 */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h2 className="font-bold text-gray-800 mb-3">배송 정보</h2>
          <p className="text-gray-600 text-sm">{order.shippingAddress}</p>
        </div>

        {/* 결제 정보 */}
        {order.payment && (
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <h2 className="font-bold text-gray-800 mb-3">결제 정보</h2>
            <div className="text-sm text-gray-600 space-y-1.5">
              <div className="flex justify-between">
                <span>결제 방법</span>
                <span className="font-medium">{order.payment.method}</span>
              </div>
              <div className="flex justify-between">
                <span>결제 상태</span>
                <span className={`font-medium ${order.payment.status === 'SUCCESS' ? 'text-green-600' : 'text-gray-600'}`}>
                  {order.payment.status}
                </span>
              </div>
              {order.payment.transactionId && (
                <div className="flex justify-between">
                  <span>거래 ID</span>
                  <span className="font-mono text-xs">{order.payment.transactionId}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 주문 취소 버튼 */}
        {order.status === 'PENDING' && (
          <button
            onClick={handleCancel}
            disabled={cancelling}
            className="w-full py-3 rounded-xl border-2 border-red-300 text-red-500 font-bold hover:bg-red-50 transition-colors disabled:opacity-50"
          >
            {cancelling ? '처리 중...' : '주문 취소'}
          </button>
        )}

        <Link to="/orders" className="block text-center text-purple-600 hover:text-purple-700 text-sm py-2">
          ← 주문 목록으로
        </Link>
      </div>
    </div>
  );
}
