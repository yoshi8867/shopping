import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, MinLength } from 'class-validator';

export class UpdateUserDto {
  @ApiProperty({ example: '홍길동', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ example: '010-1234-5678', required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ example: '서울시 강남구', required: false })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ example: 'newpassword123', required: false, minLength: 6 })
  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string;
}
