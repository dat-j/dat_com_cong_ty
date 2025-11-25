import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Order, OrderStatus, PaymentMethod } from './order.entity';
import { CreateOrderDto } from './dto/order.dto';
import { MenuService } from '../menu/menu.service';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private ordersRepository: Repository<Order>,
    private menuService: MenuService,
  ) {}

  async createOrder(userId: string, createOrderDto: CreateOrderDto): Promise<Order> {
    const menuItem = await this.menuService.findById(createOrderDto.menuItemId);
    
    if (!menuItem) {
      throw new NotFoundException('Menu item not found');
    }

    if (!menuItem.isAvailable) {
      throw new BadRequestException('Menu item is not available');
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const paymentMethod = createOrderDto.paymentMethod || PaymentMethod.IMMEDIATE;
    const initialStatus = paymentMethod === PaymentMethod.PAY_LATER 
      ? OrderStatus.PAY_LATER_PENDING 
      : OrderStatus.PENDING;

    const order = this.ordersRepository.create({
      userId,
      menuItemId: createOrderDto.menuItemId,
      orderDate: today,
      status: initialStatus,
      paymentMethod,
    });

    return this.ordersRepository.save(order);
  }

  async markPaymentSubmitted(orderId: string, userId: string): Promise<Order> {
    const order = await this.ordersRepository.findOne({
      where: { id: orderId, userId },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.status !== OrderStatus.PENDING) {
      throw new BadRequestException('Order already processed');
    }

    order.paymentProofSubmitted = true;
    order.status = OrderStatus.PAID;

    return this.ordersRepository.save(order);
  }

  async confirmPayment(orderId: string): Promise<Order> {
    const order = await this.ordersRepository.findOne({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.status !== OrderStatus.PAID) {
      throw new BadRequestException('Payment not submitted yet');
    }

    order.status = OrderStatus.CONFIRMED;

    return this.ordersRepository.save(order);
  }

  async getUserOrderHistory(userId: string): Promise<Order[]> {
    return this.ordersRepository.find({
      where: { userId },
      relations: ['menuItem'],
      order: { createdAt: 'DESC' },
    });
  }

  async getUserOrdersByDate(userId: string, date: Date): Promise<Order[]> {
    const searchDate = new Date(date);
    searchDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date(searchDate);
    endDate.setHours(23, 59, 59, 999);

    return this.ordersRepository.find({
      where: {
        userId,
        orderDate: Between(searchDate, endDate),
      },
      relations: ['menuItem'],
      order: { createdAt: 'DESC' },
    });
  }

  async getAllOrders(): Promise<Order[]> {
    return this.ordersRepository.find({
      relations: ['user', 'menuItem'],
      order: { createdAt: 'DESC' },
    });
  }

  async getPendingOrders(): Promise<Order[]> {
    return this.ordersRepository.find({
      where: [
        { status: OrderStatus.PENDING },
        { status: OrderStatus.PAY_LATER_PENDING },
      ],
      relations: ['user', 'menuItem'],
      order: { createdAt: 'DESC' },
    });
  }

  // Payment Later Management
  async approvePayLater(orderId: string, adminId: string): Promise<Order> {
    const order = await this.ordersRepository.findOne({
      where: { id: orderId },
      relations: ['user', 'menuItem'],
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.status !== OrderStatus.PAY_LATER_PENDING) {
      throw new BadRequestException('Order is not pending pay later approval');
    }

    order.status = OrderStatus.PAY_LATER_APPROVED;
    order.approvedAt = new Date();
    order.approvedBy = adminId;

    return this.ordersRepository.save(order);
  }

  async rejectPayLater(orderId: string, adminId: string): Promise<Order> {
    const order = await this.ordersRepository.findOne({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.status !== OrderStatus.PAY_LATER_PENDING) {
      throw new BadRequestException('Order is not pending pay later approval');
    }

    order.status = OrderStatus.CANCELLED;
    order.approvedAt = new Date();
    order.approvedBy = adminId;

    return this.ordersRepository.save(order);
  }

  async moveToDebt(orderId: string): Promise<Order> {
    const order = await this.ordersRepository.findOne({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.status !== OrderStatus.PAY_LATER_APPROVED) {
      throw new BadRequestException('Order must be approved first');
    }

    order.status = OrderStatus.DEBT;
    return this.ordersRepository.save(order);
  }

  // Debt Tracking
  async getUserDebt(userId: string): Promise<{ totalDebt: number; orderCount: number }> {
    const debtOrders = await this.ordersRepository.find({
      where: [
        { userId, status: OrderStatus.DEBT },
        { userId, status: OrderStatus.PAY_LATER_APPROVED },
      ],
      relations: ['menuItem'],
    });

    const totalDebt = debtOrders.reduce((sum, order) => sum + order.menuItem.price, 0);
    return { totalDebt, orderCount: debtOrders.length };
  }

  async getUserDebtOrders(userId: string): Promise<Order[]> {
    return this.ordersRepository.find({
      where: [
        { userId, status: OrderStatus.DEBT },
        { userId, status: OrderStatus.PAY_LATER_APPROVED },
      ],
      relations: ['menuItem'],
      order: { createdAt: 'DESC' },
    });
  }

  async getAllDebtOrders(): Promise<Order[]> {
    return this.ordersRepository.find({
      where: [
        { status: OrderStatus.DEBT },
        { status: OrderStatus.PAY_LATER_APPROVED },
      ],
      relations: ['user', 'menuItem'],
      order: { createdAt: 'DESC' },
    });
  }

  async getTotalDebt(): Promise<{ totalDebt: number; userCount: number; orderCount: number }> {
    const debtOrders = await this.ordersRepository.find({
      where: [
        { status: OrderStatus.DEBT },
        { status: OrderStatus.PAY_LATER_APPROVED },
      ],
      relations: ['menuItem', 'user'],
    });

    const totalDebt = debtOrders.reduce((sum, order) => sum + order.menuItem.price, 0);
    const uniqueUsers = new Set(debtOrders.map(order => order.userId));
    
    return {
      totalDebt,
      userCount: uniqueUsers.size,
      orderCount: debtOrders.length,
    };
  }

  // Admin Order Management
  async getPayLaterPendingOrders(): Promise<Order[]> {
    return this.ordersRepository.find({
      where: { status: OrderStatus.PAY_LATER_PENDING },
      relations: ['user', 'menuItem'],
      order: { createdAt: 'DESC' },
    });
  }

  async getTodayOrders(): Promise<Order[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const endDate = new Date(today);
    endDate.setHours(23, 59, 59, 999);

    return this.ordersRepository.find({
      where: {
        orderDate: Between(today, endDate),
      },
      relations: ['user', 'menuItem'],
      order: { createdAt: 'DESC' },
    });
  }

  async updateOrderStatus(orderId: string, status: OrderStatus, adminId: string): Promise<Order> {
    const order = await this.ordersRepository.findOne({
      where: { id: orderId },
      relations: ['user', 'menuItem'],
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    order.status = status;
    if (status === OrderStatus.CONFIRMED || status === OrderStatus.PAY_LATER_APPROVED) {
      order.approvedAt = new Date();
      order.approvedBy = adminId;
    }

    return this.ordersRepository.save(order);
  }

  async deleteOrder(orderId: string): Promise<void> {
    const order = await this.ordersRepository.findOne({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    await this.ordersRepository.remove(order);
  }
}
