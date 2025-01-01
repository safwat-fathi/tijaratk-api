import { Customer } from 'src/customers/entities/customer.entity';
import { Post } from 'src/posts/entities/post.entity';

import { Tag } from 'src/tags/entities/tag.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeUpdate,
  BeforeInsert,
} from 'typeorm';

@Entity('comments')
export class Comment {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Post)
  post: Post;

  @ManyToOne(() => Customer)
  customer: Customer;

  @Column({ nullable: true })
  facebookCommentId?: string;

  @Column()
  commentLink: string;

  @Column()
  text: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @BeforeInsert()
  @BeforeUpdate()
  generateCommentLink() {
    this.commentLink = `https://www.facebook.com/${this.facebookCommentId}`;
  }
}
