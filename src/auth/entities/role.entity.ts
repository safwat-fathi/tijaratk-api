import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
  Relation,
  UpdateDateColumn,
} from 'typeorm';
import { Permission } from './permission.entity';

/**
 * Role scope - determines where the role applies.
 */
export enum RoleScope {
  GLOBAL = 'global', // Platform-wide (e.g., admin_super, admin_support)
  STORE = 'store', // Store-specific (e.g., merchant_owner, merchant_staff)
}

/**
 * Role entity - named permission bundles.
 *
 * Examples:
 * - admin_super (global) - Full platform access
 * - admin_support (global) - Limited admin access
 * - merchant_owner (store) - Full store access
 * - merchant_manager (store) - Can manage products and orders
 * - merchant_staff (store) - Limited store access
 */
@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn()
  id: number;

  /**
   * Unique role name (e.g., "admin_super", "merchant_owner")
   */
  @Column({ unique: true })
  name: string;

  /**
   * Human-readable display name
   */
  @Column({ nullable: true })
  display_name?: string;

  /**
   * Role scope - global or store-specific
   */
  @Column({ type: 'enum', enum: RoleScope })
  scope: RoleScope;

  /**
   * Permissions assigned to this role.
   * Uses a join table: role_permissions
   */
  @ManyToMany(() => Permission)
  @JoinTable({
    name: 'role_permissions',
    joinColumn: { name: 'role_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'permission_id', referencedColumnName: 'id' },
  })
  permissions: Relation<Permission[]>;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
