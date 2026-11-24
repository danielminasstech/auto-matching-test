import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { TransactionController } from "../../src/connector/controller/transaction-controller";
import { BuyingInvoiceRepository } from "../../src/connector/repository/buying-invoice-repository";
import { CompanyRepository } from "../../src/connector/repository/company-repository";
import { TransactionRepository } from "../../src/connector/repository/transaction-repository";
import { AutoMatchUseCase } from "../../src/application/usecases/auto-match-use-case";
import {
  createRepositoryTestDatabase,
  findMatchedInvoiceId,
} from "../integration/database-fixture";

const companySiren = "123456789";
const transactionId = "10000000-0000-4000-8000-000000000001";
const invoiceId = "b0000000-0000-4000-8000-000000000001";
let database: Awaited<ReturnType<typeof createRepositoryTestDatabase>>;
let controller: TransactionController;

describe("auto-matching flow", () => {
  beforeAll(async () => {
    database = await createRepositoryTestDatabase();
    const companies = new CompanyRepository(database.pool);
    const transactions = new TransactionRepository(database.pool);
    const invoices = new BuyingInvoiceRepository(database.pool);
    controller = new TransactionController(
      new AutoMatchUseCase(companies, transactions, invoices),
    );
  });

  afterAll(async () => {
    await database?.close();
  });

  it("matches an eligible transaction and persists the invoice", async () => {
    await expect(controller.matchTransactionWithInvoice(companySiren)).resolves.toEqual({
      matched: 1,
      totalTransactions: 1,
      skipped: 0,
    });
    await expect(findMatchedInvoiceId(database.pool, transactionId)).resolves.toBe(invoiceId);
  });

  it("fails when the company does not exist", async () => {
    await expect(controller.matchTransactionWithInvoice("000000000")).rejects.toThrow(
      "Company not found",
    );
  });
});
