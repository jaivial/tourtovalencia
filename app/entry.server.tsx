/**
 * By default, Remix will handle generating the HTTP Response for you.
 * You are free to delete this file if you'd like to, but if you ever want it revealed again, you can run `npx remix reveal` ✨
 * For more information, see https://remix.run/file-conventions/entry.server
 */

// Load environment variables at server startup
import dotenv from 'dotenv';
dotenv.config();

import { PassThrough } from "node:stream";
import { RemixServer } from "@remix-run/react";
import { renderToPipeableStream } from "react-dom/server";
import { startBlogScheduler } from "~/utils/blogScheduler.server";

const ABORT_DELAY = 5000;

if (!(globalThis as any).__blogSchedulerStarted) {
  (globalThis as any).__blogSchedulerStarted = true;
  startBlogScheduler().catch((error) => {
    console.error("[BLOG-SCHEDULER] Failed to start:", error);
  });
}

export default function handleRequest(request: Request, responseStatusCode: number, responseHeaders: Headers, remixContext: any) {
  const url = new URL(request.url);
  const isHttps = url.protocol === "https:";
  const requestStartTime = Date.now();
  console.log(`[SERVER] Request started: ${request.method} ${url.pathname} - ${new Date(requestStartTime).toISOString()}`);
  
  responseHeaders.set("X-Content-Type-Options", "nosniff");
  responseHeaders.set("X-XSS-Protection", "1; mode=block");
  responseHeaders.set("Referrer-Policy", "strict-origin-when-cross-origin");
  // Permissions-Policy is managed at the reverse proxy layer to avoid conflicting duplicate headers.
  
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://www.paypal.com https://paypal.com https://www.paypalobjects.com https://*.paypal.com https://*.paypalobjects.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' data: https: blob:",
    "font-src 'self' https://fonts.gstatic.com",
    "connect-src 'self' https://api.stripe.com https://api.paypal.com https://api-m.paypal.com https://api-m.sandbox.paypal.com https://js.stripe.com https://www.paypal.com https://paypal.com https://www.paypalobjects.com https://*.paypal.com https://*.paypalobjects.com https://acs.revolut.com https://*.revolut.com https://cdn.jsdelivr.net https://unpkg.com https://*.lottiefiles.com https://lottie.host",
    "frame-src 'self' https://js.stripe.com https://www.paypal.com https://paypal.com https://www.paypalobjects.com https://*.paypal.com https://*.paypalobjects.com https://acs.revolut.com https://*.revolut.com https:",
    "base-uri 'self'",
    "form-action 'self' https://www.paypal.com https://paypal.com https://*.paypal.com https://acs.revolut.com https://*.revolut.com https:",
    "frame-ancestors 'self' https://www.paypal.com https://*.paypal.com",
    "worker-src 'self' blob:",
  ].join("; ");
  
  responseHeaders.set("Content-Security-Policy", csp);
  
  if (isHttps) {
    responseHeaders.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
  }
  
  const origin = request.headers.get("Origin");
  const allowedOrigins = [
    "https://tourtovalencia.com",
    "https://www.tourtovalencia.com",
    process.env.NODE_ENV === "development" ? "http://localhost:3000" : null,
  ].filter(Boolean) as string[];
  
  if (origin && allowedOrigins.includes(origin)) {
    responseHeaders.set("Access-Control-Allow-Origin", origin);
    responseHeaders.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    responseHeaders.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
    responseHeaders.set("Access-Control-Allow-Credentials", "true");
    responseHeaders.set("Access-Control-Max-Age", "86400");
  }
  
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: responseHeaders,
    });
  }

  return new Promise((resolve, reject) => {
    let didError = false; 
    
    const { pipe, abort } = renderToPipeableStream(<RemixServer context={remixContext} url={request.url} />, {
      onShellReady() {
        const body = new PassThrough();
        
        responseHeaders.set("Content-Type", "text/html");
        
        const requestDuration = Date.now() - requestStartTime;
        console.log(`[SERVER] Shell ready: ${url.pathname} - Time: ${requestDuration}ms`);
        
        resolve(
          new Response(body as any, {
            headers: responseHeaders,
            status: didError ? 500 : responseStatusCode,
          })
        );
        
        pipe(body);
      },
      onShellError(err: unknown) {
        console.error(`[SERVER] Shell error for ${url.pathname}:`, err);
        reject(err);
      },
      onError(error: unknown) {
        didError = true;
        console.error(`[SERVER] Rendering error for ${url.pathname}:`, error);
      },
    });
    
    setTimeout(abort, ABORT_DELAY);
  });
}
