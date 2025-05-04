import { usePreferences } from '../context/PreferencesContext';
import { Moon, Sun } from 'lucide-react';

export function ThemeToggle() {
  const { preferences, setPreferences } = usePreferences();

  const toggleTheme = () => {
    setPreferences({
      theme: preferences.theme === 'light' ? 'dark' : 'light',
    });
  };

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
      aria-label={`Switch to ${preferences.theme === 'light' ? 'dark' : 'light'} theme`}
    >
      {preferences.theme === 'light' ? (
        <Moon className="w-5 h-5" />
      ) : (
        <Sun className="w-5 h-5" />
      )}
    </button>
  );
} 