const loginAttempts = new Map<string, { count: number; resetTime: number }>();

const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 5;

export interface RateLimitResult {
  success: boolean;
  remainingAttempts: number;
  resetTime?: number;
}

export async function checkLoginRateLimit(ip: string): Promise<RateLimitResult> {
  const now = Date.now();
  const attempts = loginAttempts.get(ip);

  if (!attempts || now > attempts.resetTime) {
    loginAttempts.set(ip, {
      count: 1,
      resetTime: now + WINDOW_MS,
    });
    
    return {
      success: true,
      remainingAttempts: MAX_ATTEMPTS - 1,
    };
  }

  if (attempts.count >= MAX_ATTEMPTS) {
    return {
      success: false,
      remainingAttempts: 0,
      resetTime: attempts.resetTime,
    };
  }

  attempts.count++;
  loginAttempts.set(ip, attempts);

  return {
    success: true,
    remainingAttempts: MAX_ATTEMPTS - attempts.count,
  };
}

export function resetRateLimit(ip: string): void {
  loginAttempts.delete(ip);
}

export function cleanupExpiredEntries(): void {
  const now = Date.now();
  
  for (const [ip, data] of loginAttempts.entries()) {
    if (now > data.resetTime) {
      loginAttempts.delete(ip);
    }
  }
}

setInterval(cleanupExpiredEntries, 60 * 1000);
