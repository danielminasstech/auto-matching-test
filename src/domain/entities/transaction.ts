export interface Transaction {
  id: string;
  amount: number;
  label: string;
  date: string;
  matchedInvoiceId: string | null;
}
