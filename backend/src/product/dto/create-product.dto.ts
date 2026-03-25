import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsInt, IsOptional, IsBoolean, IsUrl, Min } from 'class-validator';

export class CreateProductDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  categoryId: number;

  @ApiProperty({ example: '아이폰 15' })
  @IsString()
  name: string;

  @ApiProperty({ example: '최신 아이폰입니다.', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 1500000 })
  @IsInt()
  @Min(0)
  price: number;

  @ApiProperty({ example: 100 })
  @IsInt()
  @Min(0)
  stock: number;

  @ApiProperty({ example: 'https://example.com/image.jpg', required: false })
  @IsOptional()
  @IsUrl()
  imageUrl?: string;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
