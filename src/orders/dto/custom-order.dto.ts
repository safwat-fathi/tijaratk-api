import { IsNotEmpty, IsString, IsPhoneNumber, IsOptional, IsNumber, IsArray, Min } from 'class-validator';

export class CreateCustomOrderDto {
  @IsString()
  @IsNotEmpty()
  buyer_name: string;

  @IsString()
  @IsNotEmpty()
  buyer_phone: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsNumber()
  @IsOptional()
  budget?: number;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  images?: string[];
}

export class QuoteCustomOrderDto {
  @IsNumber()
  @Min(0)
  price: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  shipping_cost?: number;

  @IsString()
  @IsOptional()
  notes?: string;
}
