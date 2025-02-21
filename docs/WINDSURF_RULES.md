# Windsurf Development Rules

## Component Architecture

### Route Components (Remix Routes)
- Handle server-side data fetching via `loader`
- Return only context providers with feature components
- Pass loader data as props to context providers

### Feature Components
- Import context and hooks from `[route].hooks.ts`
- No direct state management or functions
- Return UI Components with minimal wrapping HTML

### UI Components
- Pure presentation components
- Receive all data via props
- No hooks, state, or logic

## State Management

### Context
- One context provider per route
- Receives server data from loader
- Uses `useStates` hook from `[route].hooks.ts`

### Custom Hooks
- Defined in `[route].hooks.ts`
- Handle all state and functions
- May receive context state parameters

## Code Style Guidelines

### General
- Use early returns
- Implement TailwindCSS for styling
- Use `class:` over ternary operators
- Prefix event handlers with "handle"
- Implement accessibility features
- Use const arrow functions

### Performance
- Use `useMemo` and `useCallback` where beneficial
- Implement proper loading states
- Optimize data fetching

## Localization

### String Management
- Store in `app/data/data.ts`
- Support multiple languages
- Access via context states

## Database Guidelines

### MongoDB Setup
- Use local instance (port 27017)
- Separate dev/test databases
- Implement connection pooling

### Model Structure
- use file on 'utils/db.server'

## Remix Best Practices

### Data Handling
- Use `loader` for server-side fetching
- Use `action` for form submissions
- Implement proper error boundaries
- Set meta tags for SEO

### Navigation
- Use Remix `<Link>` component
- Implement proper loading states
- Handle client-side transitions

## Testing Guidelines

### Unit Tests
- Test individual components
- Test hooks and utilities
- Test data transformations

### Integration Tests
- Test complete user flows
- Test data fetching
- Test form submissions

## Documentation

### Code Documentation
- Document complex logic
- Document API integrations
- Document state management
- Keep README updated

### New Features
- Document solutions in rules
- Update testing guidelines
- Document breaking changes
