import { registerDecorator, ValidationOptions } from 'class-validator';
import {
  parsePhoneNumberWithError,
  CountryCode,
} from 'libphonenumber-js';

/**
 * Options for phone number validation.
 */
export interface IsPhoneNumberIntlOptions {
  /**
   * List of allowed country codes. If provided, only phone numbers
   * from these countries will be accepted.
   * @example ['EG', 'SA', 'AE']
   */
  allowedCountries?: CountryCode[];
}

/**
 * Validates that a string is a valid international phone number.
 * Optionally restricts to specific countries.
 *
 * @param options - Validation options including allowed countries
 * @param validationOptions - class-validator options
 *
 * @example
 * // Accept any valid international phone number
 * @IsPhoneNumberIntl()
 * phone: string;
 *
 * @example
 * // Only accept phone numbers from Egypt, Saudi Arabia, and UAE
 * @IsPhoneNumberIntl({ allowedCountries: ['EG', 'SA', 'AE'] })
 * phone: string;
 */
export function IsPhoneNumberIntl(
  options?: IsPhoneNumberIntlOptions,
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'IsPhoneNumberIntl',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [options],
      validator: {
        validate(value: unknown) {
          if (typeof value !== 'string') {
            return false;
          }

          try {
            const phoneNumber = parsePhoneNumberWithError(value);

            if (!phoneNumber?.isValid()) {
              return false;
            }

            // If allowed countries are specified, check if the phone's country is in the list
            if (options?.allowedCountries?.length) {
              const phoneCountry = phoneNumber.country;
              return (
                phoneCountry !== undefined &&
                options.allowedCountries.includes(phoneCountry)
              );
            }

            return true;
          } catch {
            return false;
          }
        },
        defaultMessage() {
          if (options?.allowedCountries?.length) {
            return `Phone number must be a valid number from one of these countries: ${options.allowedCountries.join(', ')}`;
          }
          return 'Phone number must be a valid international phone number';
        },
      },
    });
  };
}
