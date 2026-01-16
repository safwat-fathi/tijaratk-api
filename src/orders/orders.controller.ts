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
import { UpdatePaymentStatusDto } from './dto/update-payment-status.dto';
import { OrderStatus } from './entities/order.entity';
import { OrdersService } from './orders.service';

@Controller('stores/:storeId/orders')
@ApiTags('Store Orders')
@ApiBearerAuth(CONSTANTS.ACCESS_TOKEN)
@UseGuards(AuthGuard(CONSTANTS.AUTH.JWT))
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  @ApiOperation({ summary: 'Get all orders for a store' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of orders',
    type: [Object], // TODO: Update with Order response DTO
  })
  findAll(
    @Param('storeId') storeId: number,
    @Query() listOrdersDto: ListOrdersDto,
    @Req() req: Request,
  ) {
    // TODO: Verify merchant ownership
    return this.ordersService.findAll(storeId, listOrdersDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get order details' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Order details',
  })
  findOne(
    @Param('storeId') storeId: number,
    @Param('id') id: number,
    @Req() req: Request,
  ) {
    // TODO: Verify merchant ownership
    return this.ordersService.findOne(id, storeId);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update order status' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Order status updated',
  })
  updateStatus(
    @Param('storeId') storeId: number,
    @Param('id') id: number,
    @Body() updateOrderStatusDto: UpdateOrderStatusDto,
    @Req() req: Request,
  ) {
    // TODO: Verify merchant ownership
    return this.ordersService.updateStatus(id, storeId, updateOrderStatusDto);
  }

  @Patch(':id/payment-status')
  @ApiOperation({ summary: 'Update order payment status' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Order payment status updated',
  })
  updatePaymentStatus(
    @Param('storeId') storeId: number,
    @Param('id') id: number,
    @Body() updatePaymentStatusDto: UpdatePaymentStatusDto,
    @Req() req: Request,
  ) {
    // TODO: Verify merchant ownership
    return this.ordersService.updatePaymentStatus(
      id,
      storeId,
      updatePaymentStatusDto,
    );
  }

  @Patch(':id/tracking')
  @ApiOperation({ summary: 'Update order tracking info' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Order tracking updated',
  })
  updateTracking(
    @Param('storeId') storeId: number,
    @Param('id') id: number,
    @Body() updateOrderTrackingDto: UpdateOrderTrackingDto,
    @Req() req: Request,
  ) {
    // TODO: Verify merchant ownership
    return this.ordersService.updateTracking(
      id,
      storeId,
      updateOrderTrackingDto,
    );
  }

  @Patch(':id/notes')
  @ApiOperation({ summary: 'Update order notes' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Order notes updated',
  })
  updateNotes(
    @Param('storeId') storeId: number,
    @Param('id') id: number,
    @Body() updateOrderNotesDto: UpdateOrderNotesDto,
    @Req() req: Request,
  ) {
    // TODO: Verify merchant ownership
    return this.ordersService.updateNotes(id, storeId, updateOrderNotesDto);
  }
}
