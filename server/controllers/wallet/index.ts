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

  static async create(req: any, res: Response): Promise<any> {
    const { body, auth } = req;
    const walletRequest: any = { owner: auth._id };

    if (body?.initialAmount) walletRequest.initialAmount = body.initialAmount;

    const result = await WalletController._walletDataAgent.create(
      walletRequest as IWalletDocument,
    );

    if (typeof result === 'string') {
      return res.status(400).json(new BadRequestError('create', result).toJSON());
    }

    return res.status(201).json({
      success: true,
      wallet: new WalletModelResponse(result).getResponseModel(),
    });
  }

  static async read(req: any, res: Response): Promise<any> {
    const { wallet } = req;

    return res.status(200).json(new WalletModelResponse(wallet).getResponseModel());
  }

  static async update(req: any, res: Response): Promise<any> {
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

    const result = await WalletController._walletDataAgent.update(_id, body);

    if (typeof result !== 'object') {
      return res.status(400).json(new BadRequestError('update', result));
    }

    return res.status(200).json({
      success: true,
      wallet: new WalletModelResponse(result).getResponseModel(),
    });
  }

  static async getById(
    req: any,
    res: Response,
    next: Function,
    walletId: string,
  ): Promise<any> {
    const wallet = await WalletController._walletDataAgent.getById(walletId);

    if (!wallet) {
      return res
        .status(404)
        .json(new NotFoundError('getById', 'Wallet not found').toJSON());
    }
    req.wallet = wallet;

    return next();
  }
}
