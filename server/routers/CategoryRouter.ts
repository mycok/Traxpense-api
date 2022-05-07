import express, { Router } from 'express';

import { authenticate } from '../middleware/auth';
import { categoryController } from '../controllers/category';

export const categoryRouter: Router = express.Router();

categoryRouter
  .route('/api/v1/categories')
  .post(authenticate, categoryController.create)
  .get(authenticate, categoryController.list);
categoryRouter
  .route('/api/v1/categories/by/user')
  .get(authenticate, categoryController.listByUser);
