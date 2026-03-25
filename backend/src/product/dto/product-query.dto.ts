import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsInt, IsString, IsIn, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class ProductQueryDto {
  @ApiProperty({ example: 1, required: false, description: '카테고리 ID 필터' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  categoryId?: number;

  @ApiProperty({ example: '아이폰', required: false, description: '상품명 검색' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({ example: 'price', required: false, enum: ['price', 'createdAt', 'name'] })
  @IsOptional()
  @IsIn(['price', 'createdAt', 'name'])
  sortBy?: 'price' | 'createdAt' | 'name';

  @ApiProperty({ example: 'ASC', required: false, enum: ['ASC', 'DESC'] })
  @IsOptional()
  @IsIn(['ASC', 'DESC'])
  order?: 'ASC' | 'DESC';

  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiProperty({ example: 12, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number;
}
