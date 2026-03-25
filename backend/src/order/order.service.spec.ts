import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { OrderService } from './order.service';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { Cart } from '../cart/entities/cart.entity';
import { Product } from '../product/entities/product.entity';
import { OrderStatus } from '../common/enums/order-status.enum';

const mockProduct = { id: 1, name: '아이폰', price: 1500000, stock: 5, isActive: true };
const mockCart = {
  id: 1, userId: 1,
  items: [{ id: 1, productId: 1, quantity: 2, product: mockProduct }],
};
const mockOrder = {
  id: 1, userId: 1, totalAmount: 3000000,
  status: OrderStatus.PENDING, shippingAddress: '서울시',
  items: [{ id: 1, productId: 1, quantity: 2, price: 1500000, product: mockProduct }],
};

const mockManager = {
  getRepository: jest.fn().mockReturnValue({ delete: jest.fn() }),
};

const mockOrderRepository = {
  findOne: jest.fn(), find: jest.fn(),
  create: jest.fn(), save: jest.fn(),
  createQueryBuilder: jest.fn(),
  manager: mockManager,
};
const mockOrderItemRepository = { create: jest.fn(), save: jest.fn() };
const mockCartRepository = {
  findOne: jest.fn(), manager: mockManager,
  createQueryBuilder: jest.fn().mockReturnValue({
    relation: jest.fn().mockReturnThis(),
    of: jest.fn().mockReturnThis(),
    loadRelationIdAndMap: jest.fn().mockResolvedValue(undefined),
  }),
};
const mockProductRepository = { update: jest.fn(), increment: jest.fn() };

describe('OrderService', () => {
  let service: OrderService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderService,
        { provide: getRepositoryToken(Order), useValue: mockOrderRepository },
        { provide: getRepositoryToken(OrderItem), useValue: mockOrderItemRepository },
        { provide: getRepositoryToken(Cart), useValue: mockCartRepository },
        { provide: getRepositoryToken(Product), useValue: mockProductRepository },
      ],
    }).compile();

    service = module.get<OrderService>(OrderService);
    jest.clearAllMocks();
    mockManager.getRepository.mockReturnValue({ delete: jest.fn() });
  });

  describe('create', () => {
    it('장바구니가 비어있으면 BadRequestException을 던진다', async () => {
      mockCartRepository.findOne.mockResolvedValue({ id: 1, userId: 1, items: [] });
      await expect(
        service.create(1, { shippingAddress: '서울시' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('재고 부족 시 BadRequestException을 던진다', async () => {
      mockCartRepository.findOne.mockResolvedValue({
        ...mockCart,
        items: [{ ...mockCart.items[0], quantity: 10, product: { ...mockProduct, stock: 1 } }],
      });
      await expect(
        service.create(1, { shippingAddress: '서울시' }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('findOne', () => {
    it('주문을 반환한다', async () => {
      mockOrderRepository.findOne.mockResolvedValue(mockOrder);
      const result = await service.findOne(1, 1);
      expect(result.id).toBe(1);
    });

    it('존재하지 않는 주문 조회 시 NotFoundException을 던진다', async () => {
      mockOrderRepository.findOne.mockResolvedValue(null);
      await expect(service.findOne(1, 999)).rejects.toThrow(NotFoundException);
    });

    it('다른 유저의 주문 접근 시 ForbiddenException을 던진다', async () => {
      mockOrderRepository.findOne.mockResolvedValue({ ...mockOrder, userId: 2 });
      await expect(service.findOne(1, 1)).rejects.toThrow(ForbiddenException);
    });
  });

  describe('cancel', () => {
    it('PENDING 상태의 주문을 취소한다', async () => {
      mockOrderRepository.findOne.mockResolvedValue({ ...mockOrder });
      mockProductRepository.increment.mockResolvedValue(undefined);
      mockOrderRepository.save.mockResolvedValue({ ...mockOrder, status: OrderStatus.CANCELLED });

      const result = await service.cancel(1, 1);
      expect(result.status).toBe(OrderStatus.CANCELLED);
    });

    it('PENDING이 아닌 주문 취소 시 BadRequestException을 던진다', async () => {
      mockOrderRepository.findOne.mockResolvedValue({ ...mockOrder, status: OrderStatus.PAID });
      await expect(service.cancel(1, 1)).rejects.toThrow(BadRequestException);
    });
  });

  describe('updateStatus (관리자)', () => {
    it('주문 상태를 변경한다', async () => {
      mockOrderRepository.findOne.mockResolvedValue({ ...mockOrder });
      mockOrderRepository.save.mockResolvedValue({ ...mockOrder, status: OrderStatus.SHIPPING });

      const result = await service.updateStatus(1, { status: OrderStatus.SHIPPING });
      expect(result.status).toBe(OrderStatus.SHIPPING);
    });
  });
});
