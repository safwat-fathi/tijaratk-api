import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import CONSTANTS from 'src/common/constants';
import { Events } from 'src/common/enums/events.enum';
import { UserLoginEvent } from 'src/events/user-login.event';
import { FacebookService } from 'src/facebook/facebook.service';
import { FacebookUser } from 'src/types/facebook-user.interface';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';

import { LoginDto, SignupDto } from './dto/auth.dto';
import { User } from '../users/entities/user.entity';
import { UserSession } from '../users/entities/user-session.entity';
import {
  UserIdentity,
  SocialProvider,
} from '../users/entities/user-identity.entity';
@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserSession)
    private readonly sessionRepository: Repository<UserSession>,
    @InjectRepository(UserIdentity)
    private readonly identityRepository: Repository<UserIdentity>,
    private readonly jwtService: JwtService,
    private readonly facebookService: FacebookService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async signup(signupDto: SignupDto) {
    const existingUser = await this.userRepository.findOne({
      where: [{ email: signupDto.email }],
    });

    if (signupDto.password !== signupDto.confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }

    const user = this.userRepository.create({
      email: signupDto.email,
      password: signupDto.password,
      first_name: signupDto.firstName,
      last_name: signupDto.lastName,
      // facebookId removed

      is_active: true, // later we will add email verification
    });

    return this.userRepository.save(user);
  }

  async setPassword(userId: number, password: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new BadRequestException('User not found');
    }

    return this.userRepository.save(user);
  }

  async login(loginDto: LoginDto) {
    const user = await this.userRepository.findOne({
      where: { email: loginDto.email },
      select: [
        'id',
        'email',
        'password',
        'first_name',
        'last_name',
        'is_active',
      ],
    });

    if (!user) {
      throw new BadRequestException('Invalid credentials');
    }

    if (!user.password) {
      throw new BadRequestException('Invalid credentials'); // User might have only FB login
    }

    const isMatch = await bcrypt.compare(loginDto.password, user.password);

    if (!isMatch) {
      throw new BadRequestException('Invalid credentials');
    }

    // Reuse existing logic to create JWTs
    // Check session limit etc
    const tokens = await this.createJwtForUser(user);

    // Remove password from response
    delete user.password;

    return {
      ...tokens,
      user,
    };
  }

  async refresh(refreshToken: string) {
    // Decode the token to get the payload even if expired (handled by validateRefreshToken?)
    // We actually need the user ID or some identifier to look up the session correctly.
    // But here we rely on the controller to pass the token.

    // Since validateRefreshToken needs facebookId (which is the 'sub' in the token),
    // we need to decode it first safely.
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

    // Rotate tokens
    const newTokens = await this.createJwtForUser(user);

    return newTokens;
  }

  async validateRefreshToken(userId: number, refreshToken: string) {
    // Reuse validateRefreshToken but slightly modified to fit the new flow if needed
    // The original validateRefreshToken took facebookId
    // We should keep it compatible
    const session = await this.sessionRepository.findOne({
      where: { user: { id: userId } },
    });

    if (!session) {
      throw new BadRequestException('Business is not logged in.');
    }

    if (session.token !== refreshToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // Check if the refresh token has expired
    if (session.created_at.getTime() + 1000 * 60 * 60 * 24 * 7 < Date.now()) {
      // Refresh token expired
      await this.sessionRepository.delete(session.id);
      throw new UnauthorizedException('Refresh token expired');
    }

    return session;
  }

  async validateFacebookUser(facebookUser: FacebookUser): Promise<User> {
    const { facebookId, email } = facebookUser;

    // 1. Try to find by Facebook Identity first (Primary match for FB Login)
    const existingIdentity = await this.identityRepository.findOne({
      where: { provider: SocialProvider.FACEBOOK, providerId: facebookId },
      relations: ['user'],
    });

    if (existingIdentity) {
      // Update the access token
      existingIdentity.accessToken = facebookUser.accessToken;
      await this.identityRepository.save(existingIdentity);
      return existingIdentity.user;
    }

    // 2. If not found by FB ID, try to find by Email (Account Linking)
    if (email) {
      const userByEmail = await this.userRepository.findOne({
        where: { email },
      });

      if (userByEmail) {
        // Found by email, create identity and link to existing user
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

    // 3. If user does not exist, create a new User AND UserIdentity
    const newUser = this.userRepository.create({
      email: email,
      first_name: facebookUser.firstName,
      last_name: facebookUser.lastName,
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

  /**
   * Link a Facebook account to an existing user (for authenticated users).
   * This is different from validateFacebookUser which is for login/signup flows.
   */
  async linkFacebookAccount(
    userId: number,
    facebookUser: FacebookUser,
  ): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    // Check if this Facebook ID is already linked to another user
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

    // If identity already exists for this user, update the token
    if (existingIdentity && existingIdentity.user.id === userId) {
      existingIdentity.accessToken = facebookUser.accessToken;
      await this.identityRepository.save(existingIdentity);
      return user;
    }

    // Create new identity
    const identity = this.identityRepository.create({
      provider: SocialProvider.FACEBOOK,
      providerId: facebookUser.facebookId,
      accessToken: facebookUser.accessToken,
      user: user,
    });
    await this.identityRepository.save(identity);

    return user;
  }

  // after login get user pages, get long-lived access token and create jwt
  async afterLogin(user: FacebookUser) {
    // Find user by their Facebook identity
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

    // Trigger login event
    this.eventEmitter.emit(
      Events.USER_LOGGED_IN,
      new UserLoginEvent(identity.user.id),
    );

    const jwt = await this.createJwtForUser(identity.user);
    await this.facebookService.getLongLivedAccessToken(
      identity.user.id,
      identity.providerId, // This is the facebookId
    );
    await this.facebookService.getUserPages(identity.user.id);

    return jwt;
  }

  async logout(userId: number) {
    await this.sessionRepository.delete({ user: { id: userId } });
  }

  async createJwtForUser(user: User) {
    // 3. Retrieve all existing sessions for this user
    const sessions = await this.sessionRepository.find({
      where: { user: { id: user.id } },
    });

    // 4. Filter out (and remove) expired sessions
    const now = Date.now();

    for (const session of sessions) {
      if (
        session.created_at.getTime() + CONSTANTS.SESSION.EXPIRATION_TIME <
        now
      ) {
        // Session is expired -> remove from DB
        await this.sessionRepository.delete(session.id);
      }
    }

    // 5. Retrieve sessions again (active only) to see how many remain
    const activeSessions = await this.sessionRepository.find({
      where: { user: { id: user.id } },
    });

    // 6. If 3 active sessions remain, decide how to handle
    if (activeSessions.length >= 3) {
      // Option A: Throw error
      // throw new BadRequestException('Maximum device limit reached. Please logout on another device first.');

      // Option B: Remove oldest session automatically
      const oldest = activeSessions.reduce(
        (prev, current) =>
          prev.created_at < current.created_at ? prev : current,
        { created_at: new Date(), id: '' },
      );
      await this.sessionRepository.delete(oldest.id);
    }

    // 7. Generate an access token (short-lived) and a refresh token (or same token) here
    // Include the numeric user id in the payload for controllers that need it
    const payload = {
      sub: user.id,
      email: user.email,
    };
    // const access_token = user.accessToken;
    const access_token = this.jwtService.sign(payload, {
      expiresIn: CONSTANTS.SESSION.EXPIRATION_TIME,
    });

    // We store the "refresh token" or session token with 10 minutes validity in DB
    const refresh_token = this.jwtService.sign(payload, {
      expiresIn: CONSTANTS.SESSION.REFRESH_TOKEN_EXPIRATION_TIME,
    });

    // 8. Create a new session record with 10-minute expiry in mind
    const session = this.sessionRepository.create({
      user: user,
      token: refresh_token,
    });

    await this.sessionRepository.save(session);

    return {
      access_token,
      refresh_token,
      user,
    };
  }
}
