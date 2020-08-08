import express, { Router } from 'express';
import { UserController } from '../controllers/user/UserController';

export const userRouter: Router = express.Router();

userRouter.param('userId', UserController.getById);
userRouter
  .route('/api/v1/users')
  .post(UserController.create)
  .get(UserController.list);

userRouter
  .route('/api/v1/users/:userId')
  .get(UserController.read)
  .patch(UserController.checkDuplicatesOnUpdate, UserController.update)
  .delete(UserController.delete);

userRouter.route('/api/v1/reset/:userId').patch(UserController.passwordReset);
