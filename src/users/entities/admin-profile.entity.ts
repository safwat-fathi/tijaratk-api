import {
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryColumn,
  Relation,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';

/**
 * Admin profile - attached to users with admin privileges.
 *
 * This is a profile table as per users-db-schema.md:
 * - user_id is the primary key (not auto-generated)
 * - One-to-one relationship with User
 * - Only created for users who are admins
 */
@Entity('admins')
export class AdminProfile {
  @PrimaryColumn()
  user_id: number;

  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: Relation<User>;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
