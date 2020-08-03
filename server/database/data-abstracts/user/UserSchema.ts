import crypto from 'crypto';
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
    hashedPassword: {
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

UserSchema.virtual('password')
  .set(function (password: string) {
    this._password = password;
    this.salt = this.makeSalt();
    this.hashedPassword = this.encryptPassword(password);
  })
  .get(function () {
    return this._password;
  });

UserSchema.methods = {
  isPasswordMatch(rawPassword: string): boolean {
    return this.encryptPassword(rawPassword) === this.hashedPassword;
  },
  encryptPassword(password: string): string {
    if (!password) return '';
    try {
      return crypto
        .createHmac('sha1', this.salt)
        .update(password)
        .digest('hex');
    } catch (error) {
      return '';
    }
  },
  makeSalt(): any {
    return `${Math.round(new Date().valueOf() * Math.random())} `;
  },
};
