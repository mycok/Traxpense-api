import mongoose from 'mongoose';

export interface IUserDocument extends mongoose.Document {
  id?: string;
  username: string;
  email: string;
  hashedPassword: string;
  avatar?: string;
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
