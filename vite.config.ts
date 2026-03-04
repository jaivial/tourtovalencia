import { vitePlugin as remix } from "@remix-run/dev";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

function cjsCompatTransform() {
  return {
    name: "cjs-compat-transform",
    transform(code: string, id: string) {
      if (id.includes("@heroui/theme")) {
        let transformed = code;
        const colorImportRegex = /import\s+(\w+)\s+from\s+["']color["']/g;
        transformed = transformed.replace(colorImportRegex, "import * as color from \"color\"");
        return { code: transformed, map: null };
      }
      return null;
    },
  };
}

function requirePolyfill() {
  const requirePolyfillScript = "<script>window.require=function(m){if(m===\"color\"){return import(\"color\").then(x=>Object.assign({},x.default||x,x))}console.warn(\"Unknown\",m);return{};};</script>";
  return {
    name: "require-polyfill",
    transformIndexHtml(html: string) {
      const headRegex = /<head[^>]*>/;
      return html.replace(headRegex, "$&" + requirePolyfillScript);
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [remix({ future: { v3_singleFetch: true, v3_lazyRouteDiscovery: false } }), tsconfigPaths(), cjsCompatTransform(), requirePolyfill()],
    server: {
      allowedHosts: ["www.tourtovalencia.com", "tourtovalencia.com"],
    },
    build: {
      chunkSizeWarningLimit: 150,
      base: "https://cdn.tourtovalencia.com/",
    },
  } as any;
});
