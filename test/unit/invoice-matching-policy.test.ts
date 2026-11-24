import { describe, expect, it } from "vitest";
import type { BuyingInvoice } from "../../src/domain/entities/buying-invoice";
import type { Transaction } from "../../src/domain/entities/transaction";
import { InvoiceMatchingPolicy } from "../../src/domain/services/invoice-matching-policy";

const policy = new InvoiceMatchingPolicy();
const transaction: Transaction = {
  id: "transaction-1",
  amount: -120,
  label: "ACME invoice-1",
  date: "2026-01-31",
  matchedInvoiceId: null,
};

function invoice(overrides: Partial<BuyingInvoice> = {}): BuyingInvoice {
  return {
    id: "invoice-1",
    supplierName: "Acme",
    invoiceNumber: "invoice-1",
    taxFreeTotal: 100,
    vatAmount: 20,
    dueDate: "2026-02-10",
    ...overrides,
  };
}

describe("InvoiceMatchingPolicy", () => {
  it("matches exact amounts inside the inclusive due-date window", () => {
    expect(policy.findBestMatch(transaction, [
      invoice({ dueDate: "2026-02-03" }),
    ])?.id).toBe("invoice-1");
    expect(policy.findBestMatch(transaction, [
      invoice({ dueDate: "2026-03-02" }),
    ])?.id).toBe("invoice-1");
  });

  it("rejects candidates with a different amount or dates outside the window", () => {
    expect(policy.findBestMatch(transaction, [
      invoice({ vatAmount: 21 }),
    ])).toBeNull();
    expect(policy.findBestMatch(transaction, [
      invoice({ dueDate: "2026-01-27" }),
    ])).toBeNull();
    expect(policy.findBestMatch(transaction, [
      invoice({ dueDate: "2026-03-03" }),
    ])).toBeNull();
  });

  it("ignores invoices without a due date and compares amounts to cents", () => {
    expect(policy.findBestMatch(transaction, [
      invoice({ dueDate: null }),
    ])).toBeNull();

    expect(policy.findBestMatch(
      { ...transaction, amount: -120.1 },
      [invoice({ taxFreeTotal: 100.1, vatAmount: 20 })],
    )?.id).toBe("invoice-1");
  });

  it("scores invoices when their supplier or invoice number is missing", () => {
    expect(policy.findBestMatch(transaction, [
      invoice({ supplierName: null, invoiceNumber: null }),
    ])?.id).toBe("invoice-1");
  });

  it("uses the label bonus and keeps the first candidate when scores tie", () => {
    const first = invoice({
      id: "first",
      supplierName: "No label match",
      invoiceNumber: "no-match",
      dueDate: "2026-02-01",
    });
    const better = invoice({ id: "better", dueDate: "2026-02-10" });

    expect(policy.findBestMatch(transaction, [first, better])?.id).toBe("better");

    const tiedFirst = invoice({ id: "tied-first" });
    const tiedSecond = invoice({ id: "tied-second" });
    expect(policy.findBestMatch(transaction, [tiedFirst, tiedSecond])?.id).toBe(
      "tied-first",
    );
  });
});
