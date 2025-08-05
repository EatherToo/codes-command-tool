import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  dts: true,
  clean: false,
  outDir: 'dist',
  splitting: false,
  sourcemap: false,
  minify: false,
  target: 'es2020',
  skipNodeModulesBundle: true,
  onSuccess: async () => {
    console.log('✅ TypeScript declaration files generated successfully!');
  },
}); 