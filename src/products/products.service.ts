import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';

import { generateUniqueSlug } from '../common/utils/slug.utils';
import { CreateProductDto } from './dto/create-product.dto';
import { ListProductsDto } from './dto/list-products.dto';
import { Product } from './entities/product.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productRepo: Repository<Product>,
  ) {}

  async create(dto: CreateProductDto): Promise<Product> {
    // Generate unique slug from product name (scoped to store)
    const slug = await generateUniqueSlug(dto.name, async (s) => {
      return this.productRepo.exists({
        where: { store_id: String(dto.store_id), slug: s },
      });
    });

    const newProduct = this.productRepo.create({
      ...dto,
      store_id: String(dto.store_id),
      slug,
    });

    return this.productRepo.save(newProduct);
  }

  async findAllByStore(storeId: string, listProductsDto: ListProductsDto) {
    const { page = 1, limit = 10, keyword } = listProductsDto;
    const skip = (page - 1) * limit;

    const where: any = { store_id: storeId, is_active: true };
    if (keyword) {
      where.name = ILike(`%${keyword}%`);
    }

    const [items, total] = await this.productRepo.findAndCount({
      where,
      skip,
      take: limit,
      order: { created_at: 'DESC', name: 'DESC' },
      relations: { variants: true },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        image_url: true,
        images: true,
        is_active: true,
        barcode: true,
        created_at: true,
        updated_at: true,
        variants: {
          id: true,
          label: true,
          price: true,
          is_default: true,
          stock: true,
          sale_price: true,
          cost_price: true,
          wholesale_price: true,
          unit_value: true,
          unit: true,
        },
      },
    });

    return {
      total,
      page,
      limit,
      last_page: Math.ceil(total / limit),
      items,
    };
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.productRepo.findOne({
      where: { id },
      relations: { variants: true, store: true },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    return product;
  }

  async findBySlug(storeId: string, slug: string): Promise<Product> {
    const product = await this.productRepo.findOne({
      where: { store_id: storeId, slug },
      relations: { variants: true },
    });

    if (!product) {
      throw new NotFoundException(`Product not found`);
    }

    return product;
  }

  async update(id: string, dto: Partial<CreateProductDto>): Promise<Product> {
    const product = await this.findOne(id);

    // Don't allow changing store_id
    delete dto.store_id;

    Object.assign(product, dto);
    return this.productRepo.save(product);
  }

  async remove(id: string): Promise<void> {
    const result = await this.productRepo.softDelete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
  }

  async countByStore(storeId: string): Promise<number> {
    return this.productRepo.count({
      where: { store_id: storeId },
    });
  }
}
