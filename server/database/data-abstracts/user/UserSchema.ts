import { Schema } from 'mongoose';

export const UserSchema: Schema = new Schema(
  {
    username: {
      type: String,
      trim: true,
      unique: true,
      uniqueCaseInsensitive: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      unique: true,
      uniqueCaseInsensitive: true,
    },
    password: {
      type: String,
    },
    salt: String,
    avatar: {
      type: String,
      trim: true,
    },
    profile: {
      bio: String,
      summary: String,
      otherNames: {
        type: Object,
        first: {
          type: String,
          trim: true,
        },
        middle: {
          type: String,
          trim: true,
        },
        last: {
          type: String,
          trim: true,
        },
      },
    },
  },
  { timestamps: true },
);
