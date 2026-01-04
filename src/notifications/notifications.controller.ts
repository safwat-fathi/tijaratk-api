import {
  Body,
  Controller,
  Get,
  Headers,
  HttpStatus,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { Request } from 'express';
import CONSTANTS from 'src/common/constants';

import { ListNotificationsDto } from './dto/list-notifications.dto';
import { NotificationsService } from './notifications.service';
import { WebPushService } from './web-push.service';

@Controller('notifications')
@ApiBearerAuth(CONSTANTS.ACCESS_TOKEN)
export class NotificationsController {
  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly webPushService: WebPushService,
  ) {}

  // ================== PUBLIC ENDPOINTS ==================

  @Get('vapid-public-key')
  @ApiOperation({ summary: 'Get VAPID public key for push subscription' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns the VAPID public key',
  })
  getVapidPublicKey() {
    return { publicKey: this.webPushService.getVapidPublicKey() };
  }

  // ================== PROTECTED ENDPOINTS ==================

  @Get()
  @UseGuards(AuthGuard(CONSTANTS.AUTH.JWT))
  @ApiOperation({ summary: 'Get all notifications' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Get all notifications',
  })
  findAll(
    @Query() listNotificationsDto: ListNotificationsDto,
    @Req() req: Request,
  ) {
    const userId = Number(req.user.id);

    return this.notificationsService.getUserNotifications(
      userId,
      listNotificationsDto,
    );
  }

  @Get('/read')
  @UseGuards(AuthGuard(CONSTANTS.AUTH.JWT))
  @ApiOperation({ summary: 'Mark a notification as read' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Mark a notification as read',
  })
  markAsRead(@Query('notificationId') notificationId: number) {
    return this.notificationsService.markNotificationAsRead(notificationId);
  }

  @Get('/unread')
  @UseGuards(AuthGuard(CONSTANTS.AUTH.JWT))
  @ApiOperation({ summary: 'Mark a notification as unread' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Mark a notification as unread',
  })
  markAsUnread(@Query('notificationId') notificationId: number) {
    return this.notificationsService.markNotificationAsUnRead(notificationId);
  }

  @Get('/delete')
  @UseGuards(AuthGuard(CONSTANTS.AUTH.JWT))
  @ApiOperation({ summary: 'Delete a notification' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Delete a notification',
  })
  deleteNotification(@Query('notificationId') notificationId: number) {
    return this.notificationsService.deleteNotification(notificationId);
  }

  @Get('/count')
  @UseGuards(AuthGuard(CONSTANTS.AUTH.JWT))
  @ApiOperation({ summary: 'Count unread notifications' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Count unread notifications',
  })
  countUnreadNotifications(@Req() req: Request) {
    const userId = Number(req.user.id);

    return this.notificationsService.countUnreadNotifications(userId);
  }

  @Get('/clear')
  @UseGuards(AuthGuard(CONSTANTS.AUTH.JWT))
  @ApiOperation({ summary: 'Clear all notifications' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Clear all notifications',
  })
  clearAllNotifications(@Req() req: Request) {
    const userId = Number(req.user.id);

    return this.notificationsService.clearNotifications(userId);
  }

  @Get('/read-all')
  @UseGuards(AuthGuard(CONSTANTS.AUTH.JWT))
  @ApiOperation({ summary: 'Mark all notifications as read' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Mark all notifications as read',
  })
  markAllNotificationsAsRead(
    @Req() req: Request,
    @Query('type') type?: string,
  ) {
    const userId = Number(req.user.id);

    return this.notificationsService.markAllAsRead(userId, type);
  }

  // ================== PUSH NOTIFICATION ENDPOINTS ==================

  @Post('push/subscribe')
  @UseGuards(AuthGuard(CONSTANTS.AUTH.JWT))
  @ApiOperation({ summary: 'Subscribe to push notifications' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        endpoint: { type: 'string' },
        keys: {
          type: 'object',
          properties: {
            p256dh: { type: 'string' },
            auth: { type: 'string' },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Successfully subscribed to push notifications',
  })
  async subscribeToPush(
    @Body() body: { endpoint: string; keys: { p256dh: string; auth: string } },
    @Req() req: Request,
    @Headers('user-agent') userAgent: string,
  ) {
    const userId = Number(req.user.id);
    return this.webPushService.subscribe(userId, body, userAgent);
  }

  @Post('push/unsubscribe')
  @UseGuards(AuthGuard(CONSTANTS.AUTH.JWT))
  @ApiOperation({ summary: 'Unsubscribe from push notifications' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        endpoint: { type: 'string' },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Successfully unsubscribed from push notifications',
  })
  async unsubscribeFromPush(@Body() body: { endpoint: string }) {
    await this.webPushService.unsubscribe(body.endpoint);
    return { success: true };
  }

  @Get('push/status')
  @UseGuards(AuthGuard(CONSTANTS.AUTH.JWT))
  @ApiOperation({ summary: 'Get push notification subscription status' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns subscription count for the user',
  })
  async getPushStatus(@Req() req: Request) {
    const userId = Number(req.user.id);
    const count = await this.webPushService.getSubscriptionCount(userId);
    return { subscribed: count > 0, deviceCount: count };
  }
}

