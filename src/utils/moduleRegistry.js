const manifestGlob = import.meta.glob('../modules/*/manifest.json', { eager: true });
const componentGlob = import.meta.glob('../modules/*/index.jsx', { eager: true });
const settingsGlob = import.meta.glob('../modules/*/settings.js', { eager: true });

function dirOf(path) {
    return path.slice(0, path.lastIndexOf('/'));
}

export const moduleRegistry = Object.entries(manifestGlob).reduce((acc, [manifestPath, manifest]) => {
    const dir = dirOf(manifestPath);
    const id = manifest.id;

    const componentPath = Object.keys(componentGlob).find(p => dirOf(p) === dir);
    const settingsPath = Object.keys(settingsGlob).find(p => dirOf(p) === dir);

    acc[id] = {
        ...manifest,
        component: componentPath ? componentGlob[componentPath].default : null,
        settings: settingsPath ? (settingsGlob[settingsPath].settings ?? []) : [],
    };
    return acc;
}, {});

export const components = Object.fromEntries(
    Object.entries(moduleRegistry)
        .filter(([, m]) => m.component)
        .map(([id, m]) => [id, m.component])
);

export const moduleSettings = Object.fromEntries(
    Object.entries(moduleRegistry).map(([id, m]) => [id, m.settings])
);
