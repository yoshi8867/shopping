import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, ParseIntPipe, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CartService } from './cart.service';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Cart')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  @ApiOperation({ summary: '내 장바구니 조회' })
  getCart(@CurrentUser() user: { id: number }) {
    return this.cartService.getCart(user.id);
  }

  @Post('items')
  @ApiOperation({ summary: '장바구니에 상품 추가' })
  addItem(@CurrentUser() user: { id: number }, @Body() dto: AddCartItemDto) {
    return this.cartService.addItem(user.id, dto);
  }

  @Patch('items/:itemId')
  @ApiOperation({ summary: '장바구니 항목 수량 수정' })
  updateItem(
    @CurrentUser() user: { id: number },
    @Param('itemId', ParseIntPipe) itemId: number,
    @Body() dto: UpdateCartItemDto,
  ) {
    return this.cartService.updateItem(user.id, itemId, dto);
  }

  @Delete('items/:itemId')
  @ApiOperation({ summary: '장바구니 항목 삭제' })
  removeItem(
    @CurrentUser() user: { id: number },
    @Param('itemId', ParseIntPipe) itemId: number,
  ) {
    return this.cartService.removeItem(user.id, itemId);
  }
}
