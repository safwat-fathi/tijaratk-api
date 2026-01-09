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
 * Customer profile - attached to users who place orders.
 *
 * This is a profile table as per users-db-schema.md:
 * - user_id is the primary key (not auto-generated)
 * - One-to-one relationship with User
 * - Created silently when a user places their first order
 * - A customer can later become a merchant (same user, different profile)
 */
@Entity('customers')
export class CustomerProfile {
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
