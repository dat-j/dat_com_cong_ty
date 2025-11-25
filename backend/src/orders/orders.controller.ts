import { Controller, Get, Post, Body, Param, UseGuards, Request, Query, Delete } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { OrdersService } from './orders.service';
import { CreateOrderDto, ApprovePayLaterDto, RejectPayLaterDto, UpdateOrderStatusDto } from './dto/order.dto';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';

@Controller('orders')
@UseGuards(AuthGuard('jwt'))
export class OrdersController {
  constructor(private ordersService: OrdersService) {}

  @Post()
  async createOrder(@Request() req, @Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.createOrder(req.user.userId, createOrderDto);
  }

  @Post(':id/payment')
  async markPaymentSubmitted(@Request() req, @Param('id') orderId: string) {
    return this.ordersService.markPaymentSubmitted(orderId, req.user.userId);
  }

  @UseGuards(RolesGuard)
  @Roles('admin')
  @Post(':id/confirm')
  async confirmPayment(@Param('id') orderId: string) {
    return this.ordersService.confirmPayment(orderId);
  }

  @Get('my-history')
  async getUserOrderHistory(@Request() req) {
    return this.ordersService.getUserOrderHistory(req.user.userId);
  }

  @Get('my-history/by-date')
  async getUserOrdersByDate(@Request() req, @Query('date') date: string) {
    return this.ordersService.getUserOrdersByDate(req.user.userId, new Date(date));
  }

  @UseGuards(RolesGuard)
  @Roles('admin')
  @Get('all')
  async getAllOrders() {
    return this.ordersService.getAllOrders();
  }

  @UseGuards(RolesGuard)
  @Roles('admin')
  @Get('pending')
  async getPendingOrders() {
    return this.ordersService.getPendingOrders();
  }

  // Payment Later Endpoints
  @UseGuards(RolesGuard)
  @Roles('admin')
  @Post(':id/approve-pay-later')
  async approvePayLater(@Request() req, @Param('id') orderId: string) {
    return this.ordersService.approvePayLater(orderId, req.user.userId);
  }

  @UseGuards(RolesGuard)
  @Roles('admin')
  @Post(':id/reject-pay-later')
  async rejectPayLater(@Request() req, @Param('id') orderId: string) {
    return this.ordersService.rejectPayLater(orderId, req.user.userId);
  }

  @UseGuards(RolesGuard)
  @Roles('admin')
  @Post(':id/move-to-debt')
  async moveToDebt(@Param('id') orderId: string) {
    return this.ordersService.moveToDebt(orderId);
  }

  // User Debt Endpoints
  @Get('my-debt')
  async getMyDebt(@Request() req) {
    return this.ordersService.getUserDebt(req.user.userId);
  }

  @Get('my-debt-orders')
  async getMyDebtOrders(@Request() req) {
    return this.ordersService.getUserDebtOrders(req.user.userId);
  }

  // Admin Debt Management
  @UseGuards(RolesGuard)
  @Roles('admin')
  @Get('all-debt')
  async getAllDebtOrders() {
    return this.ordersService.getAllDebtOrders();
  }

  @UseGuards(RolesGuard)
  @Roles('admin')
  @Get('total-debt')
  async getTotalDebt() {
    return this.ordersService.getTotalDebt();
  }

  // Admin Order Management
  @UseGuards(RolesGuard)
  @Roles('admin')
  @Get('pay-later-pending')
  async getPayLaterPendingOrders() {
    return this.ordersService.getPayLaterPendingOrders();
  }

  @UseGuards(RolesGuard)
  @Roles('admin')
  @Get('today')
  async getTodayOrders() {
    return this.ordersService.getTodayOrders();
  }

  @UseGuards(RolesGuard)
  @Roles('admin')
  @Post(':id/status')
  async updateOrderStatus(
    @Request() req,
    @Param('id') orderId: string,
    @Body() updateStatusDto: UpdateOrderStatusDto,
  ) {
    return this.ordersService.updateOrderStatus(orderId, updateStatusDto.status, req.user.userId);
  }

  @UseGuards(RolesGuard)
  @Roles('admin')
  @Delete(':id')
  async deleteOrder(@Param('id') orderId: string) {
    await this.ordersService.deleteOrder(orderId);
    return { message: 'Order deleted successfully' };
  }
}
