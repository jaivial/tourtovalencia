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

## Page Generator Implementation Guide

## 1. Add Confirmation Modal
- [ ] Create Modal component
- [ ] Add open/close state management
- [ ] Implement translation-ready text

## 2. Database Operations
- [ ] Create Page schema
- [ ] Implement insert logic
- [ ] Add unique page identifier

## 3. Route Generation
- [ ] Create dynamic route template
- [ ] Implement slug formatting
- [ ] Add route registration

## 4. Navigation Updates
- [ ] Fetch generated pages
- [ ] Add dynamic links
- [ ] Maintain existing links

## 5. Localization System
- [ ] Store translations
- [ ] Implement language toggle
- [ ] Connect to text display

## 6. Testing
- [ ] End-to-end publish flow
- [ ] Route accessibility
- [ ] Translation validation

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

#### 4. Adding SanJuanSection4
When implementing SanJuanSection4, follow these steps:

1. **Component Structure**
   ```typescript
   // EditableSanJuanSection4.tsx
   interface EditableSanJuanSection4Props {
     data: sanJuanSection4Type;
     onUpdate: (field: keyof sanJuanSection4Type, value: string) => void;
   }
   ```

2. **State Management**
   - Create `EditableSanJuanSection4.hooks.ts` for state logic
   - Add section4 state to `admin.dashboard.pagegen.tsx`
   ```typescript
   const DEFAULT_SECTION4_DATA: sanJuanSection4Type = {
     title: "",
     description: "",
     // Add other fields based on design
   };
   ```

3. **Integration Steps**
   - Create base component preserving original styling
   - Add EditableText components for text fields
   - Preserve Framer Motion animations
   - Maintain responsive design
   - Add to PageTemplate component

4. **Testing Points**
   - Verify text editing functionality
   - Check animation preservation
   - Test responsive behavior
   - Validate state updates

5. **Common Issues**
   - Animation conflicts with editable fields
   - State synchronization delays
   - Responsive layout breaks during editing

6. **Solutions**
   - Use layoutId for smooth animation transitions
   - Implement proper state debouncing
   - Add responsive class overrides for edit mode

## Error Prevention

### Common Issues and Solutions

1. **Undefined Props Error Prevention**
   - Always provide default values for section data in the route component
   - Implement proper type checking in components
   - Use optional chaining when accessing nested properties
   - Example for section data:
   ```typescript
   // In PageTemplate.tsx
   type PageTemplateProps = {
     section5Data?: sanJuanSection5Type; // Make prop optional
     // ...other props
   };

   // In EditableSanJuanSection5.tsx
   interface EditableSanJuanSection5Props {
     data?: sanJuanSection5Type; // Make prop optional
     // ...other props
   }

   const EditableSanJuanSection5: React.FC<EditableSanJuanSection5Props> = ({ 
     data = DEFAULT_SECTION5_DATA, // Provide default value
     // ...other props 
   }) => {
     // Use data safely here
   };
   ```

2. **State Management Best Practices**
   - Initialize state with default values in hooks
   - Use TypeScript to ensure type safety
   - Implement proper error boundaries
   - Example:
   ```typescript
   // In [component].hooks.ts
   export const useEditableSection = (initialData?: SectionType) => {
     const [data, setData] = useState<SectionType>(initialData ?? DEFAULT_DATA);
     // ...rest of the hook
   };
   ```

3. **Component Initialization**
   - Always check if required props are available
   - Provide meaningful error messages
   - Use React.Suspense for loading states
   - Example:
   ```typescript
   if (!data) {
     return <div>Loading section data...</div>;
   }
   ```

## Notes
- Following Remix best practices for data handling
- Implementing proper loading states
- Ensuring accessibility features
- Using TailwindCSS for styling
- Implementing responsive design for all components
- Adding proper error handling for image uploads
