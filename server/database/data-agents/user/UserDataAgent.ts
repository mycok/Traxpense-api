import { Types } from 'mongoose';

import { IUserDocument, UserModel } from '../../data-abstracts';
import { handleErrorMessages } from '../../../../utils/dbErrorHandler';
import { BaseDataAgent } from '../BaseDataAgent';
import { IDataAgent } from '../DataAgent';

export interface IUserDataAgent extends IDataAgent<IUserDocument> {
  pushDuplicatesToArray(items: Array<any>, obj: any): Promise<any[]>;
  reset(userId: string, newPassword: string): Promise<IUserDocument | string>;
}

export class UserDataAgent extends BaseDataAgent<IUserDocument> {
  constructor() {
    super(UserModel);
  }

  async pushDuplicatesToArray(items: Array<any>, obj: any): Promise<any[]> {
    const arr = [];

    for (const item of items) {
      if (item === 'username' || item === 'email') {
        const user = await this.model.findOne({ [item]: obj[item] });

        if (user) arr.push({ [item]: `${obj[item]} already exists` });
      }
    }
    return arr;
  }

  async reset(userId: string, newPassword: string): Promise<IUserDocument | string> {
    return await this.model
      .findByIdAndUpdate(Types.ObjectId(userId), {
        password: newPassword,
      })
      .catch((err: any) => handleErrorMessages(err));
  }
}
