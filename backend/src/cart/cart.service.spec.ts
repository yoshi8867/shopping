import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { CartService } from './cart.service';
import { Cart } from './entities/cart.entity';
import { CartItem } from './entities/cart-item.entity';
import { Product } from '../product/entities/product.entity';

const mockCart = { id: 1, userId: 1, items: [] };
const mockProduct = { id: 1, name: '아이폰', price: 1500000, stock: 10, isActive: true };

const mockCartRepository = { findOne: jest.fn(), save: jest.fn(), create: jest.fn() };
const mockCartItemRepository = { findOne: jest.fn(), save: jest.fn(), create: jest.fn(), remove: jest.fn() };
const mockProductRepository = { findOne: jest.fn() };

describe('CartService', () => {
  let service: CartService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CartService,
        { provide: getRepositoryToken(Cart), useValue: mockCartRepository },
        { provide: getRepositoryToken(CartItem), useValue: mockCartItemRepository },
        { provide: getRepositoryToken(Product), useValue: mockProductRepository },
      ],
    }).compile();

    service = module.get<CartService>(CartService);
    jest.clearAllMocks();
  });

  describe('getCart', () => {
    it('기존 장바구니를 반환한다', async () => {
      mockCartRepository.findOne.mockResolvedValue(mockCart);
      const result = await service.getCart(1);
      expect(result.userId).toBe(1);
    });

    it('장바구니가 없으면 새로 생성해 반환한다', async () => {
      mockCartRepository.findOne.mockResolvedValue(null);
      mockCartRepository.create.mockReturnValue({ userId: 1 });
      mockCartRepository.save.mockResolvedValue(mockCart);
      const result = await service.getCart(1);
      expect(result.userId).toBe(1);
    });
  });

  describe('addItem', () => {
    it('재고 부족 시 BadRequestException을 던진다', async () => {
      mockProductRepository.findOne.mockResolvedValue({ ...mockProduct, stock: 1 });
      mockCartRepository.findOne.mockResolvedValue(mockCart);

      await expect(
        service.addItem(1, { productId: 1, quantity: 5 }),
      ).rejects.toThrow(BadRequestException);
    });

    it('존재하지 않는 상품 추가 시 NotFoundException을 던진다', async () => {
      mockProductRepository.findOne.mockResolvedValue(null);

      await expect(
        service.addItem(1, { productId: 999, quantity: 1 }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('removeItem', () => {
    it('존재하지 않는 항목 삭제 시 NotFoundException을 던진다', async () => {
      mockCartRepository.findOne.mockResolvedValue(mockCart);
      mockCartItemRepository.findOne.mockResolvedValue(null);

      await expect(service.removeItem(1, 999)).rejects.toThrow(NotFoundException);
    });
  });
});
