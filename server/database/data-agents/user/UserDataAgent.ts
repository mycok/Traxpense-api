import { IUserDocument } from '../../data-abstracts/user/IUserDocument';
import { UserModel } from '../../data-abstracts/user/UserModel';
import { handleErrorMessages } from '../../../../utils/dbErrorHandler';

export class UserDataAgent {
  static async create(user: any): Promise<any> {
    const userData = <IUserDocument>user;

    const newUser = await UserModel.create(userData).catch((err) => handleErrorMessages(err));

    return newUser;
  }

  static async list(): Promise<any> {
    const users: IUserDocument[] = await UserModel.find().select(
      '_id username email avatar profile',
    );
    return users;
  }

  static async getById(userId: string): Promise<any> {
    const user = await UserModel.findById(userId).select(
      '_id username email avatar profile',
    );
    return user;
  }

  static async update(userId: string, propsToUpdate: any): Promise<any> {
    const updatedUser = await UserModel.findOneAndUpdate(
      { _id: userId },
      propsToUpdate,
      {
        omitUndefined: true,
        new: true,
        runValidators: true,
        context: 'query',
      },
    )
      .select('_id username email avatar profile')
      .catch((err) => handleErrorMessages(err));

    return updatedUser;
  }

  static async delete(userId: string): Promise<any> {
    const deletedResponse = await UserModel.deleteOne({
      _id: userId,
    }).catch((err) => handleErrorMessages(err));

    return deletedResponse;
  }
}
