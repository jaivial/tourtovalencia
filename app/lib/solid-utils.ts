/**
 * SOLID Utilities Library
 *
 * Principles applied:
 * - SRP: Each function has a single responsibility
 * - OCP: Functions are open for extension, closed for modification
 * - DIP: Utilities depend on abstractions, not concretions
 */

// ============================================================================
// Type Utilities
// ============================================================================

/**
 * Make all properties in T optional, but keep the types strict
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * Extract the return type of a function
 */
export type FunctionReturnType<T extends (...args: unknown[]) => unknown> =
  T extends (...args: unknown[]) => infer R ? R : never;

// ============================================================================
// Object Utilities - SRP: Each function handles one specific operation
// ============================================================================

/**
 * Flattens a nested object into a single-level object with dot-notation keys.
 * Replaces the 'flat' library functionality.
 *
 * @example
 * flattenObject({ a: { b: { c: 1 } } }) // { 'a.b.c': 1 }
 */
export function flattenObject<T extends Record<string, unknown>>(
  obj: T,
  prefix = ''
): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(obj)) {
    const newKey = prefix ? `${prefix}.${key}` : key;

    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      Object.assign(result, flattenObject(value as Record<string, unknown>, newKey));
    } else {
      result[newKey] = value;
    }
  }

  return result;
}

/**
 * Unflattens a flat object with dot-notation keys back to nested object.
 *
 * @example
 * unflattenObject({ 'a.b.c': 1 }) // { a: { b: { c: 1 } } }
 */
export function unflattenObject(flatObj: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(flatObj)) {
    const keys = key.split('.');
    let current: Record<string, unknown> = result;

    for (let i = 0; i < keys.length - 1; i++) {
      const k = keys[i];
      if (!(k in current)) {
        current[k] = {};
      }
      current = current[k] as Record<string, unknown>;
    }

    current[keys[keys.length - 1]] = value;
  }

  return result;
}

/**
 * Deep clone an object without external dependencies.
 * Uses JSON serialization as a simple deep clone mechanism.
 */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Type-safe object merge (OOP: Strategy pattern for merging)
 * Uses spread operator for immutable merging.
 */
export function mergeObjects<T extends Record<string, unknown>>(
  target: T,
  source: Partial<T>
): T {
  return { ...target, ...source };
}

/**
 * Get a nested value from an object using dot notation.
 * Returns undefined if the path doesn't exist.
 */
export function getNestedValue<T>(
  obj: T,
  path: string,
  defaultValue?: unknown
): unknown {
  const keys = path.split('.');
  let current: unknown = obj;

  for (const key of keys) {
    if (current === null || typeof current !== 'object') {
      return defaultValue;
    }
    current = (current as Record<string, unknown>)[key];
  }

  return current !== undefined ? current : defaultValue;
}

/**
 * Set a nested value in an object using dot notation.
 * Creates intermediate objects as needed.
 */
export function setNestedValue<T extends Record<string, unknown>>(
  obj: T,
  path: string,
  value: unknown
): T {
  const keys = path.split('.');
  const lastKey = keys.pop()!;

  let current: Record<string, unknown> = obj;

  for (const key of keys) {
    if (!(key in current)) {
      current[key] = {};
    }
    current = current[key] as Record<string, unknown>;
  }

  current[lastKey] = value;
  return obj;
}

// ============================================================================
// Array Utilities
// ============================================================================

/**
 * Remove duplicates from an array based on a key function.
 */
export function uniqueBy<T>(arr: T[], keyFn: (item: T) => unknown): T[] {
  const seen = new Set<unknown>();
  return arr.filter((item) => {
    const key = keyFn(item);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/**
 * Group array items by a key function.
 */
export function groupBy<T>(arr: T[], keyFn: (item: T) => string): Record<string, T[]> {
  return arr.reduce((groups, item) => {
    const key = keyFn(item);
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(item);
    return groups;
  }, {} as Record<string, T[]>);
}

/**
 * Sort array by multiple criteria.
 */
export function sortBy<T>(arr: T[], ...criteria: ((a: T, b: T) => number)[]): T[] {
  return [...arr].sort((a, b) => {
    for (const compare of criteria) {
      const result = compare(a, b);
      if (result !== 0) return result;
    }
    return 0;
  });
}

// ============================================================================
// String Utilities
// ============================================================================

/**
 * Capitalize the first letter of a string.
 */
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Truncate a string to a maximum length with ellipsis.
 */
export function truncate(str: string, maxLength: number, suffix = '...'): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - suffix.length) + suffix;
}

// ============================================================================
// Validation Utilities
// ============================================================================

/**
 * Check if a value is empty (null, undefined, empty string, empty array, empty object).
 */
export function isEmpty(value: unknown): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string' && value.trim() === '') return true;
  if (Array.isArray(value) && value.length === 0) return true;
  if (typeof value === 'object' && Object.keys(value).length === 0) return true;
  return false;
}

/**
 * Validate an email address format.
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// ============================================================================
// Async Utilities
// ============================================================================

/**
 * Delay execution for a specified time.
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Debounce a function call.
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delayMs: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;

  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delayMs);
  };
}

/**
 * Throttle a function call.
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  fn: T,
  limitMs: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limitMs);
    }
  };
}
