import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { CategoriesService } from './categories.service';
import { CategoryResponseDto } from './dto/category-response.dto';

/**
 * Categories Controller - Public endpoints for store categories.
 *
 * Categories are used to classify stores and provide suggested sub-categories.
 */
@ApiTags('Categories')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  @ApiOperation({
    summary: 'Get all categories with suggestions',
    description:
      'Retrieves all store categories with their suggested sub-categories. Categories are bilingual (English/Arabic).',
  })
  @ApiOkResponse({
    description: 'List of all categories',
    type: [CategoryResponseDto],
  })
  findAll() {
    return this.categoriesService.findAll();
  }
}

