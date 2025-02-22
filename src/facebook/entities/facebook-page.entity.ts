import { decrypt, encrypt } from 'src/common/utils/encryption.util';
import { User } from 'src/users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Relation,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

@Entity('facebook_pages')
@Unique(['page_id', 'user'])
export class FacebookPage {
  @PrimaryGeneratedColumn()
  id: string;

  @ManyToOne(() => User, (user) => user.facebook_pages, {
    cascade: true,
    nullable: true,
  })
  user: Relation<User>;

  @Column()
  name: string;

  @Column({ nullable: true })
  category: string;

  @Column({ nullable: true })
  page_id: string;

  @Column({
    select: false,
    nullable: true,
    transformer: {
      to: (value: string | null) => (value ? encrypt(value) : null),
      from: (value: string | null) => (value ? decrypt(value) : null),
    },
  })
  access_token?: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  last_updated: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date;
}
