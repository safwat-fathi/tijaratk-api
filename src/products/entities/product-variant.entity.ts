import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Relation,
  UpdateDateColumn,
} from 'typeorm';
import { Product } from './product.entity';

export enum Unit {
  KG = 'kg',
  G = 'g',
  LITER = 'liter',
  PIECE = 'piece',
  PACK = 'pack',
}

@Entity('product_variants')
@Index(['product_id'], { where: 'is_default = true', unique: true })
export class ProductVariant {
  @PrimaryGeneratedColumn()
  id: string;

  @Column({ name: 'product_id' })
  product_id: string;

  @ManyToOne(() => Product, (product) => product.variants, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'product_id' })
  product: Relation<Product>;

  @Column({ type: 'varchar', length: 100 })
  label: string; // '1 kg', 'Box'

  @Column({ type: 'enum', enum: Unit, nullable: true })
  unit?: Unit;

  @Column({ type: 'integer' })
  stock: number; // 1,

  @Column({ type: 'numeric', precision: 10, scale: 3, nullable: true })
  unit_value?: number; // 1, 0.5

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'numeric', precision: 10, scale: 2, nullable: true })
  sale_price?: number;

  @Column({ type: 'numeric', precision: 10, scale: 2, nullable: true })
  cost_price?: number;

  @Column({ type: 'numeric', precision: 10, scale: 2, nullable: true })
  wholesale_price?: number;

  @Column({ default: false })
  is_default: boolean;

  @Column({ default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date;
}
