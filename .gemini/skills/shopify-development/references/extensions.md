# Extensions Reference

Guide for building UI extensions and Shopify Functions.

## Checkout UI Extensions

Customize checkout and thank-you pages with native-rendered components.

### Extension Points

**Block Targets (Merchant-Configurable):**

- `purchase.checkout.block.render` - Main checkout
- `purchase.thank-you.block.render` - Thank you page

**Static Targets (Fixed Position):**

- `purchase.checkout.header.render-after`
- `purchase.checkout.contact.render-before`
- `purchase.checkout.shipping-option-list.render-after`
- `purchase.checkout.payment-method-list.render-after`
- `purchase.checkout.footer.render-before`

### Setup

```bash
shopify app generate extension --type checkout_ui_extension
```

Configuration (`shopify.extension.toml`):

```toml
api_version = "2026-01"
name = "gift-message"
type = "ui_extension"

[[extensions.targeting]]
target = "purchase.checkout.block.render"

[capabilities]
network_access = true
api_access = true
```

### Basic Example

```javascript
import {
  reactExtension,
  BlockStack,
  TextField,
  Checkbox,
  useApi,
} from "@shopify/ui-extensions-react/checkout";

export default reactExtension("purchase.checkout.block.render", () => (
  <Extension />
));

function Extension() {
  const [message, setMessage] = useState("");
  const [isGift, setIsGift] = useState(false);
  const { applyAttributeChange } = useApi();

  useEffect(() => {
    if (isGift) {
      applyAttributeChange({
        type: "updateAttribute",
        key: "gift_message",
        value: message,
      });
    }
  }, [message, isGift]);

  return (
    <BlockStack spacing="loose">
      <Checkbox checked={isGift} onChange={setIsGift}>
        This is a gift
      </Checkbox>
      {isGift && (
        <TextField
          label="Gift Message"
          value={message}
          onChange={setMessage}
          multiline={3}
        />
      )}
    </BlockStack>
  );
}
```

### Common Hooks

**useApi:**

```javascript
const { extensionPoint, shop, storefront, i18n, sessionToken } = useApi();
```

**useCartLines:**

```javascript
const lines = useCartLines();
lines.forEach((line) => {
  console.log(line.merchandise.product.title, line.quantity);
});
```

**useShippingAddress:**

```javascript
const address = useShippingAddress();
console.log(address.city, address.countryCode);
```

**useApplyCartLinesChange:**

```javascript
const applyChange = useApplyCartLinesChange();

async function addItem() {
  await applyChange({
    type: "addCartLine",
    merchandiseId: "gid://shopify/ProductVariant/123",
    quantity: 1,
  });
}
```

### Core Components

**Layout:**

- `BlockStack` - Vertical stacking
- `InlineStack` - Horizontal layout
- `Grid`, `GridItem` - Grid layout
- `View` - Container
- `Divider` - Separator

**Input:**

- `TextField` - Text input
- `Checkbox` - Boolean
- `Select` - Dropdown
- `DatePicker` - Date selection
- `Form` - Form wrapper

**Display:**

- `Text`, `Heading` - Typography
- `Banner` - Messages
- `Badge` - Status
- `Image` - Images
- `Link` - Hyperlinks
- `List`, `ListItem` - Lists

**Interactive:**

- `Button` - Actions
- `Modal` - Overlays
- `Pressable` - Click areas

## Admin UI Extensions

Extend Shopify admin interface.

### Admin Action

Custom actions on resource pages.

```bash
shopify app generate extension --type admin_action
```

```javascript
import {
  reactExtension,
  AdminAction,
  Button,
} from "@shopify/ui-extensions-react/admin";

export default reactExtension("admin.product-details.action.render", () => (
  <Extension />
));

function Extension() {
  const { data } = useData();

  async function handleExport() {
    const response = await fetch("/api/export", {
      method: "POST",
      body: JSON.stringify({ productId: data.product.id }),
    });
    console.log("Exported:", await response.json());
  }

  return (
    <AdminAction
      title="Export Product"
      primaryAction={<Button onPress={handleExport}>Export</Button>}
    />
  );
}
```

**Targets:**

- `admin.product-details.action.render`
- `admin.order-details.action.render`
- `admin.customer-details.action.render`

### Admin Block

Embedded content in admin pages.

