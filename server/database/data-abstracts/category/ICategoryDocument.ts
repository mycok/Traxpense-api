import { Types, Document } from 'mongoose';

export interface ICategoryDocument extends Document {
  _id: string;
  title: string;
  createdByAdmin: boolean;
  user: Types.ObjectId | string;
}
