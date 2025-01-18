import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags } from '@nestjs/swagger';
import CONSTANTS from 'src/common/constants';

import { AuthService } from './auth.service';

// import { CsrfGuard } from 'src/common/guards/csrf.guard';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // // logout
  // @ApiBearerAuth(CONSTANTS.ACCESS_TOKEN)
  // @UseGuards(AuthGuard('jwt'))
  // @Get('/logout')
  // @HttpCode(204)
  // @ApiOperation({ summary: 'Logout user and revoke refresh token' })
  // @ApiResponse({ status: 204, description: 'Return no content response.' })
  // @ApiResponse({ status: 404, description: 'Not logged in user' })
  // @ApiResponse({ status: 400, description: 'Bad request.' })
  // async logout(@Req() req: Request) {
  //   const { facebookId } = req.user;

  //   await this.authService.logout(facebookId);
  // }

  // @ApiBearerAuth(CONSTANTS.ACCESS_TOKEN)
  // @UseGuards(AuthGuard('jwt'))
  // @Post('/refresh')
  // @HttpCode(200)
  // @ApiOperation({ summary: 'Refresh token' })
  // @ApiBody({
  //   schema: {
  //     type: 'object',
  //     properties: {
  //       refresh_token: { type: 'string' },
  //     },
  //     required: ['refresh_token'],
  //   },
  // })
  // @ApiResponse({
  //   status: 200,
  //   description: 'Return the new access token and refresh token.',
  //   schema: {
  //     type: 'object',
  //     properties: {
  //       access_token: { type: 'string' },
  //       refresh_token: { type: 'string' },
  //     },
  //   },
  // })
  // @ApiResponse({ status: 400, description: 'Invalid refresh token.' })
  // @ApiResponse({ status: 404, description: 'Business not logged in.' })
  // async refresh(@Body() body: { refresh_token: string }, @Req() req: Request) {
  //   const { facebookId } = req.user;

  //   return this.authService.refresh(facebookId, body.refresh_token);
  // }

  // Initiate Facebook Authentication
  @Get('facebook')
  @UseGuards(AuthGuard(CONSTANTS.AUTH.FACEBOOK))
  async facebookLogin() {}

  // Facebook Callback URL
  @Get('facebook/callback')
  @UseGuards(AuthGuard(CONSTANTS.AUTH.FACEBOOK))
  async facebookLoginCallback(@Req() req) {
    // Successful authentication here
    // You can generate JWT tokens or perform additional signup/login logic here
    const user = req.user;

    // Possibly use AuthService to create tokens or update user data
    return this.authService.createJwtForUser(user);
  }
}
