import { decrypt, encrypt } from 'src/common/utils/encryption.util';
import { Product } from 'src/products/entities/product.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Relation,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

@Entity('users')
@Unique(['email'])
@Unique(['facebookId'])
export class User {
  @PrimaryGeneratedColumn()
  id: string;

  @Column({ nullable: true })
  email?: string;

  @Column({ type: 'varchar', unique: true })
  facebookId: string;

  @Column()
  first_name: string;

  @Column()
  last_name: string;

  @ManyToOne(() => Product, (product) => product.user, {
    cascade: true, // or 'SET NULL' if you want a different behavior
    nullable: true,
  })
  products?: Relation<Product[]>;

  @Column({
    select: false,
    nullable: true,
    transformer: {
      to: (value: string | null) => (value ? encrypt(value) : null),
      from: (value: string | null) => (value ? decrypt(value) : null),
    },
  })
  fb_access_token?: string;

  @Column({ nullable: true })
  reset_password_token?: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
