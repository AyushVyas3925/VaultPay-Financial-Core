import { User } from '@/types/user';
import { Invoice, ClientSummary } from '@/types/invoice';

export interface MemoryStore {
  users: (User & { passwordHash: string })[];
  invoices: Invoice[];
}

const seedUsers: (User & { passwordHash: string })[] = [
  {
    id: 'user_evelyn',
    name: 'Evelyn Croft',
    email: 'evelyn@nexus.com',
    role: 'admin',
    passwordHash: 'admin123',
  },
  {
    id: 'user_sarah',
    name: 'Sarah Jenkins',
    email: 'sarah@meridian.com',
    role: 'client',
    clientId: 'client_meridian',
    passwordHash: 'client123',
  },
  {
    id: 'user_james',
    name: 'James Carter',
    email: 'james@apex.com',
    role: 'client',
    clientId: 'client_apex',
    passwordHash: 'client123',
  },
  {
    id: 'user_elena',
    name: 'Elena Rostova',
    email: 'elena@vanguard.com',
    role: 'client',
    clientId: 'client_vanguard',
    passwordHash: 'client123',
  },
  {
    id: 'user_marcus',
    name: 'Marcus Vance',
    email: 'marcus@horizon.com',
    role: 'client',
    clientId: 'client_horizon',
    passwordHash: 'client123',
  },
];

