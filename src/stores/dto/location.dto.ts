import { IsLatitude, IsLongitude, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO for location input (lat/lng).
 * Converts to WKT format internally: 'POINT(lng lat)'
 */
export class LocationDto {
  @IsLongitude()
  @Type(() => Number)
  lng: number;

  @IsLatitude()
  @Type(() => Number)
  lat: number;

  /**
   * Converts lat/lng to WKT format for PostGIS storage
   * @returns WKT Point string in format 'POINT(lng lat)'
   */
  toWKT(): string {
    return `POINT(${this.lng} ${this.lat})`;
  }
}

/**
 * DTO for nearby store search queries
 */
export class NearbySearchDto {
  @IsLongitude()
  @Type(() => Number)
  lng: number;

  @IsLatitude()
  @Type(() => Number)
  lat: number;

  @IsOptional()
  @IsNumber()
  @Min(100)
  @Max(50000)
  @Type(() => Number)
  radiusMeters?: number = 3000;
}

/**
 * DTO for updating store location
 */
export class UpdateStoreLocationDto {
  @IsOptional()
  @IsString()
  address_text?: string;

  @IsOptional()
  @IsLongitude()
  @Type(() => Number)
  lng?: number;

  @IsOptional()
  @IsLatitude()
  @Type(() => Number)
  lat?: number;

  /**
   * Converts lat/lng to WKT format if both values are present
   * @returns WKT Point string or undefined
   */
  toLocationWKT(): string | undefined {
    if (this.lng !== undefined && this.lat !== undefined) {
      return `POINT(${this.lng} ${this.lat})`;
    }
    return undefined;
  }
}
