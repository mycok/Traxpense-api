import express, { Router } from 'express';
import { UserController } from '../controllers/user';
import { authenticate, authorize } from '../middleware/auth';

export const userRouter: Router = express.Router();

userRouter.param('userId', UserController.getById);
userRouter.route('/api/v1/users').post(UserController.create).get(UserController.list);

userRouter
  .route('/api/v1/users/:userId')
  .get(authenticate, authorize, UserController.read)
  .patch(
    authenticate,
    authorize,
    UserController.checkDuplicatesOnUpdate,
    UserController.update,
  )
  .delete(authenticate, authorize, UserController.delete);

userRouter
  .route('/api/v1/reset/:userId')
  .patch(authenticate, authorize, UserController.passwordReset);
