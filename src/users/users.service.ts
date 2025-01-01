// src/auth/auth.service.ts
import { Injectable,  } from '@nestjs/common';

import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from 'src/users/dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  /**
   * Finds a user by their Facebook User ID
   * @param facebookUserId - Facebook User ID
   * @returns The User entity or undefined
   */
  async findByFacebookId(facebookUserId: string): Promise<User | undefined> {
    return this.usersRepository.findOne({ where: { facebookUserId } });
  }

  /**
   * Creates a new User entity
   * @param createUserDto - Data to create a user
   * @returns The created User entity
   */
  async create(createUserDto: CreateUserDto): Promise<User> {
    const user = this.usersRepository.create(createUserDto);
    return this.usersRepository.save(user);
  }

  /**
   * Finds a user by their ID
   * @param id - User ID
   * @returns The User entity or undefined
   */
  async findById(id: string): Promise<User | undefined> {
    return this.usersRepository.findOne({ where: { id } });
  }
}
