import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import CONSTANTS from 'src/common/constants';
import { FacebookService } from 'src/facebook/facebook.service';
import { FacebookUser } from 'src/types/facebook-user.interface';
import { Repository } from 'typeorm';

import { User } from './entities/user.entity';
import { UserSession } from './entities/user-session.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly facebookService: FacebookService,
    // private readonly emailService: EmailService,

    @InjectRepository(UserSession)
    private readonly sessionRepository: Repository<UserSession>,
  ) {}

  // async sessionExist(facebookId: string) {
  //   const exists = await this.sessionRepository.exists({
  //     where: { user: { facebookId: facebookId } },
  //   });

  //   return exists;
  // }

  async validateRefreshToken(facebookId: string, refreshToken: string) {
    const session = await this.sessionRepository.findOne({
      where: { user: { facebookId: facebookId } },
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
    // Attempt to find a user by Facebook ID or email
    let user = await this.userRepository.findOne({
      where: [
        { email: facebookUser.email },
        { facebookId: facebookUser.facebookId },
      ],
    });

    // If user exists, return it
    if (user) return user;

    // If user does not exist, create a new one using Facebook details
    user = this.userRepository.create({
      email: facebookUser.email,
      first_name: facebookUser.firstName,
      last_name: facebookUser.lastName,
      facebookId: facebookUser.facebookId,
      fb_access_token: facebookUser.accessToken,
    });

    // Save the new user in the database
    await this.userRepository.save(user);

    return user;
  }

  // after login get user pages, get long-lived access token and create jwt
  async afterLogin(user: FacebookUser) {
    const jwt = await this.createJwtForUser(user);
    await this.facebookService.getLongLivedAccessToken(user.facebookId);
    await this.facebookService.getUserPages(user.facebookId);

    delete jwt.user.accessToken;

    return jwt;
  }

  async createJwtForUser(user: FacebookUser) {
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // 3. Retrieve all existing sessions for this user
    const sessions = await this.sessionRepository.find({
      where: { user: { facebookId: user.facebookId } },
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
      where: { user: { facebookId: user.facebookId } },
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
    const payload = { sub: user.facebookId, email: user.email };
    // const access_token = user.accessToken;
    const access_token = this.jwtService.sign(payload, {
      expiresIn: CONSTANTS.SESSION.EXPIRATION_TIME,
    });

    // We store the "refresh token" or session token with 10 minutes validity in DB
    const refresh_token = this.jwtService.sign(payload, {
      expiresIn: CONSTANTS.SESSION.EXPIRATION_TIME,
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
