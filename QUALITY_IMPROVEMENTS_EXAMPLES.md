# Quality Improvements Examples

This document provides specific examples of how to fix the identified code quality issues.

## 1. Replacing `any` Types

### Example 1: Event Handlers
```typescript
// ❌ Before (CalendarSearchBar.tsx:84)
const handleFilterChange = (_: any, newValue: FilterOption[]) => {
  // ...
};

// ✅ After
const handleFilterChange = (_event: unknown, newValue: FilterOption[]) => {
  // ...
};
```

### Example 2: Error Types
```typescript
// ❌ Before (CalendarShell.tsx:45)
error?: any;

// ✅ After
interface ComponentError {
  message: string;
  code?: string;
  details?: Record<string, unknown>;
}
error?: ComponentError;
```

### Example 3: API Response Types
```typescript
// ❌ Before (MobileCalendarV2Page.tsx:327)
templatesData?: any[];

// ✅ After
interface TemplateData {
  id: number;
  name: string;
  // ... other properties
}
templatesData?: TemplateData[];
```

## 2. Fixing React Hooks Issues

### Example 1: Rules of Hooks
```typescript
// ❌ Before (TrainingTemplateForm.tsx:163)
const memoizedValue = useMemo(() => {
  // Inside a callback - WRONG!
}, []);

// ✅ After
const Component = () => {
  const memoizedValue = useMemo(() => {
    // At component top level - CORRECT!
  }, []);
  
  const handleCallback = () => {
    // Use the memoized value here
    return memoizedValue;
  };
};
```

### Example 2: Exhaustive Dependencies
```typescript
// ❌ Before (already fixed in useAuth.tsx)
useEffect(() => {
  dispatch(someAction());
}, []); // Missing 'dispatch'

// ✅ After
useEffect(() => {
  dispatch(someAction());
}, [dispatch]); // Include all dependencies
```

## 3. Proper Interface Definitions

### Example: Payment Data
```typescript
// ❌ Before (realTraining.ts:162)
payments: any[];

// ✅ After
interface Payment {
  id: number;
  amount: number;
  currency: string;
  date: string;
  method: 'cash' | 'card' | 'transfer';
  status: 'pending' | 'completed' | 'failed';
}
payments: Payment[];
```

## 4. Error Handling Best Practices

### Example: Try-Catch with Proper Types
```typescript
// ❌ Before
try {
  // some operation
} catch (error: any) {
  console.error(error);
}

// ✅ After
try {
  // some operation
} catch (error) {
  if (error instanceof Error) {
    console.error('Operation failed:', error.message);
  } else {
    console.error('Unknown error occurred:', error);
  }
}
```

## 5. Component Prop Types

### Example: Style Props
```typescript
// ❌ Before (DroppableSlot.tsx:12)
interface Props {
  sx?: any;
}

// ✅ After
import { SxProps, Theme } from '@mui/material';

interface Props {
  sx?: SxProps<Theme>;
}
```

## 6. Form Handling

### Example: Form Helpers
```typescript
// ❌ Before (PaymentForm.tsx:69)
const handleFormSubmit = async (values: PaymentFormData, { resetForm }: any) => {
  // ...
};

// ✅ After
import { FormikHelpers } from 'formik';

const handleFormSubmit = async (
  values: PaymentFormData, 
  helpers: FormikHelpers<PaymentFormData>
) => {
  // ...
};
```

## 7. Data Grid Columns

### Example: MUI DataGrid
```typescript
// ❌ Before (ClientsDataGrid.tsx:105)
renderCell: (params: any) => (
  <Component />
)

// ✅ After
import { GridRenderCellParams } from '@mui/x-data-grid';

renderCell: (params: GridRenderCellParams) => (
  <Component />
)
```

## 8. Generic Components

### Example: Reusable Hook
```typescript
// ❌ Before (useInvalidateQueries.tsx:21)
export const useInvalidateQueries = (queries: Array<() => Promise<any>>) => {

// ✅ After
export const useInvalidateQueries = <T = unknown>(
  queries: Array<() => Promise<T>>
) => {
```

## 9. API Service Types

### Example: Trainer API
```typescript
// ❌ Before (trainersApi.ts:166)
getTrainerPaymentsMobile: builder.query<any[], { period?: 'week' | '2weeks' }>({

// ✅ After
interface TrainerPayment {
  id: number;
  amount: number;
  date: string;
  description: string;
}

getTrainerPaymentsMobile: builder.query<TrainerPayment[], { period?: 'week' | '2weeks' }>({
```

## 10. Utility Functions

### Example: Formatter Functions
```typescript
// ❌ Before (trainingTypeColumns.tsx:6)
const priceFormatter = (value: number | null | undefined, params?: any) => {

// ✅ After
interface FormatterParams {
  field: string;
  id: string | number;
  row: Record<string, unknown>;
}

const priceFormatter = (
  value: number | null | undefined, 
  params?: FormatterParams
) => {
```

## Implementation Strategy

1. **Start with Critical Files**: Focus on API services and core utilities first
2. **Create Base Interfaces**: Define common interfaces in `models/` directory
3. **Use Type Guards**: Implement runtime type checking where needed
4. **Gradual Migration**: Replace `any` types incrementally to avoid breaking changes
5. **Test Thoroughly**: Ensure each change doesn't break existing functionality

## Automation Scripts

### Check for any usage:
```bash
grep -r ": any" src/ --include="*.ts" --include="*.tsx"
```

### Find React hooks violations:
```bash
npm run lint | grep "react-hooks"
```

### Type checking:
```bash
npx tsc --noEmit
```

## Common Pitfalls

1. **Don't Over-Type**: Not everything needs complex interfaces
2. **Use `unknown` for Truly Unknown Data**: Better than `any`
3. **Consider Generics**: For reusable components and functions
4. **Runtime Validation**: Add type guards for external data
5. **Incremental Changes**: Don't try to fix everything at once