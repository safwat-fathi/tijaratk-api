import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from 'src/products/entities/product.entity';
import { Repository, ILike, Between, FindOptionsWhere } from 'typeorm';

@Injectable()
export class AdminProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async findAll(
    page: number = 1,
    limit: number = 10,
    search?: string,
    startDate?: string,
    endDate?: string,
  ) {
    const where: FindOptionsWhere<Product> = {};

    if (search) {
      where.name = ILike(`%${search}%`);
    }

    if (startDate && endDate) {
      where.created_at = Between(new Date(startDate), new Date(endDate));
    } else if (startDate) {
        where.created_at = Between(new Date(startDate), new Date());
    }

    const [products, total] = await this.productRepository.findAndCount({
      where,
      skip: (page - 1) * limit,
      take: limit,
      order: { created_at: 'DESC' },
      relations: ['user', 'user.storefront'], // Include owner and storefront details
    });

    return {
      data: products,
      meta: {
        total,
        page,
        last_page: Math.ceil(total / limit),
      },
    };
  }
}
