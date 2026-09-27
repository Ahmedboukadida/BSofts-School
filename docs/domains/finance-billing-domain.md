# Domain 4: Finance, Caisse & Dual Payment Gateways

## 1. Domain Purpose
The Finance & Billing domain provides complete financial accounting for both the SaaS platform owner and individual school establishments. It cleanly decouples Level 1 SaaS subscription billing from Level 2 student tuition fee collections, managing dual payment gateways (Tunisian ClicToPay and International Stripe), daily cash desk (caisse), receipts, and payment schedules.

## 2. Decoupled Dual-Tier Architecture

```
+----------------------------------------------------------------------------------------------------+
| LEVEL 1: SaaS Platform Level (Root Admin)                                                           |
| Target: SaaS subscription billing, license renewals, plan upgrades                                |
| Payee: Platform Owner                                                                              |
| Payers: Tenant / School Administrators                                                             |
| Model: PlatformPaymentConfig                                                                       |
| Gateways:                                                                                          |
|   - Stripe: International card payments (EUR, USD, etc.)                                          |
|   - ClicToPay: Tunisian national bank cards & e-Dinar (TND)                                        |
+----------------------------------------------------------------------------------------------------+

+----------------------------------------------------------------------------------------------------+
| LEVEL 2: Tenant / School Level (School Admin)                                                      |
| Target: Tuition fees, inscription fees, cafeteria, transport, uniforms                            |
| Payee: School / Establishment                                                                      |
| Payers: Parents, Students, Tutors                                                                  |
| Model: PaymentConfig                                                                               |
| Gateways:                                                                                          |
|   - ClicToPay: Tunisian national bank cards & e-Dinar (TND in millimes)                            |
|   - Stripe: International cards for expatriate / foreign students                                  |
| Cash Desk: On-premise physical caisse / cash payments with auto-generated receipts                 |
+----------------------------------------------------------------------------------------------------+
```

## 3. Core Entities & Data Models
- **`PlatformPaymentConfig`**: Root Level 1 credentials (Stripe secret/publishable keys, ClicToPay merchant ID, terminal ID, secret key, environment toggle).
- **`PaymentConfig`**: School Level 2 credentials per establishment for student tuition processing.
- **`StudentPayment`**: Individual student tuition ledger with tuitionDue, tuitionPaid, paymentStatus (`PAID`, `PARTIAL`, `UNPAID`, `EXEMPT`), receiptNumber, and paymentMethod.
- **`CaisseTransaction`**: Physical cash desk ledger recording daily deposits, withdrawals, registration receipts, and balance reconciliations.
- **`Invoice`**: Formal tax invoice generated with establishment header, student details, line items, and VAT breakdown.

## 4. Key Endpoints & APIs
- `GET /billing/gateways`: List active Level 1 payment gateways for platform subscribers.
- `GET /billing/config` & `PUT /billing/config`: Root admin configuration of Level 1 gateways.
- `POST /billing/checkout`: Initialize Level 1 subscription checkout session.
- `POST /billing/webhook/stripe`: Stripe webhook listener verifying signatures and updating subscription status.
- `GET /establishments/payment-config` & `PUT /establishments/payment-config`: School admin Level 2 gateway setup.
- `GET /student-payments/:id/gateways`: Query available payment options for a tuition invoice.
- `POST /student-payments/:id/online-checkout`: Launch student tuition payment (redirect to Stripe or ClicToPay).
- `POST /payments/caisse/transaction`: Log a physical cash/cheque receipt with instant balance update.

## 5. Frontend Views
- `/admin/settings`: Level 1 Platform payment gateway credentials and switches.
- `/settings`: Level 2 School-specific payment gateway setup for tuition fee processing.
- `/payments`: Student tuition list with payment badges, receipt downloads, and balance summaries.
- `/payments/caisse`: School cash desk management with daily cash summary and entry logging.

## 6. Architectural Safeguards
- ClicToPay transactions operate strictly in Tunisian Dinars with amounts converted to millimes (`amount * 1000`).
- Stripe amounts are converted to smallest currency units (cents).
- If both gateways are enabled, the UI renders an interactive gateway selection modal to the payer.
- Webhook endpoints verify digital signatures to prevent spoofed payment confirmations.
