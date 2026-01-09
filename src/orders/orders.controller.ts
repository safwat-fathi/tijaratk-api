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

@Controller('storefronts/:storefrontId/orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  /*
  @Get()
  findAll(...) { ... }

  ... all other methods ...
  */
}
