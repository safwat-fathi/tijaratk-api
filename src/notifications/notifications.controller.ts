import {
  Controller,
  Get,
  HttpStatus,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Request } from 'express';
import CONSTANTS from 'src/common/constants';

import { ListNotificationsDto } from './dto/list-notifications.dto';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
@ApiBearerAuth(CONSTANTS.ACCESS_TOKEN)
@UseGuards(AuthGuard(CONSTANTS.AUTH.JWT))
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all notifications' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Get all notifications',
  })
  findAll(
    @Query() listNotificationsDto: ListNotificationsDto,
    @Req() req: Request,
  ) {
    const { facebookId } = req.user;

    return this.notificationsService.getUserNotifications(
      facebookId,
      listNotificationsDto,
    );
  }

  @Get('/read')
  @ApiOperation({ summary: 'Mark a notification as read' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Mark a notification as read',
  })
  markAsRead(@Query('notificationId') notificationId: number) {
    return this.notificationsService.markNotificationAsRead(notificationId);
  }

  @Get('/unread')
  @ApiOperation({ summary: 'Mark a notification as unread' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Mark a notification as unread',
  })
  markAsUnread(@Query('notificationId') notificationId: number) {
    return this.notificationsService.markNotificationAsUnRead(notificationId);
  }

  @Get('/delete')
  @ApiOperation({ summary: 'Delete a notification' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Delete a notification',
  })
  deleteNotification(@Query('notificationId') notificationId: number) {
    return this.notificationsService.deleteNotification(notificationId);
  }

  @Get('/count')
  @ApiOperation({ summary: 'Count unread notifications' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Count unread notifications',
  })
  countUnreadNotifications(@Req() req: Request) {
    const { facebookId } = req.user;

    return this.notificationsService.countUnreadNotifications(facebookId);
  }

  @Get('/clear')
  @ApiOperation({ summary: 'Clear all notifications' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Clear all notifications',
  })
  clearAllNotifications(@Req() req: Request) {
    const { facebookId } = req.user;

    return this.notificationsService.clearNotifications(facebookId);
  }

  @Get('/read-all')
  @ApiOperation({ summary: 'Mark all notifications as read' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Mark all notifications as read',
  })
  markAllNotificationsAsRead(@Req() req: Request) {
    const { facebookId } = req.user;

    return this.notificationsService.markAllAsRead(facebookId);
  }
}
