import { IsPhoneNumber } from 'class-validator';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';

@Entity('customers')
@Unique(['facebookUserId'])
export class Customer {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  facebookUserId: string;

  @Column()
  profileLink: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  email?: string;

  @Column({ nullable: true })
  @IsPhoneNumber(null, { message: 'Invalid phone number format' })
  phoneNumber?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @BeforeInsert()
  @BeforeUpdate()
  generateProfileLink() {
    this.profileLink = `https://www.facebook.com/${this.facebookUserId}`;
  }
}
