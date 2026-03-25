import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from './entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';

type SafeUser = Omit<User, 'password'>;

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findMe(userId: number): Promise<SafeUser> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('사용자를 찾을 수 없습니다.');
    return user;
  }

  async updateMe(userId: number, dto: UpdateUserDto): Promise<SafeUser> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      select: ['id', 'email', 'password', 'name', 'phone', 'address', 'role', 'createdAt'],
    });
    if (!user) throw new NotFoundException('사용자를 찾을 수 없습니다.');

    if (dto.password) {
      dto.password = await bcrypt.hash(dto.password, 10);
    }

    Object.assign(user, dto);
    const saved = await this.userRepository.save(user);

    const { password: _, ...result } = saved as User & { password: string };
    return result as SafeUser;
  }

  async findAll(): Promise<SafeUser[]> {
    return this.userRepository.find({
      order: { createdAt: 'DESC' },
    });
  }
}
