/**
 * Utility functions for the library
 * 
 * @packageDocumentation
 */

/**
 * Capitalizes the first letter of a string
 * 
 * @param str - The string to capitalize
 * @returns The capitalized string
 * 
 * @example
 * ```typescript
 * capitalize('hello'); // 'Hello'
 * capitalize('world'); // 'World'
 * ```
 */
export function capitalize(str: string): string {
  if (!str || str.length === 0) {
    return str;
  }
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Debounces a function call
 * 
 * @param func - The function to debounce
 * @param delay - The delay in milliseconds
 * @returns The debounced function
 * 
 * @example
 * ```typescript
 * const debouncedFn = debounce(() => console.log('Called!'), 300);
 * debouncedFn(); // Will only execute after 300ms of no additional calls
 * ```
 */
export function debounce<T extends (...args: any[]) => void>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

/**
 * Checks if a value is a plain object
 * 
 * @param value - The value to check
 * @returns True if the value is a plain object, false otherwise
 * 
 * @example
 * ```typescript
 * isPlainObject({}); // true
 * isPlainObject([]); // false
 * isPlainObject(null); // false
 * ```
 */
export function isPlainObject(value: unknown): value is Record<string, unknown> {
  return (
    typeof value === 'object' &&
    value !== null &&
    Object.prototype.toString.call(value) === '[object Object]'
  );
} 