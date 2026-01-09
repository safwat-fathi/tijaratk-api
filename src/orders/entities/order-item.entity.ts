import { Product } from 'src/products/entities/product.entity';
import { ProductVariant } from 'src/products/entities/product-variant.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Relation,
} from 'typeorm';

import { Order } from './order.entity';

@Entity('order_items')
export class OrderItem {
  @PrimaryGeneratedColumn()
  id: string;

  @ManyToOne(() => Order, (order) => order.items, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  order: Relation<Order>;

  @Column({ name: 'product_id', nullable: true })
  product_id: string;

  @ManyToOne(() => Product, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'product_id' })
  product: Relation<Product> | null;

  @Column({ name: 'product_variant_id', nullable: true })
  product_variant_id: string;

  @ManyToOne(() => ProductVariant, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'product_variant_id' })
  variant: Relation<ProductVariant> | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  name: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  variant_label: string;

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  quantity: number;

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  unit_price: number;

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  total_price: number;
}
