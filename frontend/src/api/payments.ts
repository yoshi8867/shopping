import client from './client';
import type { Payment, PaymentMethod } from '../types';

export const requestPayment = (orderId: number, method: PaymentMethod) =>
  client.post<Payment>('/payments', { orderId, method }).then((r) => r.data);

export const getPaymentByOrder = (orderId: number) =>
  client.get<Payment>(`/payments/order/${orderId}`).then((r) => r.data);

export const refundPayment = (paymentId: number) =>
  client.post<Payment>(`/payments/${paymentId}/refund`).then((r) => r.data);
