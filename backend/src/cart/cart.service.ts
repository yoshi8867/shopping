import {
  Injectable, NotFoundException, BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cart } from './entities/cart.entity';
import { CartItem } from './entities/cart-item.entity';
import { Product } from '../product/entities/product.entity';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart)
    private readonly cartRepository: Repository<Cart>,
    @InjectRepository(CartItem)
    private readonly cartItemRepository: Repository<CartItem>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  private async getOrCreateCart(userId: number): Promise<Cart> {
    let cart = await this.cartRepository.findOne({
      where: { userId },
      relations: ['items', 'items.product'],
    });
    if (!cart) {
      cart = await this.cartRepository.save(
        this.cartRepository.create({ userId }),
      );
      cart.items = [];
    }
    return cart;
  }

  async getCart(userId: number): Promise<Cart> {
    return this.getOrCreateCart(userId);
  }

  async addItem(userId: number, dto: AddCartItemDto): Promise<Cart> {
    const product = await this.productRepository.findOne({
      where: { id: dto.productId, isActive: true },
    });
    if (!product) throw new NotFoundException('상품을 찾을 수 없습니다.');
    if (product.stock < dto.quantity) {
      throw new BadRequestException('재고가 부족합니다.');
    }

    const cart = await this.getOrCreateCart(userId);

    const existing = await this.cartItemRepository.findOne({
      where: { cartId: cart.id, productId: dto.productId },
    });

    if (existing) {
      existing.quantity += dto.quantity;
      await this.cartItemRepository.save(existing);
    } else {
      await this.cartItemRepository.save(
        this.cartItemRepository.create({
          cartId: cart.id,
          productId: dto.productId,
          quantity: dto.quantity,
        }),
      );
    }

    return this.getOrCreateCart(userId);
  }

  async updateItem(userId: number, itemId: number, dto: UpdateCartItemDto): Promise<Cart> {
    const cart = await this.getOrCreateCart(userId);
    const item = await this.cartItemRepository.findOne({
      where: { id: itemId, cartId: cart.id },
    });
    if (!item) throw new NotFoundException('장바구니 항목을 찾을 수 없습니다.');

    item.quantity = dto.quantity;
    await this.cartItemRepository.save(item);
    return this.getOrCreateCart(userId);
  }

  async removeItem(userId: number, itemId: number): Promise<Cart> {
    const cart = await this.getOrCreateCart(userId);
    const item = await this.cartItemRepository.findOne({
      where: { id: itemId, cartId: cart.id },
    });
    if (!item) throw new NotFoundException('장바구니 항목을 찾을 수 없습니다.');

    await this.cartItemRepository.remove(item);
    return this.getOrCreateCart(userId);
  }
}
