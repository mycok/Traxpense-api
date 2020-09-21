import mongoose from 'mongoose';

export interface ICategoryDocument extends mongoose.Document {
  _id: string;
  title: string;
}
