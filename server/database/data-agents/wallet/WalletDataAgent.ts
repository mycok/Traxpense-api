import { Types, CreateQuery } from 'mongoose';
import { IWalletDocument } from '../../data-abstracts';
import { handleErrorMessages } from '../../../../utils/dbErrorHandler';
import { IWalletModel } from '../../data-abstracts/wallet/WalletModel';

export interface IWalletDataAgent {
  create(data: CreateQuery<IWalletDocument>): Promise<IWalletDocument | string>;
  getByOwner(ownerId: string): Promise<IWalletDocument | null>;
  update(
    id: string,
    amount: number,
    didAddExpense?: boolean,
    expenseOrWalletUpdate?: { shouldDeductBalance: boolean }
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
    amount: number,
    didAddExpense?: boolean,
    expenseOrWalletUpdate?: { shouldDeductBalance: boolean },
  ): Promise<IWalletDocument | string> {
    const walletId = Types.ObjectId(id);
    const update = { currentBalance: amount };
    const walletToUpdate = await this.model.findById(walletId);

    if (didAddExpense) {
      update.currentBalance = (walletToUpdate?.currentBalance as number) - update.currentBalance;
      // TODO: Add functionality to increment walletToUpdate.totalSpent.
    } else if (expenseOrWalletUpdate) {
      // For direct wallet and expense amount update cases.
      if (expenseOrWalletUpdate.shouldDeductBalance) {
        update.currentBalance = (walletToUpdate?.currentBalance as number) - update.currentBalance;
      } else {
        update.currentBalance = (walletToUpdate?.currentBalance as number) + update.currentBalance;
      }
    } else {
      // For expense deletion cases.
      update.currentBalance = (walletToUpdate?.currentBalance as number) + update.currentBalance;
    }

    const result = await this.model
      .findByIdAndUpdate(walletId, update, {
        omitUndefined: true,
        new: true,
        runValidators: true,
      })
      .catch((err: any) => handleErrorMessages(err));

    return result;
  }
}
