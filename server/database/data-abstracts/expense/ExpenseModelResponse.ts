import { IExpenseDocument } from './IExpenseDocument';
import { ResponseModel } from '../../../../utils/ResponseModel';

export class ExpenseModelResponse implements ResponseModel<IExpenseDocument> {
  _document: IExpenseDocument;

  constructor(document: IExpenseDocument) {
    this._document = document;
  }

  getResponseModel() {
    return Object.seal({
      _id: this._document._id?.toString(),
      title: this._document.title,
      amount: this._document.amount,
      category: this._document.category,
      incurredOn: this._document.incurredOn,
      notes: this._document.notes,
      createdAt: this._document.createdAt,
    });
  }
}
