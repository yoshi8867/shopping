import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateOrderDto {
  @ApiProperty({ example: '서울시 강남구 테헤란로 123' })
  @IsString()
  shippingAddress: string;
}
