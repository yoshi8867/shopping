import {
  Injectable, NotFoundException, BadRequestException, ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from './entities/payment.entity';
import { Order } from '../order/entities/order.entity';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { PaymentStatus } from '../common/enums/payment.enum';
import { OrderStatus } from '../common/enums/order-status.enum';

@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
  ) {}

  async requestPayment(userId: number, dto: CreatePaymentDto): Promise<Payment> {
    const order = await this.orderRepository.findOne({
      where: { id: dto.orderId },
    });
    if (!order) throw new NotFoundException('주문을 찾을 수 없습니다.');
    if (order.userId !== userId) throw new ForbiddenException('접근 권한이 없습니다.');
    if (order.status !== OrderStatus.PENDING) {
      throw new BadRequestException('결제 가능한 상태의 주문이 아닙니다.');
    }

    const existing = await this.paymentRepository.findOne({
      where: { orderId: dto.orderId },
    });
    if (existing && existing.status === PaymentStatus.SUCCESS) {
      throw new BadRequestException('이미 결제 완료된 주문입니다.');
    }

    // Mock: 결제 요청 생성 (PENDING 상태)
    const payment = await this.paymentRepository.save(
      this.paymentRepository.create({
        orderId: dto.orderId,
        amount: order.totalAmount,
        method: dto.method,
        status: PaymentStatus.PENDING,
      }),
    );

    // Mock: 즉시 결제 성공 처리 (실제라면 PG 콜백 대기)
    return this.processSuccess(payment.id);
  }

  async processSuccess(paymentId: number): Promise<Payment> {
    const payment = await this.paymentRepository.findOne({ where: { id: paymentId } });
    if (!payment) throw new NotFoundException('결제 정보를 찾을 수 없습니다.');

    payment.status = PaymentStatus.SUCCESS;
    payment.transactionId = `MOCK-TXN-${Date.now()}`;
    payment.paidAt = new Date();
    await this.paymentRepository.save(payment);

    // 주문 상태 PAID로 변경
    await this.orderRepository.update(payment.orderId, { status: OrderStatus.PAID });

    return payment;
  }

  async getPaymentByOrder(userId: number, orderId: number): Promise<Payment> {
    const order = await this.orderRepository.findOne({ where: { id: orderId } });
    if (!order) throw new NotFoundException('주문을 찾을 수 없습니다.');
    if (order.userId !== userId) throw new ForbiddenException('접근 권한이 없습니다.');

    const payment = await this.paymentRepository.findOne({ where: { orderId } });
    if (!payment) throw new NotFoundException('결제 정보가 없습니다.');
    return payment;
  }

  async refund(userId: number, paymentId: number): Promise<Payment> {
    const payment = await this.paymentRepository.findOne({
      where: { id: paymentId },
      relations: ['order'],
    });
    if (!payment) throw new NotFoundException('결제 정보를 찾을 수 없습니다.');
    if (payment.order.userId !== userId) throw new ForbiddenException('접근 권한이 없습니다.');
    if (payment.status !== PaymentStatus.SUCCESS) {
      throw new BadRequestException('결제 완료 상태의 결제만 환불 가능합니다.');
    }

    // Mock 환불 처리
    payment.status = PaymentStatus.REFUNDED;
    await this.paymentRepository.save(payment);
    await this.orderRepository.update(payment.orderId, { status: OrderStatus.CANCELLED });

    return payment;
  }
}
