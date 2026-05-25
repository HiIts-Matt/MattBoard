import { Input, HoverPopover, DropdownMenu, MenuItem, MenuLabel, Segmented, Slider } from "../../components/primitives";
import {
    IconChevronLeft, IconChevronRight,
    IconDeviceFloppy, IconX, IconPlus,
    IconSwitch,
    IconCheck,
    IconTools,
    IconPalette,
} from "@tabler/icons-react";
import styles from "./PageControls.module.css";
import themeStyles from "../../components/Builder/ThemeMenu.module.css";
import { createPortal } from "react-dom";
import { forwardRef, useLayoutEffect, useRef, useState, useEffect } from "react";
import { components } from "../../utils/componentMap"
import { classNames, seconds } from "../../utils/utils";
import { useTempState } from "../../hooks/useTempState.jsx";
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
        <div className={classNames(
            styles.controller,
            builderMode ? styles.builderMode : '',
        )}>
            <div
                className={styles.arrowPill}
                style={{
                    transform: canGoBack ? "translateX(0)" : "translateX(-150%)",
                    opacity: canGoBack ? 1 : 0,
                    pointerEvents: canGoBack ? "auto" : "none",
                }}
                onClick={() => onNavigate(activePage - 1)}
            >
                <IconChevronLeft size={24} color="white" />
            </div>

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

            <div
                className={styles.arrowPill}
                style={{
                    transform: canGoForward ? "translateX(0)" : "translateX(150%)",
                    opacity: canGoForward ? 1 : 0,
                    pointerEvents: canGoForward ? "auto" : "none",
                }}
                onClick={() => onNavigate(activePage + 1)}
            >
                <IconChevronRight size={24} color="white" />
            </div>
        </div>
    );
}

function NamePillRow({ activeConfig, configData, pages, direction, activePage, onEnterBuilder, onSave, onDiscard, onAddModule, builderMode, onSwap }) {
    const [themeOpen, setThemeOpen] = useState(false);
    const themeButtonRef = useRef(null);

    useEffect(() => {
        if (!builderMode) setThemeOpen(false);
    }, [builderMode]);

    return (
        <div className={styles.namePillRow}>
            <ThemeButton
                ref={themeButtonRef}
                builderMode={builderMode}
                open={themeOpen}
                onToggle={() => setThemeOpen(o => !o)}
            />
            <NamePill pages={pages} direction={direction} activePage={activePage} />
            <Toolbar
                activeConfig={activeConfig}
                configData={configData}
                onEnterBuilder={onEnterBuilder}
                onSave={onSave}
                onDiscard={onDiscard}
                onAddModule={(type) => onAddModule(activePage, type)}
                onSwap={onSwap}
                builderMode={builderMode}
            />
            {themeOpen && builderMode && (
                <ThemePanel anchorRef={themeButtonRef} onClose={() => setThemeOpen(false)} />
            )}
        </div>
    );
}

const ThemeButton = forwardRef(function ThemeButton({ builderMode, open, onToggle }, ref) {
    return (
        <div className={styles.leftToolbar}>
            <button
                ref={ref}
                className={classNames(styles.toolbarPill, builderMode && styles.visible, open && styles.themeButtonActive)}
                onClick={() => builderMode && onToggle()}
                aria-label="Theme settings"
            >
                <IconPalette size={20} color="white" />
            </button>
        </div>
    );
});

