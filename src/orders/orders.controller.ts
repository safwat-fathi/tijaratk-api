import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Patch,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Request } from 'express';
import CONSTANTS from 'src/common/constants';

import { ListOrdersDto } from './dto/list-orders.dto';
import { UpdateOrderNotesDto } from './dto/update-order-notes.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { UpdateOrderTrackingDto } from './dto/update-order-tracking.dto';
import { OrderStatus } from './entities/order.entity';
import { OrdersService } from './orders.service';

@ApiTags('Storefront Orders')
@ApiBearerAuth(CONSTANTS.ACCESS_TOKEN)
@UseGuards(AuthGuard(CONSTANTS.AUTH.JWT))
@Controller('storefronts/:storefrontId/orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  @ApiOperation({ summary: 'List orders for a storefront (owner only)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of orders for the storefront',
  })
  findAll(
    @Param('storefrontId') storefrontId: number,
    @Query() query: ListOrdersDto,
    @Req() req: Request,
  ) {
    const { facebookId } = req.user;

    return this.ordersService.findForStorefrontOwner(
      facebookId,
      storefrontId,
      query,
    );
  }

  @Get(':orderId')
  @ApiOperation({ summary: 'Get a single order for a storefront (owner only)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Order details',
  })
  findOne(
    @Param('storefrontId') storefrontId: number,
    @Param('orderId') orderId: number,
    @Req() req: Request,
  ) {
    const { facebookId } = req.user;

    return this.ordersService.findOneForStorefrontOwner(
      facebookId,
      storefrontId,
      orderId,
    );
  }

  @Patch(':orderId/status')
  @ApiOperation({ summary: 'Update order status (owner only)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Order status updated',
  })
  updateStatus(
    @Param('storefrontId') storefrontId: number,
    @Param('orderId') orderId: number,
    @Body() dto: UpdateOrderStatusDto,
    @Req() req: Request,
  ) {
    const { facebookId } = req.user;

    return this.ordersService.updateStatusForStorefrontOwner(
      facebookId,
      storefrontId,
      orderId,
      dto.status,
    );
  }

  @Patch(':orderId/accept')
  @ApiOperation({ summary: 'Accept order (set status to confirmed)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Order accepted',
  })
  accept(
    @Param('storefrontId') storefrontId: number,
    @Param('orderId') orderId: number,
    @Req() req: Request,
  ) {
    const { facebookId } = req.user;

    return this.ordersService.updateStatusForStorefrontOwner(
      facebookId,
      storefrontId,
      orderId,
      OrderStatus.CONFIRMED,
    );
  }

  @Patch(':orderId/reject')
  @ApiOperation({ summary: 'Reject order (set status to cancelled)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Order rejected',
  })
  reject(
    @Param('storefrontId') storefrontId: number,
    @Param('orderId') orderId: number,
    @Req() req: Request,
  ) {
    const { facebookId } = req.user;

    return this.ordersService.updateStatusForStorefrontOwner(
      facebookId,
      storefrontId,
      orderId,
      OrderStatus.CANCELLED,
    );
  }

  @Patch(':orderId/mark-paid')
  @ApiOperation({ summary: 'Mark order as paid' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Order marked as paid',
  })
  markPaid(
    @Param('storefrontId') storefrontId: number,
    @Param('orderId') orderId: number,
    @Req() req: Request,
  ) {
    const { facebookId } = req.user;

    return this.ordersService.markAsPaid(facebookId, storefrontId, orderId);
  }

  @Patch(':orderId/mark-shipped')
  @ApiOperation({ summary: 'Mark order as shipped with optional tracking' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Order marked as shipped',
  })
  markShipped(
    @Param('storefrontId') storefrontId: number,
    @Param('orderId') orderId: number,
    @Body() dto: UpdateOrderTrackingDto,
    @Req() req: Request,
  ) {
    const { facebookId } = req.user;

    return this.ordersService.markAsShipped(
      facebookId,
      storefrontId,
      orderId,
      dto.tracking_number,
    );
  }

  @Patch(':orderId/mark-delivered')
  @ApiOperation({ summary: 'Mark order as delivered' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Order marked as delivered',
  })
  markDelivered(
    @Param('storefrontId') storefrontId: number,
    @Param('orderId') orderId: number,
    @Req() req: Request,
  ) {
    const { facebookId } = req.user;

    return this.ordersService.markAsDelivered(
      facebookId,
      storefrontId,
      orderId,
    );
  }

  @Patch(':orderId/notes')
  @ApiOperation({ summary: 'Update internal notes' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Internal notes updated',
  })
  updateNotes(
    @Param('storefrontId') storefrontId: number,
    @Param('orderId') orderId: number,
    @Body() dto: UpdateOrderNotesDto,
    @Req() req: Request,
  ) {
    const { facebookId } = req.user;

    return this.ordersService.updateInternalNotes(
      facebookId,
      storefrontId,
      orderId,
      dto.internal_notes,
    );
  }
}
