import {
  Body,
  Controller,
  Get,
  Logger,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiExcludeEndpoint, ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';
import CONSTANTS from 'src/common/constants';

import { FacebookService } from './facebook.service';

@ApiTags('Facebook')
@Controller('facebook')
export class FacebookController {
  private readonly logger = new Logger(FacebookController.name);
  private readonly verifyToken = process.env.FACEBOOK_WEBHOOK_VERIFY_TOKEN; // Replace with your Verify Token
  constructor(private readonly facebookService: FacebookService) {}

  @ApiBearerAuth(CONSTANTS.ACCESS_TOKEN)
  @UseGuards(AuthGuard(CONSTANTS.AUTH.JWT))
  @Get('pages')
  async getPages(@Req() req: Request) {
    const { facebookId } = req.user;

    return await this.facebookService.getUserPages(facebookId);
  }

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
