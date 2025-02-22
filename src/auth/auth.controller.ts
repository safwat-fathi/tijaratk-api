import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiExcludeEndpoint, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
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

  // logout
  @ApiBearerAuth(CONSTANTS.ACCESS_TOKEN)
  @UseGuards(AuthGuard(CONSTANTS.AUTH.JWT))
  @Get('/logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(@Req() req: Request) {
    const { facebookId } = req.user;

    await this.authService.logout(facebookId);
  }

  // Initiate Facebook Authentication
  @ApiExcludeEndpoint()
  @Get('facebook')
  @UseGuards(AuthGuard(CONSTANTS.AUTH.FACEBOOK))
  async facebookLogin() {}

  // Facebook Callback URL
  @ApiExcludeEndpoint()
  @Get('facebook/callback')
  @UseGuards(AuthGuard(CONSTANTS.AUTH.FACEBOOK))
  @HttpCode(HttpStatus.FOUND)
  async facebookLoginCallback(@Req() req, @Res() res) {
    // Successful authentication here
    const user = req.user;

    // return await this.authService.afterLogin(user);
    const tokens = await this.authService.afterLogin(user);

    return res.redirect(
      `${process.env.CLIENT_URL}/auth/facebook?access_token=${tokens.access_token}&refresh_token=${tokens.refresh_token}`,
    );
  }
}
