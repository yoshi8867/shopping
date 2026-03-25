import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async findAll(): Promise<Category[]> {
    return this.categoryRepository.find({ order: { name: 'ASC' } });
  }

  async create(dto: CreateCategoryDto): Promise<Category> {
    const exists = await this.categoryRepository.findOne({
      where: { name: dto.name },
    });
    if (exists) throw new ConflictException('이미 존재하는 카테고리 이름입니다.');

    const category = this.categoryRepository.create(dto);
    return this.categoryRepository.save(category);
  }

  async update(id: number, dto: UpdateCategoryDto): Promise<Category> {
    const category = await this.categoryRepository.findOne({ where: { id } });
    if (!category) throw new NotFoundException('카테고리를 찾을 수 없습니다.');

    if (dto.name && dto.name !== category.name) {
      const exists = await this.categoryRepository.findOne({
        where: { name: dto.name },
      });
      if (exists) throw new ConflictException('이미 존재하는 카테고리 이름입니다.');
    }

    Object.assign(category, dto);
    return this.categoryRepository.save(category);
  }

  async remove(id: number): Promise<void> {
    const category = await this.categoryRepository.findOne({ where: { id } });
    if (!category) throw new NotFoundException('카테고리를 찾을 수 없습니다.');
    await this.categoryRepository.remove(category);
  }
}
