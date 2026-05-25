import { create } from 'zustand';

export const DEFAULT_THEME = {
    blur: 'none',
    blurAmount: 5,
};

export const useThemeStore = create((set) => ({
    activeTheme: DEFAULT_THEME,
    blurredImageUrl: null,
    blurredImageSize: null,
    setActiveTheme: (theme) => set({ activeTheme: { ...DEFAULT_THEME, ...theme } }),
    setBlurredImage: (url, size) => set({ blurredImageUrl: url, blurredImageSize: size ?? null }),
}));
