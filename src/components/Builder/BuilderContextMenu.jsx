import { Select } from '@mantine/core';
import { IconLocationSearch, IconTrash, IconPlus, IconX, IconCheck, IconPlugConnectedX } from '@tabler/icons-react';
import { useCalendarAuth } from '../../api/useCalendarAuth';
import { useNews } from '../../api/useNews';
import { useEffect, useState } from 'react';
import { useBuilderStore } from './BuilderStore';
import { moduleSettings } from '../../utils/moduleSettings';
import { components } from '../../utils/componentMap';
import styles from './BuilderContextMenu.module.css';
import { classNames, seconds } from '../../utils/utils';
import { useTempState } from '../../hooks/useTempState';
import { useMenuPosition } from './useMenuPosition';
import { IconButton, Switch, Input, Slider, Segmented, Divider, UnstyledButton, Transition, Tooltip } from '../primitives';

export function BuilderContextMenu({ builderMode }) {
    const { selectedModuleId, pages, updateModuleSetting, updateModuleSettings, removeModule, swapModuleType, selectModule, renameBuilderToDoList } = useBuilderStore();
    const moduleTypes = Object.keys(components);
    const [displayedModule, setDisplayedModule] = useState(null);
    const [listNameDraft, setListNameDraft] = useState('');

    const [deleteOpen, setDeleteOpen, resetDeleteOpen] = useTempState(false, seconds(3));

    const { pos, slide, menuRef } = useMenuPosition(selectedModuleId, [displayedModule]);

    useEffect(() => {
        if (!selectedModuleId || !builderMode) return;
        const handlePointerDown = (e) => {
            if (menuRef.current?.contains(e.target)) return;
            if (menuRef.current?.contains(document.activeElement)) return;
            if (e.target.closest('[data-module-id]')) return;
            if (e.target.closest('.mantine-Combobox-dropdown, .mantine-Tooltip-tooltip')) return;
            selectModule(null);
        };
        document.addEventListener('pointerdown', handlePointerDown);
        return () => document.removeEventListener('pointerdown', handlePointerDown);
    }, [selectedModuleId, builderMode, selectModule, menuRef]);

    useEffect(() => {
        if (!selectedModuleId) return;
        const module = pages?.flatMap(p => p.modules).find(m => m.id === selectedModuleId);
        resetDeleteOpen();
        if (module) {
            setDisplayedModule(module);
            setListNameDraft(module.listName || '');
        }
    }, [selectedModuleId, pages, resetDeleteOpen]);

    const settings = (moduleSettings[displayedModule?.type] ?? []).filter(setting => {
        if (setting.key === 'listName' && displayedModule?.fullsize) return false;
        return true;
    });

    return (
        <Transition
            mounted={!!(selectedModuleId && builderMode)}
            transition='pop'
            duration={200}
        >
            {(transitionStyle) => (
                <div
                    className={styles.positioner}
                    style={{
                        transform: `translate(${pos.x}px, ${pos.y}px)`,
                        transition: slide ? 'transform 0.3s cubic-bezier(0.22, 1, 0.36, 1)' : 'none',

                    }}
                >
                    <div ref={menuRef} className={styles.menu} style={transitionStyle}>
                        <div className={styles.header}>
                            <Select
                                variant="unstyled"
                                searchable
                                size="xs"
                                value={displayedModule?.type ?? null}
                                data={moduleTypes}
                                onChange={val => val && swapModuleType(displayedModule.id, val)}
                                classNames={{ input: styles.typeInput, dropdown: styles.typeDropdown, option: styles.typeOption }}
                                comboboxProps={{ position: 'top', zIndex: 600, transitionProps: { transition: 'pop' } }}
                            />
                            <Tooltip
                                label='Are you Sure'
                                className={styles.confirmTooltip}
                                opened={deleteOpen}
                                withArrow
                                transitionProps={{ transition: 'pop', duration: 150 }}
                                zIndex={600}
                            >
                                <IconButton
                                    className={classNames(
                                        styles.deleteButton,
                                        deleteOpen ? styles.open : '',
                                    )}
                                    onClick={deleteOpen ? () => removeModule(selectedModuleId) : () => setDeleteOpen(true)}
                                >
                                    <IconTrash size={14} />
                                </IconButton>
                            </Tooltip>
                        </div>

                        {settings.length > 0 && (
                            <>
                                <Divider />
                                <div className={styles.settings}>
                                    {settings.map(setting => {
                                        if (setting.type === 'settingGroup') return (
                                            <SettingGroupRow
                                                key={setting.toggleKey}
                                                setting={setting}
                                                moduleValues={displayedModule}
                                                onChangeSetting={(key, val) => updateModuleSetting(displayedModule?.id, key, val)}
                                            />
                                        );
                                        if (setting.key === 'listName' && displayedModule?.type === 'todo') {
                                            return (
                                                <SettingRow
                                                    key={setting.key}
                                                    setting={setting}
                                                    value={listNameDraft}
                                                    onChange={setListNameDraft}
                                                    onBlur={() => {
                                                        const newName = listNameDraft.trim();
                                                        if (!displayedModule || newName === displayedModule.listName) {
                                                            setListNameDraft(displayedModule?.listName || '');
                                                            return;
                                                        }
                                                        const allModules = pages?.flatMap(p => p.modules) || [];
                                                        const otherTodoModules = allModules.filter(m => m.type === 'todo' && m.id !== displayedModule.id);
                                                        if (otherTodoModules.some(m => m.listName === newName)) {
                                                            setListNameDraft(displayedModule.listName || '');
                                                            return;
                                                        }
                                                        updateModuleSetting(displayedModule.id, 'listName', newName);
                                                        renameBuilderToDoList(displayedModule.listName, newName);
                                                    }}
                                                />
                                            );
                                        }
                                        return (
                                            <SettingRow
                                                key={setting.key ?? setting.type}
                                                setting={setting}
                                                value={displayedModule?.[setting.key]}
                                                onChange={setting.type === 'location'
                                                    ? loc => updateModuleSettings(displayedModule?.id, { [setting.key]: loc })
                                                    : val => updateModuleSetting(displayedModule?.id, setting.key, val)}
                                            />
                                        );
                                    })}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </Transition>
    );
}

function SettingGroupRow({ setting, moduleValues, onChangeSetting }) {
    const enabled = !!moduleValues?.[setting.toggleKey];
    return (
        <div className={styles.settingGroup}>
            <div className={styles.groupHeader}>
                <span className={styles.label}>{setting.label}</span>
                <Switch
                    checked={enabled}
                    onChange={e => onChangeSetting(setting.toggleKey, e.currentTarget.checked)}
                />
            </div>
            <div className={classNames(styles.groupChildren, !enabled && styles.groupChildrenDisabled)}>
                {setting.children?.map(child => (
                    <SettingRow
                        key={child.key}
                        setting={child}
                        value={moduleValues?.[child.key]}
                        onChange={val => onChangeSetting(child.key, val)}
                    />
                ))}
            </div>
        </div>
    );
}

function SettingRow({ setting, value, onChange, onBlur }) {
    if (setting.type === 'boolean') return (
        <div className={styles.row}>
            <span className={styles.label}>{setting.label}</span>
            <Switch
                checked={!!value}
                onChange={e => onChange(e.currentTarget.checked)}
            />
        </div>
    );

    if (setting.type === 'select') return (
        <div className={styles.row}>
            <span className={styles.label}>{setting.label}</span>
            <Select
                size="xs"
                value={value ?? null}
                onChange={onChange}
                data={setting.options}
                w={100}
                classNames={{ input: styles.input }}
                comboboxProps={{ zIndex: 600 }}
            />
        </div>
    );

    if (setting.type === 'text') return (
        <div className={styles.textRow}>
            <span className={styles.label}>{setting.label}</span>
            <Input
                value={value ?? ''}
                placeholder={setting.placeholder}
                onChange={e => onChange(e.currentTarget.value)}
                onBlur={onBlur}
                classNames={{ input: styles.input }}
            />
        </div>
    );

    if (setting.type === 'number') return (
        <div className={styles.row}>
            <span className={styles.label}>{setting.label}</span>
            <Input
                type="number"
                value={value ?? ''}
                onChange={e => onChange(e.currentTarget.value === '' ? '' : Number(e.currentTarget.value))}
                style={{ width: 100 }}
                classNames={{ input: styles.input }}
            />
        </div>
    );

    if (setting.type === 'slider') return (
        <div className={classNames(styles.row, styles.sliderRow)}>
            <div className={styles.sliderHeader}>
                <span className={styles.label}>{setting.label}</span>
                <span className={styles.sliderValue}>{value ?? setting.min ?? 0}</span>
            </div>
            <Slider
                value={value ?? setting.min ?? 0}
                onChange={onChange}
                min={setting.min ?? 0}
                max={setting.max ?? 1}
                step={setting.steps ?? 0.1}
                className={styles.sliderRoot}
            />
        </div>
    );

    if (setting.type === 'control') return (
        <div className={styles.controlRow}>
            <Segmented
                value={value ? 'true' : 'false'}
                onChange={val => onChange(val === 'true')}
                data={[
                    { value: 'false', label: setting.falseLabel },
                    { value: 'true', label: setting.trueLabel },
                ]}
                fullWidth
                classNames={{
                    root: styles.segmentedRoot,
                    indicator: styles.segmentedIndicator,
                    label: styles.segmentedLabel,
                }}
            />
        </div>
    );

    const needsSetup = setting.required && (!value || (Array.isArray(value) && value.length === 0));
    if (setting.type === 'googleAuth') return <GoogleAuthRow />;
    if (setting.type === 'location') return <LocationRow value={value} onChange={onChange} needsSetup={needsSetup} />;
    if (setting.type === 'feedUrls') return <FeedUrlsRow value={value} onChange={onChange} needsSetup={needsSetup} />;

    return null;
}

function GoogleAuthRow() {
    const { connected, isLoading, authUrl, openAuthTab, disconnect, isDisconnecting } = useCalendarAuth();
    const needsSetup = !isLoading && !connected;

    return (
        <div className={classNames(styles.row, styles.googleAuthRow)}>
            <div className={styles.titleBox} style={needsSetup ? { backgroundColor: 'var(--mantine-color-red-light)' } : undefined}>
                <span className={styles.title}>Google Calendar</span>
                <div className={styles.rightSection}>
                    <div className={classNames(styles.statusDot, (!isLoading && connected) ? styles.connected : styles.disconnected)} />
                    {connected && (
                        <IconButton
                            className={styles.disconnectButton}
                            onClick={() => disconnect()}
                            loading={isDisconnecting}
                        >
                            <IconPlugConnectedX size={16} />
                        </IconButton>
                    )}
                </div>
            </div>
            {!isLoading && !connected && (
                <div className={styles.googleAuthContent}>
                    <span className={styles.googleAuthStep}>
                        <span className={styles.stepNum}>1</span>
                        Visit on any device:
                    </span>
                    <div className={styles.authUrlRow}>
                        <span className={styles.authUrl}>{authUrl}</span>
                        <IconButton onClick={() => navigator.clipboard.writeText(authUrl)}>
                            <IconCheck size={12} />
                        </IconButton>
                    </div>
                    <span className={styles.googleAuthStep}>
                        <span className={styles.stepNum}>2</span>
                        Sign in with Google
                    </span>
                    <UnstyledButton
                        className={styles.connectThisDevice}
                        onClick={openAuthTab}
                    >
                        Sign in on this device →
                    </UnstyledButton>
                </div>
            )}
        </div>
    );
}

function feedLabel(url) {
    try { return new URL(url).hostname.replace(/^www\./, ''); }
    catch { return url; }
}

function FeedUrlsRow({ value = [], onChange, needsSetup }) {
    const [input, setInput] = useState('');
    const { feedStatuses } = useNews({ feedUrls: value, enabled: value.length > 0 });

    function add() {
        const url = input.trim();
        if (!url || value.includes(url)) return;
        onChange([...value, url]);
        setInput('');
    }

    return (
        <div className={classNames(styles.row, styles.feedUrls, needsSetup ? styles.needsSetup : '')}>
            <div className={styles.titleBox}>
                <span className={styles.title}>RSS Feeds</span>
                {needsSetup && <span className={styles.setupRequired}>Setup required</span>}
            </div>
            {value.map(url => {
                const status = feedStatuses?.[url];
                return (
                    <div key={url} className={classNames(styles.feedItem, status === 'error' && styles.feedItemError)}>
                        <div className={classNames(styles.feedStatusDot, styles[`feedStatus_${status}`])} />
                        <span className={styles.feedLabel} title={url}>{feedLabel(url)}</span>
                        <IconButton onClick={() => onChange(value.filter(u => u !== url))}>
                            <IconX size={12} />
                        </IconButton>
                    </div>
                );
            })}
            <div className={styles.feedAddRow}>
                <Input
                    placeholder="New RSS Url"
                    value={input}
                    onChange={e => setInput(e.currentTarget.value)}
                    onKeyDown={e => e.key === 'Enter' && add()}
                    classNames={{ input: styles.input }}
                    style={{ flex: 1 }}
                />
                <IconButton onClick={add} disabled={!input.trim()} className={styles.actionIcon}>
                    <IconPlus size={14} />
                </IconButton>
            </div>
        </div>
    );
}

function LocationRow({ value, onChange, needsSetup }) {
    const [locating, setLocating] = useState(false);
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);

    useEffect(() => {
        const id = setTimeout(async () => {
            if (!query.trim()) { setResults([]); return; }
            try {
                const res = await fetch(
                    `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5`
                );
                const json = await res.json();
                setResults(json.map(r => ({ value: `${r.lat},${r.lon}`, label: r.display_name })));
            } catch { /* ignore network errors */ }
        }, 400);
        return () => clearTimeout(id);
    }, [query]);

    function useCurrentLocation() {
        if (!navigator.geolocation) return;
        setLocating(true);
        navigator.geolocation.getCurrentPosition(
            ({ coords }) => {
                onChange({ lat: coords.latitude, lon: coords.longitude });
                setLocating(false);
            },
            () => setLocating(false)
        );
    }

    return (
        <div className={classNames(styles.row, styles.location)}>
            <div className={styles.titleBox} style={needsSetup ? { backgroundColor: 'var(--mantine-color-red-light)' } : undefined}>
                <span className={styles.title}>Location</span>
            </div>
            <UnstyledButton
                className={styles.currLocationButton}
                onClick={useCurrentLocation}
                disabled={locating}
            >
                <IconLocationSearch size={14} />
                {locating ? 'Locating…' : 'Use Current Location'}
            </UnstyledButton>

            <Divider label="OR" />
            <div style={{ padding: '0 10px' }}>
                <Select
                    size="xs"
                    placeholder="Search address…"
                    searchable
                    value={null}
                    data={results}
                    onSearchChange={setQuery}
                    onChange={val => {
                        if (!val) return;
                        const [lat, lon] = val.split(',').map(Number);
                        onChange({ lat, lon });
                        setQuery('');
                        setResults([]);
                    }}
                    filter={({ options }) => options}
                    nothingFoundMessage={query ? 'No results' : undefined}
                    classNames={{ input: styles.input, dropdown: styles.typeDropdown, option: styles.typeOption }}
                    comboboxProps={{ zIndex: 600 }}
                />
            </div>
            <Divider label="OR" />
            <div className={styles.coordRow}>
                <div className={styles.coordSection}>
                    <span className={styles.coordLabel}>Lat</span>
                    <Input
                        type="number"
                        step="0.00001"
                        placeholder="Lat"
                        value={value?.lat ?? ''}
                        onChange={e => {
                            const v = e.currentTarget.value;
                            onChange({ ...value, lat: v === '' ? '' : Number(v) });
                        }}
                        className={styles.root}
                        classNames={{ input: styles.input, label: styles.label }}
                    />
                </div>
                <div className={styles.coordSection}>
                    <span className={styles.coordLabel}>Long</span>
                    <Input
                        type="number"
                        step="0.00001"
                        placeholder="Lon"
                        value={value?.lon ?? ''}
                        onChange={e => {
                            const v = e.currentTarget.value;
                            onChange({ ...value, lon: v === '' ? '' : Number(v) });
                        }}
                        className={styles.root}
                        classNames={{ input: styles.input, label: styles.label }}
                    />
                </div>
            </div>
        </div>
    );
}
