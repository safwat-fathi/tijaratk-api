import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  Relation,
  UpdateDateColumn,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { genSalt, hash } from 'bcryptjs';

import { UserIdentity } from './user-identity.entity';
import { UserSubscription } from 'src/billing/entities/user-subscription.entity';
import { FacebookPage } from 'src/facebook/entities/facebook-page.entity';
import { FacebookPageSubscription } from 'src/facebook-page-subscription/entities/facebook-page-subscription.entity';
import { Notification } from 'src/notifications/entities/notification.entity';

/**
 * User status for account state management.
 */
export enum UserStatus {
  ACTIVE = 'active',
  BLOCKED = 'blocked',
  PENDING = 'pending',
}

/**
 * User entity - Single source of truth for identity.
 *
 * Design principles (from users-db-schema.md):
 * - One identity per human (phone is primary identifier)
 * - No role column (roles are in separate tables)
 * - No permission column (permissions resolved via roles)
 * - Profiles (merchant, customer, admin) are separate tables linked via user_id
 */
@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  /**
   * Primary identifier - phone number (required for all users).
   * Used for OTP authentication for merchants and customers.
   */
  @Index()
  @Column({ unique: true })
  phone: string;

  /**
   * Email - optional, used for admin login and notifications.
   */
  @Column({ nullable: true, unique: true })
  email?: string;

  /**
   * Password hash - only for admin users.
   * Merchants and customers use OTP authentication.
   */
  @Exclude()
  @Column({ nullable: true, select: false })
  password_hash?: string;

  /**
   * Account status for moderation and verification.
   */
  @Column({
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.PENDING,
  })
  status: UserStatus;

  /**
   * When the phone number was verified via OTP.
   */
  @Column({ nullable: true })
  phone_verified_at?: Date;

  /**
   * Display name (optional, can be derived from profiles).
   */
  @Column({ nullable: true })
  name?: string;

  // ==================== Relations ====================

  /**
   * Social identities (Facebook, Google, etc.)
   */
  @OneToMany(() => UserIdentity, (identity) => identity.user, { cascade: true })
  identities?: Relation<UserIdentity[]>;

  /**
   * Billing subscription for this user.
   */
  @OneToOne(() => UserSubscription, (sub) => sub.user, { cascade: true })
  userSubscription?: Relation<UserSubscription>;

  /**
   * Facebook pages linked to this user.
   */
  @OneToMany(() => FacebookPage, (page) => page.user)
  facebook_pages?: Relation<FacebookPage[]>;

  /**
   * Facebook page subscriptions for notifications.
   */
  @OneToMany(() => FacebookPageSubscription, (pageSub) => pageSub.user)
  facebook_page_subscriptions?: Relation<FacebookPageSubscription[]>;

  /**
   * User notifications.
   */
  @OneToMany(() => Notification, (notification) => notification.user)
  notifications?: Relation<Notification[]>;

  // ==================== Timestamps ====================

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at?: Date;

  // ==================== Hooks ====================

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (this.password_hash && !this.password_hash.startsWith('$2')) {
      // Only hash if not already hashed (bcrypt hashes start with $2)
      const salt = await genSalt();
      this.password_hash = await hash(this.password_hash, salt);
    }
  }
}
