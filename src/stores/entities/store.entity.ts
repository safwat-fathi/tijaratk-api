import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  Relation,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Product } from '../../products/entities/product.entity';
import type { StoreTheme } from './store-theme.entity';
import type { StoreSeo } from './store-seo.entity';
import { Category } from '../../categories/entities/category.entity';

/**
 * Store type enum
 * - physical: Has a physical location (requires location)
 * - online: Online-only store (no location needed)
 * - hybrid: Both physical and online presence
 */
export enum StoreType {
  PHYSICAL = 'physical',
  ONLINE = 'online',
  HYBRID = 'hybrid',
}

@Entity('stores')
@Unique(['slug'])
export class Store {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: StoreType,
    default: StoreType.ONLINE,
  })
  type: StoreType;

  /**
   * Owner of this store - links to users table.
   * The user must have a merchant profile.
   */
  @Column()
  owner_user_id: number;

  @ManyToOne(() => User, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'owner_user_id' })
  owner: Relation<User>;

  @Column({ type: 'varchar', length: 120 })
  name: string;

  @Column({ type: 'varchar', length: 120 })
  slug: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'text', nullable: true })
  address_text?: string;

  // PostGIS geography(Point, 4326) for accurate earth-distance calculations
  // Format: WKT string 'POINT(lng lat)' - note: longitude comes first!
  @Index({ spatial: true })
  @Column({
    type: 'geography',
    spatialFeatureType: 'Point',
    srid: 4326,
    nullable: true,
  })
  location?: string;

  /**
   * Theme configuration - stored in separate store_themes table.
   * Load with: relations: ['theme']
   */
  @OneToOne('StoreTheme', (theme: StoreTheme) => theme.store)
  theme?: Relation<StoreTheme>;

  /**
   * SEO configuration - stored in separate store_seo table.
   * Load with: relations: ['seo']
   */
  @OneToOne('StoreSeo', (seo: StoreSeo) => seo.store)
  seo?: Relation<StoreSeo>;

  /**
   * Primary category for this store.
   * Links to categories table.
   */
  @Column({ nullable: true })
  category_id?: number;

  @ManyToOne(() => Category, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'category_id' })
  category?: Relation<Category>;

  @OneToMany(() => Product, (product) => product.store)
  products: Relation<Product[]>;

  @Column({ default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date;
}
