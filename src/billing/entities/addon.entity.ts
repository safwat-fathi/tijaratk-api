import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum AddonType {
  MESSAGE_PACK = 'message_pack',
  STAFF_SEAT = 'staff_seat',
  PRODUCT_PACK = 'product_pack',
  POSTS_PACK = 'posts_pack',
}

@Entity('addons')
export class Addon {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column({ unique: true })
  slug: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({
    type: 'enum',
    enum: AddonType,
  })
  addon_type: AddonType;

  @Column({ type: 'int' })
  price: number; // in cents

  @Column({ default: 'monthly' })
  billing_cycle: string; // one_time, monthly, yearly

  @Column({ type: 'int' })
  provides_quantity: number;

  @Column({ type: 'json', nullable: true })
  available_for_plans: string[]; // array of plan slugs

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
}
