---
name: zero-silent-catch-error-resilience
description: 'Engineering standards for zero silent catch blocks, user-visible toast notifications, API error payload extraction, and UI recovery states.'
---

# Zero Silent Catch & Error Resilience Standard

## 1. Principles
Silent errors degrade user trust and make debugging nearly impossible in production. Under this standard:
1. **Never Swallow**: No catch block may be empty or contain only a `console.log` / `console.error`.
2. **User Notification**: Every failed user-initiated mutation MUST trigger an informative feedback message (toast or modal banner).
3. **Structured API Parsing**: Parse NestJS error payloads (`response.data.message` which may be a string or array of strings).
4. **Preserve Operational Flow**: Reset loading states (`setIsSubmitting(false)`, `setIsLoading(false)`) in `finally` blocks so forms do not freeze permanently.

## 2. Standard Implementation Pattern

```typescript
import { useToast } from '@/components/ui/toast';

export function useActionHandler() {
  const { showToast, showApiErrorToast } = useToast();

  const handleSave = async (payload: any) => {
    setIsSubmitting(true);
    try {
      await api.post('/resource', payload);
      showToast.success('Élément enregistré avec succès');
      setIsFormModalOpen(false);
      fetchData();
    } catch (err: any) {
      // PROHIBITED: .catch(() => {})
      // REQUIRED: Clean error extraction
      showApiErrorToast(err, "Impossible d'enregistrer l'élément");
    } finally {
      setIsSubmitting(false);
    }
  };
}
```

## 3. Extracting Detailed NestJS Error Messages
NestJS ValidationPipe returns:
```json
{
  "statusCode": 400,
  "message": ["email must be an email", "capacity must not be less than 1"],
  "error": "Bad Request"
}
```
`showApiErrorToast` extracts `message[0]` or joins them with commas, ensuring the user sees the exact business rule violation instead of a generic "An error occurred".
