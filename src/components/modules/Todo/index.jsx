import { ActionIcon, Checkbox, Loader, ScrollArea, TextInput, Transition } from "@mantine/core";
import styles from './Todo.module.css'
import { IconArchive, IconChevronLeft, IconChevronRight, IconCircle, IconCircleCheck, IconPencilPlus, IconPlus, IconTrash } from "@tabler/icons-react";
import { ModuleTitle } from '../shared/ModuleTitle';
import { memo, useEffect, useMemo, useRef, useState } from "react";
import { useToDo } from "../../../api/useToDo";
import { classNames, formatSeparatorDate, toTitleCase } from "../../../utils/utils";
import { useBuilderStore } from "../../Builder/BuilderStore";

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

export function ToDoList({ module }) {

    const [displayArchives, setDisplayArchives] = useState(false);

    const {
        data: toDoData,
        isLoading: toDoLoading,
        updateTodo,
    } = useToDo();

    const { pages: builderPages, builderToDoData } = useBuilderStore();
    const builderMode = builderPages !== null;
    const displayedData = (builderMode && builderToDoData ? builderToDoData : toDoData);
    const listName = module?.listName;
    const toDos = useMemo(() => displayedData?.[listName] || [], [displayedData, listName]);

    const activeGrouped = useMemo(() => groupByDay(toDos.filter(item => !item?.archived)), [toDos]);
    const archivedGrouped = useMemo(() => groupByDay(toDos.filter(item => item?.archived)), [toDos]);

    const clearTimeHours = module?.clearTime;
    const processingRef = useRef(new Set());

    useEffect(() => {
        if (!clearTimeHours || clearTimeHours <= 0 || builderMode) return;
        const thresholdMs = clearTimeHours * 60 * 60 * 1000;

        const check = () => {
            const now = Date.now();
            toDos.forEach(item => {
                if (item.archived || !item.timeCompleted) return;
                if (processingRef.current.has(item.id)) return;
                if (now - new Date(item.timeCompleted).getTime() < thresholdMs) return;
                processingRef.current.add(item.id);
                updateTodo.mutate(
                    { id: item.id, item: { ...item, archived: true } },
                    { onSettled: () => processingRef.current.delete(item.id) }
                );
            });
        };

        check();
        const id = setInterval(check, 60_000);
        return () => clearInterval(id);
    }, [toDos, clearTimeHours, builderMode, updateTodo]);

    if (module.fullsize) {
        return <FullsizeList displayedData={displayedData} />
    }

    return (
        <div className={styles.bothWrapper}>
            <div className={styles.toDoContainer}>
                <ModuleTitle
                    title={toTitleCase(listName)}
                    actions={[{
                        icon: <IconArchive />,
                        tooltip: 'Toggle Archives',
                        onClick: () => setDisplayArchives(prev => !prev),
                    }]}
                />

                {toDoLoading ? (
                    <div>
                        <Loader />
                    </div>
                ) : (
                    <ScrollArea
                        type="hover"
                        classNames={{ root: styles.toDoList }}
                    >
                        {activeGrouped.map((entry) =>
                            entry.type === 'separator' ? (
                                <div key={entry.date.toDateString()} className={styles.dateSeparator}>
                                    <span className={styles.dateSeparatorText}>
                                        {formatSeparatorDate(entry.date)}
                                    </span>
                                </div>
                            ) : (
                                <ToDoItem key={entry.item.id} item={entry.item} listName={listName} />
                            )
                        )}
                    </ScrollArea>
                )}
                <CreateNew listName={listName} />
            </div>
            <Transition
                mounted={displayArchives}
                transition="pop"
                duration={300}
                timingFunction="ease"
            >
                {(transition) => (
                    <div
                        className={classNames(
                            styles.toDoContainer,
                            styles.archivesBox
                        )}
                        style={transition}
                    >
                        <div className={styles.titleGroup}>
                            <IconArchive size={34} stroke={1.5} />
                            <span className={styles.smallTitle}>
                                Archive
                            </span>
                        </div>
                        <ScrollArea
                            type="hover"
                            classNames={{ root: styles.toDoList }}
                        >
                            {archivedGrouped.map((entry) =>
                                entry.type === 'separator' ? (
                                    <div key={entry.date.toDateString()} className={styles.dateSeparator}>
                                        <span className={styles.dateSeparatorText}>
                                            {formatSeparatorDate(entry.date)}
                                        </span>
                                    </div>
                                ) : (
                                    <ToDoItem key={entry.item.id} item={entry.item} listName={listName} />
                                )
                            )}
                        </ScrollArea>
                    </div>
                )}
            </Transition>
        </div>
    )
}

