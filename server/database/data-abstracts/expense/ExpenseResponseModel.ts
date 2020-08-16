import { IExpenseDocument } from './IExpenseDocument';
import { ResponseModel } from '../../../../utils/ResponseModel';
// TODO: - extend this class by adding more getters
export class ExponseResponseModel implements ResponseModel<IExpenseDocument> {
  document: IExpenseDocument;

  constructor(document: IExpenseDocument) {
    this.document = document;
  }

  getResponseModel() {
    return Object.seal({
      id: this.document.id && this.document.id.toString(),
      title: this.document.title,
      amount: this.document.amount,
      category: this.document.category,
      incurredOn: this.document.incurredOn,
      notes: this.document.notes,
      createdAt: this.document.createdAt,
    });
  }
}
