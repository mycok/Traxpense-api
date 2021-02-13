import Ajv from 'ajv';
import { BaseValidator } from '../BaseValidator';

export class AuthValidator extends BaseValidator {
  validate<T>(schema: any, pathPrefix: string, data: T): boolean | string {
    const ajvValidate = new Ajv()
      .addFormat('email', /^[\w.+]+@\w+\.\w+$/)
      .compile(schema);

    const isValid = ajvValidate(data);

    if (!isValid) {
      return this.generateValidationErrorMessages(ajvValidate.errors, pathPrefix);
    }
    return isValid as boolean;
  }
}
