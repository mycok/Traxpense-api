import { IUserDocument } from '../../data-abstracts/user/IUserDocument';
import { UserModel } from '../../data-abstracts/user/UserModel';
import { handleErrorMessages } from '../../../../utils/dbErrorHandler';
import { DataAgent } from '../../../../utils/DataAgent';

export class UserDataAgent extends DataAgent<IUserDocument> {
  async create(userData: IUserDocument): Promise<IUserDocument | string> {
    const newUser = await UserModel.create(userData).catch((err) => handleErrorMessages(err));

    return newUser;
  }

  async list(): Promise<IUserDocument[]> {
    const users: IUserDocument[] = await UserModel.find().select(
      '_id username email avatar profile',
    );
    return users;
  }

  async getById(userId: string): Promise<IUserDocument | null> {
    const user = await UserModel.findById(userId).select(
      '_id username email avatar profile',
    );
    return user;
  }

  async update(
    userId: string,
    propsToUpdate: any,
  ): Promise<IUserDocument | string> {
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

  async delete(userId: string): Promise<any> {
    const deletedResponse = await UserModel.deleteOne({
      _id: userId,
    }).catch((err) => handleErrorMessages(err));

    return deletedResponse;
  }
}
