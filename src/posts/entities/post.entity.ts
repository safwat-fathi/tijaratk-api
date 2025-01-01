import { Product } from 'src/products/entities/product.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';

@Entity('posts')
export class Post {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Product)
  product: Product;

  @Column()
  facebookPostId: string;

  @Column()
  postLink: string;

  @Column()
  content: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @BeforeInsert()
  @BeforeUpdate()
  generatePostLink() {
    this.postLink = `https://www.facebook.com/${this.facebookPostId}`;
  }
}
