import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum DashboardType {
  BASIC = 'basic',
  ADVANCED = 'advanced',
}

export enum SupportType {
  NONE = 'none',
  EMAIL = 'email',
  CHAT = 'chat',
  VIP = 'VIP',
}

/**
 * @deprecated This entity is replaced by Plan and UserSubscription entities in usage-billing system.
 * It is kept for backward compatibility during migration.
 */
@Entity('subscriptions')
export class Subscription {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'int' })
  price: number;

  // Maximum number of products allowed (null for unlimited)
  @Column({ type: 'int', nullable: true })
  product_limit: number | null;

  @Column({ type: 'int', nullable: true })
  post_limit: number | null;

  // Maximum number of comments/messages allowed per month (null for unlimited)
  @Column({ type: 'int', nullable: true })
  comment_message_limit: number | null;

  // Dashboard type provided by the plan
  @Column({
    type: 'enum',
    enum: DashboardType,
    default: DashboardType.BASIC,
  })
  dashboard: DashboardType;

  // Whether notifications for new messages are enabled
  @Column({ type: 'boolean', default: false })
  notifications: boolean;

  // Whether the plan includes smart classification features
  @Column({ type: 'boolean', default: false })
  smart_classification: boolean;

  // Type of support provided by the plan
  @Column({
    type: 'enum',
    enum: SupportType,
    default: SupportType.NONE,
  })
  support: SupportType;

  // Indicates if the plan allows adding more than one admin to the account
  @Column({ type: 'boolean', default: false })
  additional_admins: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date;
}
