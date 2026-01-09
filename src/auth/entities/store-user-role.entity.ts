import {
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  Relation,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Store } from '../../stores/entities/store.entity';
import { Role } from './role.entity';

/**
 * StoreUserRole entity - assigns store-scoped roles to users.
 *
 * Used for:
 * - Merchant owners (merchant_owner)
 * - Store managers (merchant_manager)
 * - Store staff (merchant_staff)
 *
 * Features:
 * - Same user can have different roles in different stores
 * - Same store can have multiple users with different roles
 * - Only roles with scope = 'store' should be used here
 */
@Entity('store_user_roles')
export class StoreUserRole {
  @PrimaryColumn()
  user_id: number;

  @PrimaryColumn()
  store_id: number;

  @PrimaryColumn()
  role_id: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: Relation<User>;

  @ManyToOne(() => Store, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'store_id' })
  store: Relation<Store>;

  @ManyToOne(() => Role, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'role_id' })
  role: Relation<Role>;

  @CreateDateColumn()
  created_at: Date;
}
