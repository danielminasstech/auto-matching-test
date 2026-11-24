export interface Transaction {
  id: string;
  amount: number;
  label: string | null;
  date: string;
  matchedInvoiceId: string | null;
}
