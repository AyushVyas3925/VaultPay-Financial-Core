export type InvoiceStatus = 'pending' | 'paid' | 'overdue';

export interface LineItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
}

export interface Invoice {
  id: string;
  number: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  dueDate: string;
  issuedDate: string;
  paidAt?: string;
  lineItems: LineItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: InvoiceStatus;
}
export interface ClientSummary {
  id: string;
  name: string;
  email: string;
  invoiceCount: number;
  totalBilled: number;
}
