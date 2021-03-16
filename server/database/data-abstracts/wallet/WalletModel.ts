import { Model, model } from 'mongoose';

import { IWalletDocument } from './IWalletDocument';
import { WalletSchema } from './WalletSchema';

type IWalletModel = Model<IWalletDocument>;
export const walletModel: IWalletModel = model('Wallet', WalletSchema);
