import Ajv from 'ajv';

import { BaseValidator } from './BaseValidator';

export class Validator extends BaseValidator {
  validate<T>(schema: any, pathPrefix: string, data: T): boolean | string {
    const ajvValidate = new Ajv().compile(schema);

    const isValid = ajvValidate(data);

    if (!isValid) {
      return this.generateValidationErrorMessages(ajvValidate.errors, pathPrefix);
    }
    return isValid as boolean;
  }
}
