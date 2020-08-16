import express, { Router } from 'express';
import { ExpenseController } from '../controllers/expense';
import { authenticate } from '../middleware/auth/index';

export const expenseRouter: Router = express.Router();

expenseRouter
  .route('/api/v1/expenses')
  .post(authenticate, ExpenseController.create)
  .get(authenticate, ExpenseController.list);

expenseRouter
  .route('/api/v1/expenses/:expId')
  .get(authenticate, ExpenseController.read);
