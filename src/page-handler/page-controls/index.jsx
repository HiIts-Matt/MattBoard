import { Box, Text, Popover, Stack, UnstyledButton, Menu, Divider, TextInput, HoverCard, HoverCardDropdown } from "@mantine/core";
import {
    IconChevronLeft, IconChevronRight,
    IconPencil, IconDeviceFloppy, IconX, IconPlus,
    IconSwitch,
    IconCheck
} from "@tabler/icons-react";
import styles from "./PageControls.module.css";
import { useLayoutEffect, useRef, useState } from "react";
import { components } from "../../utils/componentMap"
import { classNames, seconds } from "../../utils/utils";
import { useTempState } from "../../utils/useTempState";
import { useBuilderStore } from "../../components/Builder/BuilderStore";

export function PageControls({
    activeConfig,
    configData,
    pages,
    direction,
    activePage,
    onNavigate,
    builderMode,
    onEnterBuilder,
    onSave,
    onDiscard,
    onAddModule,
    onSwap
}) {
    const canGoBack = activePage > 0;
    const canGoForward = activePage < pages?.length - 1;

    return (
        <Box className={styles.controller}>
            <Box
                className={styles.arrowPill}
                style={{
                    transform: canGoBack ? "translateX(0)" : "translateX(-150%)",
                    opacity: canGoBack ? 1 : 0,
                    pointerEvents: canGoBack ? "auto" : "none",
                }}
                onClick={() => onNavigate(activePage - 1)}
            >
                <IconChevronLeft size={24} color="white" />
            </Box>

            <NamePillRow
                activeConfig={activeConfig}
                configData={configData}
                pages={pages}
                direction={direction}
                activePage={activePage}
                onEnterBuilder={onEnterBuilder}
                onSave={onSave}
                onDiscard={onDiscard}
                onAddModule={onAddModule}
                builderMode={builderMode}
                onSwap={onSwap}
            />

            <Box
                className={styles.arrowPill}
                style={{
                    transform: canGoForward ? "translateX(0)" : "translateX(150%)",
                    opacity: canGoForward ? 1 : 0,
                    pointerEvents: canGoForward ? "auto" : "none",
                }}
                onClick={() => onNavigate(activePage + 1)}
            >
                <IconChevronRight size={24} color="white" />
            </Box>
        </Box>
    );
}

function NamePillRow({ activeConfig, configData, pages, direction, activePage, onEnterBuilder, onSave, onDiscard, onAddModule, builderMode, onSwap }) {
    return (
        <Box className={styles.namePillRow}>
            <NamePill pages={pages} direction={direction} activePage={activePage} />
            <Box
                className={classNames(
                    styles.editButton,
                    builderMode ? styles.hide : ''
                )}
                onClick={onEnterBuilder}
            >
                <IconPencil size={20} color="white" />
            </Box>
            <BuilderToolbar
                activeConfig={activeConfig}
                configData={configData}
                onSave={onSave}
                onDiscard={onDiscard}
                onAddModule={() => onAddModule(activePage)}
                builderMode={builderMode}
                onSwap={onSwap}
            />
        </Box>
    );
}

function BuilderToolbar({
    activeConfig,
    configData,
    onSave,
    onDiscard,
    onAddModule,
    builderMode,
    onSwap
}) {

    return (
        <Box className={styles.builderToolbar}>
            <XButton
                activeConfig={activeConfig}
                onDiscard={onDiscard}
                builderMode={builderMode}
            />
            <AddModule
                builderMode={builderMode}
                onAddModule={onAddModule}
            />
            <SaveConfig
                onSave={onSave}
                builderMode={builderMode}
                configData={configData}
            />
            <SwapConfig
                onSwap={onSwap}
                builderMode={builderMode}
                configData={configData}
            />
        </Box>
    );
}

function XButton({ activeConfig, onDiscard, builderMode }) {
    const { pages: builderPages } = useBuilderStore();

    const hasChanges = builderPages !== null &&
        JSON.stringify(builderPages) !== JSON.stringify(activeConfig.pages)

    const [xOpen, setXOpen, resetXState] = useTempState(false, seconds(3))

    return (
        <HoverCard
            withinPortal={false}
            withArrow
            transitionProps={{ transition: 'pop' }}
        >
            <HoverCard.Target>
                <Box
                    className={classNames(styles.toolbarPill, builderMode && styles.visible, xOpen && styles.xOpen)}
                    onClick={() => {
                        if (xOpen) {
                            onDiscard();
                            resetXState();
                        }
                        else if (!xOpen && !hasChanges) {
                            onDiscard();
                            resetXState();
                        }
                        else {
                            setXOpen(true);
                        }
                    }}
                >
                    <IconX size={20} color="white" />
                </Box>
            </HoverCard.Target>
            <HoverCard.Dropdown className={classNames(
                styles.saveMenu,
                xOpen ? styles.redHighlight : ''
            )}>
                {xOpen ? (
                    <Box className={styles.confirmBox}>
                        <Box className={styles.titleWrapper}>
                            <Text className={styles.titleText}>Are You Sure</Text>
                        </Box>
                        <Text className={styles.subText}>This will permanently delete any unsaved changes</Text>
                    </Box>
                ) : (
                    <Text className={styles.toolTip}>
                        {hasChanges
                            ? 'Discard Changes'
                            : 'Exit Builder Mode'
                        }
                    </Text>
                )}

            </HoverCard.Dropdown>
        </HoverCard >
    )
}

