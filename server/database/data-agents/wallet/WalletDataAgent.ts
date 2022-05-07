import { Types, CreateQuery, UpdateQuery } from 'mongoose';
import { IWalletDocument } from '../../data-abstracts';
import { handleErrorMessages } from '../../../../utils/dbErrorHandler';
import { IWalletModel } from '../../data-abstracts/wallet/WalletModel';

export interface IWalletDataAgent {
  create(data: CreateQuery<IWalletDocument>): Promise<IWalletDocument | string>;
  getByOwner(ownerId: string): Promise<IWalletDocument | null>;
  update(
    id: string,
    updateProps: UpdateQuery<IWalletDocument>,
    deductible: boolean
  ): Promise<IWalletDocument | string>;
}

export class WalletDataAgent implements IWalletDataAgent {
  private readonly model: IWalletModel;

  constructor(model: IWalletModel) {
    this.model = model;
  }

  async create(data: CreateQuery<IWalletDocument>): Promise<IWalletDocument | string> {
    const result = await this.model
      .create(data)
      .catch((err: any) => handleErrorMessages(err));

    return result;
  }

  async getByOwner(ownerId: string): Promise<IWalletDocument | null> {
    const result = await this.model
      .findOne({ owner: ownerId })
      .populate('owner', '_id username email');

    return result;
  }

  async update(
    id: string,
    propsToUpdate: { currentBalance: number },
    deductible = true,
  ): Promise<IWalletDocument | string> {
    const walletId = Types.ObjectId(id);
    const updates = { ...propsToUpdate };
    const walletToUpdate = await this.model.findById(walletId);

    if (deductible) {
      updates.currentBalance = (walletToUpdate?.currentBalance as number) - updates.currentBalance;
    } else {
      updates.currentBalance = (walletToUpdate?.currentBalance as number) + updates.currentBalance;
    }

    const result = await this.model
      .findByIdAndUpdate(walletId, updates, {
        omitUndefined: true,
        new: true,
        runValidators: true,
      })
      .catch((err: any) => handleErrorMessages(err));

    return result;
  }
}
