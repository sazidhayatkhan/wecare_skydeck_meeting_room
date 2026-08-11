export const THEMES = [
  { id: 'slate', label: 'Slate', primary: '222 47% 11%', primaryForeground: '210 40% 98%' },
  { id: 'blue', label: 'Blue', primary: '217 91% 60%', primaryForeground: '210 40% 98%' },
  { id: 'emerald', label: 'Emerald', primary: '160 84% 39%', primaryForeground: '0 0% 100%' },
  { id: 'amber', label: 'Amber', primary: '38 92% 50%', primaryForeground: '0 0% 100%' },
  { id: 'rose', label: 'Rose', primary: '350 89% 60%', primaryForeground: '0 0% 100%' },
] as const;

const DEFAULT_THEME = THEMES[0];

export function themeStyle(themeId: string): Record<string, string> {
  const theme = THEMES.find((t) => t.id === themeId) ?? DEFAULT_THEME;
  return {
    '--primary': theme.primary,
    '--primary-foreground': theme.primaryForeground,
    '--ring': theme.primary,
  };
}

export function applyTheme(themeId: string) {
  const root = document.documentElement;
  for (const [key, value] of Object.entries(themeStyle(themeId))) {
    root.style.setProperty(key, value);
  }
}

export function resetTheme() {
  const root = document.documentElement;
  root.style.removeProperty('--primary');
  root.style.removeProperty('--primary-foreground');
  root.style.removeProperty('--ring');
}
