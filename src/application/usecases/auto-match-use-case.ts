import type { BuyingInvoiceRepositoryInterface } from "../interfaces/buying-invoice-repository-interface";
import type { CompanyRepositoryInterface } from "../interfaces/company-repository-interface";
import type { TransactionRepositoryInterface } from "../interfaces/transaction-repository-interface";
import { InvoiceMatchingPolicy } from "../../domain/services/invoice-matching-policy";

export interface AutoMatchResult {
  matched: number;
  totalTransactions: number;
  skipped: number;
}

export class AutoMatchUseCase {
  constructor(
    private readonly companiesRepo: CompanyRepositoryInterface,
    private readonly transactionsRepo: TransactionRepositoryInterface,
    private readonly invoicesRepo: BuyingInvoiceRepositoryInterface,
    private readonly matchingPolicy = new InvoiceMatchingPolicy(),
  ) {}

  async execute(companySiren: string): Promise<AutoMatchResult> {
    const company = await this.companiesRepo.findCompanyBySiren(companySiren);
    if (!company) {
      throw new Error(`Company not found for SIREN ${companySiren}`);
    }

    const [transactions, invoices] = await Promise.all([
      this.transactionsRepo.findByCompanyId(company.id),
      this.invoicesRepo.findByCompanyId(company.id),
    ]);
    if(!transactions || !invoices) {
      throw new Error(`No transactions or invoices found for company with SIREN ${companySiren}`);
    }
    let matched = 0;
    let skipped = 0;

    for (const transaction of transactions) {
      try {
        const invoice = this.matchingPolicy.findBestMatch(transaction, invoices);
        if (!invoice) {
          continue;
        }

        const updatedTransaction = {
          ...transaction,
          matchedInvoiceId: invoice.id,
        };
        await this.transactionsRepo.updateTransactionById(
          transaction.id,
          updatedTransaction,
        );
        matched++;
      } catch (error) {
        console.log("skip", error);
        skipped++;
      }
    }

    return {
      matched,
      totalTransactions: transactions.length,
      skipped,
    };
  }
}
