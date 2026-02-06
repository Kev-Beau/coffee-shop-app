'use client';

import { useTheme, themes, ThemeName } from '../theme/config';
import { Coffee, Leaf, Sunset, Wine, Flower2, LucideIcon, Check } from 'lucide-react';

const themeIcons: Record<ThemeName, LucideIcon> = {
  coffee: Coffee,
  matcha: Leaf,
  chai: Sunset,
  'black-tea': Wine,
  herbal: Flower2,
};

export default function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="space-y-3">
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {Object.values(themes).map((themeConfig) => {
          const Icon = themeIcons[themeConfig.name as ThemeName];
          const isActive = theme === themeConfig.name;

          return (
            <button
              key={themeConfig.name}
              onClick={() => setTheme(themeConfig.name as ThemeName)}
              className="relative group flex-shrink-0"
            >
              <div
                className="w-20 h-24 rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-lg"
                style={{
                  background: `linear-gradient(135deg, ${themeConfig.colors.primaryLighter} 0%, ${themeConfig.colors.primaryLight} 50%, ${themeConfig.colors.primary} 100%)`,
                }}
              >
                {/* Checkmark for active theme */}
                {isActive && (
                  <div className="absolute top-2 right-2 w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-md animate-bounce-in">
                    <Check className="w-3 h-3" style={{ color: themeConfig.colors.primary }} />
                  </div>
                )}

                {/* Icon */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <Icon
                    className="w-8 h-8 opacity-80"
                    style={{ color: themeConfig.colors.primaryDark }}
                  />
                </div>

                {/* Theme name */}
                <div className="absolute bottom-0 left-0 right-0 bg-white/90 backdrop-blur-sm px-2 py-1">
                  <p className="text-xs font-semibold text-center text-gray-800 truncate">
                    {themeConfig.displayName}
                  </p>
                </div>
              </div>

              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 rounded-xl transition-colors pointer-events-none" />
            </button>
          );
        })}
      </div>

      {/* Selected theme label */}
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <span>Current:</span>
        <span className="font-medium" style={{ color: themes[theme].colors.primary }}>
          {themes[theme].displayName}
        </span>
      </div>
    </div>
  );
}
