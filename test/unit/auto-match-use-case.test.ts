import { describe, expect, it, vi } from "vitest";
import type { BuyingInvoice } from "../../src/domain/entities/buying-invoice";
import type { Transaction } from "../../src/domain/entities/transaction";
import { AutoMatchUseCase } from "../../src/application/usecases/auto-match-use-case";

const company = { id: "company-1", name: "Acme Ltd", siren: "123456789" };
const transaction: Transaction = {
  id: "transaction-1",
  amount: -120,
  label: "ACME invoice-1",
  date: "2026-01-31",
  matchedInvoiceId: null,
};
const invoice: BuyingInvoice = {
  id: "invoice-1",
  supplierName: "Acme",
  invoiceNumber: "invoice-1",
  taxFreeTotal: 100,
  vatAmount: 20,
  dueDate: "2026-02-10",
};

function makeUseCase(companyExists = true, invoices: BuyingInvoice[] = [invoice]) {
  const companies = {
    findCompanyBySiren: vi.fn(async () => companyExists ? company : null),
  };
  const transactions = {
    findByCompanyId: vi.fn(async () => [transaction]),
    updateTransactionById: vi.fn(async () => undefined),
  };
  const buyingInvoices = {
    findByCompanyId: vi.fn(async () => invoices),
  };

  return {
    useCase: new AutoMatchUseCase(companies, transactions, buyingInvoices),
    transactions,
  };
}

describe("AutoMatchUseCase", () => {
  it("saves the matching invoice on the transaction", async () => {
    const { useCase, transactions } = makeUseCase();

    await expect(useCase.execute(company.siren)).resolves.toEqual({
      matched: 1,
      totalTransactions: 1,
      skipped: 0,
    });
    expect(transactions.updateTransactionById).toHaveBeenCalledWith(
      transaction.id,
      { ...transaction, matchedInvoiceId: invoice.id },
    );
  });

  it("fails when the company cannot be found", async () => {
    const { useCase, transactions } = makeUseCase(false);

    await expect(useCase.execute(company.siren)).rejects.toThrow("Company not found");
    expect(transactions.findByCompanyId).not.toHaveBeenCalled();
  });

  it("leaves the transaction unchanged when there is no eligible invoice", async () => {
    const { useCase, transactions } = makeUseCase(true, []);

    await expect(useCase.execute(company.siren)).resolves.toEqual({
      matched: 0,
      totalTransactions: 1,
      skipped: 0,
    });
    expect(transactions.updateTransactionById).not.toHaveBeenCalled();
  });
});
