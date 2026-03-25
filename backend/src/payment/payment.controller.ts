import {
  Controller, Get, Post, Param, Body, ParseIntPipe, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PaymentService } from './payment.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Payments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post()
  @ApiOperation({ summary: '결제 요청 (Mock: 즉시 성공 처리)' })
  requestPayment(@CurrentUser() user: { id: number }, @Body() dto: CreatePaymentDto) {
    return this.paymentService.requestPayment(user.id, dto);
  }

  @Get('order/:orderId')
  @ApiOperation({ summary: '주문별 결제 상태 조회' })
  getPaymentByOrder(
    @CurrentUser() user: { id: number },
    @Param('orderId', ParseIntPipe) orderId: number,
  ) {
    return this.paymentService.getPaymentByOrder(user.id, orderId);
  }

  @Post(':id/refund')
  @ApiOperation({ summary: '환불 요청 (Mock)' })
  refund(
    @CurrentUser() user: { id: number },
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.paymentService.refund(user.id, id);
  }
}
