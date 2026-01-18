import { vitePlugin as remix } from "@remix-run/dev";
import { defineConfig, loadEnv, Plugin } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

declare module "@remix-run/node" {
  interface Future {
    v3_singleFetch: true;
  }
}

// Plugin to handle CJS ESM compatibility issues in @heroui/theme
// Transforms default imports from CJS packages to namespace imports
function cjsCompatTransform(): Plugin {
  return {
    name: 'cjs-compat-transform',
    transform(code, id) {
      // Only transform @heroui/theme chunks
      if (id.includes('@heroui/theme')) {
        let transformed = code;

        // Packages that are CJS but imported with default import
        const cjsPackages = ['color', 'deepmerge', 'tailwindcss/plugin.js'];

        for (const pkg of cjsPackages) {
          // Replace: import X from "pkg" -> import * as X from "pkg"
          transformed = transformed.replace(
            new RegExp(`import\\s+(\\w+)\\s+from\\s+["']${pkg}["']`, 'g'),
            `import * as $1 from "${pkg}"`
          );
        }

        // Fix Color constructor calls: Color(...) -> Color.default(...)
        // This is needed because namespace import requires .default to access the CJS export
        // Only match Color when used as function call: Color(...) not Color.property
        transformed = transformed.replace(
          /\bColor\((?!\w+\()/g,
          'Color.default('
        );
        transformed = transformed.replace(
          /\bColor\.(hsl|rgb|hex|css|lab|hcl|lch|cmyk|xyz|hsv)\b/g,
          'Color.default.$1'
        );
        // Fix any double .default
        transformed = transformed.replace(
          /Color\.default\.default\(/g,
          'Color.default('
        );

        // Fix deepmerge calls: deepmerge(...) -> deepmerge.default(...)
        transformed = transformed.replace(
          /\bdeepmerge\((?!\w+\()/g,
          'deepmerge.default('
        );
        // Fix any double .default
        transformed = transformed.replace(
          /deepmerge\.default\.default\(/g,
          'deepmerge.default('
        );

        // Fix tailwindcss plugin calls: plugin(...) -> plugin.default(...)
        // Only match when plugin is followed by opening parenthesis (function call)
        transformed = transformed.replace(
          /\bplugin\((?!\w+\()/g,
          'plugin.default('
        );
        // Fix any double .default
        transformed = transformed.replace(
          /plugin\.default\.default\(/g,
          'plugin.default('
        );

        return {
          code: transformed,
          map: null,
        };
      }
      return null;
    },
  };
}

// Plugin to inject require polyfill for CJS modules in browser
function requirePolyfill(): Plugin {
  const requirePolyfillScript = `<script>// Require polyfill for CJS modules in browser
window.require = function(moduleId) {
  if (moduleId === 'color') {
    return import('color').then(m => Object.assign({}, m.default || m, m));
  }
  if (moduleId === 'deepmerge') {
    return import('deepmerge').then(m => Object.assign({}, m.default || m, m));
  }
  if (moduleId === 'tailwindcss/plugin.js') {
    return import('tailwindcss/plugin.js').then(m => Object.assign({}, m.default || m, m));
  }
  console.warn('Unknown module:', moduleId);
  return {};
};
</script>`;

  return {
    name: 'require-polyfill',
    enforce: 'pre',
    transformIndexHtml(html) {
      // Inject polyfill after <head> tag (which may have attributes)
      return html.replace(/<head[^>]*>/, '$&' + requirePolyfillScript);
    },
  };
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
      cjsCompatTransform(),
      requirePolyfill(),
    ],
    resolve: {
      alias: {
        // Fix for flat import error in @paypal/react-paypal-js
        // The flat package only has named exports in ESM mode
        flat: 'flat/index.js',
      },
    },
    // Exclude heroui/theme from pre-bundling to allow better chunk splitting
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        '@heroui/system',
        '@heroui/utils',
        '@heroui/button',
        '@heroui/input',
        '@heroui/card',
        '@heroui/tabs',
        '@heroui/modal',
        '@heroui/select',
      ],
      exclude: [
        '@heroui/theme',
        // Fix for color ESM import issue (@heroui/theme dependency)
        'color',
        // Fix for flat import error in @paypal/react-paypal-js
        '@paypal/react-paypal-js',
        '@paypal/paypal-js',
      ],
    },
    // Handle SSR externalization for heroui packages
    ssr: {
      noExternal: ['@heroui/theme', '@heroui/system', '@heroui/utils'],
      // Externalize color to prevent bundling issues with ESM-only package
      external: ['color'],
    },
    define: {
      'process.env': env
    },
    build: {
      chunkSizeWarningLimit: 150,
      rollupOptions: {
        output: {
          manualChunks(id) {
            // Separate @heroui components individually
            if (id.includes('node_modules/@heroui/system')) {
              return 'vendor-heroui-system';
            }
            // Separate @heroui theme - split into smaller chunks
            if (id.includes('node_modules/@heroui/theme/dist/components')) {
              return 'vendor-heroui-theme-components';
            }
            if (id.includes('node_modules/@heroui/theme/dist/utils')) {
              return 'vendor-heroui-theme-utils';
            }
            if (id.includes('node_modules/@heroui/theme/dist/utilities')) {
              return 'vendor-heroui-theme-utilities';
            }
            if (id.includes('node_modules/@heroui/theme')) {
              return 'vendor-heroui-theme';
            }
            if (id.includes('node_modules/@heroui/utils')) {
              return 'vendor-heroui-utils';
            }
            if (id.includes('node_modules/@heroui/button')) {
              return 'vendor-heroui-button';
            }
            if (id.includes('node_modules/@heroui/input') || id.includes('node_modules/@heroui/popover')) {
              return 'vendor-heroui-input';
            }
            if (id.includes('node_modules/@heroui/card') || id.includes('node_modules/@heroui/checkbox')) {
              return 'vendor-heroui-card';
            }
            if (id.includes('node_modules/@heroui/tabs') || id.includes('node_modules/@heroui/switch')) {
              return 'vendor-heroui-tabs';
            }
            if (id.includes('node_modules/@heroui/modal') || id.includes('node_modules/@heroui/dialog')) {
              return 'vendor-heroui-modal';
            }
            if (id.includes('node_modules/@heroui/select') || id.includes('node_modules/@heroui/combobox')) {
              return 'vendor-heroui-select';
            }
            if (id.includes('node_modules/@heroui')) {
              return 'vendor-heroui-other';
            }
            // Separate React core
            if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/')) {
              return 'vendor-react';
            }
            // Separate framer-motion
            if (id.includes('node_modules/framer-motion')) {
              return 'vendor-framer-motion';
            }
            // Separate react-aria
            if (id.includes('node_modules/@react-aria') || id.includes('node_modules/react-aria')) {
              return 'vendor-react-aria';
            }
            // Separate tailwind
            if (id.includes('node_modules/tailwindcss') || id.includes('node_modules/@tailwindcss')) {
              return 'vendor-tailwind';
            }
            // Separate icons
            if (id.includes('node_modules/lucide-react')) {
              return 'vendor-lucide';
            }
            // Separate remaining @react-aria libraries
            if (id.includes('node_modules/@react-stately')) {
              return 'vendor-react-stately';
            }
            if (id.includes('node_modules/@internationalized')) {
              return 'vendor-i18n';
            }
            // Separate utilities
            if (id.includes('node_modules/clsx') || id.includes('node_modules/class-variance-authority') || id.includes('node_modules/tailwind-merge')) {
              return 'vendor-utils';
            }
            // node_modules but not already separated
            if (id.includes('node_modules')) {
              return 'vendor-libs';
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
          entryFileNames: 'assets/[name]-[hash].js',
        },
      },
    },
  };
});