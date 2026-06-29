import { minutes } from './utils';

// Curated NASA Image & Video Library searches that reliably surface
// "amazing planets and stars" content. Used as quick-pick chips.
export const NASA_CATEGORIES = [
    { label: 'Nebulae', query: 'nebula' },
    { label: 'Galaxies', query: 'galaxy' },
    { label: 'Planets', query: 'planet' },
    { label: 'Stars', query: 'star cluster' },
    { label: 'Aurorae', query: 'aurora' },
    { label: 'Deep Field', query: 'hubble deep field' },
];

export const DEFAULT_BACKGROUND = {
    source: 'apple',        // 'apple' | 'nasa' — active source tab
    mode: 'shuffle',        // 'shuffle' (rotate on timer) | 'pinned' (one chosen image)
    changeTime: minutes(2), // rotation interval, shared across sources
    brightness: 0.5,        // board-level dim, 0–1
    apple: { albumToken: null, pinned: null }, // pinned: { guid, url, width, height }
    nasa: { query: 'nebula', pinned: null },   // pinned: { id, url, width, height }
};

// Upgrades any stored background (including the legacy
// { changeTime, brightness, albumToken } shape) to the current model.
export function normalizeBackground(bg) {
    const base = structuredClone(DEFAULT_BACKGROUND);
    if (!bg) return base;

    const out = {
        ...base,
        ...bg,
        apple: { ...base.apple, ...(bg.apple ?? {}) },
        nasa: { ...base.nasa, ...(bg.nasa ?? {}) },
    };

    // Legacy: albumToken sat at the top level.
    if (bg.albumToken && !out.apple.albumToken) {
        out.apple.albumToken = bg.albumToken;
    }
    delete out.albumToken;

    return out;
}
