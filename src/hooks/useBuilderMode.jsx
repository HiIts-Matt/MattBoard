import { useBuilderStore } from "../components/Builder/BuilderStore";
import { useToDo } from "../api/useToDo";

export function useBuilderMode(save, config, data) {
    const { pages: builderPages, theme: builderTheme, background: builderBackground, builderToDoData, enterBuilder, exitBuilder, addModule, exportConfig } = useBuilderStore();
    const { updateTodo } = useToDo();

    async function handleSave(targetId, newName) {
        const updatedPages = exportConfig();
        const updatedTheme = builderTheme ?? config.theme;
        const updatedBackground = builderBackground ?? config.background;
        const target = newName
            ? { name: newName }
            : targetId
                ? data.configs.find(c => c.id === targetId)
                : config;
        await save.mutateAsync({ ...target, pages: updatedPages, theme: updatedTheme, background: updatedBackground });

        if (builderToDoData) {
            const allItems = Object.values(builderToDoData).flat();
            await Promise.all(allItems.map(item => updateTodo.mutateAsync({ id: item.id, item })));
        }

        exitBuilder();
    }

    function handleSwap(targetId) {
        const target = data.configs.find(c => c.id === targetId);
        save.mutate(target);
        exitBuilder();
    }

    function handleAddModule(pageIndex, type) {
        addModule(pageIndex, { type });
    }

    return {
        builderPages,
        builderTheme,
        builderBackground,
        enterBuilder,
        exitBuilder,
        handleSave,
        handleSwap,
        handleAddModule,
    }
}
