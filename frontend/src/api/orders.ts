import client from './client';
import type { Order } from '../types';

export const createOrder = (shippingAddress: string) =>
  client.post<Order>('/orders', { shippingAddress }).then((r) => r.data);

export const getMyOrders = () =>
  client.get<Order[]>('/orders').then((r) => r.data);

export const getOrder = (id: number) =>
  client.get<Order>(`/orders/${id}`).then((r) => r.data);

export const cancelOrder = (id: number) =>
  client.delete<Order>(`/orders/${id}`).then((r) => r.data);

export const getAllOrders = () =>
  client.get<Order[]>('/orders/admin/all').then((r) => r.data);

export const updateOrderStatus = (id: number, status: string) =>
  client.patch<Order>(`/orders/admin/${id}/status`, { status }).then((r) => r.data);
