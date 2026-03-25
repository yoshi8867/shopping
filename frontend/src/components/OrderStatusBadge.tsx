import type { OrderStatus } from '../types';

const STATUS_MAP: Record<OrderStatus, { label: string; color: string }> = {
  PENDING:   { label: '결제대기', color: 'bg-yellow-100 text-yellow-700' },
  PAID:      { label: '결제완료', color: 'bg-blue-100 text-blue-700' },
  SHIPPING:  { label: '배송중',   color: 'bg-purple-100 text-purple-700' },
  DELIVERED: { label: '배송완료', color: 'bg-green-100 text-green-700' },
  CANCELLED: { label: '취소됨',   color: 'bg-gray-100 text-gray-500' },
};

export default function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const { label, color } = STATUS_MAP[status] ?? { label: status, color: 'bg-gray-100 text-gray-500' };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${color}`}>
      {label}
    </span>
  );
}
