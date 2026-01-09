import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * Permission entity - represents atomic actions that can be performed.
 *
 * Examples:
 * - store.view, store.update, store.delete
 * - product.add, product.edit, product.delete
 * - order.view, order.cancel, order.refund
 * - merchant.suspend
 */
@Entity('permissions')
export class Permission {
  @PrimaryGeneratedColumn()
  id: number;

  /**
   * Unique permission key in dot notation.
   * Format: resource.action (e.g., "store.view", "order.cancel")
   */
  @Column({ unique: true })
  key: string;

  /**
   * Human-readable description of the permission.
   */
  @Column({ type: 'text', nullable: true })
  description?: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
