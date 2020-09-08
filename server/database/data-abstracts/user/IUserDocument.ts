import mongoose from 'mongoose';

export interface IUserDocument extends mongoose.Document {
  _id: string;
  username: string;
  email: string;
  password: string;
  avatar?: string;
  salt?: string;
  profile?: {
    bio: string;
    summary: string;
    otherNames: {
      first: string;
      middle: string;
      last: string;
    };
  };
}
