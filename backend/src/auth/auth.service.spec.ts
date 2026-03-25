import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { AuthService } from './auth.service';
import { User } from '../user/entities/user.entity';
import { Role } from '../common/enums/role.enum';

// User Repository 목(mock)
const mockUserRepository = {
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
};

// JwtService 목(mock)
const mockJwtService = {
  sign: jest.fn().mockReturnValue('mock-jwt-token'),
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getRepositoryToken(User), useValue: mockUserRepository },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
  });

  // ───────────────────────────────────────────
  // register
  // ───────────────────────────────────────────
  describe('register', () => {
    const dto = {
      email: 'test@example.com',
      password: 'password123',
      name: '홍길동',
    };

    it('신규 이메일로 회원가입 시 password를 제외한 user를 반환한다', async () => {
      mockUserRepository.findOne.mockResolvedValue(null); // 중복 없음
      mockUserRepository.create.mockReturnValue({ ...dto, id: 1, role: Role.USER });
      mockUserRepository.save.mockResolvedValue({
        id: 1,
        email: dto.email,
        password: 'hashed',
        name: dto.name,
        role: Role.USER,
        createdAt: new Date(),
      });

      const result = await service.register(dto);

      expect(result).not.toHaveProperty('password');
      expect(result.email).toBe(dto.email);
    });

    it('이미 존재하는 이메일로 가입 시 ConflictException을 던진다', async () => {
      mockUserRepository.findOne.mockResolvedValue({ id: 1, email: dto.email });

      await expect(service.register(dto)).rejects.toThrow(ConflictException);
    });

    it('비밀번호는 bcrypt로 해시되어 저장된다', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);
      mockUserRepository.create.mockReturnValue({});
      mockUserRepository.save.mockResolvedValue({
        id: 1,
        email: dto.email,
        password: 'hashed-value',
        name: dto.name,
        role: Role.USER,
        createdAt: new Date(),
      });

      await service.register(dto);

      const createdArg = mockUserRepository.create.mock.calls[0][0];
      const isHashed = await bcrypt.compare(dto.password, createdArg.password);
      expect(isHashed).toBe(true);
    });
  });

  // ───────────────────────────────────────────
  // login
  // ───────────────────────────────────────────
  describe('login', () => {
    it('올바른 자격증명으로 로그인 시 accessToken을 반환한다', async () => {
      const hashed = await bcrypt.hash('password123', 10);
      mockUserRepository.findOne.mockResolvedValue({
        id: 1,
        email: 'test@example.com',
        password: hashed,
        role: Role.USER,
        name: '홍길동',
      });

      const result = await service.login({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result).toHaveProperty('accessToken');
      expect(result.accessToken).toBe('mock-jwt-token');
    });

    it('존재하지 않는 이메일로 로그인 시 UnauthorizedException을 던진다', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(
        service.login({ email: 'none@example.com', password: '1234' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('잘못된 비밀번호로 로그인 시 UnauthorizedException을 던진다', async () => {
      const hashed = await bcrypt.hash('correct-password', 10);
      mockUserRepository.findOne.mockResolvedValue({
        id: 1,
        email: 'test@example.com',
        password: hashed,
        role: Role.USER,
      });

      await expect(
        service.login({ email: 'test@example.com', password: 'wrong-password' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
