import { ApiProperty } from '@nestjs/swagger';

// ==================== Category Response DTOs ====================

/**
 * DTO for suggested sub-category.
 */
export class SuggestedSubCategoryDto {
  @ApiProperty({
    description: 'Sub-category name in English',
    example: 'T-Shirts',
  })
  name_en: string;

  @ApiProperty({
    description: 'Sub-category name in Arabic',
    example: 'تيشرتات',
  })
  name_ar: string;
}

/**
 * DTO for a store category.
 */
export class CategoryResponseDto {
  @ApiProperty({
    description: 'Category ID',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'Category unique key',
    example: 'fashion',
  })
  key: string;

  @ApiProperty({
    description: 'Category name in English',
    example: 'Fashion & Clothing',
  })
  name_en: string;

  @ApiProperty({
    description: 'Category name in Arabic',
    example: 'أزياء وملابس',
  })
  name_ar: string;

  @ApiProperty({
    description: 'Suggested sub-categories for this category',
    type: [SuggestedSubCategoryDto],
    example: [
      { name_en: 'T-Shirts', name_ar: 'تيشرتات' },
      { name_en: 'Dresses', name_ar: 'فساتين' },
      { name_en: 'Shoes', name_ar: 'أحذية' },
    ],
  })
  suggested_sub_categories: SuggestedSubCategoryDto[];
}
