import express, { Router } from 'express';

import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/wallet';
import { WalletController } from '../controllers/wallet';

export const walletRouter: Router = express.Router();
walletRouter.param('walletId', WalletController.getById);

walletRouter.route('/api/v1/wallet').post(authenticate, WalletController.create);
walletRouter
  .route('/api/v1/wallet/:walletId')
  .get(authenticate, authorize, WalletController.read)
  .patch(authenticate, authorize, WalletController.update);
