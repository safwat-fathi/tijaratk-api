import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Store } from './entities/store.entity';
import { StoreTheme } from './entities/store-theme.entity';
import {
  STORE_THEME_EDITOR_SCOPE,
  StoreThemeEditorTokenService,
} from './store-theme-editor-token.service';
import {
  DEFAULT_STOREFRONT_THEME,
  StorefrontThemeConfig,
} from './types/theme-config';

/**
 * Service for managing stores and their theme configurations.
 * Theme data is stored in a separate store_themes table per schema recommendations.
 */
@Injectable()
export class StoresService {
  constructor(
    @InjectRepository(Store)
    private readonly storeRepository: Repository<Store>,
    @InjectRepository(StoreTheme)
    private readonly storeThemeRepository: Repository<StoreTheme>,
    private readonly themeEditorTokenService: StoreThemeEditorTokenService,
  ) {}

  // ==================== Nearby Store Search Methods ====================

  /**
   * Find stores within a given radius using PostGIS ST_DWithin
   * @param lng Longitude
   * @param lat Latitude
   * @param radiusMeters Search radius in meters (default: 3000)
   */
  async findNearby(
    lng: number,
    lat: number,
    radiusMeters = 3000,
  ): Promise<Store[]> {
    return this.storeRepository
      .createQueryBuilder('store')
      .where(
        `ST_DWithin(
          store.location,
          ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)::geography,
          :radius
        )`,
      )
      .andWhere('store.is_open = :isOpen', { isOpen: true })
      .andWhere('store.is_active = :isActive', { isActive: true })
      .setParameters({ lng, lat, radius: radiusMeters })
      .getMany();
  }

  /**
   * Find nearest stores ordered by distance
   * @param lng Longitude
   * @param lat Latitude
   * @param limit Maximum number of stores to return (default: 10)
   */
  async findClosest(
    lng: number,
    lat: number,
    limit = 10,
  ): Promise<{ store: Store; distance: number }[]> {
    const result = await this.storeRepository
      .createQueryBuilder('store')
      .addSelect(
        `ST_Distance(
          store.location,
          ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)::geography
        )`,
        'distance',
      )
      .where('store.location IS NOT NULL')
      .andWhere('store.is_open = :isOpen', { isOpen: true })
      .andWhere('store.is_active = :isActive', { isActive: true })
      .setParameters({ lng, lat })
      .orderBy('distance', 'ASC')
      .limit(limit)
      .getRawAndEntities();

    return result.entities.map((store, index) => ({
      store,
      distance: parseFloat(result.raw[index].distance) || 0,
    }));
  }

  // ==================== Standard CRUD Methods ====================

  /**
   * Find a store by ID with optional relations
   */
  async findOne(id: number): Promise<Store | null> {
    return this.storeRepository.findOne({
      where: { id },
      relations: ['owner', 'products', 'theme'],
    });
  }

  /**
   * Find a store by its unique slug
   */
  async findBySlug(slug: string): Promise<Store | null> {
    return this.storeRepository.findOne({
      where: { slug },
      relations: ['owner', 'theme'],
    });
  }

  /**
   * Find all stores owned by a user
   */
  async findByOwner(userId: number): Promise<Store[]> {
    return this.storeRepository.find({
      where: { owner_user_id: userId },
      order: { created_at: 'DESC' },
    });
  }

  /**
   * Create a new store
   */
  async create(data: Partial<Store>): Promise<Store> {
    const store = this.storeRepository.create(data);
    return this.storeRepository.save(store);
  }

  /**
   * Update an existing store
   */
  async update(id: number, data: Partial<Store>): Promise<Store> {
    const store = await this.findOne(id);
    if (!store) {
      throw new NotFoundException(`Store with ID ${id} not found`);
    }
    Object.assign(store, data);
    return this.storeRepository.save(store);
  }

  // ==================== Public Storefront Methods ====================

  /**
   * Get public store data for storefront display
   */
  async getPublicStore(slug: string): Promise<Store> {
    const store = await this.storeRepository.findOne({
      where: { slug, is_open: true },
      relations: ['owner', 'theme'],
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        is_open: true,
        address_text: true,
        owner: {
          id: true,
          name: true,
          phone: true,
        },
      },
    });

    if (!store) {
      throw new NotFoundException(`Store not found or is closed`);
    }

