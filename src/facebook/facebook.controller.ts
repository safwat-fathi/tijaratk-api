import {
  Body,
  Controller,
  Get,
  Logger,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import { ApiExcludeEndpoint, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';

import { FacebookService } from './facebook.service';

@ApiTags('Facebook')
@Controller('facebook')
export class FacebookController {
  private readonly logger = new Logger(FacebookController.name);
  private readonly verifyToken = process.env.FACEBOOK_WEBHOOK_VERIFY_TOKEN; // Replace with your Verify Token
  constructor(private readonly facebookService: FacebookService) {}

  // constructor() {}
  // @ApiBearerAuth(CONSTANTS.ACCESS_TOKEN)
  // @UseGuards(AuthGuard(CONSTANTS.AUTH.JWT))
  // @Get('pages')
  // async getPages(@Request() req: ExpressRequest) {
  //   const { facebookId } = req.user;
  //   console.log('🚀 ~ FacebookController ~ getPages ~ facebookId:', facebookId);
  //   return await this.facebookService.getUserPages(facebookId);
  // }

  @ApiExcludeEndpoint()
  @Get('/webhook')
  verifyWebhook(@Query() query: any, @Res() res: Response) {
    const mode = query['hub.mode'];
    const token = query['hub.verify_token'];
    const challenge = query['hub.challenge'];

    if (mode === 'subscribe' && token === this.verifyToken) {
      this.logger.log('Webhook verified successfully');
      return res.status(200).send(challenge);
    } else {
      this.logger.error('Webhook verification failed');
      return res.sendStatus(403);
    }
  }

  @ApiExcludeEndpoint()
  @Post('/webhook')
  async handleWebhook(@Body() body: any, @Res() res: Response) {
    await this.facebookService.handleWebhook(body);
    return res.sendStatus(200);
  }
}
