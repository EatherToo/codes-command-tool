import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default [
  // ESM build
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/index.js',
      format: 'es',
      sourcemap: true,
    },
    plugins: [
      resolve({
        preferBuiltins: true,
      }),
      commonjs(),
      typescript({
        tsconfig: join(__dirname, 'tsconfig.json'),
        declaration: false,
        declarationMap: false,
        sourceMap: true,
      }),
    ],
    external: [
      // Mark all node built-ins as external
      'fs',
      'path',
      'url',
      'util',
      'stream',
      'events',
      'crypto',
      'os',
      'http',
      'https',
      'zlib',
      'buffer',
      'process',
      'child_process',
      'cluster',
      'net',
      'tls',
      'dgram',
      'dns',
      'readline',
      'repl',
      'vm',
      'string_decoder',
      'querystring',
      'punycode',
      'v8',
      'worker_threads',
      'inspector',
      'async_hooks',
      'perf_hooks',
      'assert',
      'console',
      'constants',
      'domain',
      'module',
      'timers',
      'trace_events',
      'tty',
      'wasi',
    ],
  },
  // CommonJS build
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/index.cjs',
      format: 'cjs',
      sourcemap: true,
      exports: 'named',
    },
    plugins: [
      resolve({
        preferBuiltins: true,
      }),
      commonjs(),
      typescript({
        tsconfig: join(__dirname, 'tsconfig.json'),
        declaration: false,
        declarationMap: false,
        sourceMap: true,
      }),
    ],
    external: [
      // Mark all node built-ins as external
      'fs',
      'path',
      'url',
      'util',
      'stream',
      'events',
      'crypto',
      'os',
      'http',
      'https',
      'zlib',
      'buffer',
      'process',
      'child_process',
      'cluster',
      'net',
      'tls',
      'dgram',
      'dns',
      'readline',
      'repl',
      'vm',
      'string_decoder',
      'querystring',
      'punycode',
      'v8',
      'worker_threads',
      'inspector',
      'async_hooks',
      'perf_hooks',
      'assert',
      'console',
      'constants',
      'domain',
      'module',
      'timers',
      'trace_events',
      'tty',
      'wasi',
    ],
  },
]; 