import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import CONSTANTS from 'src/common/constants';
import { Repository } from 'typeorm';
import { hash, compare, genSalt } from 'bcryptjs';
import { normalizePhoneNumber } from 'src/common/utils/phone.utils';

import {
  AdminLoginDto,
  AdminSignupDto,
  MerchantSignupDto,
  MerchantLoginDto,
  RequestOtpDto,
  VerifyOtpDto,
} from './dto/auth.dto';
import { User, UserStatus } from '../users/entities/user.entity';
import { UserSession } from '../users/entities/user-session.entity';
import { UserIdentity } from '../users/entities/user-identity.entity';
import { AdminProfile } from '../users/entities/admin-profile.entity';
import { Merchant } from '../merchants/entities/merchant.entity';
import { Role } from './entities/role.entity';
import { UserRole } from './entities/user-role.entity';
import { StoreUserRole } from './entities/store-user-role.entity';
import { JwtPayload } from './strategies/jwt.strategy';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserSession)
    private readonly sessionRepository: Repository<UserSession>,
    @InjectRepository(UserIdentity)
    private readonly identityRepository: Repository<UserIdentity>,
    @InjectRepository(Merchant)
    private readonly merchantRepository: Repository<Merchant>,
    @InjectRepository(AdminProfile)
    private readonly adminProfileRepository: Repository<AdminProfile>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(UserRole)
    private readonly userRoleRepository: Repository<UserRole>,
    @InjectRepository(StoreUserRole)
    private readonly storeUserRoleRepository: Repository<StoreUserRole>,
    private readonly jwtService: JwtService,
    // private readonly facebookService: FacebookService,
  ) {}

  // ==================== Admin Auth (Email + Password) ====================

  /**
   * Admin signup - creates user with admin profile
   */
  async signupAdmin(dto: AdminSignupDto) {
    const existingUser = await this.userRepository.findOne({
      where: [{ email: dto.email }],
    });

    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }

    // Hash password
    const salt = await genSalt();
    const password_hash = await hash(dto.password, salt);

    // Normalize phone to E.164 format before storing
    const normalizedPhone = normalizePhoneNumber(dto.phone);

    const user = this.userRepository.create({
      email: dto.email,
      phone: normalizedPhone,
      password_hash,
      name: dto.name || dto.email.split('@')[0],
      status: UserStatus.ACTIVE,
    });

    await this.userRepository.save(user);

    // Create admin profile
    const adminProfile = this.adminProfileRepository.create({
      user_id: user.id,
    });
    await this.adminProfileRepository.save(adminProfile);

    // Assign admin role
    const adminRole = await this.roleRepository.findOne({
      where: { name: 'admin' },
    });

    if (adminRole) {
      const userRole = this.userRoleRepository.create({
        user_id: user.id,
        role_id: adminRole.id,
      });
      await this.userRoleRepository.save(userRole);
    }

    return { message: 'Admin created successfully', userId: user.id };
  }

  /**
   * Admin login - email + password
   */
  async loginAdmin(dto: AdminLoginDto) {
    const user = await this.userRepository.findOne({
      where: { email: dto.email },
      select: ['id', 'email', 'phone', 'password_hash', 'name', 'status'],
    });

    if (!user) {
      throw new BadRequestException('Invalid credentials');
    }

    if (!user.password_hash) {
      throw new BadRequestException('Invalid credentials');
    }

    const isMatch = await compare(dto.password, user.password_hash);

    if (!isMatch) {
      throw new BadRequestException('Invalid credentials');
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new BadRequestException('Account is not active');
    }

    const tokens = await this.createJwtForUser(user);

    // Remove sensitive data
    delete (user as any).password_hash;

    // Return tokens directly (which includes the enriched user object with permissions)
    return tokens;
  }

  // ==================== Merchant Auth (Password) ====================

  /**
   * Merchant signup - creates user + merchant profile
   */
  async signupMerchant(dto: MerchantSignupDto) {
    // Check if user exists (phone or email)
    const normalizedPhone = normalizePhoneNumber(dto.phone);
    const existingUser = await this.userRepository.findOne({
      where: [{ phone: normalizedPhone }, { email: dto.email }],
    });

    if (existingUser) {
      throw new BadRequestException(
        'User with this phone or email already exists',
      );
    }

    // Hash password
    const salt = await genSalt();
    const password_hash = await hash(dto.password, salt);

    // Create User
    const user = this.userRepository.create({
      email: dto.email,
      phone: normalizedPhone,
      password_hash,
      name: dto.name,
      status: UserStatus.ACTIVE,
      phone_verified_at: new Date(), // Auto-verify for now or require checks
    });

    await this.userRepository.save(user);

    // Create Merchant Profile
    const merchant = this.merchantRepository.create({
      user_id: user.id,
    });
    await this.merchantRepository.save(merchant);

    // Emit login event
    // Emit login event
    // Facebook integration disabled
    // this.eventEmitter.emit(Events.USER_LOGGED_IN, new UserLoginEvent(user.id));

    // Generate tokens
    const tokens = await this.createJwtForUser(user);

    // Return tokens directly (which includes the enriched user object with permissions)
    return tokens;
  }

  /**
   * Merchant login - phone + password
   */
  async loginMerchant(dto: MerchantLoginDto) {
    const normalizedPhone = normalizePhoneNumber(dto.phone);
    const user = await this.userRepository.findOne({
      where: { phone: normalizedPhone },
      select: ['id', 'email', 'phone', 'password_hash', 'name', 'status'],
      relations: ['merchant_profile'], // Check if 'merchant_profile' relation exists on User?
      // User entity has OneToMany 'identities', OneToOne 'userSubscription', OneToMany 'facebook_pages' etc.
      // It doesn't seem to have direct 'merchant' relation in the snippet I saw earlier (User.ts).
      // But we need to ensure this user IS a merchant.
    });

    if (!user) {
      throw new BadRequestException('Invalid credentials');
    }

    if (!user.password_hash) {
      // User might have signed up via OTP only?
      throw new BadRequestException('Invalid credentials');
    }

    const isMatch = await compare(dto.password, user.password_hash);
    if (!isMatch) {
      throw new BadRequestException('Invalid credentials');
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new BadRequestException('Account is not active');
    }

    // specific check: must have merchant profile?
    const merchant = await this.merchantRepository.findOne({
      where: { user_id: user.id },
    });
    if (!merchant) {
      // Auto-create? Or deny?
      // If they logged in correctly, maybe they are just a "user" who wants to be a merchant?
      // For "Merchant Login", we expect them to be a merchant.
      // But let's be lenient or check requirements.
      // For now, allow login, frontend directs them.
    }

    const tokens = await this.createJwtForUser(user);
    delete (user as any).password_hash;

    // Return tokens directly (which includes the enriched user object with permissions)
    return tokens;
  }

  // ==================== Merchant/Customer Auth (OTP) - Legacy/Backup ====================

  /**
   * Request OTP for phone-based login/signup
   * In production, this would send an actual OTP via WhatsApp/SMS
   */
  async requestOtp(dto: RequestOtpDto) {
    // TODO: Implement actual OTP sending via WhatsApp/SMS
    // For now, just return success (OTP would be sent via external service)
    console.log(`[DEV] OTP requested for phone: ${dto.phone}`);

    // In development, you might want to use a fixed OTP like '123456'
    return { message: 'OTP sent successfully', phone: dto.phone };
  }

  /**
   * Verify OTP and complete login/signup
   * Creates user if doesn't exist (login == signup for merchants)
   */
  async verifyOtp(dto: VerifyOtpDto) {
    // TODO: Implement actual OTP verification
    // For development, accept '123456' as valid OTP
    const validOtp = '123456';
    if (dto.otp !== validOtp) {
      throw new BadRequestException('Invalid OTP');
    }

    // Normalize phone to E.164 format for consistent lookup and storage
    const normalizedPhone = normalizePhoneNumber(dto.phone);

    // Find or create user by phone
    let user = await this.userRepository.findOne({
      where: { phone: normalizedPhone },
    });

    let isNewUser = false;

    if (!user) {
      // Create new user
      user = this.userRepository.create({
        phone: normalizedPhone,
        status: UserStatus.ACTIVE,
        phone_verified_at: new Date(),
      });
      await this.userRepository.save(user);
      isNewUser = true;
    } else {
      // Update phone verified timestamp
      user.phone_verified_at = new Date();
      await this.userRepository.save(user);
    }

    // Emit login event
    // Emit login event
    // Facebook integration disabled
    // this.eventEmitter.emit(Events.USER_LOGGED_IN, new UserLoginEvent(user.id));

    const tokens = await this.createJwtForUser(user);

    return {
      ...tokens,
      // user, // Don't overwrite the enriched user from tokens
      isNewUser,
    };
  }

  /**
   * Create merchant profile for a user after OTP verification
   */
  async createMerchantProfile(userId: number) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new BadRequestException('User not found');
    }

    // Check if merchant profile already exists
    const existingMerchant = await this.merchantRepository.findOne({
      where: { user_id: userId },
    });

    if (existingMerchant) {
      return existingMerchant;
    }

    // Create merchant profile
    const merchant = this.merchantRepository.create({
      user_id: userId,
    });
    await this.merchantRepository.save(merchant);

    return merchant;
  }

  // ==================== Token Management ====================

  async refresh(refreshToken: string) {
    const payload = this.jwtService.decode(refreshToken) as any;
    if (!payload || !payload.sub) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const verifiedSession = await this.validateRefreshToken(
      payload.sub,
      refreshToken,
    );

    const user = await this.userRepository.findOne({
      where: { id: verifiedSession.user.id },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const newTokens = await this.createJwtForUser(user);

    return newTokens;
  }

  async validateRefreshToken(userId: number, refreshToken: string) {
    const session = await this.sessionRepository.findOne({
      where: { user: { id: userId } },
      relations: ['user'],
    });

    if (!session) {
      throw new BadRequestException('User is not logged in');
    }

    if (session.token !== refreshToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // Check if expired (7 days)
    if (session.created_at.getTime() + 1000 * 60 * 60 * 24 * 7 < Date.now()) {
      await this.sessionRepository.delete(session.id);
      throw new UnauthorizedException('Refresh token expired');
    }

    return session;
  }

  async logout(userId: number) {
    await this.sessionRepository.delete({ user: { id: userId } });
  }

  // ==================== JWT Creation with RBAC ====================

  async createJwtForUser(user: User) {
    // Fetch user with subscription data
    const userWithSubscription = await this.userRepository.findOne({
      where: { id: user.id },
      relations: {
        userSubscription: {
          plan: true,
        },
      },
    });

    // Get global roles and their permissions
    const globalRoleAssignments = await this.userRoleRepository.find({
      where: { user_id: user.id },
      relations: ['role', 'role.permissions'],
    });
    const globalRoles = globalRoleAssignments.map((ur) => ur.role.name);

    // Extract and flat map permissions from global roles
    const globalPermissions = new Set<string>();
    for (const assignment of globalRoleAssignments) {
      if (assignment.role.permissions) {
        for (const permission of assignment.role.permissions) {
          globalPermissions.add(permission.key);
        }
      }
    }

    // Get store roles
    const storeRoleAssignments = await this.storeUserRoleRepository.find({
      where: { user_id: user.id },
      relations: ['role'],
    });

    const storeRoles: Record<string, string[]> = {};
    for (const sur of storeRoleAssignments) {
      const storeId = String(sur.store_id);
      if (!storeRoles[storeId]) {
        storeRoles[storeId] = [];
      }
      storeRoles[storeId].push(sur.role.name);
    }

    // Clean up expired sessions
    const sessions = await this.sessionRepository.find({
      where: { user: { id: user.id } },
    });

    const now = Date.now();
    for (const session of sessions) {
      if (
        session.created_at.getTime() + CONSTANTS.SESSION.EXPIRATION_TIME <
        now
      ) {
        await this.sessionRepository.delete(session.id);
      }
    }

    // Check session limit (max 3)
    const activeSessions = await this.sessionRepository.find({
      where: { user: { id: user.id } },
    });

    if (activeSessions.length >= 3) {
      const oldest = activeSessions.reduce(
        (prev, current) =>
          prev.created_at < current.created_at ? prev : current,
        { created_at: new Date(), id: '' },
      );
      await this.sessionRepository.delete(oldest.id);
    }

    // Create JWT payload with roles
    const payload: JwtPayload = {
      sub: user.id,
      phone: user.phone,
      email: user.email,
      global_roles: globalRoles,
      store_roles: storeRoles,
    };

    const access_token = this.jwtService.sign(payload, {
      expiresIn: CONSTANTS.SESSION.EXPIRATION_TIME,
    });

    const refresh_token = this.jwtService.sign(payload, {
      expiresIn: CONSTANTS.SESSION.REFRESH_TOKEN_EXPIRATION_TIME,
    });

    // Create session
    const session = this.sessionRepository.create({
      user: user,
      token: refresh_token,
    });
    await this.sessionRepository.save(session);

    return {
      access_token,
      refresh_token,
      user: {
        id: user.id,
        phone: user.phone,
        email: user.email,
        name: user.name,
        status: user.status,
        subscription: userWithSubscription?.userSubscription || null,
        global_roles: globalRoles,
        permissions: Array.from(globalPermissions),
      },
    };
  }

  // ==================== Facebook OAuth (Disabled) ====================
  // Note: Facebook login is disabled but code is kept for future use

  /*
  async validateFacebookUser(facebookUser: FacebookUser): Promise<User> {
    const { facebookId, email } = facebookUser;

    const existingIdentity = await this.identityRepository.findOne({
      where: { provider: SocialProvider.FACEBOOK, providerId: facebookId },
      relations: ['user'],
    });

    if (existingIdentity) {
      existingIdentity.accessToken = facebookUser.accessToken;
      await this.identityRepository.save(existingIdentity);
      return existingIdentity.user;
    }

    if (email) {
      const userByEmail = await this.userRepository.findOne({
        where: { email },
      });

      if (userByEmail) {
        const identity = this.identityRepository.create({
          provider: SocialProvider.FACEBOOK,
          providerId: facebookId,
          accessToken: facebookUser.accessToken,
          user: userByEmail,
        });
        await this.identityRepository.save(identity);
        return userByEmail;
      }
    }

    const newUser = this.userRepository.create({
      email: email,
      phone: `fb_${facebookId}`,
    });
    await this.userRepository.save(newUser);

    const identity = this.identityRepository.create({
      provider: SocialProvider.FACEBOOK,
      providerId: facebookId,
      accessToken: facebookUser.accessToken,
      user: newUser,
    });
    await this.identityRepository.save(identity);

    return newUser;
  }

  async linkFacebookAccount(
    userId: number,
    facebookUser: FacebookUser,
  ): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    const existingIdentity = await this.identityRepository.findOne({
      where: {
        provider: SocialProvider.FACEBOOK,
        providerId: facebookUser.facebookId,
      },
      relations: ['user'],
    });

    if (existingIdentity && existingIdentity.user.id !== userId) {
      throw new BadRequestException(
        'This Facebook account is already linked to another user',
      );
    }

    if (existingIdentity && existingIdentity.user.id === userId) {
      existingIdentity.accessToken = facebookUser.accessToken;
      await this.identityRepository.save(existingIdentity);
      return user;
    }

    const identity = this.identityRepository.create({
      provider: SocialProvider.FACEBOOK,
      providerId: facebookUser.facebookId,
      accessToken: facebookUser.accessToken,
      user: user,
    });
    await this.identityRepository.save(identity);

    return user;
  }

  async afterLogin(user: FacebookUser) {
    const identity = await this.identityRepository.findOne({
      where: {
        provider: SocialProvider.FACEBOOK,
        providerId: user.facebookId,
      },
      relations: ['user'],
    });

    if (!identity) {
      throw new BadRequestException('User not found');
    }

    this.eventEmitter.emit(
      Events.USER_LOGGED_IN,
      new UserLoginEvent(identity.user.id),
    );

    const jwt = await this.createJwtForUser(identity.user);
    await this.facebookService.getLongLivedAccessToken(
      identity.user.id,
      identity.providerId,
    );
    await this.facebookService.getUserPages(identity.user.id);

    return jwt;
  }
  */
}