    return store;
  }

  /**
   * Check if a slug is available for use
   */
  async isSlugAvailable(slug: string, excludeId?: number): Promise<boolean> {
    const existing = await this.storeRepository.findOne({
      where: { slug },
      select: ['id'],
    });

    if (!existing) return true;
    if (excludeId && existing.id === excludeId) return true;
    return false;
  }

  // ==================== Theme Editor Methods ====================

  /**
   * Create a theme editor session with a signed token
   */
  async createThemeEditorSession(
    userId: number,
    storeId: number,
  ): Promise<{ token: string; expiresAt: Date; editorUrl: string }> {
    const store = await this.storeRepository.findOne({
      where: { id: storeId, owner_user_id: userId },
    });

    if (!store) {
      throw new NotFoundException('Store not found');
    }

    const token = this.themeEditorTokenService.sign({
      sub: String(userId),
      storeId: String(store.id),
      scope: [STORE_THEME_EDITOR_SCOPE],
    });

    const expiresAt = this.themeEditorTokenService.expiresAtFromNow();
    const editorUrl = this.buildThemeEditorUrl(store.slug, token);

    return { token, expiresAt, editorUrl };
  }

  // ==================== Store Theme Methods (using store_themes table) ====================

  /**
   * Get a store's theme configuration (merged with defaults)
   */
  async getStoreTheme(storeId: number): Promise<StorefrontThemeConfig> {
    const theme = await this.storeThemeRepository.findOne({
      where: { store_id: storeId, is_active: true },
    });

    return this.mergeThemeConfig(theme?.config);
  }

  /**
   * Update or create a store's theme configuration
   */
  async updateStoreTheme(
    storeId: number,
    config?: StorefrontThemeConfig,
  ): Promise<StorefrontThemeConfig> {
    let theme = await this.storeThemeRepository.findOne({
      where: { store_id: storeId },
    });

    const mergedConfig = this.mergeThemeConfig(config);

    if (theme) {
      theme.config = mergedConfig;
      theme.version += 1;
    } else {
      theme = this.storeThemeRepository.create({
        store_id: storeId,
        config: mergedConfig,
        version: 1,
        is_active: true,
      });
    }

    await this.storeThemeRepository.save(theme);
    return theme.config;
  }

  /**
   * Get a store's theme by slug (for public storefront)
   */
  async getStoreThemeBySlug(
    slug: string,
    expectedStoreId?: number,
  ): Promise<StorefrontThemeConfig> {
    const store = await this.storeRepository.findOne({
      where: { slug },
      select: ['id'],
    });

    if (!store) {
      throw new NotFoundException(`Store with slug '${slug}' not found`);
    }

    if (expectedStoreId && store.id !== expectedStoreId) {
      throw new ForbiddenException('Store ID mismatch');
    }

    return this.getStoreTheme(store.id);
  }

  /**
   * Update a store's theme by slug
   */
  async updateStoreThemeBySlug(
    slug: string,
    config?: StorefrontThemeConfig,
    expectedStoreId?: number,
  ): Promise<StorefrontThemeConfig> {
    const store = await this.storeRepository.findOne({
      where: { slug },
      select: ['id'],
    });

    if (!store) {
      throw new NotFoundException(`Store with slug '${slug}' not found`);
    }

    if (expectedStoreId && store.id !== expectedStoreId) {
      throw new ForbiddenException('Store ID mismatch');
    }

    return this.updateStoreTheme(store.id, config);
  }

  // ==================== Owner-Scoped Methods ====================

  /**
   * Create a new store for a user (must have merchant profile)
   */
  async createForOwner(
    userId: number,
    data: {
      name: string;
      slug?: string;
      description?: string;
      type?: string;
      is_open?: boolean;
      address_text?: string;
      longitude?: number;
      latitude?: number;
      category_id?: number;
    },
  ): Promise<Store> {
    // Generate slug from name if not provided
    let slug = data.slug;
    if (!slug) {
      const slugBase = data.name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

      slug = slugBase;
      let suffix = 1;

      // Ensure slug is unique
      while (!(await this.isSlugAvailable(slug))) {
        slug = `${slugBase}-${suffix}`;
        suffix += 1;
      }
    }

    // Build location WKT if coordinates provided
    let location: string | undefined;
    if (data.longitude !== undefined && data.latitude !== undefined) {
      location = `POINT(${data.longitude} ${data.latitude})`;
    }

    const store = this.storeRepository.create({
      owner_user_id: userId,
      name: data.name,
      slug,
      description: data.description,
      type: data.type as any,
      is_open: data.is_open ?? true,
      address_text: data.address_text,
      location,
      category_id: data.category_id,
    });

    return this.storeRepository.save(store);
  }

  /**
   * Find a specific store for a user (with ownership verification)
   */
  async findOneForOwner(
    userId: number,
    storeId: number,
  ): Promise<Store> {
    const store = await this.storeRepository.findOne({
      where: { id: storeId, owner_user_id: userId },
      relations: ['owner', 'theme', 'category'],
    });

    if (!store) {
      throw new NotFoundException('Store not found');
    }

    return store;
  }

  /**
   * Update a store for a user (with ownership verification)
   */
  async updateForOwner(
    userId: number,
    storeId: number,
    data: Partial<{
      name: string;
      slug: string;
      description: string;
      type: string;
      is_open: boolean;
      address_text: string;
      longitude: number;
      latitude: number;
      category_id: number;
    }>,
  ): Promise<Store> {
    const store = await this.findOneForOwner(userId, storeId);

    // Build location WKT if coordinates provided
    if (data.longitude !== undefined && data.latitude !== undefined) {
      (data as any).location = `POINT(${data.longitude} ${data.latitude})`;
    }
    delete data.longitude;
    delete data.latitude;

    Object.assign(store, data);
    return this.storeRepository.save(store);
  }

  // ==================== Public Product Methods ====================

  /**
   * Get products for a public store
   */
  async getPublicStoreProducts(
    slug: string,
    query: { page?: number; limit?: number; keyword?: string },
  ) {
    const store = await this.storeRepository.findOne({
      where: { slug, is_open: true },
      select: ['id'],
    });

    if (!store) {
      throw new NotFoundException('Store not found or is closed');
    }

    const { page = 1, limit = 10, keyword } = query;
    const skip = (page - 1) * limit;

    // Use query builder for product search
    const qb = this.storeRepository.manager
      .createQueryBuilder()
      .select('product')
      .from('products', 'product')
      .leftJoinAndSelect('product.variants', 'variants')
      .where('product.store_id = :storeId', { storeId: store.id })
      .andWhere('product.is_active = :isActive', { isActive: true })
      .orderBy('product.created_at', 'DESC')
      .skip(skip)
      .take(limit);

    if (keyword) {
      qb.andWhere('product.name ILIKE :keyword', { keyword: `%${keyword}%` });
    }

    const [items, total] = await qb.getManyAndCount();

    return {
      total,
      page,
      limit,
      last_page: Math.ceil(total / limit),
      items,
    };
  }

  /**
   * Get a single product for a public store
   */
  async getPublicStoreProduct(
    slug: string,
    productSlug: string,
  ) {
    const store = await this.storeRepository.findOne({
      where: { slug, is_open: true },
      select: ['id'],
    });

    if (!store) {
      throw new NotFoundException('Store not found or is closed');
    }

    const product = await this.storeRepository.manager
      .createQueryBuilder()
      .select('product')
      .from('products', 'product')
      .leftJoinAndSelect('product.variants', 'variants')
      .where('product.store_id = :storeId', { storeId: store.id })
      .andWhere('product.slug = :productSlug', { productSlug })
      .andWhere('product.is_active = :isActive', { isActive: true })
      .getOne();

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  // ==================== Private Helpers ====================

  /**
   * Merge provided theme config with defaults.
   * Stores only overrides in DB, merges with defaults at runtime.
   */
  private mergeThemeConfig(
    provided?: StorefrontThemeConfig | null,
  ): StorefrontThemeConfig {
    if (!provided) {
      return DEFAULT_STOREFRONT_THEME;
    }

    return {
      ...DEFAULT_STOREFRONT_THEME,
      ...provided,
      palette: {
        ...DEFAULT_STOREFRONT_THEME.palette,
        ...(provided.palette || {}),
      },
    };
  }

  /**
   * Build the theme editor preview URL
   */
  private buildThemeEditorUrl(slug: string, token: string): string {
    const baseUrl =
      process.env.STOREFRONT_BASE_URL || 'http://localhost:3001';
    return `${baseUrl}/${slug}/preview?token=${token}`;
  }
}
