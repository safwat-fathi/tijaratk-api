import {
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  Relation,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Role } from './role.entity';

/**
 * UserRole entity - assigns global roles to users.
 *
 * Used for:
 * - Platform admins (admin_super, admin_support)
 * - Any role with scope = 'global'
 *
 * Note: Store-scoped roles use StoreUserRole instead.
 */
@Entity('user_roles')
export class UserRole {
  @PrimaryColumn()
  user_id: number;

  @PrimaryColumn()
  role_id: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: Relation<User>;

  @ManyToOne(() => Role, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'role_id' })
  role: Relation<Role>;

  @CreateDateColumn()
  created_at: Date;
}
