import { vitePlugin as remix } from "@remix-run/dev";
import { defineConfig, loadEnv } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

declare module "@remix-run/node" {
  interface Future {
    v3_singleFetch: true;
  }
}

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [
      remix({
        future: {
          v3_fetcherPersist: true,
          v3_relativeSplatPath: true,
          v3_throwAbortReason: true,
          v3_singleFetch: true,
          v3_lazyRouteDiscovery: true,
        },
      }),
      tsconfigPaths(),
    ],
    define: {
      'process.env': env
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('react') && id.includes('react-dom')) {
                return 'react-core';
              }
              if (id.includes('framer-motion')) {
                return 'motion';
              }
              if (id.includes('@heroui') || id.includes('@radix-ui')) {
                return 'ui';
              }
              if (id.includes('lucide-react')) {
                return 'icons';
              }
              if (id.includes('@remix-run/react')) {
                return 'remix-core';
              }
              return 'vendor';
            }
            if (id.includes('app/components') || id.includes('app/routes')) {
              const componentName = id.split('/').pop()?.replace(/\.(tsx|ts)$/, '');
              if (['IndexContainer', 'PageTemplate', 'SanJuanSection3', 'LegalPage', 'AdminDashboard', 'BookingStep', 'TourCard'].some(c => componentName?.includes(c))) {
                return componentName || 'app';
              }
            }
            if (id.includes('_index') || id.includes('book._index') || id.includes('legal') || id.includes('sanjuan') || id.includes('valencia-things-to-do') || id.includes('pages.')) {
              return 'routes-public';
            }
            if (id.includes('admin')) {
              return 'routes-admin';
            }
            return 'app';
          },
          chunkFileNames: 'assets/[name]-[hash].js',
        },
      },
    },
  };
});
