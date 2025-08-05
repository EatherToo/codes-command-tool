/**
 * My Node.js Library
 * 
 * A modern TypeScript library built with Rollup and tsup
 * 
 * @packageDocumentation
 */

export * from './utils/index';

/**
 * Library version
 */
export const VERSION = '1.0.0';

/**
 * Main library class
 * 
 * @example
 * ```typescript
 * import { MyLibrary } from 'my-nodejs-library';
 * 
 * const lib = new MyLibrary();
 * console.log(lib.greet('World')); // "Hello, World!"
 * ```
 */
export class MyLibrary {
  private name: string;

  /**
   * Creates a new instance of MyLibrary
   * 
   * @param name - The name to use for greetings
   */
  constructor(name: string = 'Library') {
    this.name = name;
  }

  /**
   * Greets the specified target
   * 
   * @param target - The target to greet
   * @returns A greeting message
   */
  greet(target: string): string {
    return `Hello, ${target}! from ${this.name}`;
  }

  /**
   * Gets the library name
   * 
   * @returns The library name
   */
  getName(): string {
    return this.name;
  }
} 