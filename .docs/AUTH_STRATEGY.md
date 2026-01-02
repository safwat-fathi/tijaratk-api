To allow a single user to log in via multiple methods (Facebook, Google, Email/Password) without creating duplicate accounts, you need to transition from a **Column-based** approach to a **Table-based (Relationship)** approach.

Currently, your `User` entity has specific columns like `facebookId`. If you add Google, you’d have to add `googleId`, then `appleId`, and so on. This makes your database rigid and hard to maintain.

### 1. The Recommended Database Strategy

The industry standard is to have a dedicated **`Identity`** or **`SocialAccount`** table. This allows one user to have many "identities" linked to their primary account.

---

### 2. Updated TypeORM Entity Implementation

Here is how you should refactor your schema. We will extract the provider-specific data into a new entity called `UserIdentity`.

#### The New `UserIdentity` Entity

This table will store the connection between a user and an external provider.

```typescript
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, Unique } from 'typeorm';
import { User } from './user.entity';

enum SocialAccount {
  FACEBOOK = 'facebook',
}

@Entity('user_identities')
@Unique(['provider', 'providerId']) // Prevents the same FB account from being linked twice
export class UserIdentity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: SocialAccount })
  provider: SocialAccount; // 'facebook', 'google', 'apple'

  @Column()
  providerId: string; // The ID returned from the provider (e.g., your current facebookId)

  @ManyToOne(() => User, (user) => user.identities)
  user: User;
}

```

#### The Updated `User` Entity

We remove `facebookId` and add a relationship to `identities`. We keep `email` and `password` on the User entity as the "primary" credentials.

```typescript
@Entity('users')
@Unique(['email'])
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  email?: string;

  @Column({ nullable: true, select: false })
  password?: string; // If this is set, they can login with email/pass

  // Link to multiple social providers
  @OneToMany(() => UserIdentity, (identity) => identity.user, { cascade: true })
  identities: UserIdentity[];

  // Keep your existing fields...
  @Column({ default: false })
  is_active: boolean;

  @Column()
  first_name: string;

  @Column()
  last_name: string;

  // ... (rest of your existing relations like storefront, notifications, etc.)
}

```

---

### 3. How the Logic Handles Both Logins

When a user tries to log in, your backend logic follows this flow:

#### Scenario A: Login via Facebook

1. Receive the `facebookId` from the Facebook SDK.
2. Query the `UserIdentity` table: `SELECT * FROM user_identities WHERE provider = 'facebook' AND providerId = '123'`.
3. If found, log the user in using the associated `userId`.
4. If **not found**, check if a User exists with the Facebook email.
* If Email exists: Link the new `UserIdentity` to that user (Account Linking).
* If Email doesn't exist: Create a new `User` and a new `UserIdentity`.



#### Scenario B: Login via Email/Password

1. Query the `User` table by `email`.
2. If the `password` column is NOT null, verify the hash.
3. If the `password` column IS null, tell the user: *"This account was created via Facebook. Please log in with Facebook or reset your password to create one."*

---

### 4. Adding a Password Later

If a user signed up with Facebook (`password` is currently `null`) and now wants to add a password:

1. The user provides a new password in their settings.
2. You hash it and update the `password` column in the `User` table.
3. **Result:** The user can now log in using either the "Login with Facebook" button (via the `UserIdentity` table) OR by typing their email and new password (via the `User` table).

### Summary of Benefits

* **Scalability:** To add Google, you just insert a row with `provider: 'google'` into `UserIdentity`. No schema changes required.
* **Cleanliness:** Your `User` entity isn't cluttered with `googleId`, `appleId`, `githubId`, etc.
* **Flexibility:** Users can link/unlink multiple social accounts without losing their primary profile.

Would you like me to show you the NestJS service logic for handling the "Account Merging" part when a user logs in?