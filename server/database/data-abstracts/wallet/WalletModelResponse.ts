import { IWalletDocument } from './IWalletDocument';
import { ResponseModel } from '../../../../utils/ResponseModel';

export class WalletModelResponse implements ResponseModel<IWalletDocument> {
  _document: IWalletDocument;

  constructor(document: IWalletDocument) {
    this._document = document;
  }

  getResponseModel() {
    return Object.seal({
      _id: this._document._id?.toString(),
      type: this._document.type,
      initialAmount: this._document.initialAmount,
      currentBalance: this._document.currentBalance,
      owner: this._document.owner,
    });
  }

  getResponseModelFromList(documentsList: IWalletDocument[]) {
    return documentsList.map((doc) => ({
      _id: doc._id,
      type: doc.type,
      initialAmount: doc.initialAmount,
      currentBalance: doc.currentBalance,
      owner: doc.owner,
    }));
  }
}
