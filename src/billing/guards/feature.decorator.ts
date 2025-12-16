import { SetMetadata } from '@nestjs/common';

export type FeatureType = 'theme_access' | 'custom_domain' | 'branding_removal';

export const FEATURE_KEY = 'feature';
export const CheckFeature = (feature: FeatureType) =>
  SetMetadata(FEATURE_KEY, feature);
