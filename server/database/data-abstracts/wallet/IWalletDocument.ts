import mongoose from 'mongoose';

export interface IWalletDocument extends mongoose.Document {
  _id: string;
  type: string;
  initialAmount: number;
  currentBalance: number;
  owner: mongoose.Schema.Types.ObjectId | string;
}
