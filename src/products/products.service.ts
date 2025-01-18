import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/auth/entities/user.entity';
import { ILike, QueryFailedError, Repository } from 'typeorm';

import { CreateProductDto } from './dto/create-product.dto';
import { ListProductsDto } from './dto/list-products.dto';
import { Product } from './entities/product.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async create(facebookId: string, dto: CreateProductDto) {
    const user = await this.userRepo.findOne({
      where: { facebookId },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    const savedProduct = this.productRepo.create({ ...dto, user });

    try {
      return await this.productRepo.save(savedProduct);
    } catch (error) {
      // Check if the error is a unique constraint violation
      if (
        error instanceof QueryFailedError &&
        (error as any).code === '23505' // PostgreSQL unique violation code
      ) {
        // Optionally, further inspect error.message or error.detail if needed
        throw new BadRequestException('Product already exists');
      }
      // Re-throw unhandled errors
      throw error;
    }
  }

  async findAll(ListProductsDto: ListProductsDto) {
    const { page = 1, limit = 10, keyword } = ListProductsDto;
    // For the sake of clarity, you might do:
    const skip = (page - 1) * limit;

    // Retrieve data
    const [results, total] = await this.productRepo.findAndCount({
      where: keyword ? { name: ILike(`%${keyword}%`) } : undefined,
      skip,
      take: limit,
      order: { created_at: 'DESC', name: 'DESC' },
    });

    // Return a structure that includes the results and pagination metadata
    return {
      total,
      page,
      limit,
      last_page: Math.ceil(total / limit),
      data: results,
    };
  }

  async findOne(id: number) {
    return await this.productRepo.findOne({ where: { id } });
  }

  async update(id: number, dto: Partial<CreateProductDto>) {
    await this.productRepo.update(id, dto);
    return await this.productRepo.findOne({ where: { id } });
  }

  async remove(id: number) {
    return await this.productRepo.delete(id);
  }
}
