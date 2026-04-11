import { useBuilderStore } from "../components/Builder/BuilderStore";
import { useToDo } from "../api/useToDo";

export function useBuilderMode(save, config, data) {
    const { pages: builderPages, builderToDoData, enterBuilder, exitBuilder, addModule, exportConfig } = useBuilderStore();
    const { updateTodo } = useToDo();

    async function handleSave(targetId, newName) {
        const updatedPages = exportConfig();
        const target = newName
            ? { name: newName, background: config.background }
            : targetId
                ? data.configs.find(c => c.id === targetId)
                : config;
        await save.mutateAsync({ ...target, pages: updatedPages });

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
        enterBuilder,
        exitBuilder,
        handleSave,
        handleSwap,
        handleAddModule,
    }
}