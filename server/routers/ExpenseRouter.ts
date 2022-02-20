import express, { Router } from 'express';
import { expenseController } from '../controllers/expense';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/expense';

export const expenseRouter: Router = express.Router();

expenseRouter.param('expId', expenseController.getById);

expenseRouter
  .route('/api/v1/expenses')
  .post(authenticate, expenseController.create)
  .get(authenticate, expenseController.list);

expenseRouter
  .route('/api/v1/expenses/current')
  .get(authenticate, expenseController.currentMonthPreview);

expenseRouter
  .route('/api/v1/expenses/by/category/for-period')
  .get(authenticate, expenseController.totalExpBycategoryForPeriod);

expenseRouter
  .route('/api/v1/expenses/plot')
  .get(authenticate, expenseController.scatteredPlotExpData);

expenseRouter
  .route('/api/v1/expenses/annual')
  .get(authenticate, expenseController.annualExpData);

expenseRouter
  .route('/api/v1/expenses/by/category/averages')
  .get(authenticate, expenseController.currentMonthAvgTotalExpByCategory);

expenseRouter
  .route('/api/v1/expenses/:expId')
  .get(authenticate, authorize, expenseController.read)
  .patch(authenticate, authorize, expenseController.update)
  .delete(authenticate, authorize, expenseController.delete);
