import { Response } from 'express';

import { BadRequestError } from '../../extensions/BadRequestError';
import { WalletDataAgent } from '../../database/data-agents/wallet/WalletDataAgent';
import { IWalletDocument, WalletModelResponse } from '../../database/data-abstracts';
import { NotFoundError } from '../../extensions/NotFoundError';
import { Validator } from '../../validation/validators/index';
import walletUpdateSchema from '../../validation/schemas/wallet/update.json';

// TODO: add unit / end 2 end tests for all controller functionality
export class WalletController {
  private static _walletDataAgent = new WalletDataAgent();

  static async create(req: any, res: Response) {
    const { auth } = req;
    const walletRequest: any = { owner: auth._id };

    await WalletController._walletDataAgent.create(walletRequest as IWalletDocument);
  }

  static async read(req: any, res: Response): Promise<Response> {
    const { wallet } = req;

    return res.status(200).json(new WalletModelResponse(wallet).getResponseModel());
  }

  static async update(req: any, res: Response): Promise<Response> {
    const {
      wallet: { _id },
      body,
    } = req;

    const validationResults = new Validator().validate<IWalletDocument>(
      walletUpdateSchema,
      'wallet',
      body,
    );

    if (typeof validationResults === 'string') {
      return res
        .status(400)
        .json(new BadRequestError('create-expense', validationResults).toJSON());
    }

    const result = await WalletController._walletDataAgent.update(_id, body, false);

    if (typeof result !== 'object') {
      return res.status(400).json(new BadRequestError('update', result));
    }

    return res.status(200).json({
      success: true,
      wallet: new WalletModelResponse(result).getResponseModel(),
    });
  }

  static async updateOnNewExpense(req: any, Res: Response) {
    const { auth: _id, expense } = req;

    const wallet = await WalletController._walletDataAgent.getByOwner(_id);
    await WalletController._walletDataAgent.update(wallet?._id as string, {
      currentBalance: expense.amount,
    });
  }

  static async getById(
    req: any,
    res: Response,
    next: Function,
    ownerId: string,
  ): Promise<Response> {
    const wallet = await WalletController._walletDataAgent.getByOwner(ownerId);

    if (!wallet) {
      return res
        .status(404)
        .json(new NotFoundError('getByOwner', 'Wallet not found').toJSON());
    }
    req.wallet = wallet;

    return next();
  }
}
