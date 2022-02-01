import express, { Router } from 'express';
import { userController } from '../controllers/user';
import { authenticate, authorize } from '../middleware/auth';

export const userRouter: Router = express.Router();

userRouter.param('userId', userController.getById);
userRouter.route('/api/v1/users').post(userController.create).get(userController.list);

userRouter
  .route('/api/v1/users/:userId')
  .get(authenticate, authorize, userController.read)
  .patch(
    authenticate,
    authorize,
    userController.checkDuplicatesOnUpdate,
    userController.update,
  )
  .delete(authenticate, authorize, userController.delete);

userRouter
  .route('/api/v1/reset/:userId')
  .patch(authenticate, authorize, userController.passwordReset);
