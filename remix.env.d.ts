/// <reference types="@remix-run/node" />
/// <reference types="vite/client" />

declare module "@remix-run/node" {
  interface ProcessEnv {
    GMAIL_USER: string;
    GMAIL_APP_PASSWORD: string;
    SESSION_SECRET: string;
    MONGODB_URI: string;
  }
}
