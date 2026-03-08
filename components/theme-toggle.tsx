'use client';

import { useSyncExternalStore } from 'react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { SunIcon, MoonIcon } from '@/components/icons';

const subscribe = () => () => {};
const useMounted = () => useSyncExternalStore(subscribe, () => true, () => false);

export function ThemeToggle() {
  const mounted = useMounted();
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
      aria-label={mounted ? `Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} mode` : 'Toggle theme'}
      className="w-9 px-0"
    >
      {mounted ? resolvedTheme === 'dark' ? <SunIcon /> : <MoonIcon /> : null}
    </Button>
  );
}
