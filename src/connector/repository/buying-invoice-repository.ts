import type { Pool, QueryResultRow } from "pg";
import type {
  BuyingInvoiceRepositoryInterface,
} from "../../application/interfaces/buying-invoice-repository-interface";
import type { BuyingInvoice } from "../../domain/entities/buying-invoice";
type BuyingInvoiceRow = QueryResultRow & {
  id: string;
  supplierName: string;
  invoiceNumber: string;
  taxFreeTotal: number;
  vatAmount: number;
  dueDate: string | null;
};

export class BuyingInvoiceRepository implements BuyingInvoiceRepositoryInterface {
  constructor(private readonly pool: Pool) {}

  async findByCompanyId(companyId: string): Promise<BuyingInvoice[]> {
    const { rows } = await this.pool.query<BuyingInvoiceRow>(
      `select id,
              supplier_name as "supplierName",
              invoice_number as "invoiceNumber",
              tax_free_total as "taxFreeTotal",
              vat_amount as "vatAmount",
              due_date as "dueDate"
       from buying_invoice
       where company_id = $1
         and deleted_at is null`,
      [companyId],
    );

    return rows;
  }
}