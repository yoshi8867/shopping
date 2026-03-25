import {
  Controller, Get, Post, Delete, Patch,
  Body, Param, ParseIntPipe, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Role } from '../common/enums/role.enum';

@ApiTags('Orders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  @ApiOperation({ summary: '주문 생성 (장바구니 → 주문)' })
  create(@CurrentUser() user: { id: number }, @Body() dto: CreateOrderDto) {
    return this.orderService.create(user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: '내 주문 목록' })
  findMyOrders(@CurrentUser() user: { id: number }) {
    return this.orderService.findMyOrders(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: '주문 상세' })
  findOne(
    @CurrentUser() user: { id: number },
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.orderService.findOne(user.id, id);
  }

  @Delete(':id')
  @ApiOperation({ summary: '주문 취소 (PENDING 상태만)' })
  cancel(
    @CurrentUser() user: { id: number },
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.orderService.cancel(user.id, id);
  }

  // 관리자 전용
  @Get('admin/all')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: '[관리자] 전체 주문 목록' })
  findAllOrders() {
    return this.orderService.findAllOrders();
  }

  @Patch('admin/:id/status')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: '[관리자] 주문 상태 변경' })
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    return this.orderService.updateStatus(id, dto);
  }
}
