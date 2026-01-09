import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryColumn,
  Relation,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Store } from '../../stores/entities/store.entity';

/**
 * Onboarding status enum for tracking merchant signup progress.
 * Aligned with merchant-onboarding-flow.md
 */
export enum MerchantOnboardingStatus {
  SIGNUP = 'signup',
  BUSINESS_TYPE_SELECTED = 'business_type_selected',
  WHATSAPP_CONNECTED = 'whatsapp_connected',
  STORE_CREATED = 'store_created',
  PRODUCTS_ADDED = 'products_added',
  LIVE = 'live',
}

/**
 * Merchant profile - attached to users who own/manage stores.
 *
 * Design (from users-db-schema.md):
 * - user_id is the primary key (not auto-generated)
 * - One-to-one relationship with User
 * - Contains merchant-specific data only (onboarding, primary store)
 * - Phone, name, etc. live on the User entity
 * - A single user can be both a merchant AND a customer
 */
@Entity('merchants')
export class Merchant {
  /**
   * Primary key - references users.id
   * Not auto-generated; set when creating merchant profile for a user.
   */
  @PrimaryColumn()
  user_id: number;

  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: Relation<User>;

  /**
   * Merchant onboarding status for tracking signup flow progress.
   * Values align with merchant-onboarding-flow.md
   */
  @Column({
    type: 'enum',
    enum: MerchantOnboardingStatus,
    default: MerchantOnboardingStatus.SIGNUP,
  })
  onboarding_status: MerchantOnboardingStatus;

  /**
   * The merchant's primary/default store.
   * Used for quick access when merchant has multiple stores.
   */
  @Column({ nullable: true })
  primary_store_id?: number;

  @ManyToOne(() => Store, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'primary_store_id' })
  primary_store?: Relation<Store>;

  // Note: To get stores for a merchant, query stores where owner_user_id = merchant.user_id
  // Stores are linked to User, not Merchant directly.

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at?: Date;
}
