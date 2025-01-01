import { Customer } from 'src/customers/entities/customer.entity';
import { Product } from 'src/products/entities/product.entity';

import { Tag } from 'src/tags/entities/tag.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  JoinTable,  
	Relation,
} from 'typeorm';
import { MessageTag } from './message-tag.entity';

@Entity('messages')
export class Message {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Customer)
  customer: Relation<Customer>;

  @ManyToOne(() => Product, { nullable: true })
  product?: Relation<Product>;

  @Column({ nullable: true })
  facebookMessageId?: string;

  @Column()
  facebookMessageLink: string; // https://www.facebook.com/496757380187044/inbox/518951281300987/?section=messages

  @Column()
  text: string;

  @ManyToMany(() => MessageTag, (tag) => tag.messages, {
    cascade: true, // Allows automatic saving of related tags
  })
  @JoinTable({
    name: 'message_tags', // Custom join table name
    joinColumn: { name: 'message_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'tag_id', referencedColumnName: 'id' },
  })
  tags: Relation<Tag[]>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
