import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { UserService } from './user.service';
import { User } from './entities/user.entity';
import { Role } from '../common/enums/role.enum';

const mockUser: User = {
  id: 1,
  email: 'test@example.com',
  password: 'hashed',
  name: '홍길동',
  phone: '010-1234-5678',
  address: '서울시 강남구',
  role: Role.USER,
  createdAt: new Date(),
};

const mockUserRepository = {
  findOne: jest.fn(),
  find: jest.fn(),
  save: jest.fn(),
};

describe('UserService', () => {
  let service: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: getRepositoryToken(User), useValue: mockUserRepository },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    jest.clearAllMocks();
  });

  // ───────────────────────────────────────────
  // findMe
  // ───────────────────────────────────────────
  describe('findMe', () => {
    it('존재하는 userId로 조회 시 사용자 정보를 반환한다', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.findMe(1);

      expect(result.email).toBe(mockUser.email);
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('존재하지 않는 userId로 조회 시 NotFoundException을 던진다', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.findMe(999)).rejects.toThrow(NotFoundException);
    });
  });

  // ───────────────────────────────────────────
  // updateMe
  // ───────────────────────────────────────────
  describe('updateMe', () => {
    it('이름과 전화번호를 정상적으로 수정한다', async () => {
      mockUserRepository.findOne.mockResolvedValue({ ...mockUser });
      mockUserRepository.save.mockResolvedValue({
        ...mockUser,
        name: '김철수',
        phone: '010-9999-8888',
      });

      const result = await service.updateMe(1, { name: '김철수', phone: '010-9999-8888' });

      expect(result.name).toBe('김철수');
      expect(result.phone).toBe('010-9999-8888');
    });

    it('비밀번호 변경 시 bcrypt로 해시되어 저장된다', async () => {
      mockUserRepository.findOne.mockResolvedValue({ ...mockUser });
      mockUserRepository.save.mockImplementation(async (u) => u);

      await service.updateMe(1, { password: 'newpassword123' });

      const savedArg = mockUserRepository.save.mock.calls[0][0];
      const isHashed = await bcrypt.compare('newpassword123', savedArg.password);
      expect(isHashed).toBe(true);
    });

    it('존재하지 않는 userId 수정 시 NotFoundException을 던진다', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.updateMe(999, { name: '테스트' })).rejects.toThrow(NotFoundException);
    });

    it('반환값에 password 필드가 없다', async () => {
      mockUserRepository.findOne.mockResolvedValue({ ...mockUser });
      mockUserRepository.save.mockResolvedValue({ ...mockUser, name: '김철수' });

      const result = await service.updateMe(1, { name: '김철수' });

      expect(result).not.toHaveProperty('password');
    });
  });

  // ───────────────────────────────────────────
  // findAll (관리자)
  // ───────────────────────────────────────────
  describe('findAll', () => {
    it('전체 회원 목록을 배열로 반환한다', async () => {
      mockUserRepository.find.mockResolvedValue([mockUser, { ...mockUser, id: 2 }]);

      const result = await service.findAll();

      expect(result).toHaveLength(2);
      expect(mockUserRepository.find).toHaveBeenCalledWith({
        order: { createdAt: 'DESC' },
      });
    });

    it('회원이 없으면 빈 배열을 반환한다', async () => {
      mockUserRepository.find.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });
  });
});
