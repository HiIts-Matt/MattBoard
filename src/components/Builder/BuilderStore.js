import { create } from 'zustand';

// Helper to map over modules across all sections in all pages
function mapModules(pages, fn) {
    return pages.map(page => ({
        ...page,
        sections: page.sections.map(section => ({
            ...section,
            modules: section.modules.map(fn)
        }))
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

    selectModule: (id) => set({ selectedModuleId: id }),

    // pageIndex + sectionIndex tell us where to insert the new module
    addModule: (pageIndex, sectionIndex, moduleTemplate) => set(state => {
        const pages = structuredClone(state.pages);
        pages[pageIndex].sections[sectionIndex].modules.push({
            ...moduleTemplate,
            id: crypto.randomUUID(),
            position: { x: 5, y: 5, w: 25, h: 30 },
        });
        return { pages };
    }),

    removeModule: (moduleId) => set(state => ({
        pages: state.pages.map(page => ({
            ...page,
            sections: page.sections.map(section => ({
                ...section,
                modules: section.modules.filter(m => m.id !== moduleId)
            }))
        }))
    })),

    exportConfig: () => get().pages,
}));