import { IWalletDocument, WalletModel, IWalletModel } from '../../data-abstracts';
import { BaseDataAgent } from '../../../../utils/BaseDataAgent';

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
}
