import { Types } from 'mongoose';
import { IWalletDocument, WalletModel } from '../../data-abstracts';
import { BaseDataAgent } from '../BaseDataAgent';
import { handleErrorMessages } from '../../../../utils/dbErrorHandler';

export class WalletDataAgent extends BaseDataAgent<IWalletDocument> {
  constructor() {
    super(WalletModel);
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
