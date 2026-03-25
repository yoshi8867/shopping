import { useEffect, useState } from 'react';
import { getAllOrders, updateOrderStatus } from '../../api/orders';
import type { Order, OrderStatus } from '../../types';
import LoadingSpinner from '../../components/LoadingSpinner';
import OrderStatusBadge from '../../components/OrderStatusBadge';

const STATUS_OPTIONS: OrderStatus[] = ['PENDING', 'PAID', 'SHIPPING', 'DELIVERED', 'CANCELLED'];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllOrders().then(setOrders).finally(() => setLoading(false));
  }, []);

  const handleStatusChange = async (orderId: number, status: OrderStatus) => {
    try {
      const updated = await updateOrderStatus(orderId, status);
      setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
    } catch {
      alert('상태 변경에 실패했습니다.');
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-800">전체 주문 ({orders.length}건)</h2>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-16 text-gray-400">주문이 없습니다.</div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-5 py-3 text-left font-semibold text-gray-600">주문 ID</th>
                <th className="px-5 py-3 text-left font-semibold text-gray-600">주문일</th>
                <th className="px-5 py-3 text-left font-semibold text-gray-600">상품 수</th>
                <th className="px-5 py-3 text-left font-semibold text-gray-600">금액</th>
                <th className="px-5 py-3 text-left font-semibold text-gray-600">상태</th>
                <th className="px-5 py-3 text-left font-semibold text-gray-600">변경</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4 font-medium text-purple-600">#{order.id}</td>
                  <td className="px-5 py-4 text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString('ko-KR')}
                  </td>
                  <td className="px-5 py-4 text-gray-600">{order.items?.length ?? 0}개</td>
                  <td className="px-5 py-4 font-semibold">{order.totalAmount.toLocaleString()}원</td>
                  <td className="px-5 py-4">
                    <OrderStatusBadge status={order.status} />
                  </td>
                  <td className="px-5 py-4">
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)}
                      className="border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-purple-400"
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
