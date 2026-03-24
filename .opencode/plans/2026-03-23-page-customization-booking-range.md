# Page Customization & Tour Booking Range Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Two features: (1) Allow complete removal/addition of items within page sections, and (2) Add customizable booking people range per tour with database migration.

**Architecture:**
1. **Page Customization**: Introduce a `sectionOrder` array in page content that defines which sections exist, their order, and which items within each section are enabled. The render in `pages.$slug.tsx` will iterate through this order array and conditionally render items based on enabled flags.
2. **Tour Booking Range**: Add `minPeople` and `maxPeople` fields to both Page and Tour schemas. Create a migration file to add these fields to existing documents. Update admin UI, loader, and booking flow.

**Tech Stack:** Remix, MongoDB, TypeScript, Framer Motion

---

## PART 1: Page Customization (Removable/Addable Items in Sections)

### Task 1: Define Section Order & Item Enable Type Definitions

**Files:**
- Modify: `app/data/data.ts`

**Step 1: Add new type for section ordering**

Add to `app/data/data.ts`:

```typescript
export type SectionOrderItem = {
  id: string;           // e.g., "section1", "section3.images", "timeline.steps.0"
  enabled: boolean;
  order: number;
};

export type PageSectionsConfig = {
  sections: SectionOrderItem[];
};
```

**Step 2: Update all existing section types to include optional `enabled` flags for sub-items**

For example, update `sanJuanSection3Type`:
```typescript
export type sanJuanSection3Type = {
  images: Array<{ source: string; alt: string; enabled?: boolean }>;
  enabled?: boolean;
};
```

Update `SanJuanSection6Type` list item:
```typescript
export type SanJuanSection6listType = {
  li: string;
  index: number;
  enabled?: boolean;
};
```

**Step 3: Commit**

---

### Task 2: Update Database Schema for Page

**Files:**
- Modify: `app/utils/db.schema.server.ts`

**Step 1: Add `sectionOrder` field to Page interface**

In the `Page` interface, add:
```typescript
content: {
  es: {
    // ... existing fields
    sectionOrder?: SectionOrderItem[];
    // ... existing fields
  };
  en: {
    // ... existing fields
    sectionOrder?: SectionOrderItem[];
    // ... existing fields
  };
};
```

Also add helper type:
```typescript
export type SectionOrderItem = {
  id: string;
  enabled: boolean;
  order: number;
};
```

**Step 2: Commit**

---

### Task 3: Update DynamicPageContainer for Dynamic Section Rendering

**Files:**
- Modify: `app/components/_pages/DynamicPageContainer.tsx`

**Step 1: Update rendering logic to respect enabled flags**

Replace static section rendering with dynamic approach:

```tsx
// Define section component map
const sectionComponents = {
  indexSection5: IndexSection5,
  section1: SanJuanSection1,
  section2: SanJuanSection2,
  section3: SanJuanSection3,
  section4: SanJuanSection4,
  section5: SanJuanSection5,
  section6: SanJuanSection6,
  timeline: TimelineSection,
};

// Helper to check if a section/item is enabled
const isItemEnabled = (itemId: string, sectionOrder?: SectionOrderItem[]): boolean => {
  if (!sectionOrder) return true; // Default to enabled if no config
  const item = sectionOrder.find(s => s.id === itemId);
  return item?.enabled ?? true;
};

// Get section order sorted by order field
const getOrderedSections = (sectionOrder?: SectionOrderItem[]): SectionOrderItem[] => {
  if (!sectionOrder) return [];
  return [...sectionOrder].sort((a, b) => a.order - b.order);
};
```

**Step 2: Update render method to use dynamic sections**

```tsx
// In the render method, replace hardcoded sections with:
const orderedSections = getOrderedSections(content.sectionOrder);

return (
  <div className="w-full h-auto flex flex-col items-start z-0 bg-blue-50 overflow-x-hidden animate-fadeIn gap-12 pt-[100px]">
    {orderedSections
      .filter(s => s.enabled)
      .map(section => {
        const Component = sectionComponents[section.id as keyof typeof sectionComponents];
        if (!Component) return null;
        // Pass appropriate props based on section type
        return <Component key={section.id} {...getSectionProps(section.id, content, width, height)} />;
      })}
  </div>
);
```

**Step 3: Add helper function for section props**

```tsx
const getSectionProps = (sectionId: string, content: any, width: number, height: number) => {
  switch (sectionId) {
    case 'section3':
      return { width, images: content.section3?.images?.filter((img: any) => img.enabled !== false) || [] };
    case 'section6':
      return {
        width,
        SanJuanSection6Text: {
          ...content.section6,
          list: content.section6?.list?.filter((item: any) => item.enabled !== false) || []
        },
        // ... other props
      };
    // ... other sections
    default:
      return { width };
  }
};
```

