import express, { Router } from 'express';

import { authenticate } from '../middleware/auth/index';
import { CategoryController } from '../controllers/category/index';

export const categoryRouter: Router = express.Router();

categoryRouter
  .route('/api/v1/categories')
  .post(authenticate, CategoryController.create)
  .get(authenticate, CategoryController.list);
