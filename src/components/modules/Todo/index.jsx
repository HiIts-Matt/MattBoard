import { ActionIcon, Box, Checkbox, Loader, Text, TextInput, Transition } from "@mantine/core";
import styles from './Todo.module.css'
import { IconArchive, IconPencilPlus, IconPlus } from "@tabler/icons-react";
import { ModuleTitle } from '../shared/ModuleTitle';
import { useState } from "react";
import { useToDo } from "../../../api/useToDo";
import { classNames, formatSeparatorDate } from "../../../utils/utils";

function groupByDay(items) {
    const sorted = [...items].sort((a, b) =>
        new Date(b.timeCreated) - new Date(a.timeCreated)
    );

    const result = [];
    let lastDay = null;

    for (const item of sorted) {
        const day = new Date(item.timeCreated).toDateString();
        if (day !== lastDay) {
            result.push({ type: 'separator', date: new Date(item.timeCreated) });
            lastDay = day;
        }
        result.push({ type: 'item', item });
    }

    return result;
}

export function ToDoList() {

    const [displayArchives, setDisplayArchives] = useState(false);

    const {
        data: toDoData,
        isLoading: toDoLoading,
    } = useToDo();

    const toDos = toDoData?.todos;

    return (
        <Box className={styles.bothWrapper}>
            <Box className={styles.toDoContainer}>
                <ModuleTitle
                    title="To Do List"
                    actions={[{
                        icon: <IconArchive />,
                        tooltip: 'Toggle Archives',
                        onClick: () => setDisplayArchives(prev => !prev),
                    }]}
                />

                {toDoLoading ? (
                    <Box>
                        <Loader />
                    </Box>
                ) : (
                    <Box className={styles.toDoList}>
                        {groupByDay(toDos.filter(item => !item?.archived)).map((entry) =>
                            entry.type === 'separator' ? (
                                <Box key={entry.date.toDateString()} className={styles.dateSeparator}>
                                    <Text className={styles.dateSeparatorText}>
                                        {formatSeparatorDate(entry.date)}
                                    </Text>
                                </Box>
                            ) : (
                                <ToDoItem key={entry.item.id} toDos={toDoData} item={entry.item} />
                            )
                        )}
                    </Box>
                )}
                <CreateNew toDos={toDoData} />
            </Box>
            <Transition
                mounted={displayArchives}
                transition="pop"
                duration={300}
                timingFunction="ease"
            >
                {(transition) => (
                    <Box
                        className={classNames(
                            styles.toDoContainer,
                            styles.archivesBox
                        )}
                        style={transition}
                    >
                        <Box className={styles.titleGroup}>
                            <IconArchive size={34} stroke={1.5} />
                            <Text className={styles.smallTitle}>
                                Archive
                            </Text>
                        </Box>
                        <Box className={styles.toDoList}>
                            {groupByDay(toDos.filter(item => item?.archived)).map((entry) =>
                                entry.type === 'separator' ? (
                                    <Box key={entry.date.toDateString()} className={styles.dateSeparator}>
                                        <Text className={styles.dateSeparatorText}>
                                            {formatSeparatorDate(entry.date)}
                                        </Text>
                                    </Box>
                                ) : (
                                    <ToDoItem key={entry.item.id} toDos={toDoData} item={entry.item} />
                                )
                            )}
                        </Box>
                    </Box>
                )}
            </Transition>
        </Box>
    )
}

function CreateNew() {

    const { addTodo } = useToDo();

    const [value, setValue] = useState('')
    const hasValue = value !== '';

    const newToDo = async () => {
        if (!value.trim()) return;

        const toDoItem = {
            timeCreated: new Date(),
            timeCompleted: null,
            value,
        }

        await addTodo.mutateAsync(toDoItem);
        setValue('');
    }

    return (
        <TextInput
            onKeyDown={(e) => {
                if (e.key === 'Enter') newToDo();
            }}
            classNames={{
                root: styles.inputRoot,
                input: styles.createNewInput,
                section: styles.createNewSection,
            }}
            placeholder="Create New To Do"
            value={value}
            onChange={e => setValue(e.currentTarget.value)}
            disabled={addTodo.isPending}
            leftSection={addTodo.isPending ? <Loader size="xs" /> : <IconPlus />}
            rightSection={hasValue ? (
                <ActionIcon onClick={newToDo} disabled={addTodo.isPending}>
                    <IconPencilPlus />
                </ActionIcon>
            ) : undefined}
        />
    )
}

function ToDoItem({ item }) {

    const { updateTodo } = useToDo();

    const isComplete = !!item.timeCompleted;

    const toggleItem = async () => {
        const newItem = {
            ...item,
            timeCompleted: item?.timeCompleted ? null : new Date(),
        }

        await updateTodo.mutateAsync({
            id: item.id,
            item: newItem,
        })
    }

    const archiveItem = async () => {
        const newItem = {
            ...item,
            archived: !item?.archived
        }

        await updateTodo.mutateAsync({
            id: item.id,
            item: newItem,
        })
    }

    return (
        <Checkbox.Card
            className={styles.toDoItem}
            checked={isComplete}
            onClick={toggleItem}
        >
            <Box className={styles.itemContent}>
                <Box className={styles.leftArea}>
                    <Checkbox.Indicator className={styles.indicator}/>
                    <Text className={styles.toDoItemText} td={isComplete ? 'line-through' : undefined}>
                        {item.value}
                    </Text>
                </Box>
                <ActionIcon
                    className={styles.archiveButton}
                    onClick={(e) => {
                        e.stopPropagation();
                        archiveItem();
                    }}
                >
                    <IconArchive size={20} />
                </ActionIcon>
            </Box>
        </Checkbox.Card>
    )
}