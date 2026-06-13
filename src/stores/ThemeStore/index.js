import { create } from 'zustand';

export const FONTS = {
    'Space Grotesk': '"Space Grotesk", sans-serif',
    'System': 'system-ui, sans-serif',
    'Geist Mono': '"Geist Mono Variable", monospace',
    'Geist Pixel': '"Geist Pixel Square", monospace',
};

export const DEFAULT_THEME = {
    tier: 'free',
    // Background
    bgColorHex: '#323232',
    bgOpacity: 0.6,
    // Blur (applied via bg-effect + backdrop-filter)
    blur: 'none',
    blurAmount: 5,
    // Appearance
    componentRadius: 12,
    // Typography
    mainFont: 'Space Grotesk',
    // Text brightness (0–1, scales all glyph color opacities)
    textBrightness: 1,
    // Per-module-type overrides — keyed by module id (e.g. 'clock')
    moduleOverrides: {},
};

function hexToRgb(hex) {
    const c = hex.replace('#', '');
    return `${parseInt(c.slice(0, 2), 16)}, ${parseInt(c.slice(2, 4), 16)}, ${parseInt(c.slice(4, 6), 16)}`;
}

export function applyTheme(theme) {
    const t = { ...DEFAULT_THEME, ...theme };
    const el = document.documentElement;

    el.style.setProperty('--bg-color', `rgba(${hexToRgb(t.bgColorHex)}, ${t.bgOpacity})`);
    el.style.setProperty('--bg-effect', t.blur === 'css' ? `blur(${t.blurAmount}px)` : 'none');
    el.style.setProperty('--module-backdrop-blur', t.blur === 'css' ? `${t.blurAmount}px` : '0px');
    el.setAttribute('data-blur-mode', t.blur ?? 'none');
    el.style.setProperty('--component-rd', `${t.componentRadius}px`);
    el.style.setProperty('--main-font', FONTS[t.mainFont] ?? FONTS['Space Grotesk']);

    const b = t.textBrightness;
    el.style.setProperty('--glyph-color-filled', `rgba(255, 255, 255, ${b})`);
    el.style.setProperty('--glyph-color-solid', `rgba(255, 255, 255, ${+(b * 0.7).toFixed(2)})`);
    el.style.setProperty('--glyph-color-minimal', `rgba(255, 255, 255, ${+(b * 0.5).toFixed(2)})`);

    applyModuleOverrides(t.moduleOverrides ?? {});
}

export function applyModuleOverrides(overrides) {
    let tag = document.getElementById('mb-module-overrides');
    if (!tag) {
        tag = document.createElement('style');
        tag.id = 'mb-module-overrides';
        document.head.appendChild(tag);
    }

    const css = Object.entries(overrides).flatMap(([id, o]) => {
        if (!o) return [];
        const rules = [];
        if (o.bgColorHex !== undefined || o.bgOpacity !== undefined) {
            const rgb = hexToRgb(o.bgColorHex ?? DEFAULT_THEME.bgColorHex);
            rules.push(`--bg-color: rgba(${rgb}, ${o.bgOpacity ?? DEFAULT_THEME.bgOpacity})`);
        }
        if (o.componentRadius !== undefined) rules.push(`--component-rd: ${o.componentRadius}px`);
        if (o.textBrightness !== undefined) {
            const b = o.textBrightness;
            rules.push(`--glyph-color-filled: rgba(255, 255, 255, ${b})`);
            rules.push(`--glyph-color-solid: rgba(255, 255, 255, ${+(b * 0.7).toFixed(2)})`);
            rules.push(`--glyph-color-minimal: rgba(255, 255, 255, ${+(b * 0.5).toFixed(2)})`);
        }
        return rules.length ? [`[data-module-type="${id}"] { ${rules.join('; ')} }`] : [];
    }).join('\n');

    tag.textContent = css;
}

export const useThemeStore = create((set) => ({
    activeTheme: DEFAULT_THEME,
    blurredImageUrl: null,
    blurredImageSize: null,
    setActiveTheme: (theme) => set({ activeTheme: { ...DEFAULT_THEME, ...theme } }),
    setBlurredImage: (url, size) => set({ blurredImageUrl: url, blurredImageSize: size ?? null }),
}));
