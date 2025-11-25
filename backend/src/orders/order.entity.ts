import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../users/user.entity';
import { MenuItem } from '../menu/menu-item.entity';

export enum PaymentMethod {
  IMMEDIATE = 'immediate',      // Thanh toán ngay
  PAY_LATER = 'pay_later',      // Thanh toán sau (ghi nợ)
}

export enum OrderStatus {
  PENDING = 'pending',                    // Chờ xử lý (thanh toán ngay)
  PAID = 'paid',                          // Đã thanh toán
  CONFIRMED = 'confirmed',                // Admin đã xác nhận
  CANCELLED = 'cancelled',                // Đã hủy
  PAY_LATER_PENDING = 'pay_later_pending', // Chờ admin duyệt thanh toán sau
  PAY_LATER_APPROVED = 'pay_later_approved', // Admin đã duyệt thanh toán sau
  DEBT = 'debt',                          // Đang nợ
}

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, user => user.orders)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => MenuItem, menuItem => menuItem.orders)
  @JoinColumn({ name: 'menu_item_id' })
  menuItem: MenuItem;

  @Column({ name: 'menu_item_id' })
  menuItemId: string;

  @Column({ type: 'date' })
  orderDate: Date;

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PENDING,
  })
  status: OrderStatus;

  @Column({
    type: 'enum',
    enum: PaymentMethod,
    default: PaymentMethod.IMMEDIATE,
  })
  paymentMethod: PaymentMethod;

  @Column({ default: false })
  paymentProofSubmitted: boolean;

  @Column({ nullable: true })
  approvedAt: Date;

  @Column({ name: 'approved_by', nullable: true })
  approvedBy: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