const seedInvoices: Invoice[] = [
  {
    id: 'inv_1',
    number: 'INV-2026-001',
    clientId: 'client_meridian',
    clientName: 'Meridian Partners',
    clientEmail: 'sarah@meridian.com',
    dueDate: '2026-06-15',
    issuedDate: '2026-05-15',
    lineItems: [
      { id: 'li_1_1', description: 'Financial Strategy Consulting', quantity: 10, rate: 500 },
      { id: 'li_1_2', description: 'B2B Accounts Audit & Compliance', quantity: 1, rate: 3000 },
    ],
    subtotal: 8000,
    tax: 710,
    total: 8710,
    status: 'pending',
  },
  {
    id: 'inv_2',
    number: 'INV-2026-002',
    clientId: 'client_meridian',
    clientName: 'Meridian Partners',
    clientEmail: 'sarah@meridian.com',
    dueDate: '2026-04-30',
    issuedDate: '2026-03-31',
    paidAt: '2026-04-28',
    lineItems: [
      { id: 'li_2_1', description: 'Q1 Corporate Tax Advisory Services', quantity: 1, rate: 12000 },
    ],
    subtotal: 12000,
    tax: 1065,
    total: 13065,
    status: 'paid',
  },
  {
    id: 'inv_3',
    number: 'INV-2026-003',
    clientId: 'client_meridian',
    clientName: 'Meridian Partners',
    clientEmail: 'sarah@meridian.com',
    dueDate: '2026-05-20',
    issuedDate: '2026-04-20',
    lineItems: [
      { id: 'li_3_1', description: 'Mergers & Acquisitions Legal Advisory', quantity: 20, rate: 600 },
    ],
    subtotal: 12000,
    tax: 1065,
    total: 13065,
    status: 'overdue',
  },
  {
    id: 'inv_4',
    number: 'INV-2026-004',
    clientId: 'client_apex',
    clientName: 'Apex Global',
    clientEmail: 'james@apex.com',
    dueDate: '2026-06-20',
    issuedDate: '2026-05-20',
    lineItems: [
      { id: 'li_4_1', description: 'Supply Chain Optimization Review', quantity: 1, rate: 15000 },
      { id: 'li_4_2', description: 'Logistics Architecture Mapping', quantity: 2, rate: 2500 },
    ],
    subtotal: 20000,
    tax: 1775,
    total: 21775,
    status: 'pending',
  },
  {
    id: 'inv_5',
    number: 'INV-2026-005',
    clientId: 'client_apex',
    clientName: 'Apex Global',
    clientEmail: 'james@apex.com',
    dueDate: '2026-05-05',
    issuedDate: '2026-04-05',
    paidAt: '2026-05-02',
    lineItems: [
      { id: 'li_5_1', description: 'Q1 Risk Assessment & Mitigation Consulting', quantity: 1, rate: 8500 },
    ],
    subtotal: 8500,
    tax: 754.38,
    total: 9254.38,
    status: 'paid',
  },
  {
    id: 'inv_6',
    number: 'INV-2026-006',
    clientId: 'client_vanguard',
    clientName: 'Vanguard Advisory',
    clientEmail: 'elena@vanguard.com',
    dueDate: '2026-06-10',
    issuedDate: '2026-05-10',
    lineItems: [
      { id: 'li_6_1', description: 'Asset Allocation Consulting', quantity: 8, rate: 750 },
      { id: 'li_6_2', description: 'Security Portfolio Risk Audit', quantity: 1, rate: 4000 },
    ],
    subtotal: 10000,
    tax: 887.5,
    total: 10887.5,
    status: 'pending',
  },
  {
    id: 'inv_7',
    number: 'INV-2026-007',
    clientId: 'client_vanguard',
    clientName: 'Vanguard Advisory',
    clientEmail: 'elena@vanguard.com',
    dueDate: '2026-05-15',
    issuedDate: '2026-04-15',
    paidAt: '2026-05-14',
    lineItems: [
      { id: 'li_7_1', description: 'Wealth Management System Onboarding', quantity: 1, rate: 25000 },
    ],
    subtotal: 25000,
    tax: 2218.75,
    total: 27218.75,
    status: 'paid',
  },
  {
    id: 'inv_8',
    number: 'INV-2026-008',
    clientId: 'client_vanguard',
    clientName: 'Vanguard Advisory',
    clientEmail: 'elena@vanguard.com',
    dueDate: '2026-05-01',
    issuedDate: '2026-04-01',
    lineItems: [
      { id: 'li_8_1', description: 'Private Equity Sourcing Services', quantity: 1, rate: 30000 },
    ],
    subtotal: 30000,
    tax: 2662.5,
    total: 32662.5,
    status: 'overdue',
  },
  {
    id: 'inv_9',
    number: 'INV-2026-009',
    clientId: 'client_horizon',
    clientName: 'Horizon Venture',
    clientEmail: 'marcus@horizon.com',
    dueDate: '2026-06-25',
    issuedDate: '2026-05-25',
    lineItems: [
      { id: 'li_9_1', description: 'Growth Capital Consulting Services', quantity: 12, rate: 800 },
    ],
    subtotal: 9600,
    tax: 852,
    total: 10452,
    status: 'pending',
  },
  {
    id: 'inv_10',
    number: 'INV-2026-010',
    clientId: 'client_horizon',
    clientName: 'Horizon Venture',
    clientEmail: 'marcus@horizon.com',
    dueDate: '2026-05-28',
    issuedDate: '2026-04-28',
    paidAt: '2026-05-27',
    lineItems: [
      { id: 'li_10_1', description: 'Series B Fundraising Pitch Advisory', quantity: 1, rate: 45000 },
    ],
    subtotal: 45000,
    tax: 3993.75,
    total: 48993.75,
    status: 'paid',
  },
  {
    id: 'inv_11',
    number: 'INV-2026-011',
    clientId: 'client_meridian',
    clientName: 'Meridian Partners',
    clientEmail: 'sarah@meridian.com',
    dueDate: '2026-07-01',
    issuedDate: '2026-05-31',
    lineItems: [
      { id: 'li_11_1', description: 'Corporate Governance Advisory', quantity: 1, rate: 5000 },
    ],
    subtotal: 5000,
    tax: 443.75,
    total: 5443.75,
    status: 'pending',
  },
  {
    id: 'inv_12',
    number: 'INV-2026-012',
    clientId: 'client_apex',
    clientName: 'Apex Global',
    clientEmail: 'james@apex.com',
    dueDate: '2026-07-05',
    issuedDate: '2026-05-31',
    lineItems: [
      { id: 'li_12_1', description: 'IT Infrastructure Integration Consulting', quantity: 40, rate: 250 },
    ],
    subtotal: 10000,
    tax: 887.5,
    total: 10887.5,
    status: 'pending',
  },
  {
    id: 'inv_13',
    number: 'INV-2026-013',
    clientId: 'client_vanguard',
    clientName: 'Vanguard Advisory',
    clientEmail: 'elena@vanguard.com',
    dueDate: '2026-07-10',
    issuedDate: '2026-05-31',
    lineItems: [
      { id: 'li_13_1', description: 'Portfolio Rebalancing Advisory', quantity: 1, rate: 7500 },
    ],
    subtotal: 7500,
    tax: 665.63,
    total: 8165.63,
    status: 'pending',
  },
  {
    id: 'inv_14',
    number: 'INV-2026-014',
    clientId: 'client_horizon',
    clientName: 'Horizon Venture',
    clientEmail: 'marcus@horizon.com',
    dueDate: '2026-07-15',
    issuedDate: '2026-05-31',
    lineItems: [
      { id: 'li_14_1', description: 'Executive Recruitment Consultations', quantity: 1, rate: 18000 },
    ],
    subtotal: 18000,
    tax: 1597.5,
    total: 19597.5,
    status: 'pending',
  },
  {
    id: 'inv_15',
    number: 'INV-2026-015',
    clientId: 'client_meridian',
    clientName: 'Meridian Partners',
    clientEmail: 'sarah@meridian.com',
    dueDate: '2026-03-15',
    issuedDate: '2026-02-15',
    paidAt: '2026-03-12',
    lineItems: [
      { id: 'li_15_1', description: 'Corporate Restructuring Analysis', quantity: 1, rate: 35000 },
    ],
    subtotal: 35000,
    tax: 3106.25,
    total: 38106.25,
    status: 'paid',
  },
  {
    id: 'inv_16',
    number: 'INV-2026-016',
    clientId: 'client_apex',
    clientName: 'Apex Global',
    clientEmail: 'james@apex.com',
    dueDate: '2026-02-28',
    issuedDate: '2026-01-28',
    lineItems: [
      { id: 'li_16_1', description: 'Strategic Expansion Feasibility Report', quantity: 1, rate: 28000 },
    ],
    subtotal: 28000,
    tax: 2485,
    total: 30485,
    status: 'overdue',
  },
];

