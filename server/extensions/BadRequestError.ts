import { HttpError } from 'routing-controllers';

export class BadRequestError extends HttpError {
  public opertionName: string;

  public errMessage: string;

  public errCount?: number;

  public args: any[];

  constructor(
    operationName: string,
    errMessage: string,
    errCount?: number,
    args: any[] = [],
  ) {
    super(400, errMessage);
    Object.setPrototypeOf(this, BadRequestError.prototype);
    this.opertionName = operationName;
    this.errMessage = errMessage;
    this.errCount = errCount;
    this.args = args;
  }

  toJSON() {
    return {
      thrown: true,
      success: false,
      status: this.httpCode,
      errCount: this.errCount,
      failedOperation: this.opertionName,
      message: this.errMessage,
      args: this.args,
    };
  }
}
