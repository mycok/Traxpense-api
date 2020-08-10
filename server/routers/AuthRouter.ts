import express, { Router } from 'express';
import { AuthController } from '../controllers/auth';

export const authRouter: Router = express.Router();

authRouter.route('/api/v1/auth/sign-in').post(AuthController.signin);
