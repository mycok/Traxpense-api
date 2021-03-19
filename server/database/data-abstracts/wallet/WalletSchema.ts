import { Schema, SchemaTypes } from 'mongoose';

export const WalletSchema: Schema = new Schema(
  {
    type: {
      type: String,
      default: 'cash',
    },
    initialAmount: {
      type: Number,
      min: 0,
      default: 0,
    },
    currentBalance: {
      type: Number,
      min: 0,
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
