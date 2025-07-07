// ModeToggle.tsx
import { useTheme } from './theme-provider';
import { Sun, Moon, Monitor } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function ModeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex items-center gap-2">
      <Button variant={theme === 'light' ? 'default' : 'outline'} onClick={() => setTheme('light')}>
        <Sun className="h-4 w-4" />
      </Button>
      <Button variant={theme === 'dark' ? 'default' : 'outline'} onClick={() => setTheme('dark')}>
        <Moon className="h-4 w-4" />
      </Button>
      <Button variant={theme === 'system' ? 'default' : 'outline'} onClick={() => setTheme('system')}>
        <Monitor className="h-4 w-4" />
      </Button>
    </div>
  );
}
