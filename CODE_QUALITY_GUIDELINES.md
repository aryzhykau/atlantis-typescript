# Code Quality Guidelines

This document outlines the code quality standards and best practices for the Atlantis TypeScript project.

## TypeScript Best Practices

### 1. Avoid `any` Type
- **Issue**: Use of `any` type defeats the purpose of TypeScript
- **Solution**: Define proper interfaces and types
- **Example**:
```typescript
// ❌ Bad
const data: any = {};

// ✅ Good  
interface UserData {
  id: number;
  name: string;
  email: string;
}
const data: UserData = {};
```

### 2. Use `as const` for Constants
- **Issue**: Type literals should use const assertions
- **Solution**: Use `as const` instead of type annotations for constants
- **Example**:
```typescript
// ❌ Bad
const STATUS: 'active' = 'active';

// ✅ Good
const STATUS = 'active' as const;
```

### 3. Proper Type Definitions
- Define interfaces for API responses
- Use union types for known values
- Avoid unsafe optional chain assertions

## React Best Practices

### 1. Follow Hooks Rules
- **Issue**: Hooks must be called at the top level
- **Solution**: Never call hooks inside loops, conditions, or nested functions
- **Example**:
```typescript
// ❌ Bad
if (condition) {
  const data = useMemo(() => calculateData(), []);
}

// ✅ Good
const data = useMemo(() => {
  if (condition) {
    return calculateData();
  }
  return null;
}, [condition]);
```

### 2. Exhaustive Dependencies
- **Issue**: Missing dependencies in useEffect/useCallback
- **Solution**: Include all referenced variables in dependency arrays
- **Example**:
```typescript
// ❌ Bad
useEffect(() => {
  fetchData(userId);
}, []);

// ✅ Good
useEffect(() => {
  fetchData(userId);
}, [userId]);
```

### 3. Component Export Patterns
- Export components as default or named consistently
- Avoid exporting constants from component files (use separate files)

## Code Organization

### 1. Import/Export Management
- Remove unused imports immediately
- Use absolute imports when possible
- Group imports logically (external, internal, relative)

### 2. File Structure
```
src/
├── components/     # Reusable components
├── features/       # Feature-specific code
├── hooks/          # Custom hooks
├── models/         # Type definitions
├── store/          # Redux/API logic
├── utils/          # Helper functions
└── theme/          # Styling
```

### 3. Naming Conventions
- Use PascalCase for components and types
- Use camelCase for functions and variables
- Use SCREAMING_SNAKE_CASE for constants

## Performance Best Practices

### 1. Bundle Size Optimization
- Use dynamic imports for large components
- Implement code splitting
- Current bundle: 2.2MB (consider optimization)

### 2. State Management
- Keep state as close to where it's used as possible
- Use Redux for global state only
- Implement proper memoization

## Security Guidelines

### 1. Dependency Management
- Keep dependencies up to date
- Fix security vulnerabilities promptly
- Use `npm audit` regularly

### 2. Environment Variables
- Never commit secrets to version control
- Use proper environment variable validation

## Testing Standards

### 1. Test Coverage
- Aim for meaningful test coverage
- Focus on business logic and user interactions
- Currently: Limited test coverage (only 1 test file found)

### 2. Test Structure
```typescript
describe('Component/Function Name', () => {
  it('should handle expected behavior', () => {
    // Arrange
    // Act
    // Assert
  });
});
```

## Linting and Formatting

### 1. ESLint Configuration
- Use strict TypeScript rules
- Enable React hooks rules
- Use type-aware linting

### 2. Pre-commit Hooks
- Run linting before commits
- Format code automatically
- Run type checking

## Common Issues Found

1. **64+ instances of `any` type usage** - Replace with proper types
2. **React hooks violations** - Fix dependency arrays and hook placement
3. **Unused variables/imports** - Clean up code regularly
4. **Unsafe optional chain assertions** - Use proper null checking
5. **Missing error boundaries** - Implement proper error handling

## Action Items

- [ ] Replace all `any` types with proper interfaces
- [ ] Fix React hooks dependency arrays
- [ ] Implement proper error boundaries
- [ ] Add comprehensive testing
- [ ] Set up pre-commit hooks
- [ ] Create component library documentation
- [ ] Implement performance monitoring
- [ ] Add bundle analysis

## Tools and Commands

```bash
# Lint code
npm run lint

# Build project
npm run build

# Security audit
npm audit

# Fix auto-fixable issues
npm run lint -- --fix
```

## Resources

- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React Best Practices](https://react.dev/)
- [ESLint Rules](https://eslint.org/docs/rules/)
- [Testing Library](https://testing-library.com/)