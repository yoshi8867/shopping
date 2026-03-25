import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { Payment } from './entities/payment.entity';
import { Order } from '../order/entities/order.entity';
import { PaymentMethod, PaymentStatus } from '../common/enums/payment.enum';
import { OrderStatus } from '../common/enums/order-status.enum';

const mockOrder = { id: 1, userId: 1, totalAmount: 3000000, status: OrderStatus.PENDING };
const mockPayment = {
  id: 1, orderId: 1, amount: 3000000,
  method: PaymentMethod.CARD, status: PaymentStatus.SUCCESS,
  transactionId: 'MOCK-TXN-123', paidAt: new Date(),
  order: mockOrder,
};

const mockPaymentRepository = { findOne: jest.fn(), create: jest.fn(), save: jest.fn() };
const mockOrderRepository = { findOne: jest.fn(), update: jest.fn() };

describe('PaymentService', () => {
  let service: PaymentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentService,
        { provide: getRepositoryToken(Payment), useValue: mockPaymentRepository },
        { provide: getRepositoryToken(Order), useValue: mockOrderRepository },
      ],
    }).compile();

    service = module.get<PaymentService>(PaymentService);
    jest.clearAllMocks();
  });

  describe('requestPayment', () => {
    it('존재하지 않는 주문 결제 시 NotFoundException을 던진다', async () => {
      mockOrderRepository.findOne.mockResolvedValue(null);
      await expect(
        service.requestPayment(1, { orderId: 999, method: PaymentMethod.CARD }),
      ).rejects.toThrow(NotFoundException);
    });

    it('다른 유저의 주문 결제 시 ForbiddenException을 던진다', async () => {
      mockOrderRepository.findOne.mockResolvedValue({ ...mockOrder, userId: 2 });
      await expect(
        service.requestPayment(1, { orderId: 1, method: PaymentMethod.CARD }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('이미 결제된 주문 결제 시 BadRequestException을 던진다', async () => {
      mockOrderRepository.findOne.mockResolvedValue(mockOrder);
      mockPaymentRepository.findOne.mockResolvedValue({ ...mockPayment });
      await expect(
        service.requestPayment(1, { orderId: 1, method: PaymentMethod.CARD }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('refund', () => {
    it('결제 완료 건을 환불 처리한다', async () => {
      mockPaymentRepository.findOne.mockResolvedValue({ ...mockPayment });
      mockPaymentRepository.save.mockResolvedValue({ ...mockPayment, status: PaymentStatus.REFUNDED });
      mockOrderRepository.update.mockResolvedValue(undefined);

      const result = await service.refund(1, 1);
      expect(result.status).toBe(PaymentStatus.REFUNDED);
    });

    it('SUCCESS가 아닌 결제 환불 시 BadRequestException을 던진다', async () => {
      mockPaymentRepository.findOne.mockResolvedValue({
        ...mockPayment, status: PaymentStatus.PENDING,
      });
      await expect(service.refund(1, 1)).rejects.toThrow(BadRequestException);
    });

    it('다른 유저의 결제 환불 시 ForbiddenException을 던진다', async () => {
      mockPaymentRepository.findOne.mockResolvedValue({
        ...mockPayment, order: { ...mockOrder, userId: 2 },
      });
      await expect(service.refund(1, 1)).rejects.toThrow(ForbiddenException);
    });
  });

  describe('getPaymentByOrder', () => {
    it('결제 정보가 없으면 NotFoundException을 던진다', async () => {
      mockOrderRepository.findOne.mockResolvedValue(mockOrder);
      mockPaymentRepository.findOne.mockResolvedValue(null);
      await expect(service.getPaymentByOrder(1, 1)).rejects.toThrow(NotFoundException);
    });
  });
});
