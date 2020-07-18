import { HttpError } from 'routing-controllers';

export class NotFoundError extends HttpError {
  public operationName: string;

  public errMessage: string;

  public args: any[];

  constructor(operationName: string, errMessage: string, args: any[] = []) {
    super(404, errMessage);
    Object.setPrototypeOf(this, NotFoundError.prototype);
    this.operationName = operationName;
    this.errMessage = errMessage;
    this.args = args;
  }

  toJSON() {
    return {
      thrown: true,
      success: false,
      status: this.httpCode,
      failedOperation: this.operationName,
      message: this.errMessage,
      args: this.args,
    };
  }
}
