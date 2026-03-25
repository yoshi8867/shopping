import {
  Injectable, NotFoundException, BadRequestException, ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { Cart } from '../cart/entities/cart.entity';
import { Product } from '../product/entities/product.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { OrderStatus } from '../common/enums/order-status.enum';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,
    @InjectRepository(Cart)
    private readonly cartRepository: Repository<Cart>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async create(userId: number, dto: CreateOrderDto): Promise<Order> {
    const cart = await this.cartRepository.findOne({
      where: { userId },
      relations: ['items', 'items.product'],
    });

    if (!cart || cart.items.length === 0) {
      throw new BadRequestException('장바구니가 비어있습니다.');
    }

    // 재고 확인 및 가격 계산
    let totalAmount = 0;
    for (const item of cart.items) {
      if (!item.product.isActive) {
        throw new BadRequestException(`${item.product.name} 상품이 판매 중지되었습니다.`);
      }
      if (item.product.stock < item.quantity) {
        throw new BadRequestException(`${item.product.name} 재고가 부족합니다.`);
      }
      totalAmount += item.product.price * item.quantity;
    }

    // 주문 생성
    const order = await this.orderRepository.save(
      this.orderRepository.create({
        userId,
        totalAmount,
        shippingAddress: dto.shippingAddress,
        status: OrderStatus.PENDING,
      }),
    );

    // 주문 항목 생성 + 재고 차감
    for (const item of cart.items) {
      await this.orderItemRepository.save(
        this.orderItemRepository.create({
          orderId: order.id,
          productId: item.productId,
          quantity: item.quantity,
          price: item.product.price, // 주문 시점 가격 스냅샷
        }),
      );
      await this.productRepository.update(item.productId, {
        stock: item.product.stock - item.quantity,
      });
    }

    // 장바구니 비우기
    await this.cartRepository.manager
      .getRepository('cart_item')
      .createQueryBuilder()
      .delete()
      .where('cartId = :cartId', { cartId: cart.id })
      .execute();

    return this.findOne(userId, order.id);
  }

  async findMyOrders(userId: number): Promise<Order[]> {
    return this.orderRepository.find({
      where: { userId },
      relations: ['items', 'items.product'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(userId: number, orderId: number): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
      relations: ['items', 'items.product', 'payment'],
    });
    if (!order) throw new NotFoundException('주문을 찾을 수 없습니다.');
    if (order.userId !== userId) throw new ForbiddenException('접근 권한이 없습니다.');
    return order;
  }

  async cancel(userId: number, orderId: number): Promise<Order> {
    const order = await this.findOne(userId, orderId);
    if (order.status !== OrderStatus.PENDING) {
      throw new BadRequestException('결제 전(PENDING) 상태의 주문만 취소할 수 있습니다.');
    }

    // 재고 복구
    for (const item of order.items) {
      await this.productRepository.increment({ id: item.productId }, 'stock', item.quantity);
    }

    order.status = OrderStatus.CANCELLED;
    return this.orderRepository.save(order);
  }

  // 관리자 전용
  async findAllOrders(): Promise<Order[]> {
    return this.orderRepository.find({
      relations: ['user', 'items', 'items.product'],
      order: { createdAt: 'DESC' },
    });
  }

  async updateStatus(orderId: number, dto: UpdateOrderStatusDto): Promise<Order> {
    const order = await this.orderRepository.findOne({ where: { id: orderId } });
    if (!order) throw new NotFoundException('주문을 찾을 수 없습니다.');
    order.status = dto.status;
    return this.orderRepository.save(order);
  }
}
