import Ajv from 'ajv';
import { BaseValidator } from '../BaseValidator';

export class UserValidator extends BaseValidator {
  validate<T>(schemas: any[], pathPrefix: string, data: T): boolean | string {
    const ajvValidate = new Ajv({ schemas })
      .addFormat('email', /^[\w.+]+@\w+\.\w+$/)
      .compile(schemas[0]);

    const isValid = ajvValidate(data);

    if (!isValid) {
      return this.generateValidationErrorMessages(
        ajvValidate.errors,
        pathPrefix,
      );
    }
    return isValid as boolean;
  }
}
