import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  // private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async getUserById(userId: number) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async getUserProfile(userId: string) {
    const user = await this.userRepo.findOne({
      where: { id: Number(userId) },
      relations: {
        facebook_pages: true,
        userSubscription: {
          plan: true,
        },
      },
    });

    // remove reset password token from response
    delete user.reset_password_token;

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }
}
