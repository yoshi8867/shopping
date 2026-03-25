import {
  Controller,
  Get,
  Patch,
  Body,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Role } from '../common/enums/role.enum';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  @ApiOperation({ summary: '내 프로필 조회' })
  @ApiResponse({ status: 200, description: '프로필 반환' })
  getMe(@CurrentUser() user: { id: number }) {
    return this.userService.findMe(user.id);
  }

  @Patch('me')
  @ApiOperation({ summary: '내 정보 수정 (이름, 전화번호, 주소, 비밀번호)' })
  @ApiResponse({ status: 200, description: '수정된 프로필 반환' })
  updateMe(
    @CurrentUser() user: { id: number },
    @Body() dto: UpdateUserDto,
  ) {
    return this.userService.updateMe(user.id, dto);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: '[관리자] 전체 회원 목록' })
  @ApiResponse({ status: 200, description: '회원 목록 반환' })
  @ApiResponse({ status: 403, description: '권한 없음' })
  findAll() {
    return this.userService.findAll();
  }
}
