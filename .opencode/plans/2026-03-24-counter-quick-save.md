# Counter UI & Quick Save Settings Plan

> **For Claude:** Use subagent-driven development to implement this plan.

**Goal:** (1) Replace min/max people inputs with circle +/- counter buttons, (2) Add "Save Settings" button for quick header config saves without full translation, (3) Improve responsive layout.

**Architecture:**
1. **Counter Component**: New reusable `CounterInput` component with minus/plus circle buttons flanking a center number display
2. **Save Settings**: New lightweight API endpoint `PATCH /api/pages/settings/$id` that updates only status, price, hasPrice, minPeople, maxPeople without translation
3. **Dirty Tracking**: Track when header settings change and show "Save Settings" button
4. **Responsive Layout**: Flex row for min/max when space allows

---

## Task 1: Create CounterInput Component

**Files:**
- Create: `app/components/ui/CounterInput.tsx`

**Step 1: Create CounterInput component**

```tsx
interface CounterInputProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  className?: string;
}

export const CounterInput: React.FC<CounterInputProps> = ({
  value,
  onChange,
  min = 1,
  max = 100,
  step = 1,
  disabled = false,
  className = "",
}) => {
  const handleDecrement = () => {
    if (!disabled && value > min) {
      onChange(Math.max(min, value - step));
    }
  };

  const handleIncrement = () => {
    if (!disabled && value < max) {
      onChange(Math.min(max, value + step));
    }
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <button
        type="button"
        onClick={handleDecrement}
        disabled={disabled || value <= min}
        className={cn(
          "w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center",
          "hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed",
          "transition-colors"
        )}
      >
        <MinusIcon className="w-4 h-4" />
      </button>
      
      <span className="w-12 text-center font-medium">{value}</span>
      
      <button
        type="button"
        onClick={handleIncrement}
        disabled={disabled || value >= max}
        className={cn(
          "w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center",
          "hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed",
          "transition-colors"
        )}
      >
        <PlusIcon className="w-4 h-4" />
      </button>
    </div>
  );
};
```

**Step 2: Commit**

---

## Task 2: Create Lightweight Settings Update API Endpoint

**Files:**
- Create: `app/routes/api.pages.settings.$id.ts`

**Step 1: Create settings-only update endpoint**

This endpoint will:
- Accept PATCH requests
- Only update: status, hasPrice, price, minPeople, maxPeople
- Skip all translation and image processing
- Return immediately

```typescript
// app/routes/api.pages.settings.$id.ts
export const action = async ({ request, params }: ActionFunctionArgs) => {
  const { id } = params;
  const formData = await request.formData();
  
  const status = formData.get("status") as string;
  const hasPrice = formData.get("hasPrice") === "true";
  const price = parseFloat(formData.get("price") as string) || 0;
  const minPeople = parseInt(formData.get("minPeople") as string) || 1;
  const maxPeople = parseInt(formData.get("maxPeople") as string) || 10;
  
  const pagesCollection = await getPagesCollection();
  await pagesCollection.updateOne(
    { _id: new ObjectId(id) },
    {
      $set: {
        status,
        hasPrice,
        price,
        "content.es.minPeople": minPeople,
        "content.es.maxPeople": maxPeople,
        "content.en.minPeople": minPeople,
        "content.en.maxPeople": maxPeople,
        updatedAt: new Date()
      }
    }
  );
  
  return json({ success: true });
};
```

**Step 2: Commit**

---

## Task 3: Update PageTemplate with CounterInput and Save Settings

**Files:**
- Modify: `app/components/_pagegen/PageTemplate.tsx`

**Step 1: Import CounterInput and add state for dirty tracking**

```tsx
import { CounterInput } from "~/components/ui/CounterInput";

// Add to props:
export type PageTemplateProps = {
  // ... existing props
  // Add these for settings tracking:
  onSaveSettings?: () => void; // Callback to trigger settings save
};

// Add state for dirty tracking in the component
const [settingsDirty, setSettingsDirty] = useState(false);

// Handler to mark settings as dirty when any header value changes
const markSettingsDirty = () => setSettingsDirty(true);
```

**Step 2: Replace min/max inputs with CounterInput**

Replace the two Input fields for min/max people with:

```tsx
<div className="flex flex-col sm:flex-row items-center gap-4">
  <div className="flex flex-col items-center">
    <Label className="text-sm font-medium text-gray-700 mb-1">Mín.</Label>
    <CounterInput
      value={minPeople}
      onChange={(val) => { onMinPeopleChange?.(val); markSettingsDirty(); }}
      min={1}
      max={maxPeople}
      disabled={!hasPrice}
    />
  </div>
  
  <div className="flex flex-col items-center">
    <Label className="text-sm font-medium text-gray-700 mb-1">Máx.</Label>
    <CounterInput
      value={maxPeople}
      onChange={(val) => { onMaxPeopleChange?.(val); markSettingsDirty(); }}
      min={minPeople}
      max={100}
      disabled={!hasPrice}
    />
  </div>
</div>
```

**Step 3: Add Save Settings button (appears when dirty)**

In the header section, after the price input:

```tsx
{settingsDirty && (
  <Button
    onClick={onSaveSettings}
    variant="outline"
    className="bg-yellow-50 border-yellow-300 hover:bg-yellow-100"
  >
    Guardar Configuración
  </Button>
)}
```

**Step 4: Mark dirty on other settings changes**

Update the onChange handlers for status, hasPrice, and price to also call `markSettingsDirty()`.

**Step 5: Commit**

---

## Task 4: Add Save Settings Handler in Edit Route

