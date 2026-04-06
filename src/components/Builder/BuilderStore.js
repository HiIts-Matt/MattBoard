import { create } from 'zustand';

function mapModules(pages, fn) {
    return pages.map(page => ({
        ...page,
        modules: page.modules.map(fn)
    }));
}

export const useBuilderStore = create((set, get) => ({
    pages: null,
    selectedModuleId: null,

    enterBuilder: (pages) => set({ pages: structuredClone(pages) }),
    exitBuilder: () => set({ pages: null, selectedModuleId: null }),

    updateModulePosition: (moduleId, newPos) => set(state => ({
        pages: mapModules(state.pages, m =>
            m.id === moduleId ? { ...m, position: newPos } : m
        )
    })),

    updateModuleSetting: (moduleId, key, value) => set(state => ({
        pages: mapModules(state.pages, m =>
            m.id === moduleId ? { ...m, [key]: value } : m
        )
    })),

    swapModuleType: (moduleId, newType) => set(state => ({
        pages: mapModules(state.pages, m =>
            m.id === moduleId ? { id: m.id, position: m.position, type: newType } : m
        )
    })),

    selectModule: (id) => set({ selectedModuleId: id }),

    addModule: (pageIndex, moduleTemplate) => set(state => {
        const pages = structuredClone(state.pages);
        pages[pageIndex].modules.push({
            ...moduleTemplate,
            id: crypto.randomUUID(),
            position: { x: 5, y: 5, w: 25 },
        });
        return { pages };
    }),

    removeModule: (moduleId) => set(state => ({
        pages: state.pages.map(page => ({
            ...page,
            modules: page.modules.filter(m => m.id !== moduleId)
        }))
    })),

    exportConfig: () => get().pages,
}));