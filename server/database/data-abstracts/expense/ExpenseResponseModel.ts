import { IExpenseDocument } from './IExpenseDocument';
import { ResponseModel } from '../../../../utils/ResponseModel';

export class ExpenseResponseModel implements ResponseModel<IExpenseDocument> {
  document: IExpenseDocument;

  constructor(document: IExpenseDocument) {
    this.document = document;
  }

  getResponseModel() {
    return Object.seal({
      _id: this.document._id && this.document._id.toString(),
      title: this.document.title,
      amount: this.document.amount,
      category: this.document.category,
      incurredOn: this.document.incurredOn,
      notes: this.document.notes,
      createdAt: this.document.createdAt,
    });
  }
}