function AddModule({ builderMode, onAddModule }) {
    const moduleTypes = Object.keys(components);

    return (
        <Menu
            withinPortal={false}
            withArrow
            transitionProps={{ transition: 'pop' }}
        >
            <Menu.Target>
                <Box
                    className={classNames(styles.toolbarPill, styles.delay60, builderMode && styles.visible)}
                >
                    <IconPlus size={20} color="white" />
                </Box>
            </Menu.Target>
            <Menu.Dropdown className={styles.saveMenu}>
                    <Menu.Label>Add Module</Menu.Label>
                    {moduleTypes.map(type => (
                        <Menu.Item
                            key={type}
                            onClick={() => onAddModule(type)}
                        >
                            {type.split(1).map(([firstChar, ...rest])=> [firstChar.toUpperCase(), rest])}
                        </Menu.Item>
                    ))}
            </Menu.Dropdown>
        </Menu>
    )
}

function SaveConfig({ onSave, builderMode, configData }) {
    const otherConfigs = configData?.configs?.filter(c => c.id !== configData.active) ?? [];
    const [savingNew, setSavingNew] = useState(false);
    const [newName, setNewName] = useState('');

    function submitNew(e) {
        e.preventDefault();
        e.stopPropagation();
        if (!newName.trim()) return;
        onSave(null, newName.trim());
        setNewName('');
        setSavingNew(false);
    }

    return (
        <Menu
            withinPortal={false}
            withArrow
            transitionProps={{ transition: 'pop' }}
            onClose={() => { setSavingNew(false); setNewName(''); }}
        >
            <Menu.Target>
                <Box className={classNames(styles.toolbarPill, styles.delay120, builderMode && styles.visible)}>
                    <IconDeviceFloppy size={20} color="white" />
                </Box>
            </Menu.Target>
            <Menu.Dropdown className={styles.saveMenu}>
                <Menu.Label>Save Configuration</Menu.Label>
                <Menu.Item leftSection={<IconDeviceFloppy />} onClick={() => onSave()}>
                    Overwrite Current
                </Menu.Item>
                {otherConfigs.length > 0 && <>
                    <Menu.Label>Overwrite other config</Menu.Label>
                    {otherConfigs.map(config => (
                        <Menu.Item
                            key={config.id}
                            leftSection={<IconDeviceFloppy />}
                            onClick={() => onSave(config.id)}
                        >
                            {config.name}
                        </Menu.Item>
                    ))}
                </>}
                {savingNew ? (
                    <Box component="form" className={styles.newConfigForm} onSubmit={submitNew}>
                        <TextInput
                            autoFocus
                            size="xs"
                            placeholder="Config name"
                            value={newName}
                            onChange={e => setNewName(e.currentTarget.value)}
                            onKeyDown={e => e.key === 'Escape' && setSavingNew(false)}
                            classNames={{ input: styles.newConfigInput }}
                        />
                    </Box>
                ) : (
                    <Menu.Item
                        leftSection={<IconPlus />}
                        closeMenuOnClick={false}
                        onClick={() => setSavingNew(true)}
                    >
                        Save as new...
                    </Menu.Item>
                )}
            </Menu.Dropdown>
        </Menu>
    );
}

function SwapConfig({ builderMode, configData, onSwap }) {
    return (
        <Menu withinPortal={false} withArrow transitionProps={{ transition: 'pop' }}>
            <Menu.Target>
                <Box className={classNames(styles.toolbarPill, styles.delay180, builderMode && styles.visible)}>
                    <IconSwitch size={20} color="white" />
                </Box>
            </Menu.Target>
            <Menu.Dropdown className={styles.saveMenu}>
                <Menu.Label>Swap Config</Menu.Label>
                {configData?.configs?.map(config => (
                    <Menu.Item
                        key={config.id}
                        leftSection={config.id === configData.active ? <IconCheck size={16} /> : <Box w={16} />}
                        onClick={() => onSwap(config.id)}
                    >
                        {config.name}
                    </Menu.Item>
                ))}
            </Menu.Dropdown>
        </Menu>
    );
}

function NamePill({ pages, direction, activePage }) {
    const currentPage = pages?.[activePage];
    const showLabel = currentPage?.showTitle !== false;

    const prevIndexRef = useRef(activePage);
    const [outgoing, setOutgoing] = useState(null);

    useLayoutEffect(() => {
        const prevIndex = prevIndexRef.current;
        if (prevIndex === activePage) return;

        const prevPage = pages?.[prevIndex];
        prevIndexRef.current = activePage;

        if (prevPage?.showTitle !== false) {
            setOutgoing({ name: prevPage?.name });
            const timer = setTimeout(() => setOutgoing(null), 350);
            return () => clearTimeout(timer);
        }
    }, [activePage]);

    return (
        <Box className={styles.namePillClip}>
            <Box
                className={styles.namePill}
                style={{
                    transform: showLabel ? "translateY(0)" : "translateY(150%)",
                    opacity: showLabel ? 1 : 0,
                    pointerEvents: showLabel ? "auto" : "none",
                }}
            >
                <Box className={styles.namePillContent}>
                    {outgoing && (
                        <Text
                            className={showLabel
                                ? `${styles.nameText} ${direction === 1 ? styles.slideOutLeft : styles.slideOutRight}`
                                : styles.nameText
                            }
                            style={showLabel ? { position: "absolute" } : undefined}
                        >
                            {outgoing?.name}
                        </Text>
                    )}
                    {showLabel && (
                        <Text
                            key={activePage}
                            className={`${styles.nameText} ${direction === 1 ? styles.slideInFromRight : styles.slideInFromLeft}`}
                        >
                            {currentPage?.name}
                        </Text>
                    )}
                </Box>
            </Box>
        </Box>
    );
}