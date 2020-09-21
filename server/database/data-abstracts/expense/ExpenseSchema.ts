import { Schema, SchemaTypes } from 'mongoose';

export const ExpenseSchema: Schema = new Schema(
  {
    title: {
      type: String,
      trim: true,
      required: true,
    },
    amount: {
      type: Number,
      min: 0,
      required: true,
    },
    category: {
      type: SchemaTypes.ObjectId,
      ref: 'Category',
    },
    incurredOn: {
      type: Date,
      default: Date.now,
    },
    notes: {
      type: String,
      trim: true,
    },
    recordedBy: {
      type: SchemaTypes.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true },
);
