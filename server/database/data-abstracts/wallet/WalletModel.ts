import { Model, model } from 'mongoose';

import { IWalletDocument } from './IWalletDocument';
import { WalletSchema } from './WalletSchema';

export type IWalletModel = Model<IWalletDocument>;
export const WalletModel: IWalletModel = model('Wallet', WalletSchema);
