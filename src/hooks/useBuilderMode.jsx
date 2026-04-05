import { useBuilderStore } from "../components/Builder/BuilderStore";

export function useBuilderMode(save, config, data) {
    const { pages: builderPages, enterBuilder, exitBuilder, addModule, exportConfig } = useBuilderStore();

    function handleSave(targetId, newName) {
        const updatedPages = exportConfig();
        const target = newName
            ? { name: newName, background: config.background }
            : targetId
                ? data.configs.find(c => c.id === targetId)
                : config;
        save.mutate({ ...target, pages: updatedPages });
        exitBuilder();
    }

    function handleSwap(targetId) {
        const target = data.configs.find(c => c.id === targetId);
        save.mutate(target);
        exitBuilder();
    }

    function handleAddModule(pageIndex, type) {
        addModule(pageIndex, 0, { type });
    }

    return {
        builderPages,
        enterBuilder,
        exitBuilder,
        handleSave,
        handleSwap,
        handleAddModule,
    }
}