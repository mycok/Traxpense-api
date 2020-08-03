import { IUserDocument } from './IUserDocument';
// TODO: - extend this class by adding getters for all the user documennt properties
export class UserResponseModel {
  private _userResponseModel: IUserDocument;

  constructor(iUserDocument: IUserDocument) {
    this._userResponseModel = iUserDocument;
  }

  getUserResponseModel() {
    return Object.seal({
      id: this._userResponseModel.id && this._userResponseModel.id.toString(),
      username: this._userResponseModel.username,
      email: this._userResponseModel.email,
      avatar: this._userResponseModel.avatar,
      profile: this._userResponseModel.profile,
    });
  }
}
