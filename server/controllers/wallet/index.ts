import { Response } from 'express';

import { BadRequestError } from '../../extensions/BadRequestError';
import {
  WalletDataAgent,
  IWalletDataAgent,
} from '../../database/data-agents/wallet/WalletDataAgent';
import { IWalletDocument, WalletModelResponse } from '../../database/data-abstracts';
import { NotFoundError } from '../../extensions/NotFoundError';
import { Validator } from '../../validation/validators/index';
import walletUpdateSchema from '../../validation/schemas/wallet/update.json';
import { WalletModel } from '../../database/data-abstracts/wallet/WalletModel';

// TODO: add unit / end 2 end tests for all controller functionality
class WalletController {
  private readonly _walletDataAgent: IWalletDataAgent;

  constructor(dataAgent: IWalletDataAgent) {
    this._walletDataAgent = dataAgent;
    this.create = this.create.bind(this);
    this.read = this.read.bind(this);
    this.update = this.update.bind(this);
    this.updateOnNewExpense = this.updateOnNewExpense.bind(this);
    this.getById = this.getById.bind(this);
  }

  async create(req: any, res: Response) {
    const { auth } = req;
    const walletRequest: any = { owner: auth._id };

    await this._walletDataAgent.create(walletRequest as IWalletDocument);
  }

  async read(req: any, res: Response): Promise<Response> {
    const { wallet } = req;

    return res.status(200).json({
      success: true,
      wallet: new WalletModelResponse(wallet).getResponseModel(),
    });
  }

  async update(req: any, res: Response): Promise<Response> {
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

    const result = await this._walletDataAgent.update(_id, body, false);

    if (typeof result !== 'object') {
      return res.status(400).json(new BadRequestError('update', result).toJSON());
    }

    return res.status(200).json({
      success: true,
      wallet: new WalletModelResponse(result).getResponseModel(),
    });
  }

  async updateOnNewExpense(req: any, Res: Response) {
    const { auth: _id, expense } = req;

    const wallet = await this._walletDataAgent.getByOwner(_id);
    await this._walletDataAgent.update(
      wallet?._id as string,
      { currentBalance: expense.amount },
      true,
    );
  }

  async getById(
    req: any,
    res: Response,
    next: Function,
    ownerId: string,
  ): Promise<Response> {
    const wallet = await this._walletDataAgent.getByOwner(ownerId);

    if (!wallet) {
      return res
        .status(404)
        .json(new NotFoundError('getByOwner', 'Wallet not found').toJSON());
    }
    req.wallet = wallet;

    return next();
  }
}

export const walletController = new WalletController(new WalletDataAgent(WalletModel));
