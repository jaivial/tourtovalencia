import apiFetch from "@wordpress/api-fetch";
import { registerCoreBlocks } from "@wordpress/block-library";

let initialized = false;

export function initGutenberg() {
  if (initialized) return;
  initialized = true;

  // Mock the WordPress REST API — no WP backend exists
  apiFetch.use(() => Promise.resolve({}) as any);

  registerCoreBlocks();
}
