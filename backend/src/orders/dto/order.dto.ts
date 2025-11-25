import { IsUUID, IsNotEmpty, IsEnum, IsOptional } from 'class-validator';
import { PaymentMethod, OrderStatus } from '../order.entity';

export class CreateOrderDto {
  @IsUUID()
  @IsNotEmpty()
  menuItemId: string;

  @IsEnum(PaymentMethod)
  @IsOptional()
  paymentMethod?: PaymentMethod;
}

export class MarkPaymentDto {
  // Empty DTO for marking payment as submitted
}

export class ApprovePayLaterDto {
  // DTO for admin approving pay later request
}

export class RejectPayLaterDto {
  // DTO for admin rejecting pay later request
}

export class UpdateOrderStatusDto {
  @IsEnum(OrderStatus)
  @IsNotEmpty()
  status: OrderStatus;
}
