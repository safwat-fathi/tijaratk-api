import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// ==================== Theme Config Response DTOs ====================

/**
 * DTO for theme palette colors.
 */
export class ThemePaletteResponseDto {
  @ApiPropertyOptional({
    description: 'Background color',
    example: '#fdfbf7',
  })
  background?: string;

  @ApiPropertyOptional({
    description: 'Surface color (cards, panels)',
    example: '#ffffff',
  })
  surface?: string;

  @ApiPropertyOptional({
    description: 'Muted surface color',
    example: '#f4f3ef',
  })
  surfaceMuted?: string;

  @ApiPropertyOptional({
    description: 'Accent color (primary actions, highlights)',
    example: '#111827',
  })
  accent?: string;

  @ApiPropertyOptional({
    description: 'Soft accent color (secondary highlights)',
    example: '#d1fae5',
  })
  accentSoft?: string;

  @ApiPropertyOptional({
    description: 'Text color',
    example: '#0f172a',
  })
  text?: string;

  @ApiPropertyOptional({
    description: 'Muted text color (secondary text)',
    example: '#475569',
  })
  textMuted?: string;

  @ApiPropertyOptional({
    description: 'Border color',
    example: '#e2e8f0',
  })
  border?: string;
}

/**
 * DTO for store theme configuration response.
 */
export class StoreThemeConfigResponseDto {
  @ApiPropertyOptional({
    description: 'Primary theme color',
    example: '#111827',
  })
  primaryColor?: string;

  @ApiPropertyOptional({
    description: 'Products layout style',
    enum: ['grid', 'list'],
    example: 'grid',
  })
  layout?: 'grid' | 'list';

  @ApiPropertyOptional({
    description: 'Theme color palette configuration',
    type: () => ThemePaletteResponseDto,
    example: {
      background: '#fdfbf7',
      surface: '#ffffff',
      surfaceMuted: '#f4f3ef',
      accent: '#111827',
      accentSoft: '#d1fae5',
      text: '#0f172a',
      textMuted: '#475569',
      border: '#e2e8f0',
    },
  })
  palette?: ThemePaletteResponseDto;
}
