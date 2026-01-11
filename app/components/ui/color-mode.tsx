import * as React from "react";
import { useTheme } from "next-themes";
import type { ThemeProviderProps } from "next-themes";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";

/**
 * STRICT interface for color mode provider props
 */
export interface ColorModeProviderProps extends ThemeProviderProps {}

/**
 * STRICT interface for color mode type
 */
export type ColorMode = "light" | "dark" | "system";

/**
 * STRICT interface for color mode return value
 */
export interface UseColorModeReturn {
  colorMode: ColorMode;
  setColorMode: (colorMode: ColorMode) => void;
  toggleColorMode: () => void;
}

/**
 * ColorModeProvider using next-themes
 */
export function ColorModeProvider(props: ColorModeProviderProps) {
  return (
    <div className="light">
      {/* Inline theme provider without external library */}
      {React.createElement('div', {
        'data-theme': props.defaultTheme || 'light',
        children: props.children,
      })}
    </div>
  );
}

/**
 * useColorMode hook with manual implementation
 */
export function useColorMode(): UseColorModeReturn {
  const [colorMode, setColorModeState] = React.useState<ColorMode>('light');

  const setColorMode = React.useCallback((mode: ColorMode) => {
    setColorModeState(mode);
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', mode);
      localStorage.setItem('theme', mode);
    }
  }, []);

  const toggleColorMode = React.useCallback(() => {
    setColorMode(colorMode === 'dark' ? 'light' : 'dark');
  }, [colorMode, setColorMode]);

  React.useEffect(() => {
    // Initialize theme from localStorage
    if (typeof document !== 'undefined') {
      const savedTheme = localStorage.getItem('theme') as ColorMode;
      if (savedTheme) {
        setColorMode(savedTheme);
      }
    }
  }, [setColorMode]);

  return {
    colorMode,
    setColorMode,
    toggleColorMode,
  };
}

/**
 * useColorModeValue helper
 */
export function useColorModeValue<T>(light: T, dark: T): T {
  const { colorMode } = useColorMode();
  return colorMode === 'dark' ? dark : light;
}

/**
 * ThemeToggle component
 */
export function ThemeToggle() {
  const { setColorMode } = useColorMode();

  return (
    <DropdownMenu
      trigger={
        <Button variant="outline" size="icon">
          <span className="h-5 w-5">☀</span>
          <span className="sr-only">Toggle theme</span>
        </Button>
      }
    >
      <DropdownMenuItem onClick={() => setColorMode('light')}>
        Light
      </DropdownMenuItem>
      <DropdownMenuItem onClick={() => setColorMode('dark')}>
        Dark
      </DropdownMenuItem>
      <DropdownMenuItem onClick={() => setColorMode('system')}>
        System
      </DropdownMenuItem>
    </DropdownMenu>
  );
}
