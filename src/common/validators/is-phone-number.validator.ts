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

          // Strategy 1: strict international parsing
          try {
            const phoneNumber = parsePhoneNumberWithError(value);

            if (phoneNumber?.isValid()) {
              // If we have specific allowed countries, check match
              if (options?.allowedCountries?.length) {
                const phoneCountry = phoneNumber.country;
                if (
                  phoneCountry &&
                  options.allowedCountries.includes(phoneCountry)
                ) {
                  return true;
                }
                // If allowed countries are set but this number is from another country,
                // don't fail yet! Valid international number might also be valid as a local number
                // in an allowed country (unlikely but possible), or we just fall through.
                // actually if it parses as a valid international number but NOT in our list,
                // it is invalid per our strict country rules.
                // BUT, "010..." might parse as a valid US number or similar if not careful?
                // libphonenumber usually requires + for international.
                // If it parses successfully as international but wrong country, return false?
                // No, let's fall through to local parsing just in case input was ambiguous without +,
                // although parsePhoneNumberWithError usually expects +.
              } else {
                return true;
              }
            }
          } catch (error) {
            // parsing failed, likely not international format
          }

          // Strategy 2: try parsing as local number for each allowed country
          if (options?.allowedCountries?.length) {
            for (const country of options.allowedCountries) {
              try {
                const phoneNumber = parsePhoneNumberWithError(value, country);
                if (phoneNumber?.isValid() && phoneNumber.country === country) {
                  return true;
                }
              } catch (error) {
                continue;
              }
            }
          }

          return false;
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
