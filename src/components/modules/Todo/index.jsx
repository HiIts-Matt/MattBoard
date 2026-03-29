import { ActionIcon, Box, Checkbox, Loader, Popover, Text, TextInput, Transition, UnstyledButton } from "@mantine/core";
import styles from './Todo.module.css'
import { IconArchive, IconPencilPlus, IconPlus, IconX } from "@tabler/icons-react";
import { useState } from "react";
import { useToDo } from "../../../api/useToDo";
import { classNames } from "../../../utils/utils";


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
                <Box className={styles.titleSection}>
                    <Text className={styles.title}>
                        To Do List
                    </Text>
                    <ActionIcon
                        className={styles.archiveIcon}
                        onClick={() => setDisplayArchives(prev => !prev)}
                    >
                        <IconArchive />
                    </ActionIcon>
                </Box>

                {toDoLoading ? (
                    <Box>
                        <Loader />
                    </Box>
                ) : (
                    <Box className={styles.toDoList}>
                        {toDos
                            .filter(item => !item?.archived)
                            ?.map((item) => (
                                <ToDoItem key={item.id} toDos={toDoData} item={item} />
                            ))}
                    </Box>
                )}

                <CreateNew toDos={toDoData} />
            </Box>
            <Transition
                mounted={displayArchives}
                transition="pop"
                duration={400}
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
                                Archives
                            </Text>
                        </Box>
                        <Box className={styles.toDoList}>
                            {toDos
                                .filter(item => item?.archived)
                                ?.map((item) => (
                                    <ToDoItem key={item.id} toDos={toDoData} item={item} />
                                ))}
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
                root: styles.inputColorPalette,
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
                    <Checkbox.Indicator />
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

function ArchiveList({ toDos, children }) {
    return (
        <Popover
            radius={10}
            position='right-start'
            offset={{
                mainAxis: 28,
                crossAxis: -20,
            }}
            withinPortal={false}
        >
            <Popover.Target>
                {children}
            </Popover.Target>
            <Popover.Dropdown className={styles.archiveDropdown}>
                <Box className={styles.dropdownInner}>

                </Box>
            </Popover.Dropdown>
        </Popover>
    )
}