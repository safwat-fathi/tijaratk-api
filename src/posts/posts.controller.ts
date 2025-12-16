import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UploadedFile } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { Request } from 'express';
import * as path from 'path';
import CONSTANTS from 'src/common/constants';
import { UploadFile } from 'src/common/decorators/upload-file.decorator';
import { createPaginatedDto } from 'src/common/dto/paginated-response.dto';
import { ImageProcessorService } from 'src/common/services/image-processor.service';
import { imageFileFilter } from 'src/common/utils/file-filters';

import { CreatePostDto } from './dto/create-post.dto';
import { ListPostsDto } from './dto/list-posts.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { Post as PostEntity } from './entities/post.entity';
import { PostsService } from './posts.service';

@Controller('posts')
@ApiBearerAuth(CONSTANTS.ACCESS_TOKEN)
@UseGuards(AuthGuard(CONSTANTS.AUTH.JWT))
export class PostsController {
  constructor(
    private readonly postsService: PostsService,
    private readonly imageProcessor: ImageProcessorService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiBody({ description: 'Create a new post', type: CreatePostDto })
  @ApiOperation({ summary: 'Create a new post' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Post created successfully',
  })
  create(@Body() createPostDto: CreatePostDto, @Req() req: Request) {
    const { facebookId } = req.user;
    return this.postsService.create(facebookId, createPostDto);
  }

  @Post('upload')
  @HttpCode(HttpStatus.OK)
  @ApiConsumes('multipart/form-data')
  @UploadFile('file', {
    fileFilter: imageFileFilter,
    limits: { fileSize: 1024 * 1024 * 5 }, // 5MB
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Image uploaded successfully',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiOperation({ summary: 'Upload an image' })
  async upload(@UploadedFile() file: Express.Multer.File, @Req() req: Request) {
    const filePath = path.join(process.cwd(), 'uploads', file.filename);
    const webpFilename = await this.imageProcessor.convertToWebP(filePath);

    const protocol = req.protocol;
    const host = req.get('host');
    const url = `${protocol}://${host}/uploads/${webpFilename}`;
    return { url };
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Posts found successfully',
    type: createPaginatedDto(PostEntity),
  })
  @ApiOperation({ summary: 'Get all posts with pagination and sorting' })
  findAll(@Query() listPostsDto: ListPostsDto) {
    return this.postsService.findAll(listPostsDto);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Post found successfully',
  })
  @ApiOperation({ summary: 'Get a post by ID' })
  findOne(@Param('id') id: string) {
    return this.postsService.findOne(+id);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Post updated successfully',
  })
  @ApiBody({ description: 'Update a post', type: UpdatePostDto })
  @ApiOperation({ summary: 'Update a post' })
  update(@Param('id') id: string, @Body() updatePostDto: UpdatePostDto) {
    return this.postsService.update(+id, updatePostDto);
  }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.postsService.remove(+id);
  // }
}
