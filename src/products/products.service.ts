import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { ILike, Repository } from 'typeorm';

import { UsageTrackingService } from '../billing/services/usage-tracking.service';
import { CreateProductDto } from './dto/create-product.dto';
import { ListProductsDto } from './dto/list-products.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productRepo: Repository<Product>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
    private usageTrackingService: UsageTrackingService,
  ) {}

  async create(facebookId: string, dto: CreateProductDto) {
    const user = await this.userRepo.findOne({
      where: { facebookId },
    });
    if (!user) {
      throw new BadRequestException('User not found');
    }

    // Check plan limits
    await this.usageTrackingService.checkProductLimit(user.id);

    const slugBase = dto.name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    let slug = slugBase;
    let suffix = 1;

    // Ensure slug is unique per user
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const exists = await this.productRepo.exist({
        where: { user: { id: user.id }, slug },
      });

      if (!exists) {
        break;
      }

      slug = `${slugBase}-${suffix}`;
      suffix += 1;
    }

    const newProduct = this.productRepo.create({
      ...dto,
      slug,
      user,
    });

    const savedProduct = await this.productRepo.save(newProduct);
    delete savedProduct.user;

    return savedProduct;
  }

  async findAll(ListProductsDto: ListProductsDto) {
    const { page = 1, limit = 10, keyword } = ListProductsDto;
    const skip = (page - 1) * limit;

    // Retrieve data
    const [items, total] = await this.productRepo.findAndCount({
      where: keyword ? { name: ILike(`%${keyword}%`) } : undefined,
      skip,
      take: limit,
      order: { created_at: 'DESC', name: 'DESC' },
      relations: { posts: true },
      select: {
        id: true,
        name: true,
        sku: true,
        slug: true,
        description: true,
        main_image: true,
        images: true,
        deleted_at: true,
        price: true,
        status: true,
        stock: true,
        created_at: true,
        updated_at: true,
        posts: {
          id: true,
        },
      },
    });

    // Return a structure that includes the results and pagination metadata
    return {
      total,
      page,
      limit,
      last_page: Math.ceil(total / limit),
      items,
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
