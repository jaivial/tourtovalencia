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
  // Load env file based on `mode` in current directory.
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
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          manualChunks(id) {
            // Put everything in node_modules into one vendor chunk to prevent React duplication
            if (id.includes('node_modules')) {
              return 'vendor';
            }
            // App code chunks
            if (id.includes('app/components')) {
              const componentName = id.split('/').pop()?.replace(/\.(tsx|ts)$/, '');
              if (componentName && 
                  ['IndexContainer', 'PageTemplate', 'SanJuanSection3', 'LegalPage', 'AdminDashboard', 'BookingStep'].some(c => componentName.includes(c))) {
                return componentName;
              }
            }
            if (id.includes('app/routes')) {
              const routeName = id.split('/').pop()?.replace(/\.(tsx|ts)$/, '');
              if (routeName) {
                return 'route-' + routeName;
              }
            }
            return undefined;
          },
          chunkFileNames: 'assets/[name]-[hash].js',
        },
      },
    },
  };
});