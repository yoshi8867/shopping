import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { ProductService } from './product.service';
import { Product } from './entities/product.entity';

const mockProduct: Partial<Product> = {
  id: 1, name: '아이폰 15', price: 1500000,
  stock: 10, isActive: true, categoryId: 1,
};

const mockQb = {
  leftJoinAndSelect: jest.fn().mockReturnThis(),
  where: jest.fn().mockReturnThis(),
  andWhere: jest.fn().mockReturnThis(),
  orderBy: jest.fn().mockReturnThis(),
  skip: jest.fn().mockReturnThis(),
  take: jest.fn().mockReturnThis(),
  getManyAndCount: jest.fn(),
};

const mockProductRepository = {
  createQueryBuilder: jest.fn(() => mockQb),
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  remove: jest.fn(),
};

describe('ProductService', () => {
  let service: ProductService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductService,
        { provide: getRepositoryToken(Product), useValue: mockProductRepository },
      ],
    }).compile();

    service = module.get<ProductService>(ProductService);
    jest.clearAllMocks();
    // reset chain mocks
    mockProductRepository.createQueryBuilder.mockReturnValue(mockQb);
    Object.values(mockQb).forEach((fn) => {
      if (typeof fn === 'function' && fn !== mockQb.getManyAndCount) {
        (fn as jest.Mock).mockReturnThis();
      }
    });
  });

  describe('findAll', () => {
    it('페이지네이션된 상품 목록을 반환한다', async () => {
      mockQb.getManyAndCount.mockResolvedValue([[mockProduct], 1]);
      const result = await service.findAll({ page: 1, limit: 12 });
      expect(result.items).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.totalPages).toBe(1);
    });
  });

  describe('findOne', () => {
    it('id로 상품을 반환한다', async () => {
      mockProductRepository.findOne.mockResolvedValue(mockProduct);
      const result = await service.findOne(1);
      expect(result.name).toBe('아이폰 15');
    });

    it('존재하지 않는 id 조회 시 NotFoundException을 던진다', async () => {
      mockProductRepository.findOne.mockResolvedValue(null);
      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('상품을 생성하고 반환한다', async () => {
      mockProductRepository.create.mockReturnValue(mockProduct);
      mockProductRepository.save.mockResolvedValue(mockProduct);
      const result = await service.create({
        name: '아이폰 15', price: 1500000, stock: 10, categoryId: 1,
      });
      expect(result.name).toBe('아이폰 15');
    });
  });

  describe('update', () => {
    it('상품 정보를 수정한다', async () => {
      mockProductRepository.findOne.mockResolvedValue({ ...mockProduct });
      mockProductRepository.save.mockResolvedValue({ ...mockProduct, price: 1200000 });
      const result = await service.update(1, { price: 1200000 });
      expect(result.price).toBe(1200000);
    });

    it('존재하지 않는 id 수정 시 NotFoundException을 던진다', async () => {
      mockProductRepository.findOne.mockResolvedValue(null);
      await expect(service.update(999, { price: 1000 })).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('상품을 삭제한다', async () => {
      mockProductRepository.findOne.mockResolvedValue(mockProduct);
      mockProductRepository.remove.mockResolvedValue(undefined);
      await expect(service.remove(1)).resolves.toBeUndefined();
    });

    it('존재하지 않는 id 삭제 시 NotFoundException을 던진다', async () => {
      mockProductRepository.findOne.mockResolvedValue(null);
      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
  });
});