**Step 4: Commit**

---

### Task 4: Update pages.$slug.tsx for Dynamic Section Rendering

**Files:**
- Modify: `app/routes/pages.$slug.tsx`

**Step 1: Add helper functions for dynamic rendering**

Add the same `isItemEnabled` and `getOrderedSections` helpers at the top of the file.

**Step 2: Refactor the section rendering loop**

Replace the hardcoded section rendering with:

```tsx
const orderedSections = getOrderedSections(content.sectionOrder);

// Section component map
const sectionComponents: Record<string, React.ComponentType<any>> = {
  indexSection5: DynamicPageContainer.IndexSection,
  section1: DynamicPageContainer.Section1,
  section2: DynamicPageContainer.Section2,
  section3: SanJuanSection3Dynamic,
  section4: DynamicPageContainer.Section4,
  section5: SanJuanSection5Dynamic,
  timeline: DynamicPageContainer.Timeline,
  section6: DynamicPageContainer.Section6,
};

return (
  <div className="w-full h-auto flex flex-col items-start z-0 bg-blue-50 overflow-x-hidden animate-fadeIn gap-12 pt-[100px]">
    {orderedSections
      .filter(s => s.enabled)
      .map(section => {
        const Component = sectionComponents[section.id];
        if (!Component) return null;
        // Render with appropriate props
        return renderSection(section.id, Component, content, safeWidth, safeHeight);
      })}
    {/* Floating button remains at end */}
  </div>
);
```

**Step 3: Add renderSection helper**

```tsx
const renderSection = (sectionId: string, Component: React.ComponentType<any>, content: any, width: number, height: number) => {
  switch (sectionId) {
    case 'section3':
      return <Component width={width} images={content.section3?.images?.filter((img: any) => img.enabled !== false) || []} />;
    case 'section6':
      return <Component
        width={width}
        SanJuanSection6Text={{
          ...content.section6,
          list: content.section6?.list?.filter((item: any) => item.enabled !== false) || []
        }}
        isInfoRequestOnly={isInfoRequestWhatsAppOnly}
        infoRequestUrl={infoRequestUrl}
        infoRequestLabel={infoRequestButtonText}
        missingInfoContactText={missingInfoContactText}
      />;
    // ... other cases
    default:
      return null;
  }
};
```

**Step 4: Commit**

---

### Task 5: Update Admin Edit UI for Section/Item Management

**Files:**
- Create: `app/components/_pagegen/SectionOrderEditor.tsx`
- Modify: `app/components/_pagegen/PageTemplate.tsx`
- Modify: `app/routes/admin.dashboard.pagegen.edit.$slug.tsx`
- Modify: `app/routes/admin.pagecreation.tsx`

**Step 1: Create SectionOrderEditor component**

Create a new component that allows:
- Drag-and-drop reordering of sections
- Toggle visibility (enabled/disabled) per section
- Expand sections to see individual items
- Toggle individual item visibility within sections

```tsx
// app/components/_pagegen/SectionOrderEditor.tsx
interface SectionOrderEditorProps {
  sections: SectionOrderItem[];
  onSectionsChange: (sections: SectionOrderItem[]) => void;
  // Available section definitions
  availableSections: Array<{ id: string; label: string; items?: Array<{ id: string; label: string }> }>;
}
```

**Step 2: Add section order editor to PageTemplate**

Add a collapsible panel at the top of PageTemplate that shows the SectionOrderEditor.

**Step 3: Add handlers for item-level enable/disable**

Update each editable section component (EditableSanJuanSection3, EditableSanJuanSection6, etc.) to:
- Accept an `onItemEnabledChange` callback
- Render a toggle/remove button next to each item
- Call the callback when items are added/removed/toggled

**Step 4: Update admin.dashboard.pagegen.edit.$slug.tsx**

Pass through the new section order props to PageTemplate.

**Step 5: Update admin.pagecreation.tsx**

Initialize default section order on page creation.

**Step 6: Commit**

---

## PART 2: Tour Booking Range (minPeople/maxPeople)

### Task 6: Create Database Migration for Booking Range

**Files:**
- Create: `app/migrations/001_add_booking_range.ts`

**Step 1: Create migration file**

