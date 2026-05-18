import { create } from 'zustand';

let nextId = 0;

export const useModalStore = create((set) => ({
    modals: [],

    open: (content) => {
        const id = ++nextId;
        set(state => ({ modals: [...state.modals, { id, content }] }));
        return id;
    },

    close: (id) => set(state => ({
        modals: id == null
            ? state.modals.slice(0, -1)
            : state.modals.filter(m => m.id !== id),
    })),

    closeAll: () => set({ modals: [] }),
}));

// Imperative helpers — callable from anywhere (event handlers, async code, etc.)
export const displayModal = (content) => useModalStore.getState().open(content);
export const closeModal = (id) => useModalStore.getState().close(id);
export const closeAllModals = () => useModalStore.getState().closeAll();
