import mongoose from 'mongoose';

export interface IExpenseDocument extends mongoose.Document {
  id?: string;
  title: string;
  amount: number;
  category: string;
  incurredOn: Date;
  notes: string;
  recordedBy: mongoose.Document;
  createdAt: Date;
  updatedAt: Date;
}
