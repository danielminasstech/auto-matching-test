import type { BuyingInvoice } from "../entities/buying-invoice";
import type { Transaction } from "../entities/transaction";

const MAX_DAYS_BEFORE_TRANSACTION = 3;
const MAX_DAYS_AFTER_TRANSACTION = 30;
const LABEL_MATCH_SCORE_BONUS = 100;

function normalizeLabel(value: string): string {
  return value.trim().toLowerCase();
}

function dayDiff(a: string, b: string): number {
  return Math.floor((new Date(a).getTime() - new Date(b).getTime()) / 86400000);
}

export class InvoiceMatchingPolicy {
  findBestMatch(
    transaction: Transaction,
    invoices: BuyingInvoice[],
  ): BuyingInvoice | null {
    const transactionAmount = Math.abs(transaction.amount);
    let bestInvoice: BuyingInvoice | null = null;
    let bestScore = Number.POSITIVE_INFINITY;

    for (const invoice of invoices) {
      if (
        Math.round((invoice.taxFreeTotal + invoice.vatAmount) * 100) !==
        Math.round(transactionAmount * 100)
      ) {
        continue;
      }

      if (invoice.dueDate === null) {
        continue;
      }

      const diff = dayDiff(transaction.date, invoice.dueDate);
      // Keep the positive form to preserve filter behavior for invalid dates (NaN).
      if (
        !(diff >= -MAX_DAYS_AFTER_TRANSACTION && diff <= MAX_DAYS_BEFORE_TRANSACTION)
      ) {
        continue;
      }

      const score = this.scoreCandidate(transaction, invoice, diff);
      if (score < bestScore) {
        bestScore = score;
        bestInvoice = invoice;
      }
    }

    return bestInvoice;
  }

  private scoreCandidate(
    transaction: Transaction,
    invoice: BuyingInvoice,
    dueDateDifference: number,
  ): number {
    let score = Math.abs(dueDateDifference);
    const label = normalizeLabel(transaction.label);

    if (
      label.includes(normalizeLabel(invoice.supplierName)) ||
      label.includes(normalizeLabel(invoice.invoiceNumber))
    ) {
      score -= LABEL_MATCH_SCORE_BONUS;
    }

    return score;
  }
}
