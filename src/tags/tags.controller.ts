import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, UseGuards, HttpStatus } from '@nestjs/common';
import { TagsService } from './tags.service';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('Tags')
@Controller('tags')
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  // @ApiBearerAuth('access_token')
  // @UseGuards(AuthGuard('jwt'))
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Post()
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'The record has been successfully created.',
  })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden.' })
  create(@Body() createTagDto: CreateTagDto) {
    return this.tagsService.create(createTagDto);
  }

  // @ApiBearerAuth('access_token')
  // @UseGuards(AuthGuard('jwt'))
  @Get()
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List all tags',
  })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden.' })
  findAll() {
    return this.tagsService.findAll();
  }

  // @ApiBearerAuth('access_token')
  // @UseGuards(AuthGuard('jwt'))
  @Get(':name')
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Get tag by name',
  })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden.' })
  findOne(@Param('name') name: string) {
    return this.tagsService.findByName(name);
  }

  // @ApiBearerAuth('access_token')
  // @UseGuards(AuthGuard('jwt'))
  @Patch(':id')
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The record has been successfully updated.',
  })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden.' })
  update(@Param('id') id: string, @Body() updateTagDto: UpdateTagDto) {
    return this.tagsService.update(+id, updateTagDto);
  }

  // @ApiBearerAuth('access_token')
  // @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The record has been successfully deleted.',
  })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden.' })
  remove(@Param('id') id: string) {
    return this.tagsService.remove(+id);
  }
}
