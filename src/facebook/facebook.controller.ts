import {
  Body,
  Controller,
  Get,
  Logger,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import { Response } from 'express';

@Controller('facebook')
export class FacebookController {
  private readonly logger = new Logger(FacebookController.name);
  private readonly verifyToken = process.env.FACEBOOK_WEBHOOK_VERIFY_TOKEN; // Replace with your Verify Token

  // constructor(private readonly facebookService: FacebookService) {}
  // @ApiBearerAuth(CONSTANTS.ACCESS_TOKEN)
  // @UseGuards(AuthGuard(CONSTANTS.AUTH.JWT))
  // @Get('pages')
  // async getPages(@Request() req: ExpressRequest) {
  //   const { facebookId } = req.user;
  //   console.log('🚀 ~ FacebookController ~ getPages ~ facebookId:', facebookId);
  //   return await this.facebookService.getUserPages(facebookId);
  // }

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

  @Post('/webhook')
  handleWebhook(@Body() body: any, @Res() res: Response) {
    this.logger.log('Webhook Event Received:', JSON.stringify(body, null, 2));
    // Handle the event (e.g., comments, messages)
    if (body.object === 'page') {
      body.entry.forEach((entry) => {
        entry.messaging?.forEach((event) => {
          this.logger.log('Message event:', event);
        });

        entry.changes?.forEach((change) => {
          this.logger.log('Change event:', change);
        });
      });
    }

    return res.sendStatus(200);
  }
}
