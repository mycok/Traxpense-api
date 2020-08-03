export class NotFoundError extends Error {
  public operationName: string;

  public message: string;

  public args: any[];

  constructor(operationName: string, message: string, args: any[] = []) {
    super(message);
    Object.setPrototypeOf(this, NotFoundError.prototype);
    this.operationName = operationName;
    this.message = message;
    this.args = args;
  }

  toJSON() {
    return {
      success: false,
      status: 404,
      failedOperation: this.operationName,
      message: this.message,
      args: this.args,
    };
  }
}
