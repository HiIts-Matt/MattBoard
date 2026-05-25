import { create } from 'zustand';
import { DEFAULT_THEME } from '../../stores/ThemeStore';

function mapModules(pages, fn) {
    return pages.map(page => ({
        ...page,
        modules: page.modules.map(fn)
    }));
}

export function groupIntoSections(modules) {
    const sections = [];
    let currentGroup = [];
    modules.forEach(m => {
        if (m.fullsize) {
            if (currentGroup.length > 0) { sections.push(currentGroup); currentGroup = []; }
            sections.push([m]);
        } else {
            currentGroup.push(m);
        }
    });
    if (currentGroup.length > 0) sections.push(currentGroup);
    return sections;
}

export const useBuilderStore = create((set, get) => ({
    pages: null,
    selectedModuleId: null,
    builderToDoData: null,
    theme: null,

    enterBuilder: (pages, builderToDoData = null, theme = null) => set({
        pages: structuredClone(pages),
        builderToDoData: builderToDoData ? structuredClone(builderToDoData) : null,
        theme: theme ? structuredClone(theme) : null,
    }),
    exitBuilder: () => set({ pages: null, selectedModuleId: null, builderToDoData: null, theme: null }),

    updateTheme: (updates) => set(state => ({
        theme: { ...(state.theme ?? DEFAULT_THEME), ...updates },
    })),
    setBuilderToDoData: (builderToDoData) => set({ builderToDoData: structuredClone(builderToDoData) }),
    renameBuilderToDoList: (oldName, newName) => set(state => {
        if (!state.builderToDoData || oldName === newName || !state.builderToDoData[oldName] || state.builderToDoData[newName]) return state;
        const updatedBuilderToDoData = structuredClone(state.builderToDoData);
        const renamedItems = updatedBuilderToDoData[oldName].map(item => ({ ...item, listName: newName }));
        updatedBuilderToDoData[newName] = renamedItems;
        delete updatedBuilderToDoData[oldName];
        return { builderToDoData: updatedBuilderToDoData };
    }),
    updateBuilderToDoItem: (id, updates) => set(state => {
        if (!state.builderToDoData) return state;
        const updatedBuilderToDoData = structuredClone(state.builderToDoData);
        Object.keys(updatedBuilderToDoData).forEach(key => {
            updatedBuilderToDoData[key] = updatedBuilderToDoData[key].map(item => item.id === id ? { ...item, ...updates } : item);
        });
        return { builderToDoData: updatedBuilderToDoData };
    }),
    addBuilderToDoItem: (item) => set(state => {
        if (!state.builderToDoData) return state;
        const updatedBuilderToDoData = structuredClone(state.builderToDoData);
        const listName = item.listName || '';
        updatedBuilderToDoData[listName] = [...(updatedBuilderToDoData[listName] || []), item];
        return { builderToDoData: updatedBuilderToDoData };
    }),

    updateModulePosition: (moduleId, newPos) => set(state => ({
        pages: mapModules(state.pages, m =>
            m.id === moduleId ? { ...m, position: newPos } : m
        )
    })),

    updateModuleSetting: (moduleId, key, value) => set(state => ({
        pages: mapModules(state.pages, m => {
            if (m.id !== moduleId) return m;
            const updated = { ...m, [key]: value };
            // When toggling fullsize off on a module with no position, give it a default
            if (key === 'fullsize' && !value && !updated.position) {
                updated.position = { x: 5, y: 5, w: 25 };
            }
            return updated;
        })
    })),

    updateSectionFlex: (moduleId, flex) => set(state => ({
        pages: mapModules(state.pages, m =>
            m.id === moduleId ? { ...m, _sectionFlex: flex } : m
        )
    })),

    updateModuleSettings: (moduleId, updates) => set(state => ({
        pages: mapModules(state.pages, m =>
            m.id === moduleId ? { ...m, ...updates } : m
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
        const isCalendar = moduleTemplate.type === 'calendar';
        const isClock = moduleTemplate.type === 'clock';

        pages[pageIndex].modules.push({
            ...moduleTemplate,
            id: crypto.randomUUID(),
            ...(isCalendar ? { fullsize: true } : { position: { x: 5, y: 5, w: 25 } }),
            ...(isClock ? { showNumbers: false, showMarks: false, showBorder: false, variant: "both", fullsize: false} : {})
        });
        return { pages };
    }),

    removeModule: (moduleId) => set(state => ({
        pages: state.pages.map(page => ({
            ...page,
            modules: page.modules.filter(m => m.id !== moduleId)
        }))
    })),

    moveSectionUp: (moduleId) => set(state => {
        const pageIdx = state.pages.findIndex(p => p.modules.some(m => m.id === moduleId));
        if (pageIdx === -1) return state;
        const modules = state.pages[pageIdx].modules;
        const sections = groupIntoSections(modules);
        const sectionIdx = sections.findIndex(s => s.some(m => m.id === moduleId));
        if (sectionIdx <= 0) return state;
        const newSections = [...sections];
        [newSections[sectionIdx - 1], newSections[sectionIdx]] = [newSections[sectionIdx], newSections[sectionIdx - 1]];
        return { pages: state.pages.map((p, i) => i === pageIdx ? { ...p, modules: newSections.flat() } : p) };
    }),

    moveSectionDown: (moduleId) => set(state => {
        const pageIdx = state.pages.findIndex(p => p.modules.some(m => m.id === moduleId));
        if (pageIdx === -1) return state;
        const modules = state.pages[pageIdx].modules;
        const sections = groupIntoSections(modules);
        const sectionIdx = sections.findIndex(s => s.some(m => m.id === moduleId));
        if (sectionIdx >= sections.length - 1) return state;
        const newSections = [...sections];
        [newSections[sectionIdx], newSections[sectionIdx + 1]] = [newSections[sectionIdx + 1], newSections[sectionIdx]];
        return { pages: state.pages.map((p, i) => i === pageIdx ? { ...p, modules: newSections.flat() } : p) };
    }),

    exportConfig: () => get().pages,
}));
