import type { BuyingInvoice } from "../../domain/entities/buying-invoice";

export type { BuyingInvoice } from "../../domain/entities/buying-invoice";

export interface BuyingInvoiceRepositoryInterface {
  findByCompanyId(companyId: string): Promise<BuyingInvoice[]>;
}