```typescript
// app/migrations/001_add_booking_range.ts
import { getDb } from "~/utils/db.server";

export async function migration_001_add_booking_range() {
  const db = await getDb();

  // Add minPeople and maxPeople to pages collection
  await db.collection("pages").updateMany(
    {},
    {
      $set: {
        "content.es.minPeople": 1,
        "content.es.maxPeople": 10,
        "content.en.minPeople": 1,
        "content.en.maxPeople": 10
      }
    }
  );

  // Add minPeople and maxPeople to tours collection
  await db.collection("tours").updateMany(
    {},
    {
      $set: {
        minPeople: 1,
        maxPeople: 10
      }
    }
  );

  console.log("Migration 001: Added minPeople and maxPeople fields");
}

export async function rollback_001_add_booking_range() {
  const db = await getDb();

  await db.collection("pages").updateMany(
    {},
    {
      $unset: {
        "content.es.minPeople": "",
        "content.es.maxPeople": "",
        "content.en.minPeople": "",
        "content.en.maxPeople": ""
      }
    }
  );

  await db.collection("tours").updateMany(
    {},
    {
      $unset: {
        minPeople: "",
        maxPeople: ""
      }
    }
  );

  console.log("Rollback 001: Removed minPeople and maxPeople fields");
}
```

**Step 2: Create migrations index file**

```typescript
// app/migrations/index.ts
import { migration_001_add_booking_range } from "./001_add_booking_range";

export const migrations = [
  { version: 1, up: migration_001_add_booking_range }
];

export async function runMigrations() {
  // Check last run migration version and run any pending
}
```

**Step 3: Commit**

---

### Task 7: Update Database Schema

**Files:**
- Modify: `app/utils/db.schema.server.ts`

**Step 1: Add minPeople and maxPeople to Tour interface**

```typescript
export interface Tour {
  _id?: string;
  slug: string;
  tourName: {
    en: string;
    es: string;
  };
  tourPrice: number;
  hasPrice?: boolean;
  minPeople: number;  // NEW: Default 1
  maxPeople: number;  // NEW: Default 10
  infoRequestContact?: InfoRequestContactType;
  // ... rest of interface
}
```

**Step 2: Add minPeople and maxPeople to Page interface content**

In both es and en content objects:
```typescript
minPeople?: number;
maxPeople?: number;
```

**Step 3: Commit**

---

### Task 8: Update Admin Page Creation UI

**Files:**
- Modify: `app/routes/admin.pagecreation.tsx`
- Modify: `app/components/_pagegen/PageTemplate.tsx`

**Step 1: Add minPeople and maxPeople state to admin.pagecreation.tsx**

```tsx
const [minPeople, setMinPeople] = useState(1);
const [maxPeople, setMaxPeople] = useState(10);
```

**Step 2: Add inputs to PageTemplate for booking range**

In the pricing section of PageTemplate, add:

```tsx
<div className="flex flex-col w-full sm:w-auto items-center">
  <Label htmlFor="min-people" className="text-sm font-medium text-gray-700 mb-1 text-center">
    Mín. personas
  </Label>
  <Input
    id="min-people"
    type="number"
    min="1"
    max={maxPeople}
    value={minPeople.toString()}
    onChange={(e) => setMinPeople(Math.max(1, parseInt(e.target.value) || 1))}
    className="w-full sm:w-20"
  />
</div>

<div className="flex flex-col w-full sm:w-auto items-center">
  <Label htmlFor="max-people" className="text-sm font-medium text-gray-700 mb-1 text-center">
    Máx. personas
  </Label>
  <Input
    id="max-people"
    type="number"
    min={minPeople}
    max="100"
    value={maxPeople.toString()}
    onChange={(e) => setMaxPeople(Math.max(minPeople, parseInt(e.target.value) || 10))}
    className="w-full sm:w-20"
  />
</div>
```

**Step 3: Update handleCreatePageClick to include minPeople/maxPeople**

```tsx
const content = {
  // ... existing content
  minPeople,
  maxPeople,
};
```

**Step 4: Commit**

---

### Task 9: Update Admin Page Edit UI

**Files:**
- Modify: `app/routes/admin.dashboard.pagegen.edit.$slug.tsx`
- Modify: `app/routes/admin.dashboard.pagegen.edit.$slug.hooks.ts` (if exists)

**Step 1: Add minPeople and maxPeople to useEditPage hook state**

In the hook, add:
```tsx
const [minPeople, setMinPeople] = useState(page.content.es.minPeople || 1);
const [maxPeople, setMaxPeople] = useState(page.content.es.maxPeople || 10);
```

**Step 2: Add handlers**

```tsx
const handleMinPeopleChange = (value: number) => setMinPeople(value);
const handleMaxPeopleChange = (value: number) => setMaxPeople(value);
```

**Step 3: Pass to PageTemplate and include in save**

Update the save logic to include minPeople/maxPeople in the content object.

**Step 4: Commit**

---

### Task 10: Update Tour Loader in book.tsx

