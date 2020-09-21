import { Schema } from 'mongoose';

export const CategorySchema: Schema = new Schema({
  title: {
    type: String,
    trim: true,
    required: true,
    unique: true,
    uniqueCaseInsensitive: true,
    minlength: [2, 'Category name must contain atleast 2 characters'],
  },
});
