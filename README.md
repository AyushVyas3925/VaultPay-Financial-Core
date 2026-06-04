# VaultPay Financial Core

Secure, role-based corporate invoicing portal with Stripe payment integration. Built for Nexus Corporate Services to replace their manual billing workflow with a centralized self-service platform.

**Live:** [vaultpay-financial-core-0p0f.onrender.com](https://vaultpay-financial-core-0p0f.onrender.com)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16.2.6 (App Router, Turbopack) |
| Auth | NextAuth v5 (Beta) — JWT strategy, Credentials provider |
| Payments | Stripe Elements + PaymentIntents API |
| Validation | Zod schema validation on all API routes |
| Styling | Tailwind CSS v4 |
| Data Fetching | SWR |
| PDF Generation | jsPDF (server-side) |
| Language | TypeScript 5 |

---

## Features

### Admin Portal (`/admin/*`)
- Financial dashboard with revenue metrics and recent invoices
- Client contract management — view all registered clients
- Invoice creation form with dynamic line items and live total calculation
- View any invoice detail with PDF download

### Client Portal (`/client/*`)
- Personalized billing dashboard showing outstanding balance
- View only own invoices — server-enforced data isolation
- Pay invoices directly via Stripe Elements (card input)
- Payment history with settled receipts

### Security
- **Server-side RBAC** via `proxy.ts` (Next.js 16 Middleware) — no client-side guard dependencies
- **API-level auth** — every route validates session + role before returning data
- **403 enforcement** — clients attempting `/admin/*` are redirected to a 403 page
- **Zod validation** — all POST bodies and URL params are schema-validated
- **Stripe webhook signature verification** — prevents spoofed payment events

---

## Project Structure

```
src/
├── app/                    # Next.js App Router pages + API routes
│   ├── admin/              # Admin dashboard, clients, invoices, create
│   ├── client/             # Client dashboard, invoices, payments
│   ├── api/                # REST endpoints (invoices, checkout, pdf, webhooks)
│   ├── login/              # Authentication page
│   └── 403/                # Forbidden access page
├── features/               # Domain-specific components
│   ├── auth/               # AuthContext provider
│   ├── checkout/           # Stripe PayButton component
│   ├── invoices/           # InvoiceTable, InvoiceDetailView, StatusBadge, StatCard
│   └── shell/              # Shell layout, Header, Sidebar, SearchModal
├── lib/                    # Server-side modules
│   ├── auth.ts             # Session helpers (requireAuth, requireAdmin, handleApiError)
│   └── store.ts            # In-memory data store (seed users + invoices)
├── types/                  # Shared TypeScript interfaces
├── auth.ts                 # NextAuth configuration
└── proxy.ts                # Next.js 16 Middleware (route protection)
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+
- Stripe account (test mode keys)

### Installation

```bash
git clone https://github.com/AyushVyas3925/VaultPay-Financial-Core.git
cd VaultPay-Financial-Core
npm install
```

### Environment Variables

Create a `.env.local` file in the project root:

```env
AUTH_SECRET="your-generated-secret-here"
NEXTAUTH_URL="http://localhost:3000"

NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

Generate `AUTH_SECRET` with:
```bash
npx auth secret
```

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Production Build

```bash
npm run build
npm start
```

---

## Demo Credentials

| Role | Email | Password |
|---|---|---|
| Admin | `Vault@Vaultpay.com` | `VpAdmin@2026!` |
| Client | `sarah@meridian.com` | `VpClient@2026!` |

Quick-fill buttons are available on the login page.

---

## API Routes

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/invoices` | Any role | List invoices (filtered by role) |
| `POST` | `/api/invoices` | Admin | Create new invoice |
| `GET` | `/api/invoices/[id]` | Any role | Get invoice detail |
| `GET` | `/api/clients` | Admin | List client summaries |
| `POST` | `/api/checkout` | Client | Create Stripe PaymentIntent |
| `GET` | `/api/pdf/[id]` | Any role | Generate and download invoice PDF |
| `POST` | `/api/webhooks/stripe` | Public | Stripe webhook (signature-verified) |

---

## Stripe Test Cards

| Scenario | Card Number |
|---|---|
| Successful payment | `4242 4242 4242 4242` |
| Requires authentication | `4000 0025 0000 3155` |
| Declined | `4000 0000 0000 0002` |

Use any future expiry date and any 3-digit CVC.

---

## Known Limitations

- **In-memory data store** — all data resets on server restart. Production deployment requires migration to a persistent database (MongoDB Atlas or PostgreSQL).
- **No email notifications** — PDF receipts are downloadable but not emailed automatically.

---

## License

Private — Prodesk IT internal delivery.
