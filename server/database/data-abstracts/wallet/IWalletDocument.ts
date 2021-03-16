import mongoose from 'mongoose';

export interface IWalletDocument extends mongoose.Document {
  _id: string;
  type: string;
  initialAmount: Number;
  currentBalance: Number;
  owner: mongoose.Schema.Types.ObjectId | string;
}
