import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';

import { UserStatus } from 'src/users/entities/user.entity';

@Injectable()
export class AdminUsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findAll(page: number = 1, limit: number = 10) {
    const [users, total] = await this.userRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { created_at: 'DESC' },
    });

    return {
      data: users,
      meta: {
        total,
        page,
        last_page: Math.ceil(total / limit),
      },
    };
  }

  async toggleActive(id: number) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Toggle logic: If ACTIVE, set to BLOCKED. If BLOCKED/PENDING, set to ACTIVE.
    if (user.status === UserStatus.ACTIVE) {
      user.status = UserStatus.BLOCKED;
    } else {
      user.status = UserStatus.ACTIVE;
    }

    return this.userRepository.save(user);
  }
}
