import { IUserDocument } from './IUserDocument';
import { ResponseModel } from '../../../../utils/ResponseModel';

export class UserResponseModel implements ResponseModel<IUserDocument> {
  document: IUserDocument;

  constructor(document: IUserDocument) {
    this.document = document;
  }

  getResponseModel() {
    return Object.seal({
      _id: this.document._id && this.document._id.toString(),
      username: this.document.username,
      email: this.document.email,
      avatar: this.document.avatar,
      profile: this.document.profile,
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
      _id: this.document._id && this.document._id.toString(),
      username: this.document.username,
      email: this.document.email,
      avatar: this.document.avatar,
      profile: this.document.profile,
      password: this.document.password,
      salt: this.document.salt,
    });
  }
}
