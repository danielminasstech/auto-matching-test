import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { Pool } from "pg";
import { BuyingInvoiceRepository } from "../../src/connector/repository/buying-invoice-repository";
import { CompanyRepository } from "../../src/connector/repository/company-repository";
import { TransactionRepository } from "../../src/connector/repository/transaction-repository";
import {
  createRepositoryTestDatabase,
  findMatchedInvoiceId,
} from "./database-fixture";

let pool: Pool;
let closeDatabase: (() => Promise<void>) | undefined;
let companies: CompanyRepository;
let transactions: TransactionRepository;
let invoices: BuyingInvoiceRepository;

describe("PostgreSQL repositories", () => {
  beforeAll(async () => {
    const database = await createRepositoryTestDatabase();
    pool = database.pool;
    closeDatabase = database.close;

    companies = new CompanyRepository(pool);
    transactions = new TransactionRepository(pool);
    invoices = new BuyingInvoiceRepository(pool);
  });

  afterAll(async () => {
    await closeDatabase?.();
  });

  it("finds a company and returns only eligible invoices and transactions", async () => {
    const company = await companies.findCompanyBySiren("123456789");
    expect(company?.name).toBe("Acme Ltd");
    expect(await companies.findCompanyBySiren("000000000")).toBeNull();

    const companyTransactions = await transactions.findByCompanyId(company!.id);
    expect(companyTransactions.map(({ id }) => id)).toEqual([
      "10000000-0000-4000-8000-000000000001",
    ]);

    const companyInvoices = await invoices.findByCompanyId(company!.id);
    expect(companyInvoices.map(({ id }) => id)).toEqual([
      "b0000000-0000-4000-8000-000000000001",
    ]);
  });

  it("persists a transaction's invoice match", async () => {
    const transaction = (await transactions.findByCompanyId(
      "c0000000-0000-4000-8000-000000000001",
    ))[0];
    const invoiceId = "b0000000-0000-4000-8000-000000000001";

    await transactions.updateTransactionById(transaction.id, {
      amount: transaction.amount,
      label: transaction.label,
      date: transaction.date,
      matchedInvoiceId: invoiceId,
    });

    expect(await findMatchedInvoiceId(pool, transaction.id)).toBe(invoiceId);
  });
});
