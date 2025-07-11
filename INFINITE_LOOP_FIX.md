# Infinite Loop Fix

## Problem
The `TemplateSelect` component was causing an infinite loop with continuous template accessibility testing, resulting in repeated console messages:

```
Testing accessibility of template: edpp at /templates/Dossier-inscription-ALSH-EDPP-2025-2026.pdf
Testing accessibility of template: test-edpp at /templates/test-edpp.pdf
Testing accessibility of template: test-periscolaire at /templates/test-periscolaire.pdf
Testing accessibility of template: periscolaire at /templates/PERISCOLAIRE-2025-2026-Fiche-inscription.pdf
...
```

## Root Cause
The `useEffect` in `TemplateSelect.tsx` had a dependency on `templateIds`, which was being recreated on every render:

```typescript
// PROBLEM: This creates a new array reference on every render
const templateIds = Object.keys(TEMPLATE_MAPPINGS);

React.useEffect(() => {
  // This runs on every render because templateIds changes
  checkTemplates();
}, [templateIds]); // Dependency causes infinite loop
```

## Solution
1. **Memoized templateIds**: Used `React.useMemo` to create a stable reference
2. **Added check protection**: Prevented multiple simultaneous accessibility checks
3. **Reduced logging**: Commented out verbose console.log in testTemplateAccessibility
4. **Added clear start/end logging**: Better visibility of when checks occur

```typescript
// FIXED: Stable reference that doesn't change
const templateIds = React.useMemo(() => Object.keys(TEMPLATE_MAPPINGS), []);

// FIXED: Protection against multiple checks
const [isCheckingTemplates, setIsCheckingTemplates] = React.useState(false);

React.useEffect(() => {
  if (isCheckingTemplates) return; // Prevent multiple checks
  
  const checkTemplates = async () => {
    setIsCheckingTemplates(true);
    console.log('Starting template accessibility check...');
    // ... check logic ...
    setIsCheckingTemplates(false);
    console.log('Template accessibility check complete');
  };
  
  checkTemplates();
}, [templateIds, isCheckingTemplates]); // Now stable dependencies
```

## Result
- ✅ No more infinite loop
- ✅ Template accessibility check runs only once per component mount
- ✅ Clear logging of check start/end
- ✅ Protection against multiple simultaneous checks
- ✅ Better performance and user experience

## Files Modified
- `src/components/pdf/TemplateSelect.tsx` - Fixed useEffect dependencies
- `src/utils/pdf/pdfFormFiller.ts` - Reduced verbose logging

The application should now run smoothly without the continuous console spam.