```javascript
import {
  reactExtension,
  BlockStack,
  Text,
  Badge,
} from "@shopify/ui-extensions-react/admin";

export default reactExtension("admin.product-details.block.render", () => (
  <Extension />
));

function Extension() {
  const { data } = useData();
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    fetchAnalytics(data.product.id).then(setAnalytics);
  }, []);

  return (
    <BlockStack>
      <Text variant="headingMd">Product Analytics</Text>
      <Text>Views: {analytics?.views || 0}</Text>
      <Text>Conversions: {analytics?.conversions || 0}</Text>
      <Badge tone={analytics?.trending ? "success" : "info"}>
        {analytics?.trending ? "Trending" : "Normal"}
      </Badge>
    </BlockStack>
  );
}
```

**Targets:**

- `admin.product-details.block.render`
- `admin.order-details.block.render`
- `admin.customer-details.block.render`

## POS UI Extensions

Customize Point of Sale experience.

### Smart Grid Tile

Quick access action on POS home screen.

```javascript
import {
  reactExtension,
  SmartGridTile,
} from "@shopify/ui-extensions-react/pos";

export default reactExtension("pos.home.tile.render", () => <Extension />);

function Extension() {
  function handlePress() {
    // Navigate to custom workflow
  }

  return (
    <SmartGridTile
      title="Gift Cards"
      subtitle="Manage gift cards"
      onPress={handlePress}
    />
  );
}
```

### POS Modal

Full-screen workflow.

```javascript
import {
  reactExtension,
  Screen,
  BlockStack,
  Button,
  TextField,
} from "@shopify/ui-extensions-react/pos";

export default reactExtension("pos.home.modal.render", () => <Extension />);

function Extension() {
  const { navigation } = useApi();
  const [amount, setAmount] = useState("");

  function handleIssue() {
    // Issue gift card
    navigation.pop();
  }

  return (
    <Screen name="Gift Card" title="Issue Gift Card">
      <BlockStack>
        <TextField label="Amount" value={amount} onChange={setAmount} />
        <TextField label="Recipient Email" />
        <Button onPress={handleIssue}>Issue</Button>
      </BlockStack>
    </Screen>
  );
}
```

## Customer Account Extensions

Customize customer account pages.

### Order Status Extension

```javascript
import {
  reactExtension,
  BlockStack,
  Text,
  Button,
} from "@shopify/ui-extensions-react/customer-account";

export default reactExtension(
  "customer-account.order-status.block.render",
  () => <Extension />,
);

function Extension() {
  const { order } = useApi();

  function handleReturn() {
    // Initiate return
  }

  return (
    <BlockStack>
      <Text variant="headingMd">Need to return?</Text>
      <Text>Start return for order {order.name}</Text>
      <Button onPress={handleReturn}>Start Return</Button>
    </BlockStack>
  );
}
```

**Targets:**

- `customer-account.order-status.block.render`
- `customer-account.order-index.block.render`
- `customer-account.profile.block.render`

## Shopify Functions

Serverless backend customization.

### Function Types

**Discounts:**

- `order_discount` - Order-level discounts
- `product_discount` - Product-specific discounts
- `shipping_discount` - Shipping discounts

**Payment Customization:**

- Hide/rename/reorder payment methods

**Delivery Customization:**

- Custom shipping options
- Delivery rules

**Validation:**

- Cart validation rules
- Checkout validation

### Create Function

```bash
shopify app generate extension --type function
```

### Order Discount Function

```javascript
// input.graphql
query Input {
  cart {
    lines {
      quantity
      merchandise {
        ... on ProductVariant {
          product {
            hasTag(tag: "bulk-discount")
          }
        }
      }
    }
  }
}

// function.js
export default function orderDiscount(input) {
  const targets = input.cart.lines
    .filter(line => line.merchandise.product.hasTag)
    .map(line => ({
      productVariant: { id: line.merchandise.id }
    }));

  if (targets.length === 0) {
    return { discounts: [] };
  }

  return {
    discounts: [{
      targets,
      value: {
        percentage: {
          value: 10  // 10% discount
        }
      }
    }]
  };
}
```

### Payment Customization Function

```javascript
export default function paymentCustomization(input) {
  const hidePaymentMethods = input.cart.lines.some(
    (line) => line.merchandise.product.hasTag,
  );

  if (!hidePaymentMethods) {
    return { operations: [] };
  }

  return {
    operations: [
      {
        hide: {
          paymentMethodId: "gid://shopify/PaymentMethod/123",
        },
      },
    ],
  };
}
```

### Validation Function

