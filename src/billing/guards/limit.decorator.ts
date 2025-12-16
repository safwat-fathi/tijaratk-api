import { SetMetadata } from '@nestjs/common';

export type LimitType = 'product' | 'post' | 'message' | 'staff';

export const LIMIT_KEY = 'limit';
export const CheckLimit = (limit: LimitType) => SetMetadata(LIMIT_KEY, limit);
