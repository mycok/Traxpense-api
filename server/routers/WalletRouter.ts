import express, { Router } from 'express';

import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/wallet';
import { walletController } from '../controllers/wallet';

export const walletRouter: Router = express.Router();
walletRouter.param('ownerId', walletController.getById);

// TODO: Remove the POST endpoint since we are now creating a wallet on user
// account creation.
walletRouter.route('/api/v1/wallet').post(authenticate, walletController.create);
walletRouter
  .route('/api/v1/wallet/:ownerId')
  .get(authenticate, authorize, walletController.read)
  .patch(authenticate, authorize, walletController.update);
