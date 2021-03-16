import { Schema, SchemaTypes } from 'mongoose';

export const WalletSchema: Schema = new Schema(
  {
    type: {
      type: String,
      default: 'cash',
    },
    initialAmount: {
      type: Number,
      default: 0,
    },
    currentBalance: {
      type: Number,
      default() {
        return this.initialAmount;
      },
    },
    owner: {
      type: SchemaTypes.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true },
);
