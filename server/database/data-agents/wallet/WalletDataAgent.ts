import { IWalletDocument, WalletModel, IWalletModel } from '../../data-abstracts';
import { BaseDataAgent } from '../../../../utils/BaseDataAgent';
import { handleErrorMessages } from '../../../../utils/dbErrorHandler';

export class WalletDataAgent extends BaseDataAgent<IWalletDocument> {
  private readonly _walletModel: IWalletModel;

  constructor() {
    super(WalletModel);
    this._walletModel = WalletModel;
  }

  async getById(id: string): Promise<IWalletDocument | null> {
    const result = await this._walletModel
      .findById(id)
      .populate('owner', '_id username email');

    return result;
  }

  async update(id: string, propsToUpdate: any): Promise<IWalletDocument | string> {
    const updates = { ...propsToUpdate };
    const walletToUpdate = await this._walletModel.findById(id);

    if (Object.keys(updates).includes('currentBalance')) {
      updates.currentBalance = walletToUpdate?.currentBalance + updates.currentBalance;
    }

    const result = await this._walletModel
      .findOneAndUpdate({ _id: id }, updates, {
        omitUndefined: true,
        new: true,
        runValidators: true,
      })
      .catch((err: any) => handleErrorMessages(err));

    return result;
  }
}
