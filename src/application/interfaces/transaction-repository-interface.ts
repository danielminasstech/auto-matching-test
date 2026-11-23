import type { Transaction } from "../../domain/entities/transaction";

export interface TransactionRepositoryInterface {
  findByCompanyId(companyId: string): Promise<Transaction[]>;
  updateTransactionById(
    transactionId: string,
    updatedTransaction: Omit<Transaction, "id">,
  ): Promise<void>;
}
