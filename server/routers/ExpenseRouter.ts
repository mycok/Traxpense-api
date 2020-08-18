import express, { Router } from 'express';
import { ExpenseController } from '../controllers/expense';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/expense';

export const expenseRouter: Router = express.Router();

expenseRouter.param('expId', ExpenseController.getById);

expenseRouter
  .route('/api/v1/expenses')
  .post(authenticate, ExpenseController.create)
  .get(authenticate, ExpenseController.list);

expenseRouter
  .route('/api/v1/expenses/current')
  .get(authenticate, ExpenseController.currentMonthPreview);

expenseRouter
  .route('/api/v1/expenses/by/category')
  .get(authenticate, ExpenseController.expensesByCategory);

expenseRouter
  .route('/api/v1/expenses/:expId')
  .get(authenticate, authorize, ExpenseController.read)
  .patch(authenticate, authorize, ExpenseController.update)
  .delete(authenticate, authorize, ExpenseController.delete);
