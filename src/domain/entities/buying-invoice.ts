export interface BuyingInvoice {
  id: string;
  supplierName: string;
  invoiceNumber: string;
  taxFreeTotal: number;
  vatAmount: number;
  dueDate: string;
}
