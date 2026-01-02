import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Product, ProductStatus } from 'src/products/entities/product.entity';
import { User } from 'src/users/entities/user.entity';
import { FindOptionsWhere, ILike, Not, Repository } from 'typeorm';

import { CreateStorefrontDto } from './dto/create-storefront.dto';
import { ListStorefrontProductsDto } from './dto/list-storefront-products.dto';
import { UpdateStorefrontDto } from './dto/update-storefront.dto';
import { Storefront } from './entities/storefront.entity';
import { StorefrontCategory } from './entities/storefront-category.entity';
import { SubCategory } from './entities/sub-category.entity';
import {
  THEME_EDITOR_SCOPE,
  ThemeEditorTokenService,
} from './theme-editor-token.service';
import {
  DEFAULT_STOREFRONT_THEME,
  StorefrontThemeConfig,
} from './types/theme-config';

@Injectable()
export class StorefrontsService {
  constructor(
    @InjectRepository(Storefront)
    private readonly storefrontRepo: Repository<Storefront>,
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(StorefrontCategory)
    private readonly storefrontCategoryRepo: Repository<StorefrontCategory>,
    @InjectRepository(SubCategory)
    private readonly subCategoryRepo: Repository<SubCategory>,
    private readonly themeEditorTokenService: ThemeEditorTokenService,
  ) {}

