import express, { Router } from 'express';

import { authenticate } from '../middleware/auth';
import { WalletController } from '../controllers/wallet';

export const walletRouter: Router = express.Router();

walletRouter.route('/api/v1/wallet').post(authenticate, WalletController.create);
