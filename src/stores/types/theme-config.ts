export type StorefrontProductsLayout = 'grid' | 'list';

export interface StorefrontThemePalette {
  background?: string;
  surface?: string;
  surfaceMuted?: string;
  accent?: string;
  accentSoft?: string;
  text?: string;
  textMuted?: string;
  border?: string;
}

export interface StoreThemeConfig {
  primaryColor?: string;
  layout?: StorefrontProductsLayout;
  palette?: StorefrontThemePalette;
  logo?: string;
}

export const DEFAULT_STORE_THEME: StoreThemeConfig = {
  primaryColor: '#111827',
  layout: 'grid',
  palette: {
    background: '#fdfbf7',
    surface: '#ffffff',
    surfaceMuted: '#f4f3ef',
    accent: '#111827',
    accentSoft: '#d1fae5',
    text: '#0f172a',
    textMuted: '#475569',
    border: '#e2e8f0',
  },
  logo: null,
};
