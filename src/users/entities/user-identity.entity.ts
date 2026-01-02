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
import { decrypt, encrypt } from 'src/common/utils/encryption.util';
import { User } from './user.entity';

export enum SocialProvider {
  FACEBOOK = 'facebook',
  // Future providers can be added here:
  // GOOGLE = 'google',
  // APPLE = 'apple',
}

@Entity('user_identities')
@Unique(['provider', 'providerId']) // Prevents the same social account from being linked twice
export class UserIdentity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: SocialProvider })
  provider: SocialProvider;

  @Column()
  providerId: string; // The ID returned from the provider (e.g., Facebook ID)

  @Column({
    select: false,
    nullable: true,
    transformer: {
      to: (value: string | null) => (value ? encrypt(value) : null),
      from: (value: string | null) => (value ? decrypt(value) : null),
    },
  })
  accessToken?: string; // Encrypted access token for the provider

  @ManyToOne(() => User, (user) => user.identities, { onDelete: 'CASCADE' })
  user: Relation<User>;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
