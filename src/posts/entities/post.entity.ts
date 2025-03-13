import { FacebookPage } from 'src/facebook/entities/facebook-page.entity';
import { Product } from 'src/products/entities/product.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Relation,
  UpdateDateColumn,
} from 'typeorm';

@Entity('posts')
export class Post {
  @PrimaryGeneratedColumn()
  id: number;

  // Many posts can belong to one facebook page
  @ManyToOne(() => FacebookPage, (facebookPage) => facebookPage.posts)
  facebook_page: Relation<FacebookPage>;

  // Many posts can belong to one product
  @ManyToOne(() => Product, (product) => product.posts, { nullable: false })
  product: Relation<Product>;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  content?: string;

  @Column({ type: 'varchar', nullable: true })
  media_url?: string;

  // Indicates whether the post has been published on Facebook.
  @Column({ default: false })
  published: boolean;

  // For scheduled posts: if provided, this post should be published at this time.
  @Column({ type: 'timestamp', nullable: true })
  scheduled_at?: Date;

  // Store the Facebook post ID once published.
  @Column({ type: 'varchar', nullable: true })
  facebook_post_id: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date;
}
