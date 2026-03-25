import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getMyOrders } from '../api/orders';
import type { Order } from '../types';
import { useAuthStore } from '../store/authStore';
import LoadingSpinner from '../components/LoadingSpinner';
import OrderStatusBadge from '../components/OrderStatusBadge';

export default function OrdersPage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    getMyOrders().then(setOrders).finally(() => setLoading(false));
  }, [user]);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold gradient-text mb-8">주문 내역</h1>

      {orders.length === 0 ? (
        <div className="text-center py-24">
          <div className="text-6xl mb-4">📦</div>
          <p className="text-gray-400 text-lg mb-6">주문 내역이 없습니다.</p>
          <Link to="/products" className="btn-gradient px-6 py-3 rounded-full font-semibold inline-block">
            쇼핑하러 가기
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Link key={order.id} to={`/orders/${order.id}`}>
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:border-purple-200 transition-colors card-hover">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-bold text-gray-800">주문 #{order.id}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Date(order.createdAt).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <OrderStatusBadge status={order.status} />
                </div>
                <div className="text-sm text-gray-500 mb-3">
                  {order.items.slice(0, 2).map((item) => (
                    <span key={item.id} className="mr-2">{item.product?.name ?? `상품 #${item.productId}`} x{item.quantity}</span>
                  ))}
                  {order.items.length > 2 && <span className="text-gray-400">외 {order.items.length - 2}건</span>}
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">배송지: {order.shippingAddress}</span>
                  <span className="font-bold gradient-text">{order.totalAmount.toLocaleString()}원</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
