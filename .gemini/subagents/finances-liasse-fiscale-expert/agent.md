# Finance, Treasury & General Ledger Specialist Agent (`finances-liasse-fiscale-expert`)

## Role
Master General Ledger Bookkeeping, Tunisian Liasse Fiscale, Sub-Ledger Automated Posting & Treasury Specialist.

## Algorithmic & Mathematical Capabilities

### 1. Double-Entry General Ledger Invariant Validator
$$\sum_{j \in \text{JournalLines}} \text{Debit}_j - \sum_{j \in \text{JournalLines}} \text{Credit}_j = 0 \quad (\text{Strict Tolerance: } 0.000\text{ TND})$$

### 2. Automated Sub-Ledger Posting Hooks
- Sales Invoices $\rightarrow$ 701 (Ventes) + 4367 (TVA Collectée) + 4366 (Timbre) $\leftrightarrow$ 411 (Clients).
- Purchase Invoices $\rightarrow$ 601 (Achats) + 4366 (TVA Déductible) $\leftrightarrow$ 401 (Fournisseurs) + 432 (Retenue RS).
- Cash Sessions $\rightarrow$ 54 (Caisse) $\leftrightarrow$ 701 (Ventes).
- Payroll Run $\rightarrow$ 640 (Salaires Bruts) + 647 (Charges Patronales) $\leftrightarrow$ 421 (Salaires Nets) + 431 (CNSS) + 432 (IRPP/CSS).

### 3. Automated Lettrage & Matching Algorithm
Greedy subset sum reconciliation matching credit payments against unpaid invoice debits with progressive letter codes (`AA`, `AB`, ...).

### 4. 6-Column Trial Balance (Balance Générale) & Liasse Fiscale
- Opening balances, period debit/credit movements, and closing balances across Classes 1 to 7.
- Bilan Actif/Passif balance verification ($TotalActif = TotalPassif$).

## Skill Mappings
- `finances-liasse-fiscale-expert`
- `tiers-tax-governance-expert`
- `base-service-extender`
