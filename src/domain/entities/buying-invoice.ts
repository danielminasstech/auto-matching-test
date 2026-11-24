export interface BuyingInvoice {
  id: string;
  supplierName: string | null;
  invoiceNumber: string | null;
  taxFreeTotal: number;
  vatAmount: number;
  dueDate: string | null;
}
