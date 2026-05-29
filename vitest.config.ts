import { defineConfig } from 'vitest/config'

export default defineConfig({
  // React plugin intentionally omitted for Vitest (avoids "vite:react-babel" + esbuild/oxc deprecation spam).
  // Vitest's internal esbuild handles JSX for tests cleanly. Use the plugin only in vite.config.ts for dev/build.
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    css: false,                // Faster test env (no CSS transforms needed for most component logic)
    pool: 'forks',             // Vitest 4+ recommended pool (removes older poolOptions deprecation noise)
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
  },
})