function ThemePanel({ anchorRef, onClose }) {
    const { theme, updateTheme } = useBuilderStore();
    const panelRef = useRef(null);
    const blur = theme?.blur ?? 'none';
    const blurAmount = theme?.blurAmount ?? 5;

    const [pos, setPos] = useState(null);

    useLayoutEffect(() => {
        if (!anchorRef.current) return;
        const rect = anchorRef.current.getBoundingClientRect();
        setPos({ bottom: window.innerHeight - rect.top + 8, left: rect.left });
    }, []);

    useEffect(() => {
        const anchor = anchorRef.current;
        const handler = (e) => {
            if (
                panelRef.current && !panelRef.current.contains(e.target) &&
                anchor && !anchor.contains(e.target)
            ) {
                onClose();
            }
        };
        document.addEventListener('pointerdown', handler);
        return () => document.removeEventListener('pointerdown', handler);
    }, [onClose]);

    if (!pos) return null;

    return createPortal(
        <div
            ref={panelRef}
            className={themeStyles.panel}
            style={{ bottom: pos.bottom, left: pos.left }}
            onPointerDown={e => e.stopPropagation()}
        >
            <div className={themeStyles.header}>
                <span className={themeStyles.title}>Theme</span>
            </div>
            <div className={themeStyles.body}>
                <span className={themeStyles.sectionLabel}>Background Blur</span>
                <Segmented
                    value={blur}
                    onChange={v => updateTheme({ blur: v })}
                    data={[
                        { value: 'none', label: 'None' },
                        { value: 'css', label: 'CSS' },
                        { value: 'prerendered', label: 'Pre-rendered' },
                    ]}
                    fullWidth
                    classNames={{
                        root: themeStyles.segmentedRoot,
                        indicator: themeStyles.segmentedIndicator,
                        label: themeStyles.segmentedLabel,
                    }}
                />
                {blur !== 'none' && (
                    <div className={themeStyles.sliderRow}>
                        <div className={themeStyles.sliderHeader}>
                            <span className={themeStyles.sliderLabel}>Blur Amount</span>
                            <span className={themeStyles.sliderValue}>{blurAmount}px</span>
                        </div>
                        <Slider
                            value={blurAmount}
                            onChange={v => updateTheme({ blurAmount: v })}
                            min={0}
                            max={10}
                            step={0.5}
                        />
                    </div>
                )}
            </div>
        </div>,
        document.body,
    );
}

function Toolbar({
    activeConfig,
    configData,
    onEnterBuilder,
    onSave,
    onDiscard,
    onAddModule,
    onSwap,
    builderMode
}) {

    return (
        <div className={styles.builderToolbar}>
            <BuilderModeButton
                onEnterBuilder={onEnterBuilder}
                builderMode={builderMode}
            />
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
        </div>
    );
}

function BuilderModeButton({ onEnterBuilder, builderMode }) {
    return (
        <HoverPopover
            className={classNames(styles.editButton, builderMode ? styles.hide : '')}
            onClick={onEnterBuilder}
            disabled={builderMode}
            dropdownClassName={styles.saveMenu}
            dropdown={<span className={styles.toolTip}>Enter Builder Mode</span>}
            position="top"
        >
            <IconTools size={20} color="white" />
        </HoverPopover>
    )
}

function XButton({ activeConfig, onDiscard, builderMode }) {
    const { pages: builderPages } = useBuilderStore();

    const hasChanges = builderPages !== null &&
        JSON.stringify(builderPages) !== JSON.stringify(activeConfig.pages)

    const [xOpen, setXOpen, resetXState] = useTempState(false, seconds(3))

    return (
        <HoverPopover
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
            disabled={!builderMode}
            dropdownClassName={classNames(
                styles.saveMenu,
                xOpen ? styles.redHighlight : ''
            )}
            dropdown={xOpen ? (
                <div className={styles.confirmBox}>
                    <div className={styles.titleWrapper}>
                        <span className={styles.titleText}>Are You Sure</span>
                    </div>
                    <span className={styles.subText}>This will permanently delete any unsaved changes</span>
                </div>
            ) : (
                <span className={styles.toolTip}>
                    {hasChanges
                        ? 'Discard Changes'
                        : 'Exit Builder Mode'
                    }
                </span>
            )}
            position='top'
        >
            <IconX size={20} color="white" />
        </HoverPopover>
    )
}

