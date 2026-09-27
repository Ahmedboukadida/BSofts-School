---
name: realestate-urbanism-expert
description: Expert in Real Estate Development, Urban Planning Surface Ratios (COS/CES), Net Sales Pricing, and 15-Day Deposit Hold State Machine from SPIZ.
---

# Real Estate Urbanism Expert Skill

Governs real estate development logic within BSOFTS:
- Max Buildable Floor Area: `Land_Area * COS`
- Max Footprint: `Land_Area * CES`
- Net Sales Price: `Surface_m² * Price_per_m² * (1 + VAT) + Registration_Fees`
- 15-Day Deposit Expiration State Machine
