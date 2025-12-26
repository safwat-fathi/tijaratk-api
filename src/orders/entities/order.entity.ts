import { Storefront } from 'src/storefronts/entities/storefront.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Relation,
  UpdateDateColumn,
} from 'typeorm';

import { OrderItem } from './order-item.entity';

export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  SHIPPED = 'shipped',
  CANCELLED = 'cancelled',
}

export enum PaymentStatus {
  UNPAID = 'unpaid',
  PAID = 'paid',
}

export enum OrderType {
  CATALOG = 'catalog',
  CUSTOM = 'custom',
}

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Storefront, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  storefront: Relation<Storefront>;

  @Column({ type: 'varchar', length: 255 })
  buyer_name: string;

  @Column({ type: 'varchar', length: 32, nullable: false })
  buyer_phone: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  buyer_email?: string;

  @Column({ type: 'varchar', length: 255 })
  shipping_address_line1: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  shipping_address_line2?: string;

  @Column({ type: 'varchar', length: 128 })
  shipping_city: string;

  @Column({ type: 'varchar', length: 128, nullable: true })
  shipping_state?: string;

  @Column({ type: 'varchar', length: 32, nullable: true })
  shipping_postal_code?: string;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PENDING,
  })
  status: OrderStatus;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.UNPAID,
  })
  payment_status: PaymentStatus;

  @Column({
    type: 'enum',
    enum: OrderType,
    default: OrderType.CATALOG,
  })
  order_type: OrderType;

  @Column({ type: 'varchar', length: 128, nullable: true })
  tracking_number?: string;

  @Column({ type: 'text', nullable: true })
  internal_notes?: string;

  @Column({ type: 'timestamp', nullable: true })
  delivered_at?: Date;

  @Column({ type: 'numeric', precision: 10, scale: 2, default: 0 })
  shipping_cost: number;

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  total_amount: number;

  @OneToMany(() => OrderItem, (item) => item.order, { cascade: true })
  items: Relation<OrderItem[]>;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date;
}
