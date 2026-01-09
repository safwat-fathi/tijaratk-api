import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  Relation,
  UpdateDateColumn,
} from 'typeorm';
import { Store } from './store.entity';
import { StorefrontThemeConfig } from '../types/theme-config';

/**
 * Store theme entity - separate table for theme configuration.
 * 
 * Benefits:
 * - Theme changes frequently, business data doesn't
 * - Allows versioning and rollback
 * - Keeps stores table clean and fast
 * - JSONB allows flexible theme options without migrations
 */
@Entity('store_themes')
export class StoreTheme {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  store_id: number;

  @OneToOne(() => Store, (store) => store.theme, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'store_id' })
  store: Relation<Store>;

  /**
   * Theme configuration as JSONB.
   * Store only overrides - merge with DEFAULT_THEME at runtime.
   */
  @Column({ type: 'jsonb', default: {} })
  config: StorefrontThemeConfig;

  /**
   * Theme version for rollback support.
   */
  @Column({ default: 1 })
  version: number;

  /**
   * Whether this theme is currently active.
   */
  @Column({ default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
