import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Relation,
  UpdateDateColumn,
} from 'typeorm';

/**
 * Store category entity - hierarchical categories for stores.
 *
 * Features:
 * - Self-referencing parent_id for hierarchy (e.g., Food > Restaurants > Pizza)
 * - One primary category per store via stores.category_id FK
 * - Optional secondary tags can be added later
 */
@Entity('store_categories')
export class StoreCategory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100, unique: true })
  key: string;

  @Column({ type: 'varchar', length: 100 })
  name_en: string;

  @Column({ type: 'varchar', length: 100 })
  name_ar: string;

  @Column({ type: 'text', nullable: true })
  description_en?: string;

  @Column({ type: 'text', nullable: true })
  description_ar?: string;

  /**
   * Icon identifier for the category (e.g., 'restaurant', 'grocery', 'fashion')
   */
  @Column({ type: 'varchar', length: 50, nullable: true })
  icon?: string;

  /**
   * Parent category for hierarchy.
   * null = top-level category
   */
  @Column({ nullable: true })
  parent_id?: number;

  @ManyToOne(() => StoreCategory, (category) => category.children, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'parent_id' })
  parent?: Relation<StoreCategory>;

  @OneToMany(() => StoreCategory, (category) => category.parent)
  children: Relation<StoreCategory[]>;

  /**
   * Display order for sorting categories in UI
   */
  @Column({ default: 0 })
  sort_order: number;

  /**
   * Whether this category is active/visible
   */
  @Column({ default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date;
}