function AddModule({ builderMode, onAddModule }) {
    const moduleTypes = Object.keys(components);

    return (
        <DropdownMenu
            className={classNames(styles.toolbarPill, styles.delay60, builderMode && styles.visible)}
            dropdownClassName={styles.saveMenu}
            position="top"
            items={
                <>
                    <MenuLabel>Add Module</MenuLabel>
                    {moduleTypes.map(type => (
                        <MenuItem
                            key={type}
                            onClick={() => onAddModule(type)}
                        >
                            {type.split(1).map(([firstChar, ...rest]) => [firstChar.toUpperCase(), rest])}
                        </MenuItem>
                    ))}
                </>
            }
        >
            <IconPlus size={20} color="white" />
        </DropdownMenu>
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
        <DropdownMenu
            className={classNames(styles.toolbarPill, styles.delay120, builderMode && styles.visible)}
            dropdownClassName={styles.saveMenu}
            position="top"
            onClose={() => { setSavingNew(false); setNewName(''); }}
            items={
                <>
                    <MenuLabel>Save Configuration</MenuLabel>
                    <MenuItem leftSection={<IconDeviceFloppy />} onClick={() => onSave()}>
                        Overwrite Current
                    </MenuItem>
                    {otherConfigs.length > 0 && <>
                        <MenuLabel>Overwrite other config</MenuLabel>
                        {otherConfigs.map(config => (
                            <MenuItem
                                key={config.id}
                                leftSection={<IconDeviceFloppy />}
                                onClick={() => onSave(config.id)}
                            >
                                {config.name}
                            </MenuItem>
                        ))}
                    </>}
                    {savingNew ? (
                        <form className={styles.newConfigForm} onSubmit={submitNew}>
                            <Input
                                autoFocus
                                placeholder="Config name"
                                value={newName}
                                onChange={e => setNewName(e.currentTarget.value)}
                                onKeyDown={e => e.key === 'Escape' && setSavingNew(false)}
                                classNames={{ input: styles.newConfigInput }}
                            />
                        </form>
                    ) : (
                        <MenuItem
                            leftSection={<IconPlus />}
                            closeOnClick={false}
                            onClick={() => setSavingNew(true)}
                        >
                            Save as new...
                        </MenuItem>
                    )}
                </>
            }
        >
            <IconDeviceFloppy size={20} color="white" />
        </DropdownMenu>
    );
}

function SwapConfig({ builderMode, configData, onSwap }) {
    return (
        <DropdownMenu
            className={classNames(styles.toolbarPill, styles.delay180, builderMode && styles.visible)}
            dropdownClassName={styles.saveMenu}
            position="top"
            items={
                <>
                    <MenuLabel>Swap Config</MenuLabel>
                    {configData?.configs?.map(config => (
                        <MenuItem
                            key={config.id}
                            leftSection={config.id === configData.active ? <IconCheck size={16} /> : <span style={{ width: 16 }} />}
                            onClick={() => onSwap(config.id)}
                        >
                            {config.name}
                        </MenuItem>
                    ))}
                </>
            }
        >
            <IconSwitch size={20} color="white" />
        </DropdownMenu>
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
    }, [activePage, pages]);

    return (
        <div className={styles.namePillClip}>
            <div
                className={styles.namePill}
                style={{
                    transform: showLabel ? "translateY(0)" : "translateY(150%)",
                    opacity: showLabel ? 1 : 0,
                    pointerEvents: showLabel ? "auto" : "none",
                }}
            >
                <div className={styles.namePillContent}>
                    {outgoing && (
                        <span
                            className={showLabel
                                ? `${styles.nameText} ${direction === 1 ? styles.slideOutLeft : styles.slideOutRight}`
                                : styles.nameText
                            }
                            style={showLabel ? { position: "absolute" } : undefined}
                        >
                            {outgoing?.name}
                        </span>
                    )}
                    {showLabel && (
                        <span
                            key={activePage}
                            className={`${styles.nameText} ${direction === 1 ? styles.slideInFromRight : styles.slideInFromLeft}`}
                        >
                            {currentPage?.name}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}
