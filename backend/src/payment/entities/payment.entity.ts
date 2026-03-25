import {
  Entity, PrimaryGeneratedColumn, Column,
  OneToOne, JoinColumn,
} from 'typeorm';
import { Order } from '../../order/entities/order.entity';
import { PaymentMethod, PaymentStatus } from '../../common/enums/payment.enum';

@Entity()
export class Payment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  orderId: number;

  @OneToOne(() => Order, (order) => order.payment)
  @JoinColumn({ name: 'orderId' })
  order: Order;

  @Column()
  amount: number;

  @Column({ type: 'text' })
  method: PaymentMethod;

  @Column({ type: 'text', default: PaymentStatus.PENDING })
  status: PaymentStatus;

  @Column({ nullable: true })
  transactionId: string;

  @Column({ type: 'datetime', nullable: true })
  paidAt: Date;
}
