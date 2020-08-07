import { IUserDocument } from './IUserDocument';
import { ResponseModel } from '../../../../utils/ResponseModel';
// TODO: - extend this class by adding getters for all the user documennt properties
export class UserResponseModel implements ResponseModel<IUserDocument> {
  document: IUserDocument;

  constructor(document: IUserDocument) {
    this.document = document;
  }

  getResponseModel() {
    return Object.seal({
      id: this.document.id && this.document.id.toString(),
      username: this.document.username,
      email: this.document.email,
      avatar: this.document.avatar,
      profile: this.document.profile,
    });
  }
}
