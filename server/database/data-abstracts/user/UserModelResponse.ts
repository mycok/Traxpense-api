import { IUserDocument } from './IUserDocument';
import { ResponseModel } from '../../../../utils/ResponseModel';

export class UserModelResponse implements ResponseModel<IUserDocument> {
  _document: IUserDocument;

  constructor(document: IUserDocument) {
    this._document = document;
  }

  getResponseModel() {
    return Object.seal({
      _id: this._document._id?.toString(),
      username: this._document.username,
      email: this._document.email,
      avatar: this._document.avatar,
      profile: this._document.profile,
    });
  }

  getResponseModelFromList(documentsList: IUserDocument[]) {
    return documentsList.map((doc) => ({
      _id: doc._id,
      email: doc.email,
      username: doc.username,
      avatar: doc.avatar,
      profile: doc.profile,
    }));
  }

  getFullModelResponse() {
    return Object.seal({
      _id: this._document._id && this._document._id.toString(),
      username: this._document.username,
      email: this._document.email,
      avatar: this._document.avatar,
      profile: this._document.profile,
      password: this._document.password,
      salt: this._document.salt,
    });
  }
}
