import client from './client';
import type { Cart } from '../types';

export const getCart = () =>
  client.get<Cart>('/cart').then((r) => r.data);

export const addToCart = (productId: number, quantity: number) =>
  client.post<Cart>('/cart/items', { productId, quantity }).then((r) => r.data);

export const updateCartItem = (itemId: number, quantity: number) =>
  client.patch<Cart>(`/cart/items/${itemId}`, { quantity }).then((r) => r.data);

export const removeCartItem = (itemId: number) =>
  client.delete<Cart>(`/cart/items/${itemId}`).then((r) => r.data);
