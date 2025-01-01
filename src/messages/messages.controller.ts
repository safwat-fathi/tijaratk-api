import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
  HttpCode,
	HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';

import { AuthGuard } from '@nestjs/passport';

@ApiTags('messages')
@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @ApiBearerAuth('access_token')
  @UseGuards(AuthGuard('jwt'))
  @Post()
  @HttpCode(201)
  @ApiOperation({ summary: 'Create a new message' })
  @ApiResponse({ status: 201, description: 'Message created successfully' })
  create(@Body() dto: CreateMessageDto) {
    // return this.messagesService.create(dto);
    return '';
  }

  @ApiBearerAuth('access_token')
  @UseGuards(AuthGuard('jwt'))
  @Get()
  @ApiOperation({ summary: 'Retrieve all messages' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Array of messages' })
  findAll() {
    return this.messagesService.findAll();
  }

  @ApiBearerAuth('access_token')
  @UseGuards(AuthGuard('jwt'))
  @Get(':id')
  @ApiOperation({ summary: 'Retrieve a single message by ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Message object' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.messagesService.findOne(id);
  }
}
