import { Response } from 'express';

import { BadRequestError } from '../../extensions/BadRequestError';
import { WalletDataAgent } from '../../database/data-agents/wallet/WalletDataAgent';
import { IWalletDocument, WalletModelResponse } from '../../database/data-abstracts';

// TODO: add read, update and delete methods if necessary
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
}