  async createForUser(userId: number, dto: CreateStorefrontDto) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new BadRequestException('User not found');
    }

    const existing = await this.storefrontRepo.findOne({
      where: { user: { id: user.id } },
    });
    if (existing) {
      throw new BadRequestException('You already have a storefront configured');
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

    const { is_published: _ignoredIsPublished, ...rest } = dto;

    const storefront = this.storefrontRepo.create({
      ...rest,
      theme_config: { ...DEFAULT_STOREFRONT_THEME },
      slug,
      user,
      // User-created storefronts start published by default
      is_published: true,
    });

    const savedStorefront = await this.storefrontRepo.save(storefront);

    if (dto.primaryCategoryId) {
      const sfCat = this.storefrontCategoryRepo.create({
        storefrontId: savedStorefront.id,
        primaryCategoryId: dto.primaryCategoryId,
        secondaryCategoryId: dto.secondaryCategoryId,
      });
      await this.storefrontCategoryRepo.save(sfCat);
    }

    if (dto.subCategories && dto.subCategories.length > 0) {
      const subs = dto.subCategories.map((sub) =>
        this.subCategoryRepo.create({
          storefrontId: savedStorefront.id,
          categoryId: sub.categoryId,
          name: sub.name,
          is_custom: sub.is_custom,
        }),
      );
      await this.subCategoryRepo.save(subs);
    }

    return savedStorefront;
  }

  async findForUser(userId: number) {
    const user = await this.userRepo.findOne({
      where: { id: userId },
    });
    if (!user) {
      throw new BadRequestException('User not found');
    }

    return this.storefrontRepo.findOne({
      where: { user: { id: user.id } },
      relations: {
        storefrontCategory: true,
        subCategories: true,
      },
    });
  }

  async updateForUser(userId: number, id: number, dto: UpdateStorefrontDto) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
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

    const {
      is_published: _ignoredIsPublished,
      subCategories: _subCategories,
      ...rest
    } = dto;

    Object.assign(storefront, {
      ...rest,
    });

    const savedStorefront = await this.storefrontRepo.save(storefront);

    if (dto.primaryCategoryId) {
      const existingCat = await this.storefrontCategoryRepo.findOne({
        where: { storefrontId: savedStorefront.id },
      });

      if (existingCat) {
        existingCat.primaryCategoryId = dto.primaryCategoryId;
        existingCat.secondaryCategoryId = dto.secondaryCategoryId;
        await this.storefrontCategoryRepo.save(existingCat);
      } else {
        const sfCat = this.storefrontCategoryRepo.create({
          storefrontId: savedStorefront.id,
          primaryCategoryId: dto.primaryCategoryId,
          secondaryCategoryId: dto.secondaryCategoryId,
        });
        await this.storefrontCategoryRepo.save(sfCat);
      }
    }

    if (dto.subCategories) {
      // Replace all sub-categories
      await this.subCategoryRepo.delete({ storefrontId: savedStorefront.id });

      if (dto.subCategories.length > 0) {
        const subs = dto.subCategories.map((sub) =>
          this.subCategoryRepo.create({
            storefrontId: savedStorefront.id,
            categoryId: sub.categoryId,
            name: sub.name,
            is_custom: sub.is_custom,
          }),
        );
        await this.subCategoryRepo.save(subs);
      }
    }

    return savedStorefront;
  }

  async createThemeEditorSession(userId: number, id: number) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new BadRequestException('User not found');
    }

    const storefront = await this.storefrontRepo.findOne({
      where: { id, user: { id: user.id } },
    });

    if (!storefront) {
      throw new NotFoundException('Storefront not found');
    }

    const token = this.themeEditorTokenService.sign({
      sub: user.id,
      storefrontId: storefront.id,
      scope: [THEME_EDITOR_SCOPE],
    });

    const expiresAt = this.themeEditorTokenService.expiresAtFromNow();
    const previewUrl = this.buildThemeEditorUrl(storefront.id, token);

    return {
      token,
      expires_at: expiresAt.toISOString(),
      preview_url: previewUrl,
    };
  }

  async getStorefrontTheme(id: number) {
    const storefront = await this.storefrontRepo.findOne({ where: { id } });

    if (!storefront) {
      throw new NotFoundException('Storefront not found');
    }

    return {
      storefront: this.sanitizeStorefront(storefront),
      theme_config: this.mergeThemeConfig(storefront.theme_config),
    };
  }

  async updateStorefrontTheme(id: number, theme?: StorefrontThemeConfig) {
    const storefront = await this.storefrontRepo.findOne({ where: { id } });

    if (!storefront) {
      throw new NotFoundException('Storefront not found');
    }

    const mergedTheme = this.mergeThemeConfig(theme ?? storefront.theme_config);
    storefront.theme_config = mergedTheme;
    await this.storefrontRepo.save(storefront);

    return {
      storefront: this.sanitizeStorefront(storefront),
      theme_config: mergedTheme,
    };
  }

  async getStorefrontThemeBySlug(slug: string, expectedStorefrontId?: number) {
    let storefront = await this.storefrontRepo.findOne({ where: { slug } });

    if (!storefront && expectedStorefrontId) {
      storefront = await this.storefrontRepo.findOne({
        where: { id: Number(expectedStorefrontId) },
      });
    }

    if (!storefront) {
      throw new NotFoundException('Storefront not found');
    }

    if (
      expectedStorefrontId &&
      storefront.id !== Number(expectedStorefrontId)
    ) {
      throw new ForbiddenException('Invalid storefront access');
    }

    return {
      storefront: this.sanitizeStorefront(storefront),
      theme_config: this.mergeThemeConfig(storefront.theme_config),
    };
  }

  async updateStorefrontThemeBySlug(
    slug: string,
    theme?: StorefrontThemeConfig,
    expectedStorefrontId?: number,
  ) {
    let storefront = await this.storefrontRepo.findOne({ where: { slug } });

    if (!storefront && expectedStorefrontId) {
      storefront = await this.storefrontRepo.findOne({
        where: { id: Number(expectedStorefrontId) },
      });
    }

    if (!storefront) {
      throw new NotFoundException('Storefront not found');
    }

    if (
      expectedStorefrontId &&
      storefront.id !== Number(expectedStorefrontId)
    ) {
      throw new ForbiddenException('Invalid storefront access');
    }

    const mergedTheme = this.mergeThemeConfig(theme ?? storefront.theme_config);
    storefront.theme_config = mergedTheme;
    await this.storefrontRepo.save(storefront);

    return {
      storefront: this.sanitizeStorefront(storefront),
      theme_config: mergedTheme,
    };
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

  async findUserStorefront(userId: string) {
    return this.storefrontRepo.findOne({
      where: { user: { id: Number(userId) } },
    });
  }

  async isSlugAvailable(slug: string, excludeId?: number) {
    const where: FindOptionsWhere<Storefront> = { slug };

    if (excludeId) {
      where.id = Not(excludeId);
    }

    const exists = await this.storefrontRepo.exists({
      where,
      withDeleted: true,
    });

    return { available: !exists };
  }

  async getPublicStorefront(slug: string) {
    const storefront = await this.storefrontRepo.findOne({
      where: {
        slug,
        is_published: true,
      },
      relations: {
        storefrontCategory: {
          primaryCategory: true,
          secondaryCategory: true,
        },
        subCategories: {
          category: true,
        },
      },
    });

    if (!storefront) {
      throw new NotFoundException('Storefront not found');
    }

    // Do not expose user relation & userId in the public response
    const { user, userId, ...rest } = storefront;

    return {
      ...rest,
      theme_config: this.mergeThemeConfig(rest.theme_config),
    };
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
        description: true,
        main_image: true,
        images: true,
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

  private mergeThemeConfig(
    provided?: StorefrontThemeConfig | null,
  ): StorefrontThemeConfig {
    if (!provided) {
      return { ...DEFAULT_STOREFRONT_THEME };
    }

    return {
      ...DEFAULT_STOREFRONT_THEME,
      ...provided,
      palette: {
        ...DEFAULT_STOREFRONT_THEME.palette,
        ...provided.palette,
      },
    };
  }

  private buildThemeEditorUrl(storefrontId: number, token: string) {
    const baseUrl =
      process.env.THEME_EDITOR_PREVIEW_URL ||
      process.env.PREVIEW_STOREFRONT_URL;
    if (!baseUrl) {
      return null;
    }

    const normalizedBase = baseUrl.endsWith('/')
      ? baseUrl.slice(0, -1)
      : baseUrl;
    const search = new URLSearchParams({ storeId: String(storefrontId) });

    return `${normalizedBase}/preview/editor?${search.toString()}#token=${token}`;
  }

  private sanitizeStorefront(storefront: Storefront) {
    return {
      id: storefront.id,
      name: storefront.name,
      slug: storefront.slug,
      description: storefront.description,
    };
  }
}
