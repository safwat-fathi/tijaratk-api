import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  Relation,
  UpdateDateColumn,
} from 'typeorm';

import { UserSubscription } from './user-subscription.entity';

@Entity('plans')
export class Plan {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column({ unique: true })
  slug: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'int' })
  price: number; // in cents

  @Column({ default: 'monthly' })
  billing_cycle: string; // monthly, yearly

  // Limits
  @Column({ type: 'int', nullable: true })
  max_products: number | null; // null for unlimited

  @Column({ type: 'int', nullable: true })
  max_posts_per_month: number | null;

  @Column({ type: 'int', nullable: true })
  max_messages_per_month: number | null;

  @Column({ type: 'int', default: 1 })
  max_staff_users: number;

  // Features
  @Column({ type: 'boolean', default: false })
  has_custom_domain: boolean;

  @Column({ type: 'boolean', default: false })
  has_theme_access: boolean;

  @Column({ type: 'boolean', default: false })
  branding_removed: boolean;

  @Column({ type: 'int', default: 0 })
  available_themes_count: number;

  @Column({ type: 'int', default: 0 })
  available_color_palettes: number;

  // Metadata
  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @Column({ type: 'int', default: 0 })
  display_order: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date;

  @OneToMany(() => UserSubscription, (subscription) => subscription.plan)
  subscriptions: Relation<UserSubscription[]>;
}
