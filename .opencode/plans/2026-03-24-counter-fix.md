# Fix CounterInput State Update Plan

## Problem Analysis

The debugging shows:
1. CounterInput's `onChange` IS being called with correct values (e.g., calling onChange with 2)
2. "admin.pagecreation onMinPeopleChange called with 2" appears in console - parent's handler IS firing
3. BUT "PageTemplate onMinPeopleChange called with 2" shows `onMinPeopleChange type: undefined`

**This means the prop is being passed correctly from admin.pagecreation.tsx, but PageTemplate is receiving it as undefined.**

## Root Cause Hypothesis

PageTemplate.tsx uses default parameter values during destructuring:
```typescript
minPeople = 1,
maxPeople = 10,
onMinPeopleChange,  // This destructures but doesn't set a default
```

If the prop `undefined` is explicitly passed (even as undefined), JavaScript's default parameter mechanism doesn't apply. But the real issue is the prop IS being passed correctly from pagecreation.tsx - yet PageTemplate sees it as undefined.

**Most likely cause**: PageTemplate.tsx is being imported from a stale/cached module that doesn't have the latest destructuring.

## Solution Plan

### Option A: Use internal state in PageTemplate for min/max people

Instead of relying on parent to manage minPeople/maxPeople state via callbacks, have PageTemplate manage its own internal state for these values, and only call parent's `onMinPeopleChange`/`onMaxPeopleChange` for notification purposes (like the dirty tracking).

**Implementation:**
1. In PageTemplate, add internal state:
```typescript
const [internalMinPeople, setInternalMinPeople] = useState(minPeople ?? 1);
const [internalMaxPeople, setInternalMaxPeople] = useState(maxPeople ?? 10);
```

2. Use internal state for CounterInput values:
```typescript
<CounterInput
  value={internalMinPeople}
  onChange={(val) => {
    setInternalMinPeople(val);
    onMinPeopleChange?.(val);
    markSettingsDirty();
  }}
  ...
/>
```

3. Use effect to sync when props change:
```typescript
useEffect(() => {
  setInternalMinPeople(minPeople ?? 1);
}, [minPeople]);

useEffect(() => {
  setInternalMaxPeople(maxPeople ?? 10);
}, [maxPeople]);
```

### Option B: Check for cached .next build

Run `rm -rf .next` and rebuild to ensure fresh build.

## Recommended Approach

**Try Option B first** (clearing .next cache) since it's simplest and the issue seems to be stale code.

If that doesn't work, **Option A** (internal state) is more robust and follows the pattern used elsewhere in PageTemplate (like `settingsDirty` state).

---

## Implementation Steps (Option A if needed)

### Step 1: Add internal state to PageTemplate

In `app/components/_pagegen/PageTemplate.tsx`, around line 123-130:

```typescript
const [loadingMessage, setLoadingMessage] = useState("Creando página...");
// Add internal state for counter values
const [internalMinPeople, setInternalMinPeople] = useState(minPeople ?? 1);
const [internalMaxPeople, setInternalMaxPeople] = useState(maxPeople ?? 10);
```

### Step 2: Add useEffect to sync props to internal state

```typescript
useEffect(() => {
  setInternalMinPeople(minPeople ?? 1);
}, [minPeople]);

useEffect(() => {
  setInternalMaxPeople(maxPeople ?? 10);
}, [maxPeople]);
```

### Step 3: Update CounterInput usage to use internal state

Change from:
```typescript
<CounterInput
  value={minPeople}
  onChange={(val) => { onMinPeopleChange?.(val); markSettingsDirty(); }}
  ...
/>
```

To:
```typescript
<CounterInput
  value={internalMinPeople}
  onChange={(val) => {
    setInternalMinPeople(val);
    onMinPeopleChange?.(val);
    markSettingsDirty();
  }}
  ...
/>
```

Same for maxPeople.

### Step 4: Remove debugging console.logs

Clean up all the console.log statements added during debugging.

### Step 5: Clear .next cache and rebuild

```bash
rm -rf .next
npm run build
```

---

## Execution

Should I try clearing .next cache first, or go directly to implementing Option A (internal state)?