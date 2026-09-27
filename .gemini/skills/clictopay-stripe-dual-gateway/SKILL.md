---
name: clictopay-stripe-dual-gateway
description: 'Standardized dual-gateway architecture for ClicToPay (Monétique Tunisie SMT) and Stripe (International) across SaaS platform and tenant school levels.'
---

# ClicToPay & Stripe Dual-Gateway Architecture

## 1. Architectural Overview

The application features a decoupled, two-tier payment architecture:

```
+-----------------------------------------------------------------------------------+
| LEVEL 1: SaaS Platform Level (Root Admin)                                          |
| Model: PlatformPaymentConfig                                                      |
| Scope: Tenant SaaS subscriptions, license renewals, plan upgrades                |
| Payee: Platform Owner                                                             |
| Payers: Tenant / School Administrators                                            |
| Endpoints:                                                                        |
|   - GET  /billing/gateways (Public active gateways)                               |
|   - GET  /billing/config   (Root-only masked credentials)                         |
|   - PUT  /billing/config   (Root-only update credentials & toggle gateways)       |
|   - POST /billing/checkout (Tenant initiates subscription checkout)               |
+-----------------------------------------------------------------------------------+

+-----------------------------------------------------------------------------------+
| LEVEL 2: Tenant / School Level (School Admin)                                     |
| Model: PaymentConfig                                                              |
| Scope: Tuition fees, inscription fees, cafeteria, transport                      |
| Payee: School / Establishment                                                     |
| Payers: Parents / Students / Tutors                                               |
| Endpoints:                                                                        |
|   - GET  /establishments/payment-config (School admin get config)                 |
|   - PUT  /establishments/payment-config (School admin toggle & credentials)       |
|   - GET  /student-payments/:id/gateways (Check available school gateways)         |
|   - POST /student-payments/:id/online-checkout (Initiate student checkout)        |
+-----------------------------------------------------------------------------------+
```

## 2. Gateway Activation Rules & Consumer Experience

For both Level 1 and Level 2, the configuration supports 3 operational states:

1. **Only ClicToPay Enabled (`clicToPayEnabled: true, stripeEnabled: false`)**:
   - The checkout action directly launches ClicToPay (Monétique Tunisie / SMT).
   - Currency: Tunisian Dinar (TND) expressed in millimes (1 TND = 1000 millimes).
   - Accepted methods: Cartes CIB nationales, cartes bancaires tunisiennes Visa/Mastercard, e-Dinar de la Poste tunisienne.

2. **Only Stripe Enabled (`clicToPayEnabled: false, stripeEnabled: true`)**:
   - The checkout action directly launches Stripe Checkout Session.
   - Currency: TND or international currencies (EUR, USD) in cents.
   - Accepted methods: Visa, Mastercard, American Express, Apple Pay, Google Pay.

3. **Both Enabled (`clicToPayEnabled: true, stripeEnabled: true`)**:
   - The UI MUST render an interactive selection modal to the consumer (Payer).
   - The consumer chooses between:
     - **Option A: ClicToPay** (Cartes bancaires tunisiennes & e-Dinar).
     - **Option B: Stripe** (Cartes bancaires internationales).
   - Once selected, the checkout is routed to the chosen provider.

4. **Neither Enabled (`clicToPayEnabled: false, stripeEnabled: false`)**:
   - Online payment is unavailable. The UI displays an informative alert directing the consumer to cash or in-person bank transfer at the administrative caisse.

## 3. UI/UX Color Scheme Standard

In accordance with BSofts-School design rules, payment cards and selection modals must strictly adhere to the 5-color palette:
- Navy Deep `#242F40`: Main containers, modal headers, primary action buttons.
- Charcoal Dark `#363636`: Borders, card backgrounds, hover states.
- Gold Accent `#CCA43B`: Active selection borders, highlight badges, currency amounts, spinner accents.
- Platinum White `#E5E5E5`: Secondary text, input placeholders.
- Pure White `#FFFFFF`: Primary labels, card headers.

## 4. Security & Compliance Checklist

- [x] API Keys and Secret Keys are masked on read endpoints (`***` or `configured`).
- [x] Webhook endpoints verify signatures before updating database states.
- [x] No sensitive PAN, CVV, or cardholder credentials touch BSofts-School servers.
- [x] Strict tenant isolation enforced through `tenantId` / `establishmentId` filters on all queries.
