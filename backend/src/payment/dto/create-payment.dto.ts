import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsEnum } from 'class-validator';
import { PaymentMethod } from '../../common/enums/payment.enum';

export class CreatePaymentDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  orderId: number;

  @ApiProperty({ enum: PaymentMethod, example: PaymentMethod.CARD })
  @IsEnum(PaymentMethod)
  method: PaymentMethod;
}
