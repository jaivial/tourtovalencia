# Page Generator Development Guide

## Overview
Development tracking for the new "Generador de páginas" section in the admin dashboard. This feature will allow users to create new pages using existing templates and manage them.

## Architecture Guidelines

### Component Architecture
1. Route Components (admin.dashboard.pagegen.tsx)
   - Handle server-side data fetching via `loader`
   - Return only context providers with feature components
   - Pass loader data as props to context providers

2. Feature Components (_pagegen/*)
   - Import context and hooks from `[route].hooks.ts`
   - No direct state management or functions
   - Return UI Components with minimal wrapping HTML
   - Example: `PageTemplate.tsx`

3. UI Components (_pagegen/*)
   - Pure presentation components
   - Receive all data via props
   - No hooks, state, or logic
   - Example: `EditableText.tsx`, `ImageUpload.tsx`

### State Management
1. Context
   - One context provider per route
   - Receives server data from loader
   - Uses `useStates` hook from `[route].hooks.ts`

2. Custom Hooks
   - Defined in `[route].hooks.ts`
   - Handle all state and functions
   - Example: `EditableSanJuanSection1.hooks.ts`

### Code Style Guidelines
1. General
   - Use early returns
   - Implement TailwindCSS for styling
   - Use `class:` over ternary operators
   - Prefix event handlers with "handle"
   - Implement accessibility features
   - Use const arrow functions

2. Performance
   - Use `useMemo` and `useCallback` where beneficial
   - Implement proper loading states
   - Optimize data fetching

## Development Steps

### 1. Admin Dashboard UI Setup [✓]
- [✓] Create new section "Generador de páginas" in admin.dashboard.tsx
- [✓] Add main option buttons:
  - [✓] "Crear nueva página"
  - [✓] "Administrar páginas"
- [✓] Implement Framer Motion animations for button transitions

### 2. Page Creation Flow [✓]
- [✓] Create page name input form
  - [✓] Add input field with route name validation
  - [✓] Implement blank space to underscore conversion
  - [✓] Add "Next" button with animation
- [✓] Develop page preview system
  - [✓] Create dynamic template based on sanjuan.tsx
  - [✓] Implement editable text fields
  - [✓] Add HeroUI switch for "estado de la excursión"
    - [✓] States: "Activo" / "Proximamente"

### 3. Template Integration [ ]
- [✓] Integrate San Juan template sections
  - [✓] Add SanJuanSection1 with editable text fields
  - [✓] Add SanJuanSection2 with editable text fields
    - [✓] Create EditableSanJuanSection2 component
    - [✓] Add EditableText integration
    - [✓] Preserve Framer Motion animations
    - [✓] Maintain responsive design
  - [ ] Add SanJuanSection3 with image upload functionality
    - [✓] Create image upload interface
    - [✓] Add image preview functionality
    - [ ] Implement drag-and-drop functionality
    - [✓] Add image deletion capability
  - [ ] Add SanJuanSection4 with editable text fields
  - [ ] Add SanJuanSection5 with editable text fields
  - [ ] Add SanJuanSection6 with editable text fields
- [ ] Integrate IndexSection5 with editable text fields
- [✓] Create unified text editing interface
  - [✓] Add text preview functionality
  - [✓] Implement inline editing with style preservation
  - [✓] Add proper focus and blur handling

### 4. Image Management [ ]
- [✓] Set up image upload system
  - [✓] Create image upload interface
  - [✓] Implement image preview
  - [✓] Set up temporary storage
- [ ] Implement image preview system
  - [ ] Add image cropping functionality
  - [ ] Add image resize functionality
  - [ ] Implement lazy loading for images

### 5. Data Processing [ ]
- [ ] Set up MongoDB integration
  - [ ] Create schema for page data
  - [ ] Create schema for image data
  - [ ] Implement save functionality
- [ ] Translation System
  - [ ] Set up translation API integration
  - [ ] Implement text processing pipeline
- [ ] Data.json Integration
  - [ ] Create update mechanism for data.json
  - [ ] Implement proper error handling

### 6. Testing & Validation [ ]
- [ ] Unit Tests
  - [ ] Test page creation flow
  - [ ] Test image upload system
  - [ ] Test text editing functionality
  - [ ] Test data processing
  - [ ] Test translations
- [ ] Integration Tests
  - [ ] Test complete user flows
  - [ ] Test data fetching
  - [ ] Test form submissions

### 7. Documentation [ ]
- [ ] Code Documentation
  - [ ] Document complex logic
  - [ ] Document API integrations
  - [ ] Document state management
  - [ ] Keep README updated
- [ ] New Features
  - [ ] Document solutions in rules
  - [ ] Update testing guidelines
  - [ ] Document breaking changes

## Common Issues and Solutions

#### 1. Adding New Editable Sections
When adding a new editable section to the page generator, follow these steps to avoid common issues:

1. **Data Type Definition**
   - Add the new section's type to `data.ts`
   - Define default values in `admin.dashboard.pagegen.tsx`
   ```typescript
   const DEFAULT_NEW_SECTION_DATA: NewSectionType = {
     field1: "",
     field2: "",
     // ...other fields
   };
   ```

2. **State Management**
   - Add state in `admin.dashboard.pagegen.tsx`
   ```typescript
   const [newSectionData, setNewSectionData] = useState<NewSectionType>(DEFAULT_NEW_SECTION_DATA);
   ```
   - Create update handler
   ```typescript
   const handleNewSectionUpdate = (field: keyof NewSectionType, value: string) => {
     setNewSectionData(prev => ({
       ...prev,
       [field]: value
     }));
   };
   ```

3. **Component Props**
   - Update `PageTemplate` props type
   ```typescript
   export type PageTemplateProps = {
     // ...existing props
     newSectionData: NewSectionType;
     onNewSectionUpdate: (field: keyof NewSectionType, value: string) => void;
   };
   ```
   - Pass props in `PageTemplate` usage
   ```typescript
   <PageTemplate
     // ...existing props
     newSectionData={newSectionData}
     onNewSectionUpdate={handleNewSectionUpdate}
   />
   ```

4. **Event Handlers**
   - ⚠️ **IMPORTANT**: When replacing static components with editable ones, ensure all event handlers are properly transferred
   - Common issue: Missing status change handler when adding new sections
   ```typescript
   // Always include this in admin.dashboard.pagegen.tsx
   const handleStatusChange = (checked: boolean) => {
     setStatus(checked ? 'active' : 'upcoming');
   };
   ```

5. **Component Creation**
   - Create new editable component in `_pagegen` directory
   - Follow existing component patterns for consistency
   - Maintain original styling and animations
   - Use `EditableText` for text fields

6. **Testing**
   - Test all editable fields
   - Verify state updates
   - Check styling and animations
   - Ensure proper error handling

Following these steps will help avoid common issues like undefined handlers, missing props, and state management problems when adding new editable sections.

## Notes
- Following Remix best practices for data handling
- Implementing proper loading states
- Ensuring accessibility features
- Using TailwindCSS for styling
- Implementing responsive design for all components
- Adding proper error handling for image uploads
