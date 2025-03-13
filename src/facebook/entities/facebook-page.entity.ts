import { decrypt, encrypt } from 'src/common/utils/encryption.util';
import { Notification } from 'src/notifications/entities/notification.entity';
import { Post } from 'src/posts/entities/post.entity';
import { User } from 'src/users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
  Relation,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

@Entity('facebook_pages')
@Unique(['page_id', 'user'])
export class FacebookPage {
  @PrimaryColumn({ type: 'varchar' })
  page_id: string;

  // one page can have multiple posts
  @OneToMany(() => Post, (post) => post.facebook_page)
  posts: Relation<Post[]>;

  @ManyToOne(() => User, (user) => user.facebook_pages, {
    cascade: true,
    nullable: true,
  })
  user: Relation<User>;

  @Column()
  name: string;

  @OneToMany(() => Notification, (notification) => notification.facebook_page)
  notifications: Relation<Notification[]>;

  @Column({ nullable: true })
  category: string;

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
