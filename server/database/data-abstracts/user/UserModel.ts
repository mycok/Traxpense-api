import { Model, model } from 'mongoose';
import { IUserDocument } from './IUserDocument';
import { UserSchema } from './UserSchema';

type IUserModel = Model<IUserDocument>;
export const UserModel: IUserModel = model<IUserDocument>('User', UserSchema);
