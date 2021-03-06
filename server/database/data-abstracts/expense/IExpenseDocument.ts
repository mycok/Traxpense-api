import mongoose from 'mongoose';

export interface IExpenseDocument extends mongoose.Document {
  _id: string;
  title: string;
  amount: number;
  category: string;
  incurredOn: Date;
  notes?: string;
  recordedBy?: mongoose.Schema.Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}
