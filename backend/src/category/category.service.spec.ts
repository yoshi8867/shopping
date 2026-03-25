import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { CategoryService } from './category.service';
import { Category } from './entities/category.entity';

const mockCategory: Category = {
  id: 1,
  name: '전자기기',
  description: '스마트폰, 노트북',
  products: [],
};

const mockCategoryRepository = {
  find: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  remove: jest.fn(),
};

describe('CategoryService', () => {
  let service: CategoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoryService,
        { provide: getRepositoryToken(Category), useValue: mockCategoryRepository },
      ],
    }).compile();

    service = module.get<CategoryService>(CategoryService);
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('카테고리 목록을 반환한다', async () => {
      mockCategoryRepository.find.mockResolvedValue([mockCategory]);
      const result = await service.findAll();
      expect(result).toHaveLength(1);
    });
  });

  describe('create', () => {
    it('새 카테고리를 생성하고 반환한다', async () => {
      mockCategoryRepository.findOne.mockResolvedValue(null);
      mockCategoryRepository.create.mockReturnValue(mockCategory);
      mockCategoryRepository.save.mockResolvedValue(mockCategory);

      const result = await service.create({ name: '전자기기' });
      expect(result.name).toBe('전자기기');
    });

    it('중복 이름으로 생성 시 ConflictException을 던진다', async () => {
      mockCategoryRepository.findOne.mockResolvedValue(mockCategory);
      await expect(service.create({ name: '전자기기' })).rejects.toThrow(ConflictException);
    });
  });

  describe('update', () => {
    it('카테고리 정보를 수정한다', async () => {
      mockCategoryRepository.findOne
        .mockResolvedValueOnce(mockCategory)
        .mockResolvedValueOnce(null);
      mockCategoryRepository.save.mockResolvedValue({ ...mockCategory, name: '가전제품' });

      const result = await service.update(1, { name: '가전제품' });
      expect(result.name).toBe('가전제품');
    });

    it('존재하지 않는 id 수정 시 NotFoundException을 던진다', async () => {
      mockCategoryRepository.findOne.mockResolvedValue(null);
      await expect(service.update(999, { name: '테스트' })).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('카테고리를 삭제한다', async () => {
      mockCategoryRepository.findOne.mockResolvedValue(mockCategory);
      mockCategoryRepository.remove.mockResolvedValue(undefined);

      await expect(service.remove(1)).resolves.toBeUndefined();
    });

    it('존재하지 않는 id 삭제 시 NotFoundException을 던진다', async () => {
      mockCategoryRepository.findOne.mockResolvedValue(null);
      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
  });
});
