import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-facebook';
import CONSTANTS from 'src/common/constants';

import { AuthService } from '../auth.service';

/**
 * Facebook OAuth Strategy
 *
 * NOTE: Facebook login is currently disabled.
 * This strategy is kept for future use but won't be called
 * since the Facebook endpoints in AuthController are commented out.
 */
@Injectable()
export class FacebookStrategy extends PassportStrategy(
  Strategy,
  CONSTANTS.AUTH.FACEBOOK,
) {
  constructor(private readonly authService: AuthService) {
    super({
      clientID: process.env.FACEBOOK_APP_ID || 'disabled',
      clientSecret: process.env.FACEBOOK_APP_SECRET || 'disabled',
      callbackURL: process.env.FACEBOOK_CALLBACK_URL || 'http://localhost',
      profileFields: ['id', 'emails', 'name'],
      scope: [
        'email',
        'public_profile',
        'pages_manage_engagement',
        'pages_show_list',
        'pages_read_engagement',
        'pages_manage_posts',
        'business_management',
        'pages_read_user_content',
        'pages_messaging',
      ],
      passReqToCallback: true,
    });
  }

  /**
   * Validate Facebook user callback.
   *
   * NOTE: This method is currently not called since Facebook endpoints are disabled.
   * When enabling Facebook OAuth:
   * 1. Uncomment the Facebook endpoints in AuthController
   * 2. Uncomment validateFacebookUser in AuthService
   * 3. This validate method will then be called by Passport
   */
  async validate(
    req: any,
    accessToken: string,
    _refreshToken: string,
    profile: Profile,
    done: (error: any, user?: any, info?: any) => void,
  ): Promise<any> {
    const { id, emails, name } = profile;

    const user = {
      facebookId: id,
      email: emails && emails[0]?.value,
      firstName: name?.givenName,
      lastName: name?.familyName,
      accessToken,
    };

    // For linking requests, just return the facebook user object
    if (req.query.state) {
      try {
        const state = JSON.parse(
          Buffer.from(req.query.state, 'base64').toString(),
        );
        if (state.linkUserId) {
          return done(null, user);
        }
      } catch (e) {
        // Ignore JSON parse errors, treat as normal login
      }
    }

    // NOTE: validateFacebookUser is currently commented out in AuthService
    // Uncomment it when enabling Facebook OAuth
    // const validatedUser = await this.authService.validateFacebookUser(user);
    // done(null, { ...validatedUser, accessToken });

    // For now, just return the user object (won't be called anyway)
    done(null, user);
  }
}
