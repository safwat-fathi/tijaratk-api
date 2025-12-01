import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { ILike, Not, Repository } from 'typeorm';

import { Product, ProductStatus } from 'src/products/entities/product.entity';
import { ListStorefrontProductsDto } from './dto/list-storefront-products.dto';
import { Storefront } from './entities/storefront.entity';
import { CreateStorefrontDto } from './dto/create-storefront.dto';
import { UpdateStorefrontDto } from './dto/update-storefront.dto';

@Injectable()
export class StorefrontsService {
  constructor(
    @InjectRepository(Storefront)
    private readonly storefrontRepo: Repository<Storefront>,
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async createForUser(facebookId: string, dto: CreateStorefrontDto) {
    const user = await this.userRepo.findOne({ where: { facebookId } });
    if (!user) {
      throw new BadRequestException('User not found');
    }

    const slugBase = (dto.slug ?? dto.name)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    let slug = slugBase;
    let suffix = 1;

    // Ensure slug is globally unique
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const exists = await this.storefrontRepo.exist({
        where: { slug },
        withDeleted: true,
      });

      if (!exists) {
        break;
      }

      slug = `${slugBase}-${suffix}`;
      suffix += 1;
    }

    const storefront = this.storefrontRepo.create({
      ...dto,
      slug,
      user,
    });

    return this.storefrontRepo.save(storefront);
  }

  async findForUser(facebookId: string) {
    const user = await this.userRepo.findOne({
      where: { facebookId },
    });
    if (!user) {
      throw new BadRequestException('User not found');
    }

    return this.storefrontRepo.find({
      where: { user: { id: user.id } },
      order: { created_at: 'DESC' },
    });
  }

  async updateForUser(
    facebookId: string,
    id: number,
    dto: UpdateStorefrontDto,
  ) {
    const user = await this.userRepo.findOne({ where: { facebookId } });
    if (!user) {
      throw new BadRequestException('User not found');
    }

    const storefront = await this.storefrontRepo.findOne({
      where: { id, user: { id: user.id } },
    });

    if (!storefront) {
      throw new NotFoundException('Storefront not found');
    }

    if (dto.slug || dto.name) {
      const slugBase = (dto.slug ?? dto.name ?? storefront.name)
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

      let slug = slugBase;
      let suffix = 1;

      // Ensure slug is globally unique (excluding current storefront)
      // eslint-disable-next-line no-constant-condition
      while (true) {
        const exists = await this.storefrontRepo.exist({
          where: {
            slug,
            id: Not(id),
          },
          withDeleted: true,
        });

        if (!exists) {
          break;
        }

        slug = `${slugBase}-${suffix}`;
        suffix += 1;
      }

      storefront.slug = slug;
    }

    Object.assign(storefront, dto);

    return this.storefrontRepo.save(storefront);
  }

  async findBySlug(slug: string, includeUnpublished = false) {
    return this.storefrontRepo.findOne({
      where: {
        slug,
        ...(includeUnpublished ? {} : { is_published: true }),
      },
      relations: { user: true },
    });
  }

  async findUserStorefronts(userId: string) {
    return this.storefrontRepo.find({
      where: { user: { id: userId } },
      order: { created_at: 'DESC' },
    });
  }

  async getPublicStorefront(slug: string) {
    const storefront = await this.findBySlug(slug);
    if (!storefront) {
      throw new NotFoundException('Storefront not found');
    }

    // Do not expose user relation in the public response
    const { user, ...rest } = storefront;

    return rest;
  }

  async getPublicStorefrontProducts(
    slug: string,
    query: ListStorefrontProductsDto,
  ) {
    const storefront = await this.findBySlug(slug);
    if (!storefront) {
      throw new NotFoundException('Storefront not found');
    }

    const { page = 1, limit = 10, keyword } = query;
    const skip = (page - 1) * limit;

    const [items, total] = await this.productRepo.findAndCount({
      where: {
        user: { id: storefront.user.id },
        status: ProductStatus.ACTIVE,
        ...(keyword ? { name: ILike(`%${keyword}%`) } : {}),
      },
      skip,
      take: limit,
      order: { created_at: 'DESC', name: 'DESC' },
      select: {
        id: true,
        name: true,
        sku: true,
        slug: true,
        price: true,
        stock: true,
        status: true,
        created_at: true,
        updated_at: true,
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

  async getPublicStorefrontProduct(slug: string, productSlug: string) {
    const storefront = await this.findBySlug(slug);
    if (!storefront) {
      throw new NotFoundException('Storefront not found');
    }

    const product = await this.productRepo.findOne({
      where: {
        user: { id: storefront.user.id },
        slug: productSlug,
        status: ProductStatus.ACTIVE,
      },
      select: {
        id: true,
        name: true,
        sku: true,
        slug: true,
        price: true,
        stock: true,
        status: true,
        created_at: true,
        updated_at: true,
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }
}
