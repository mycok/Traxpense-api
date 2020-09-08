import { IUserDocument, UserModel } from '../../data-abstracts';
import { handleErrorMessages } from '../../../../utils/dbErrorHandler';
import { BaseDataAgent } from '../../../../utils/BaseDataAgent';

export class UserDataAgent extends BaseDataAgent<IUserDocument> {
  private userModel: any;

  constructor() {
    super(UserModel);
    this.userModel = UserModel;
  }

  async pushDuplicatesToArray(items: Array<any>, obj: any): Promise<any> {
    const arr: Array<any> = [];
    for (const item of items) {
      if (item === 'username' || item === 'email') {
        const user = await UserModel.findOne({ [item]: obj[item] });
        if (user) arr.push({ [item]: `${obj[item]} already exists` });
      }
    }
    return arr;
  }

  async reset(userId: IUserDocument, newPassword: string): Promise<any> {
    return await this.userModel
      .findByIdAndUpdate(userId, {
        password: newPassword,
      })
      .catch((err: any) => handleErrorMessages(err));
  }
}
