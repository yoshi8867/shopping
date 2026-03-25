import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class UpdateCategoryDto {
  @ApiProperty({ example: '가전제품', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ example: '냉장고, 세탁기 등', required: false })
  @IsOptional()
  @IsString()
  description?: string;
}
