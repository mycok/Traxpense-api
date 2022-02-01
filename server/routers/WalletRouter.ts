import express, { Router } from 'express';

import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/wallet';
import { WalletController } from '../controllers/wallet';

export const walletRouter: Router = express.Router();
walletRouter.param('walletId', WalletController.getById);

// TODO: Remove the POST endpoint since we are now creating a wallet on user
// account creation.
walletRouter.route('/api/v1/wallet').post(authenticate, WalletController.create);
walletRouter
  .route('/api/v1/wallet/:walletId')
  .get(authenticate, authorize, WalletController.read)
  .patch(authenticate, authorize, WalletController.update);
