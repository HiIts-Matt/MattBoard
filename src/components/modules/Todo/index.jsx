import { ActionIcon, Box, Checkbox, Text, TextInput, UnstyledButton } from "@mantine/core";
import styles from './Todo.module.css'
import { useMap } from "@mantine/hooks";
import { IconPencilPlus, IconPlus } from "@tabler/icons-react";
import { useState } from "react";


export function ToDoList() {

    const toDos = useMap();
    const archive = useMap();

    console.log(Array.from(toDos.values()))

    return (
        <Box className={styles.toDoContainer}>
            <Text className={styles.title}>
                To Do List
            </Text>
            <Box className={styles.toDoList}>
                {Array.from(toDos.entries()).map(([itemKey, itemValue]) => (
                    <ToDoItem key={itemKey} toDos={toDos} itemKey={itemKey} item={itemValue} />
                ))}
            </Box>

            <CreateNew toDos={toDos} />
        </Box>
    )
}

function CreateNew({ toDos }) {

    const [value, setValue] = useState('')
    const hasValue = value !== '';

    function addToDo() {
        if (!value.trim()) return;

        const toDoItem = {
            timeCreated: new Date(),
            timeCompleted: null,
            value,
        }

        toDos.set(crypto.randomUUID(), toDoItem);
        setValue('');
    }

    return (
        <TextInput
            onKeyDown={(e) => {
                if (e.key === 'Enter') addToDo();
            }}
            classNames={{
                root: styles.inputColorPalette,
                input: styles.createNewInput,
                section: styles.createNewSection,
            }}
            placeholder="Create New To Do"
            value={value}
            onChange={e => setValue(e.currentTarget.value)}
            leftSection={<IconPlus />}
            rightSection={hasValue ? (
                <ActionIcon onClick={addToDo}>
                    <IconPencilPlus />
                </ActionIcon>
            ) : undefined}
        />
    )
}

function ToDoItem({ toDos, itemKey, item }) {

    const isComplete = !!item.timeCompleted;

    const toggleItem = () => {
        toDos.set(itemKey, {
            ...item,
            timeCompleted: isComplete ? null : new Date(),
        });
    }

    return (
        <Checkbox.Card
            className={styles.toDoItem}
            checked={isComplete}
            onClick={toggleItem}
        >
            <Checkbox.Indicator />
            <Text className={styles.toDoItemText} td={isComplete ? 'line-through' : undefined}>
                {item.value}
            </Text>
        </Checkbox.Card>
    )
}