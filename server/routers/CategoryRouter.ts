import express, { Router } from 'express';

import { authenticate } from '../middleware/auth';
import { CategoryController } from '../controllers/category';

export const categoryRouter: Router = express.Router();

categoryRouter
  .route('/api/v1/categories')
  .post(authenticate, CategoryController.create)
  .get(authenticate, CategoryController.list);
categoryRouter
  .route('/api/v1/categories/by/user')
  .get(authenticate, CategoryController.listByUser);
