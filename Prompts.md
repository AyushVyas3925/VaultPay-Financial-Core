### What I needed help with

**Problem 1: Invoices going out of sync between admin and client after deploying to Render**

After deploying to Render, the admin would create an invoice but the client's SWR hook wasn't picking it up. I checked the network tab and the GET `/api/invoices` response was returning stale data — the new invoice wasn't in the JSON even though `store.createInvoice()` had already pushed it into the array. Locally with `next dev` it worked because Turbopack keeps the same process alive, but on Render I suspected the module-level `const` was getting re-evaluated across serverless invocations, creating separate array references. I also noticed that some GET responses had `x-nextjs-cache: HIT` in the headers, which meant Next.js was serving a cached static snapshot instead of running the handler.

**AI response summary:**
The stale reference issue can be fixed by attaching the store to `globalThis` so the same object persists across module re-evaluations within a single Node process. The caching issue is a Next.js App Router default — GET route handlers are treated as static unless explicitly marked dynamic. Add `export const dynamic = "force-dynamic"` and `export const revalidate = 0` to every API route, and set `{ cache: "no-store" }` on client-side fetches.

**Decision made:** Moved the store initialization behind a `globalThis.globalInvoiceStore` check in `src/lib/store.ts` so the arrays persist across hot reloads. Added `force-dynamic` and `revalidate = 0` to all six API route files. Updated the SWR fetcher to pass `{ cache: "no-store" }` so the browser doesn't use its own HTTP cache either. Verified by creating an invoice as admin and confirming the client dashboard picks it up on the next 2-second SWR polling interval.

---

**Problem 2: Streaming jsPDF binary output through a Next.js route handler**

I needed to generate a downloadable PDF receipt with line items, tax breakdown, and company branding. I ruled out Puppeteer because it requires a Chromium binary and Render's free tier has limited disk space. jsPDF was lightweight enough, but when I tried returning `doc.output()` as a string in `NextResponse.json()`, the browser was downloading a corrupted file — the binary data was getting mangled by JSON serialization. I needed to figure out the right way to return raw binary from an App Router route handler.

**AI response summary:**
Don't use `NextResponse.json()` for binary data. Call `doc.output("arraybuffer")` to get a raw `ArrayBuffer`, then return it in a plain `new Response(buffer)` with `Content-Type: application/pdf` and `Content-Disposition: attachment; filename="..."` headers. The browser will trigger a native download dialog.

**Decision made:** Built the full PDF layout in `src/app/api/pdf/[id]/route.ts` — company header with `doc.setFont("helvetica", "bold")`, client billing section, line items table with dynamic Y-coordinate tracking (`currentY += 10` per row), and subtotal/tax(8.875%)/total footer. Used `doc.output("arraybuffer")` and returned it in a raw `Response` object. The route validates ownership through `store.getInvoice(id, role, clientId)` before rendering — clients can't generate PDFs for invoices that don't belong to them (returns 404, not 403, to avoid leaking invoice existence).

---

**Problem 3: Webhook route had a dev bypass that skipped Stripe's HMAC signature verification**

For local testing, I had built a conditional in the webhook route — if `STRIPE_WEBHOOK_SECRET` was set to `whsec_placeholder`, the route would skip `stripe.webhooks.constructEvent()` and accept any POST body as a valid event, as long as the request had a `stripe-signature: mock_signature` header. The `PayButton` component also had a `isMockMode` branch that bypassed `stripe.confirmCardPayment()` entirely and POSTed a fake `payment_intent.succeeded` event directly to `/api/webhooks/stripe`. It was fast for demos, but it meant anyone who discovered the mock header could hit the endpoint from curl and mark arbitrary invoices as paid — completely bypassing Stripe's HMAC-SHA256 signature chain.

**AI response summary:**
Remove the bypass entirely — no conditional paths around `constructEvent()`. If the webhook secret isn't configured, return 503 immediately. The mock mode in PayButton should also be removed so there's no client-side code that fabricates webhook payloads. For local development, use `stripe listen --forward-to localhost:3000/api/webhooks/stripe` to get a real signing secret and forward actual Stripe events.

**Decision made:** Removed the `mock_signature` conditional from `src/app/api/webhooks/stripe/route.ts`. The route now returns 503 if the secret is missing or set to placeholder, and runs `stripe.webhooks.constructEvent(payload, signature, webhookSecret)` on every request — invalid signatures get a 400. Stripped out the `isMockMode` flag, mock card inputs, and the fake webhook POST from `src/features/checkout/PayButton.tsx`. The component now only renders Stripe's `<CardElement>` inside an `<Elements>` provider and calls `stripe.confirmCardPayment(clientSecret, { payment_method: { card: cardElement } })` for the actual charge.

---

**Problem 4: Invoice creation accepting malformed payloads and passwords stored in plaintext**

The `POST /api/invoices` handler was using a manual `if (!clientId || !clientName || !lineItems || !Array.isArray(lineItems))` guard, which catches nulls and missing fields but doesn't validate types — I tested in Postman and the route happily accepted `{ quantity: "abc", rate: -500 }` without complaining, which would create a broken invoice with NaN in the total calculation. Separately, I noticed the seed passwords in `src/lib/store.ts` were stored as raw strings (`passwordHash: 'admin123'`) and the auth flow in `src/auth.ts` was comparing them with `===` — the field was named `passwordHash` but it wasn't actually a hash.

**AI response summary:**
Use Zod for structured schema validation — define `z.number().int().positive()` for quantity, `z.number().positive()` for rate, `z.string().email()` for email, and wrap line items in `z.array().min(1)`. Use `.safeParse()` and return `parsed.error.flatten().fieldErrors` in the 400 response for field-level error reporting. For passwords, pre-compute bcrypt hashes with cost factor 10 and swap the `===` comparison for `bcrypt.compareSync()`.

**Decision made:** Added `zod` and `bcryptjs` as dependencies. Defined `lineItemSchema` and `createInvoiceSchema` at the top of `src/app/api/invoices/route.ts` — the route now calls `createInvoiceSchema.safeParse(body)` and returns structured validation errors on failure. Generated bcrypt hashes for both passwords using `bcrypt.hashSync('admin123', 10)` and `bcrypt.hashSync('client123', 10)`, replaced all five plaintext strings in the seed data. Updated the `authorize` callback in `src/auth.ts` from `user.passwordHash === credentials.password` to `bcrypt.compareSync(credentials.password as string, user.passwordHash)`. Tested login with both admin and client accounts to confirm the hashed comparison works correctly.
