
import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, Relation } from 'typeorm';
import { Message } from './message.entity';

@Entity()
export class MessageTag {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @ManyToMany(() => Message, (message) => message.tags)
  messages: Relation<Message[]>;
}