**Files:**
- Modify: `app/routes/admin.dashboard.pagegen.edit.$slug.tsx`
- Modify: `app/routes/admin.dashboard.pagegen.edit.$slug.hooks.ts`

**Step 1: Add saveSettings function in hooks**

```typescript
const saveSettings = async () => {
  const formData = new FormData();
  formData.append("status", status);
  formData.append("hasPrice", hasPrice.toString());
  formData.append("price", price.toString());
  formData.append("minPeople", minPeople.toString());
  formData.append("maxPeople", maxPeople.toString());
  
  const response = await fetch(`/api/pages/settings/${deserializedPage._id}`, {
    method: "PATCH",
    body: formData,
  });
  
  if (response.ok) {
    setSettingsDirty(false);
  }
};
```

**Step 2: Pass saveSettings to PageTemplate**

```tsx
<PageTemplate
  // ... other props
  onSaveSettings={saveSettings}
/>
```

**Step 3: Clear dirty state on successful save**

When settings save completes successfully, set `settingsDirty` to false.

**Step 4: Commit**

---

## Task 5: Improve Header Layout Responsiveness

**Files:**
- Modify: `app/components/_pagegen/PageTemplate.tsx`

**Step 1: Group header settings in a responsive flex container**

Current layout has settings stacked vertically. Update to:

```tsx
<div className="flex flex-wrap items-center justify-center gap-4 p-6 bg-white rounded-lg shadow-sm">
  {/* Status toggle */}
  <div className="flex flex-col items-center gap-1">
    <Label className="text-xs font-medium text-gray-500">
      {status === "active" ? "Activo" : "Próximamente"}
    </Label>
    <Switch checked={status === "active"} onCheckedChange={(checked) => { onStatusChange(checked ? 'active' : 'upcoming'); markSettingsDirty(); }} />
  </div>

  {/* HasPrice toggle */}
  <div className="flex flex-col items-center gap-1">
    <Label className="text-xs font-medium text-gray-500">
      {hasPrice ? "Con precio" : "Sin precio"}
    </Label>
    <Switch checked={hasPrice} onCheckedChange={(checked) => { onHasPriceChange(checked); markSettingsDirty(); }} />
  </div>

  {/* Price input - only show when hasPrice */}
  {hasPrice && (
    <div className="flex flex-col items-center gap-1">
      <Label className="text-xs font-medium text-gray-500">Precio</Label>
      <div className="relative flex items-center">
        <Input
          type="number"
          min="0"
          step="0.01"
          value={price.toString()}
          onChange={(e) => { onPriceChange(parseFloat(e.target.value) || 0); markSettingsDirty(); }}
          className="w-24 pl-3 pr-7 text-center"
        />
        <span className="absolute right-2 text-gray-500 text-sm">€</span>
      </div>
    </div>
  )}

  {/* Min/Max Counter - in row when space allows */}
  <div className="flex items-center gap-6">
    <div className="flex flex-col items-center gap-1">
      <Label className="text-xs font-medium text-gray-500">Personas</Label>
      <div className="flex items-center gap-3">
        <CounterInput
          value={minPeople}
          onChange={(val) => { onMinPeopleChange?.(val); markSettingsDirty(); }}
          min={1}
          max={maxPeople}
          disabled={!hasPrice}
        />
        <span className="text-gray-400">-</span>
        <CounterInput
          value={maxPeople}
          onChange={(val) => { onMaxPeopleChange?.(val); markSettingsDirty(); }}
          min={minPeople}
          max={100}
          disabled={!hasPrice}
        />
      </div>
    </div>
  </div>

  {/* Save Settings button - appears when dirty */}
  {settingsDirty && (
    <Button
      onClick={onSaveSettings}
      size="sm"
      className="bg-yellow-500 hover:bg-yellow-600 text-white"
    >
      Guardar
    </Button>
  )}
</div>
```

**Step 2: Commit**

---

## Task 6: Update BookingStepTwoUI Counter

**Files:**
- Modify: `app/components/ui/BookingStepTwoUI.tsx`

**Step 1: Replace Select dropdown with CounterInput**

```tsx
import { CounterInput } from "~/components/ui/CounterInput";

export const BookingStepTwoUI = ({ partySize, errors, availablePlaces, minPeople, maxPeople, onPartySizeChange, bookingStepTwoText }: BookingStepTwoUIProps) => {
  const min = minPeople || 1;
  const max = Math.min(maxPeople || 10, availablePlaces);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>{bookingStepTwoText.numberOfPeople}</Label>
        <div className="flex items-center gap-4">
          <CounterInput
            value={partySize}
            onChange={onPartySizeChange}
            min={min}
            max={max}
          />
          <span className="text-gray-600">
            {partySize} {partySize === 1 ? bookingStepTwoText.person : bookingStepTwoText.people}
          </span>
        </div>
        {errors.partySize && <p className="text-sm text-destructive">{errors.partySize}</p>}
      </div>
    </div>
  );
};
```

**Step 2: Commit**

---

## Summary of Changes

| Task | Files |
|------|-------|
| 1 | `app/components/ui/CounterInput.tsx` (new) |
| 2 | `app/routes/api.pages.settings.$id.ts` (new) |
| 3 | `app/components/_pagegen/PageTemplate.tsx` |
| 4 | `app/routes/admin.dashboard.pagegen.edit.$slug.tsx`, `hooks.ts` |
| 5 | `app/components/_pagegen/PageTemplate.tsx` (layout improvements) |
| 6 | `app/components/ui/BookingStepTwoUI.tsx` |

---

## Execution Options

**Plan complete. Two execution options:**

**1. Subagent-Driven (this session)** - I dispatch fresh subagent per task, review between tasks

**2. Parallel Session** - Open new session with executing-plans

**Which approach?**