import client from './client';
import type { Product, ProductListResult, ProductQuery, Category } from '../types';

export const getProducts = (query?: ProductQuery) =>
  client.get<ProductListResult>('/products', { params: query }).then((r) => r.data);

export const getProduct = (id: number) =>
  client.get<Product>(`/products/${id}`).then((r) => r.data);

export const getCategories = () =>
  client.get<Category[]>('/categories').then((r) => r.data);

export const createProduct = (data: Partial<Product>) =>
  client.post<Product>('/products', data).then((r) => r.data);

export const updateProduct = (id: number, data: Partial<Product>) =>
  client.patch<Product>(`/products/${id}`, data).then((r) => r.data);

export const deleteProduct = (id: number) =>
  client.delete(`/products/${id}`).then((r) => r.data);

export const createCategory = (data: { name: string; description?: string }) =>
  client.post<Category>('/categories', data).then((r) => r.data);

export const updateCategory = (id: number, data: { name?: string; description?: string }) =>
  client.patch<Category>(`/categories/${id}`, data).then((r) => r.data);

export const deleteCategory = (id: number) =>
  client.delete(`/categories/${id}`).then((r) => r.data);
