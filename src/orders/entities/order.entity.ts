import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Relation,
  UpdateDateColumn,
} from 'typeorm';
import { Customer } from '../../customers/entities/customer.entity';
import { Store } from '../../stores/entities/store.entity';
import { OrderItem } from './order-item.entity';

export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  SHIPPED = 'shipped',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
}

export enum PaymentStatus {
  UNPAID = 'unpaid',
  PAID = 'paid',
}

export enum OrderSource {
  WHATSAPP = 'whatsapp',
  WEB = 'web',
}

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'store_id' })
  store_id: string;

  @ManyToOne(() => Store, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'store_id' })
  store: Relation<Store>;

  @Column({ name: 'customer_id', nullable: true })
  customer_id: number;

  @ManyToOne(() => Customer, (customer) => customer.orders, {
    nullable: true,
  })
  @JoinColumn({ name: 'customer_id' })
  customer: Relation<Customer>;

  @Column({
    type: 'enum',
    enum: OrderSource,
    default: OrderSource.WEB,
  })
  order_source: OrderSource;

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
  shipping_city: string; // Used as Area/Neighborhood

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
