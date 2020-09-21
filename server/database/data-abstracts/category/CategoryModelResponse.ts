import { ResponseModel } from '../../../../utils/ResponseModel';
import { ICategoryDocument } from './ICategoryDocument';

export class CategoryModelResponse implements ResponseModel<ICategoryDocument> {
  _document: ICategoryDocument;

  constructor(document: ICategoryDocument) {
    this._document = document;
  }

  getResponseModel() {
    return Object.seal({
      _id: this._document._id?.toString(),
      title: this._document.title,
    });
  }

  getResponseModelFromList(documentsList: ICategoryDocument[]) {
    return documentsList.map((doc) => ({
      _id: doc._id,
      title: doc.title,
    }));
  }
}
