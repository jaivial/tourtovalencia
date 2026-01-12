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
                return 'react-vendor';
              }
              if (id.includes('@remix-run/react')) {
                return 'remix-core';
              }
              if (id.includes('framer-motion')) {
                return 'motion-vendor';
              }
              if (id.includes('lucide-react') || id.includes('@heroui/react') || id.includes('@radix-ui')) {
                return 'ui-vendor';
              }
              return 'other-vendor';
            }
            if (id.includes('react')) {
              return 'react';
            }
            if (id.includes('_index') || id.includes('book._index')) {
              return 'home';
            }
            if (id.includes('pages._slug') || id.includes('legal') || id.includes('valencia-things-to-do') || id.includes('sanjuan')) {
              return 'routes';
            }
            if (id.includes('admin')) {
              return 'admin';
            }
            return 'app';
          },
        },
      },
    },
  };
});