declare global {
  var globalInvoiceStore: MemoryStore | undefined;
}

if (!globalThis.globalInvoiceStore) {
  globalThis.globalInvoiceStore = {
    users: seedUsers,
    invoices: seedInvoices,
  };
}

const localStore = globalThis.globalInvoiceStore;

export const store = {
  getUsers() {
    return localStore.users;
  },

  getUserByEmail(email: string) {
    return localStore.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  },

  getInvoices(role: string, clientId?: string): Invoice[] {
    if (role === 'admin') {
      return localStore.invoices;
    }
    if (role === 'client' && clientId) {
      return localStore.invoices.filter(i => i.clientId === clientId);
    }
    return [];
  },

  getInvoice(id: string, role: string, clientId?: string): Invoice | null {
    const invoice = localStore.invoices.find(i => i.id === id);
    if (!invoice) return null;

    if (role === 'admin') {
      return invoice;
    }
    if (role === 'client' && clientId && invoice.clientId === clientId) {
      return invoice;
    }
    return null;
  },

  createInvoice(data: {
    clientId: string;
    clientName: string;
    clientEmail: string;
    dueDate: string;
    lineItems: Omit<Invoice['lineItems'][number], 'id'>[];
  }): Invoice {
    const id = `inv_${Date.now()}`;
    const year = new Date().getFullYear();
    const lastNum = localStore.invoices.length + 1;
    const number = `INV-${year}-${String(lastNum).padStart(3, '0')}`;

    const items = data.lineItems.map((item, idx) => ({
      ...item,
      id: `li_${id}_${idx}`,
    }));

    const subtotal = items.reduce((acc, current) => acc + current.quantity * current.rate, 0);
    const tax = Math.round(subtotal * 0.08875 * 100) / 100;
    const total = Math.round((subtotal + tax) * 100) / 100;

    const newInvoice: Invoice = {
      id,
      number,
      clientId: data.clientId,
      clientName: data.clientName,
      clientEmail: data.clientEmail,
      dueDate: data.dueDate,
      issuedDate: new Date().toISOString().split('T')[0],
      lineItems: items,
      subtotal,
      tax,
      total,
      status: 'pending',
    };

    localStore.invoices.unshift(newInvoice);
    return newInvoice;
  },

  markPaid(invoiceId: string): boolean {
    const idx = localStore.invoices.findIndex(i => i.id === invoiceId);
    if (idx !== -1) {
      localStore.invoices[idx] = {
        ...localStore.invoices[idx],
        status: 'paid',
        paidAt: new Date().toISOString().split('T')[0],
      };
      return true;
    }
    return false;
  },

  getClientsSummaries(): ClientSummary[] {
    const clientsMap = new Map<string, { name: string; email: string; invoices: Invoice[] }>();

    localStore.users.forEach(u => {
      if (u.role === 'client' && u.clientId) {
        clientsMap.set(u.clientId, { name: u.name, email: u.email, invoices: [] });
      }
    });

    localStore.invoices.forEach(inv => {
      const bucket = clientsMap.get(inv.clientId);
      if (bucket) {
        bucket.invoices.push(inv);
      } else {
        clientsMap.set(inv.clientId, { name: inv.clientName, email: inv.clientEmail, invoices: [inv] });
      }
    });

    return Array.from(clientsMap.entries()).map(([id, info]) => {
      const totalBilled = info.invoices.reduce((sum, i) => sum + i.total, 0);
      return {
        id,
        name: info.name,
        email: info.email,
        invoiceCount: info.invoices.length,
        totalBilled: Math.round(totalBilled * 100) / 100,
      };
    });
  },
};