function FullsizeList({ displayedData }) {

    const [selectedList, setSelectedList] = useState(null);
    const [archivesOpen, setArchivesOpen] = useState(false);
    const [extraLists, setExtraLists] = useState([]);
    const { deleteTodo } = useToDo();

    const allListNames = [...new Set([...Object.keys(displayedData || {}), ...extraLists])];
    const displayedItems = displayedData?.[selectedList] || [];
    const activeItems = displayedItems.filter(item => !item?.archived);
    const archivedItems = displayedItems.filter(item => item?.archived);

    const handleAddList = (name) => {
        setExtraLists(prev => prev.includes(name) ? prev : [...prev, name]);
        setSelectedList(name);
    };

    const handleDeleteList = async (listName) => {
        const items = displayedData?.[listName] || [];
        await Promise.all(items.map(item => deleteTodo.mutateAsync(item.id)));
        setExtraLists(prev => prev.filter(l => l !== listName));
        if (selectedList === listName) setSelectedList(null);
    };

    return (
        <div className={styles.fullsizeContainer}>
            <ModuleTitle title='Lists' />
            <div className={styles.viewerRoot}>
                <div className={styles.listColumn}>
                    <ScrollArea type="hover" classNames={{ root: styles.sidebarScroll }}>
                        {allListNames.map(listName => (
                            <ListItem
                                key={listName}
                                listName={listName}
                                list={displayedData?.[listName] || []}
                                isSelected={selectedList === listName}
                                onClick={() => setSelectedList(listName)}
                                onDelete={() => handleDeleteList(listName)}
                            />
                        ))}
                    </ScrollArea>
                    <CreateNewList onAdd={handleAddList} />
                </div>
                <div className={styles.listBox}>
                    <div className={styles.paneHeader}>
                        <span className={styles.paneTitle}>{selectedList ?? 'Select a list'}</span>
                    </div>
                    {selectedList === null ? (
                        <EmptyState message="Select a list to get started" />
                    ) : activeItems.length === 0 ? (
                        <EmptyState message="This list is empty" />
                    ) : (
                        <ScrollArea type="hover" classNames={{ root: styles.toDoList }}>
                            {groupByDay(activeItems).map((entry) =>
                                entry.type === 'separator' ? (
                                    <div key={entry.date.toDateString()} className={styles.dateSeparator}>
                                        <span className={styles.dateSeparatorText}>
                                            {formatSeparatorDate(entry.date)}
                                        </span>
                                    </div>
                                ) : (
                                    <ToDoItem key={entry.item.id} item={entry.item} listName={selectedList} />
                                )
                            )}
                        </ScrollArea>
                    )}
                    {selectedList && <CreateNew listName={selectedList} />}
                </div>
                <div
                    className={classNames(styles.archiveDivider, archivesOpen ? styles.archiveDividerOpen : '')}
                    onClick={() => setArchivesOpen(prev => !prev)}
                >
                    {archivesOpen ? <IconChevronRight size={14} /> : <IconChevronLeft size={14} />}
                    <IconArchive size={16} />
                </div>
                <div className={classNames(styles.archiveBox, archivesOpen ? styles.opened : '')}>
                    <div className={styles.paneHeader}>
                        <span className={styles.paneTitle}>Archive</span>
                    </div>
                    {archivedItems.length === 0 ? (
                        <EmptyState message="Nothing archived" />
                    ) : (
                        <ScrollArea type="hover" classNames={{ root: styles.toDoList }}>
                            {groupByDay(archivedItems).map((entry) =>
                                entry.type === 'separator' ? (
                                    <div key={entry.date.toDateString()} className={styles.dateSeparator}>
                                        <span className={styles.dateSeparatorText}>
                                            {formatSeparatorDate(entry.date)}
                                        </span>
                                    </div>
                                ) : (
                                    <ToDoItem key={entry.item.id} item={entry.item} listName={selectedList} />
                                )
                            )}
                        </ScrollArea>
                    )}
                </div>
            </div>
        </div>
    )
}

