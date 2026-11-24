import type { Pool, QueryResultRow } from "pg";
import type {
  TransactionRepositoryInterface,
} from "../../application/interfaces/transaction-repository-interface";
import type { Transaction } from "../../domain/entities/transaction";

type TransactionRow = QueryResultRow & {
  id: string;
  amount: number;
  label: string;
  date: string;
  matchedInvoiceId: string | null;
};

export class TransactionRepository implements TransactionRepositoryInterface {
  constructor(private readonly pool: Pool) {}

  async findByCompanyId(companyId: string): Promise<Transaction[]> {
    const { rows } = await this.pool.query<TransactionRow>(
        `select transaction.id, transaction.amount, transaction.label, transaction.date,
              transaction.matched_invoice_id as "matchedInvoiceId"
        from transaction
        join account on account.id = transaction.account_id
        where account.company_id = $1
          and transaction.matched_invoice_id is null
          and transaction.deleted_at is null
          and transaction.amount < 0`,
      [companyId],
    );

    return rows;
  }

  async updateTransactionById(
    transactionId: string,
    updatedTransaction: Omit<Transaction, "id">,
  ): Promise<void> {
    const columnByProperty = {
      amount: "amount",
      label: "label",
      date: "date",
      matchedInvoiceId: "matched_invoice_id",
    } as const;
    const updates = Object.entries(columnByProperty).map(([property, column]) => ({
      column,
      value: updatedTransaction[property as keyof typeof columnByProperty],
    }));
    const assignments = updates.map(({ column }, index) => `${column} = $${index + 1}`);

    await this.pool.query(
      `update transaction set ${assignments.join(", ")} where id = $${updates.length + 1}`,
      [...updates.map(({ value }) => value), transactionId],
    );
  }
}