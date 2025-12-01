import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Req,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Request } from 'express';
import CONSTANTS from 'src/common/constants';

import { CheckSlugDto } from './dto/check-slug.dto';
import { CreateStorefrontDto } from './dto/create-storefront.dto';
import { UpdateStorefrontDto } from './dto/update-storefront.dto';
import { StorefrontsService } from './storefronts.service';

@ApiTags('Storefronts')
@ApiBearerAuth(CONSTANTS.ACCESS_TOKEN)
@UseGuards(AuthGuard(CONSTANTS.AUTH.JWT))
@Controller('storefronts')
export class StorefrontsController {
  constructor(private readonly storefrontsService: StorefrontsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiBody({ description: 'Create storefront', type: CreateStorefrontDto })
  @ApiOperation({ summary: 'Create storefront' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'The storefront has been successfully created.',
  })
  create(@Body() dto: CreateStorefrontDto, @Req() req: Request) {
    const { facebookId } = req.user;

    return this.storefrontsService.createForUser(facebookId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get storefronts for the authenticated user' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of storefronts for the authenticated user.',
  })
  findMine(@Req() req: Request) {
    const { facebookId } = req.user;

    return this.storefrontsService.findForUser(facebookId);
  }

  @Get('slug/check')
  @ApiOperation({ summary: 'Check storefront slug availability' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Whether the slug is available',
  })
  checkSlug(@Req() _req: Request, @Query() query: CheckSlugDto) {
    const { slug, excludeId } = query;

    return this.storefrontsService.isSlugAvailable(slug, excludeId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update storefront by id' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The storefront has been successfully updated.',
  })
  update(
    @Param('id') id: number,
    @Body() dto: UpdateStorefrontDto,
    @Req() req: Request,
  ) {
    const { facebookId } = req.user;

    return this.storefrontsService.updateForUser(facebookId, id, dto);
  }
}
