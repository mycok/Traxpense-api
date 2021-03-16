import { IWalletDocument, WalletModel } from '../../data-abstracts';
import { BaseDataAgent } from '../../../../utils/BaseDataAgent';

export class WalletDataAgent extends BaseDataAgent<IWalletDocument> {
  constructor() {
    super(WalletModel);
  }
}
