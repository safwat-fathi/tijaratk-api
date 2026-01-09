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
    storeId?: number, // Assuming store ID is number as per Store entity
  ) {
    const where: FindOptionsWhere<Product> = {};

    if (storeId) {
      // Product links directly to Store
      // Product.store_id is string in entity but Store.id is number?
      // Let's assume TypeORM handles the join condition if we use the relation.
      where.store = { id: storeId };
    }

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
      relations: ['store', 'store.owner'], // Include store and its owner
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

  async toggleStatus(id: string) {
    // Product.id is string (UUID)
    const product = await this.productRepository.findOne({ where: { id } });
    if (!product) {
      throw new Error('Product not found');
    }

    product.is_active = !product.is_active;

    return this.productRepository.save(product);
  }
}
