import { PartialType } from '@nestjs/swagger';

import { CreateFacebookDto } from './create-facebook.dto';

export class UpdateFacebookDto extends PartialType(CreateFacebookDto) {}
