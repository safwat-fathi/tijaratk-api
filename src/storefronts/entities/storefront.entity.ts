import { User } from 'src/users/entities/user.entity';
import { StorefrontThemeConfig } from '../types/theme-config';
import { SubCategory } from './sub-category.entity';
import { StorefrontCategory } from './storefront-category.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  Relation,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

@Entity('storefronts')
@Unique(['slug'])
export class Storefront {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 255 })
  slug: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ default: false })
  is_published: boolean;

  @Column({ name: 'userId', unique: true })
  userId: number;

  @OneToOne(() => User, (user) => user.storefront, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'userId' })
  user: Relation<User>;

  @Column({ type: 'varchar', length: 255, nullable: true })
  seo_title?: string;

  @Column({ type: 'text', nullable: true })
  seo_description?: string;

  @Column({ type: 'varchar', length: 512, nullable: true })
  seo_image_url?: string;

  @Column({ type: 'varchar', length: 512, nullable: true })
  canonical_url?: string;

  @Column({ default: false })
  noindex: boolean;

  @Column({ type: 'varchar', length: 64, nullable: true })
  facebook_pixel_id?: string;

  @Column({ type: 'varchar', length: 64, nullable: true })
  google_analytics_measurement_id?: string;

  @Column({ type: 'json', nullable: true })
  theme_config?: StorefrontThemeConfig;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date;

  @OneToMany(() => SubCategory, (subCategory) => subCategory.storefront)
  subCategories: Relation<SubCategory[]>;

  @OneToOne(
    () => StorefrontCategory,
    (storefrontCategory) => storefrontCategory.storefront,
  )
  storefrontCategory: Relation<StorefrontCategory>;
}
