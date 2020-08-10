import express, { Router } from 'express';
import { UserController } from '../controllers/user';
import { authenticate } from '../middleware/auth/index';

export const userRouter: Router = express.Router();

userRouter.param('userId', UserController.getById);
userRouter
  .route('/api/v1/users')
  .post(UserController.create)
  .get(UserController.list);

userRouter
  .route('/api/v1/users/:userId')
  .get(authenticate, UserController.read)
  .patch(
    authenticate,
    UserController.checkDuplicatesOnUpdate,
    UserController.update,
  )
  .delete(authenticate, UserController.delete);

userRouter
  .route('/api/v1/reset/:userId')
  .patch(authenticate, UserController.passwordReset);