function EmptyState({ message }) {
    return (
        <div className={styles.emptyState}>
            <span className={styles.emptyStateText}>{message}</span>
        </div>
    );
}

function CreateNewList({ onAdd }) {
    const [value, setValue] = useState('');
    const submit = () => {
        const name = value.trim();
        if (!name) return;
        onAdd(name);
        setValue('');
    };
    return (
        <TextInput
            classNames={{
                root: styles.inputRoot,
                input: styles.createNewInput,
                section: styles.createNewSection,
            }}
            placeholder="New list..."
            value={value}
            onChange={e => setValue(e.currentTarget.value)}
            onKeyDown={e => e.key === 'Enter' && submit()}
            leftSection={<IconPlus />}
            rightSection={value ? (
                <ActionIcon onClick={submit}><IconPencilPlus /></ActionIcon>
            ) : undefined}
        />
    );
}

function ListItem({ listName, list, isSelected, onClick, onDelete }) {
    return (
        <div className={classNames(styles.listItem, isSelected && styles.listItemSelected)} onClick={onClick}>
            <span className={styles.listTitle}>{listName}</span>
            <div className={styles.listItemRight}>
                <div className={styles.countGroup}>
                    <div className={styles.itemCountBox}>
                        <IconCircle size={14} />
                        <span className={styles.itemCount}>{list.filter(i => !i.archived).length}</span>
                    </div>
                    <div className={styles.itemCountBox}>
                        <IconCircleCheck size={14} color='#12b886' />
                        <span className={styles.itemCount}>{list.filter(i => !!i.timeCompleted && !i.archived).length}</span>
                    </div>
                </div>
                <ActionIcon
                    className={styles.deleteListButton}
                    size="xs"
                    onClick={(e) => { e.stopPropagation(); onDelete(); }}
                >
                    <IconTrash size={13} />
                </ActionIcon>
            </div>
        </div>
    );
}

function CreateNew({ listName }) {

    const { addTodo } = useToDo();

    const [value, setValue] = useState('')
    const hasValue = value !== '';

    const newToDo = async () => {
        if (!value.trim()) return;

        const toDoItem = {
            timeCreated: new Date(),
            timeCompleted: null,
            value,
            listName,
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

const ToDoItem = memo(function ToDoItem({ item, listName }) {

    const { updateTodo } = useToDo();

    const isComplete = !!item.timeCompleted;

    const toggleItem = async () => {
        const newItem = {
            ...item,
            timeCompleted: item?.timeCompleted ? null : new Date(),
            listName
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
            <div className={styles.itemContent}>
                <div className={styles.leftArea}>
                    <Checkbox.Indicator className={styles.indicator} />
                    <span className={styles.toDoItemText} style={isComplete ? { textDecoration: 'line-through' } : undefined}>
                        {item.value}
                    </span>
                </div>
                <ActionIcon
                    className={styles.archiveButton}
                    onClick={(e) => {
                        e.stopPropagation();
                        archiveItem();
                    }}
                >
                    <IconArchive size={20} />
                </ActionIcon>
            </div>
        </Checkbox.Card>
    )
});