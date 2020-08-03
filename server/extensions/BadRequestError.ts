export class BadRequestError extends Error {
  public opertionName: string;

  public message: string;

  public args: any[];

  constructor(operationName: string, message: string, args: any[] = []) {
    super(message);
    Object.setPrototypeOf(this, BadRequestError.prototype);
    this.opertionName = operationName;
    this.message = message;
    this.args = args;
  }

  toJSON() {
    return {
      success: false,
      status: 400,
      failedOperation: this.opertionName,
      message: this.message,
      args: this.args,
    };
  }
}
