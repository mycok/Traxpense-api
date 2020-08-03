import Ajv from 'ajv';

export class Validator {
  private static generateValidationErrorMessages(
    errors: any,
    pathPrefix: string = '',
  ): string {
    const error = errors[0];

    switch (error.keyword) {
      case 'minLength':
        return `The '${pathPrefix}${error.dataPath}' field ${error.message}`;
      case 'required':
        return `The '${pathPrefix}${error.dataPath}.${error.params.missingProperty}' field is missing`;
      case 'type':
        return `The '${pathPrefix}${error.dataPath}' field must be of type ${error.params.type}`;
      case 'format':
        return `The '${pathPrefix}${error.dataPath}' field must be a valid ${error.params.format}`;
      case 'additionalProperties':
        return `The '${pathPrefix}${error.dataPath}' object does not support the field '${error.params.additionalProperty}'`;
      case 'pattern':
        return `The '${pathPrefix}${error.dataPath}' field should contain atleast 8 characters with a lowercase, uppercase, a number and a special character`;

      default:
        return 'Invalid error object';
    }
  }

  public static validateUser<T>(
    userSchema: any,
    profileSchema: any,
    pathPrefix: string,
    data: T,
  ): boolean | string {
    const ajvValidate = new Ajv({ schemas: [userSchema, profileSchema] })
      .addFormat('email', /^[\w.+]+@\w+\.\w+$/)
      .compile(userSchema);

    const isValid = ajvValidate(data);

    if (!isValid) {
      return this.generateValidationErrorMessages(
        ajvValidate.errors,
        pathPrefix,
      );
    }
    return true;
  }
}