```javascript
export default function cartValidation(input) {
  const errors = [];

  // Max 5 items per cart
  if (input.cart.lines.length > 5) {
    errors.push({
      localizedMessage: "Maximum 5 items allowed per order",
      target: "cart",
    });
  }

  // Min $50 for wholesale
  const isWholesale = input.cart.lines.some(
    (line) => line.merchandise.product.hasTag,
  );

  if (isWholesale && input.cart.cost.totalAmount.amount < 50) {
    errors.push({
      localizedMessage: "Wholesale orders require $50 minimum",
      target: "cart",
    });
  }

  return { errors };
}
```

## Network Requests

Extensions can call external APIs.

```javascript
import { useApi } from "@shopify/ui-extensions-react/checkout";

function Extension() {
  const { sessionToken } = useApi();

  async function fetchData() {
    const token = await sessionToken.get();

    const response = await fetch("https://your-app.com/api/data", {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    return await response.json();
  }
}
```

## Best Practices

**Performance:**

- Lazy load data
- Memoize expensive computations
- Use loading states
- Minimize re-renders

**UX:**

- Provide clear error messages
- Show loading indicators
- Validate inputs
- Support keyboard navigation

**Security:**

- Verify session tokens on backend
- Sanitize user input
- Use HTTPS for all requests
- Don't expose sensitive data

**Testing:**

- Test on development stores
- Verify mobile/desktop
- Check accessibility
- Test edge cases

## Resources

- Checkout Extensions: https://shopify.dev/docs/api/checkout-extensions
- Admin Extensions: https://shopify.dev/docs/apps/admin/extensions
- Functions: https://shopify.dev/docs/apps/functions
- Components: https://shopify.dev/docs/api/checkout-ui-extensions/components


---

## 🛠️ Mandatory Workspace & Governance Directives (Upgraded Standards)

1. **Project Root & Paths**: Primary project workspace is E:\ToDo\BSofts.
2. **Auxiliary Workspace Directory Layout (.agents/bonus/)**:
   - **Scratch**: E:\ToDo\BSofts\.agents\bonus\Scratch — Scripting directory for creating temporary JS/TS scripts to inspect, verify, extract, or audit database & API components.
   - **Output**: E:\ToDo\BSofts\.agents\bonus\Scratch\Output — Deliverable directory for exported reports, data dumps, and persistent deliverables.
   - **Vault**: E:\ToDo\BSofts\.agents\bonus\Vault — Persistent memory vault directory holding state files (README.md, STATUS.md, PROGRESS.md, DECISIONS.md, DECLARATIONS.md, PROJECT.md).
3. **Autonomous Execution Loop (Rule #12)**:
   [1. Receive Goal] ➔ [2. Work & Implement] ➔ [3. Check & Verify (tsc --noEmit)] ➔ [4. Re-work if not complete] ➔ [5. Deliver Result] ➔ [6. Update Vault Memos].
4. **Autonomous Execution Permissions (Rule #13)**: Full permission to read, write, create, move files, and execute scripts/commands under E:\ToDo\BSofts without asking for permission.
5. **Mandatory Deletion Confirmation Guard (Rule #14)**: MUST ALWAYS ask user for explicit confirmation before deleting any file, folder, or database table.
6. **Zero Database Data Loss Guard (Rule #15)**: NEVER run commands that accept database data loss (such as prisma db push --accept-data-loss or forced table drops).


---

## 👥 BSOFT 5-Actor Role Architecture & Permanent Deletion Governance

1. **Developer (System Developer / Me)**:
   - Full platform god-mode access across all companies, tenants, endpoints, and system settings.
   - **Exclusive Permanent Deletion Authority**: Hard permanent deletes can ONLY be executed by Developer users. Non-developer delete requests default to soft-delete or throw ForbiddenException.
2. **Super Admin (Subscription Buyer & Owner)**:
   - Buyer of the SaaS subscription for his company/companies.
   - Full administrative control and feature configuration for his own company/companies only.
3. **Admin (Company Administrator)**:
   - Highest operational authority in a specific company right after Super Admin.
   - Manages day-to-day operations, employees, inventory, sales, and finance within his assigned company.
4. **Employees (Company Staff)**:
   - Operational staff members (Sales Agent, Accountant, Warehouse Manager) with role-restricted permissions.
5. **Third Parties (Clients & Providers / Suppliers)**:
   - External Customers (CLIENT) and Suppliers (FOURNISSEUR) operating in **Spectator Mode** — consult-only access restricted strictly to their own related records.

7. **Permanent Recursive File System Access Guarantee (Rule #16)**: Permanent, unrestricted, recursive read, write, create, and move permissions across all files, directories, subdirectories, and nested paths under E:\ToDo\BSofts at all times without asking for confirmation.