**Files:**
- Modify: `app/routes/book.tsx`

**Step 1: Update Tour type to include minPeople and maxPeople**

```tsx
export type Tour = {
  _id: string;
  slug: string;
  name?: string;
  hasPrice?: boolean;
  minPeople?: number;  // NEW
  maxPeople?: number;  // NEW
  infoRequestContact?: InfoRequestContactType;
  // ... rest
};
```

**Step 2: Update loader to include minPeople and maxPeople**

```tsx
return json({
  tours: tours.map(tour => ({
    _id: tour._id.toString(),
    slug: tour.slug || "",
    name: tour.tourName?.en || tour.slug || "",
    hasPrice: typeof tour.hasPrice === "boolean" ? tour.hasPrice : true,
    minPeople: typeof tour.minPeople === "number" ? tour.minPeople : 1,
    maxPeople: typeof tour.maxPeople === "number" ? tour.maxPeople : 10,
    // ... rest
  }))
});
```

**Step 3: Commit**

---

### Task 11: Update Booking Flow to Respect Tour Booking Range

**Files:**
- Modify: `app/components/ui/BookingStepTwoUI.tsx`
- Modify: `app/components/_book/BookingStepTwo.tsx`
- Modify: `app/routes/book._index.tsx`

**Step 1: Update BookingStepTwoUI to accept min/max people**

```tsx
interface BookingStepTwoUIProps {
  partySize: number;
  errors: Partial<Record<keyof BookingFormData, string>>;
  availablePlaces: number;
  minPeople?: number;  // NEW
  maxPeople?: number;  // NEW
  onPartySizeChange: (value: string) => void;
  bookingStepTwoText: {
    numberOfPeople: string;
    selectNumberOfPeople: string;
    person: string;
    people: string;
  };
}
```

**Step 2: Update options generation to respect tour range**

```tsx
// Generate options from minPeople to min(maxPeople, availablePlaces)
const min = minPeople || 1;
const max = Math.min(maxPeople || 10, availablePlaces);
const options = Array.from({ length: Math.max(0, max - min + 1) }, (_, i) => min + i);
```

**Step 3: Update BookingStepTwo.tsx to pass min/max to UI**

Pass the tour's minPeople and maxPeople to BookingStepTwoUI.

**Step 4: Update book._index.tsx loader to include tour range**

When fetching tour data, ensure minPeople and maxPeople are passed to the client.

**Step 5: Add validation in booking submission**

In the booking action, validate that partySize is within the tour's minPeople-maxPeople range.

**Step 6: Commit**

---

### Task 12: Update Other Tour-Fetching Endpoints

**Files:**
- Modify: `app/routes/book.tsx` (loader already done above)
- Modify: `app/routes/_index.tsx` (if it fetches tours)
- Check: `app/routes/blog.$slug.tsx`

**Step 1: Ensure all tour-fetching endpoints include minPeople/maxPeople**

Review all places that fetch tours and add minPeople/maxPeople to the response.

**Step 2: Commit**

---

## Summary of File Changes

| Task | Files Modified/Created |
|------|------------------------|
| 1 | `app/data/data.ts` |
| 2 | `app/utils/db.schema.server.ts` |
| 3 | `app/components/_pages/DynamicPageContainer.tsx` |
| 4 | `app/routes/pages.$slug.tsx` |
| 5 | `app/components/_pagegen/SectionOrderEditor.tsx` (new), `PageTemplate.tsx`, `admin.dashboard.pagegen.edit.$slug.tsx`, `admin.pagecreation.tsx` |
| 6 | `app/migrations/001_add_booking_range.ts` (new), `app/migrations/index.ts` (new) |
| 7 | `app/utils/db.schema.server.ts` |
| 8 | `app/routes/admin.pagecreation.tsx`, `app/components/_pagegen/PageTemplate.tsx` |
| 9 | `app/routes/admin.dashboard.pagegen.edit.$slug.tsx`, `admin.dashboard.pagegen.edit.$slug.hooks.ts` |
| 10 | `app/routes/book.tsx` |
| 11 | `app/components/ui/BookingStepTwoUI.tsx`, `app/components/_book/BookingStepTwo.tsx`, `app/routes/book._index.tsx` |
| 12 | `app/routes/_index.tsx`, `app/routes/blog.$slug.tsx` |

---

## Execution Options

**Plan complete and saved to `.opencode/plans/2026-03-23-page-customization-booking-range.md`. Two execution options:**

**1. Subagent-Driven (this session)** - I dispatch fresh subagent per task, review between tasks, fast iteration

**2. Parallel Session (separate)** - Open new session with executing-plans, batch execution with checkpoints

**Which approach?**