import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-facebook';
import CONSTANTS from 'src/common/constants';

import { AuthService } from '../auth.service';

@Injectable()
export class FacebookStrategy extends PassportStrategy(
  Strategy,
  CONSTANTS.AUTH.FACEBOOK,
) {
  constructor(private readonly authService: AuthService) {
    super({
      clientID: process.env.FACEBOOK_APP_ID,
      clientSecret: process.env.FACEBOOK_APP_SECRET,
      callbackURL: process.env.FACEBOOK_CALLBACK_URL,
      profileFields: ['id', 'emails', 'name'], // specify fields you need
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
    });
  }

  async validate(
    accessToken: string,
    _refreshToken: string,
    profile: Profile,
    done: (error: any, user?: any, info?: any) => void,
  ): Promise<any> {
    // Extract necessary profile info
    const { id, emails, name } = profile;

    const user = {
      facebookId: id,
      email: emails && emails[0]?.value,
      firstName: name?.givenName,
      lastName: name?.familyName,
      accessToken,
    };

    // Use your AuthService to find or create a user
    const validatedUser = await this.authService.validateFacebookUser(user);

    done(null, { ...validatedUser, accessToken });
  }
}
