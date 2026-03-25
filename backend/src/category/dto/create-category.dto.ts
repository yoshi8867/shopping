import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({ example: '전자기기' })
  @IsString()
  name: string;

  @ApiProperty({ example: '스마트폰, 노트북 등', required: false })
  @IsOptional()
  @IsString()
  description?: string;
}
