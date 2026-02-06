import { vitePlugin as remix } from "@remix-run/dev";
import { defineConfig, loadEnv, Plugin } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import dotenv from "dotenv";

declare module "@remix-run/node" {
  interface Future {
    v3_singleFetch: true;
  }
}

function cjsCompatTransform(): Plugin {
  return {
    name: "cjs-compat-transform",
    transform(code, id) {
      if (id.includes("@heroui/theme")) {
        let transformed = code;
        const colorImportRegex = /import\s+(\w+)\s+from\s+["']color["']/g;
        transformed = transformed.replace(colorImportRegex, "import * as $1 from \"color\"");
        return { code: transformed, map: null };
      }
      return null;
    },
  };
}

function requirePolyfill(): Plugin {
  const requirePolyfillScript = "<script>window.require=function(m){if(m===\"color\"){return import(\"color\").then(x=>Object.assign({},x.default||x,x))}console.warn(\"Unknown\",m);return{};};</script>";
  return {
    name: "require-polyfill",
    transformIndexHtml(html) {
      const headRegex = /<head[^>]*>/;
      return html.replace(headRegex, "$&" + requirePolyfillScript);
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
    plugins: [remix({ future: { v3_singleFetch: true, v3_lazyRouteDiscovery: true } }), tsconfigPaths(), cjsCompatTransform(), requirePolyfill()],
    build: {
      chunkSizeWarningLimit: 150,
      base: "https://cdn.tourtovalencia.com/",
    },
  };
});
