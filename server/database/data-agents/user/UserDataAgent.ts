import { IUserDocument, UserModel } from '../../data-abstracts';
import { handleErrorMessages } from '../../../../utils/dbErrorHandler';
import { DataAgent } from '../../../../utils/DataAgent';

export class UserDataAgent extends DataAgent<IUserDocument> {
  async create(userData: IUserDocument): Promise<IUserDocument | string> {
    const result = await UserModel.create(userData).catch((err) => handleErrorMessages(err));

    return result;
  }

  async list(): Promise<IUserDocument[]> {
    const users: IUserDocument[] = await UserModel.find().select(
      '_id username email avatar profile',
    );
    return users;
  }

  async getById(userId: string): Promise<IUserDocument | null> {
    const result = await UserModel.findById(userId).select(
      '_id username email password salt avatar profile',
    );
    return result;
  }

  async update(
    userId: string,
    propsToUpdate: any,
  ): Promise<IUserDocument | string> {
    const result = await UserModel.findOneAndUpdate(
      { _id: userId },
      propsToUpdate,
      {
        omitUndefined: true,
        new: true,
        runValidators: true,
      },
    )
      .select('_id username email avatar profile')
      .catch((err) => handleErrorMessages(err));

    return result;
  }

  async delete(userId: string): Promise<any> {
    const result = await UserModel.deleteOne({
      _id: userId,
    }).catch((err) => handleErrorMessages(err));

    return result;
  }

  async reset(userId: IUserDocument, newPassword: string): Promise<any> {
    return await UserModel.findByIdAndUpdate(userId, {
      password: newPassword,
    }).catch((err) => handleErrorMessages(err));
  }
}
