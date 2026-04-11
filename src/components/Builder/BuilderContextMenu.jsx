import { Box, Text, Switch, Select, NumberInput, ActionIcon, Divider, Stack, Transition, Tooltip, UnstyledButton, TextInput, Slider, SegmentedControl } from '@mantine/core';
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
                    <Box ref={menuRef} className={styles.menu} style={transitionStyle}>
                        <Box className={styles.header}>
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
                                <ActionIcon
                                    className={classNames(
                                        styles.deleteButton,
                                        deleteOpen ? styles.open : '',
                                    )}
                                    onClick={deleteOpen ? () => removeModule(selectedModuleId) : () => setDeleteOpen(true)}
                                    size="sm"
                                    radius={100}
                                >
                                    <IconTrash size={14} />
                                </ActionIcon>
                            </Tooltip>
                        </Box>

                        {settings.length > 0 && (
                            <>
                                <Divider color="rgba(255, 255, 255, 0.3)" />
                                <Stack gap={0} className={styles.settings}>
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
                                </Stack>
                            </>
                        )}
                    </Box>
                </div>
            )}
        </Transition>
    );
}

function SettingGroupRow({ setting, moduleValues, onChangeSetting }) {
    const enabled = !!moduleValues?.[setting.toggleKey];
    return (
        <Box className={styles.settingGroup}>
            <Box className={styles.groupHeader}>
                <Text className={styles.label}>{setting.label}</Text>
                <Switch
                    size="xs"
                    checked={enabled}
                    onChange={e => onChangeSetting(setting.toggleKey, e.currentTarget.checked)}
                />
            </Box>
            <Box className={classNames(styles.groupChildren, !enabled && styles.groupChildrenDisabled)}>
                {setting.children?.map(child => (
                    <SettingRow
                        key={child.key}
                        setting={child}
                        value={moduleValues?.[child.key]}
                        onChange={val => onChangeSetting(child.key, val)}
                    />
                ))}
            </Box>
        </Box>
    );
}

function SettingRow({ setting, value, onChange, onBlur }) {
    if (setting.type === 'boolean') return (
        <Box className={styles.row}>
            <Text className={styles.label}>{setting.label}</Text>
            <Switch
                size="xs"
                checked={!!value}
                onChange={e => onChange(e.currentTarget.checked)}
            />
        </Box>
    );

    if (setting.type === 'select') return (
        <Box className={styles.row}>
            <Text className={styles.label}>{setting.label}</Text>
            <Select
                size="xs"
                value={value ?? null}
                onChange={onChange}
                data={setting.options}
                w={100}
                classNames={{ input: styles.input }}
                comboboxProps={{ zIndex: 600 }}
            />
        </Box>
    );

    if (setting.type === 'text') return (
        <Box className={styles.textRow}>
            <Text className={styles.label}>{setting.label}</Text>
            <TextInput
                size="xs"
                value={value ?? ''}
                placeholder={setting.placeholder}
                onChange={e => onChange(e.currentTarget.value)}
                onBlur={onBlur}
                classNames={{ input: styles.input }}
            />
        </Box>
    );

    if (setting.type === 'number') return (
        <Box className={styles.row}>
            <Text className={styles.label}>{setting.label}</Text>
            <NumberInput
                size="xs"
                value={value ?? ''}
                onChange={onChange}
                w={100}
                classNames={{ input: styles.input }}
            />
        </Box>
    );

    if (setting.type === 'slider') return (
        <Box className={classNames(styles.row, styles.sliderRow)}>
            <Box className={styles.sliderHeader}>
                <Text className={styles.label}>{setting.label}</Text>
                <Text className={styles.sliderValue}>{value ?? setting.min ?? 0}</Text>
            </Box>
            <Slider
                value={value ?? setting.min ?? 0}
                onChange={onChange}
                min={setting.min ?? 0}
                max={setting.max ?? 1}
                step={setting.steps ?? 0.1}
                size="xs"
                classNames={{ root: styles.sliderRoot, track: styles.sliderTrack, thumb: styles.sliderThumb }}
            />
        </Box>
    );

    if (setting.type === 'control') return (
        <Box className={styles.controlRow}>
            <SegmentedControl
                value={value ? 'true' : 'false'}
                onChange={val => onChange(val === 'true')}
                data={[
                    { value: 'false', label: setting.falseLabel },
                    { value: 'true', label: setting.trueLabel },
                ]}
                radius="xl"
                fullWidth
                classNames={{
                    root: styles.segmentedRoot,
                    indicator: styles.segmentedIndicator,
                    label: styles.segmentedLabel,
                }}
            />
        </Box>
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
        <Box className={classNames(styles.row, styles.googleAuthRow)}>
            <Box className={styles.titleBox} style={needsSetup ? { backgroundColor: 'var(--mantine-color-red-light)' } : undefined}>
                <Text className={styles.title}>Google Calendar</Text>
                <Box className={styles.rightSection}>
                    <Box className={classNames(styles.statusDot, (!isLoading && connected) ? styles.connected : styles.disconnected)} />
                    {connected && (
                        <ActionIcon
                            variant="subtle"
                            className={styles.disconnectButton}
                            onClick={() => disconnect()}
                            loading={isDisconnecting}
                            size={18}
                        >
                            <IconPlugConnectedX size={16} />
                        </ActionIcon>
                    )}
                </Box>
            </Box>
            {!isLoading && !connected && (
                <Box className={styles.googleAuthContent}>
                    <Text className={styles.googleAuthStep}>
                        <span className={styles.stepNum}>1</span>
                        Visit on any device:
                    </Text>
                    <Box className={styles.authUrlRow}>
                        <Text className={styles.authUrl} truncate>{authUrl}</Text>
                        <ActionIcon size="xs" variant="subtle" onClick={() => navigator.clipboard.writeText(authUrl)}>
                            <IconCheck size={12} />
                        </ActionIcon>
                    </Box>
                    <Text className={styles.googleAuthStep}>
                        <span className={styles.stepNum}>2</span>
                        Sign in with Google
                    </Text>
                    <UnstyledButton
                        className={styles.connectThisDevice}
                        onClick={openAuthTab}
                    >
                        Sign in on this device →
                    </UnstyledButton>
                </Box>
            )}
        </Box>
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
        <Box className={classNames(styles.row, styles.feedUrls, needsSetup ? styles.needsSetup : '')}>
            <Box className={styles.titleBox}>
                <Text className={styles.title}>RSS Feeds</Text>
                {needsSetup && <Text className={styles.setupRequired}>Setup required</Text>}
            </Box>
            {value.map(url => {
                const status = feedStatuses?.[url];
                return (
                    <Box key={url} className={classNames(styles.feedItem, status === 'error' && styles.feedItemError)}>
                        <Box className={classNames(styles.feedStatusDot, styles[`feedStatus_${status}`])} />
                        <Text className={styles.feedLabel} truncate title={url}>{feedLabel(url)}</Text>
                        <ActionIcon size="xs" variant="subtle" color="red" onClick={() => onChange(value.filter(u => u !== url))}>
                            <IconX size={12} />
                        </ActionIcon>
                    </Box>
                );
            })}
            <Box className={styles.feedAddRow}>
                <TextInput
                    size="xs"
                    placeholder="New RSS Url"
                    value={input}
                    onChange={e => setInput(e.currentTarget.value)}
                    onKeyDown={e => e.key === 'Enter' && add()}
                    classNames={{ input: styles.input }}
                    style={{ flex: 1 }}
                />
                <ActionIcon size="md" onClick={add} disabled={!input.trim()} className={styles.actionIcon}>
                    <IconPlus size={14} />
                </ActionIcon>
            </Box>
        </Box>
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
        <Box className={classNames(styles.row, styles.location)}>
            <Box className={styles.titleBox} style={needsSetup ? { backgroundColor: 'var(--mantine-color-red-light)' } : undefined}>
                <Text className={styles.title}>Location</Text>
            </Box>
            <UnstyledButton
                className={styles.currLocationButton}
                onClick={useCurrentLocation}
                disabled={locating}
            >
                <IconLocationSearch size={14} />
                {locating ? 'Locating…' : 'Use Current Location'}
            </UnstyledButton>

            <Divider color="rgba(255,255,255,0.15)" label="OR" />
            <Box px={10}>
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
            </Box>
            <Divider color="rgba(255,255,255,0.15)" label="OR" labelProps={{ style: { color: 'rgba(255,255,255,0.3)', fontSize: 10 } }} />
            <Box className={styles.coordRow}>
                <Box className={styles.coordSection}>
                    <Text className={styles.coordLabel}>Lat</Text>
                    <NumberInput
                        size="xs"
                        placeholder="Lat"
                        value={value?.lat ?? ''}
                        onChange={lat => onChange({ ...value, lat })}
                        decimalScale={5}
                        classNames={{ root: styles.root, input: styles.input, label: styles.label }}
                    />
                </Box>
                <Box className={styles.coordSection}>
                    <Text className={styles.coordLabel}>Long</Text>
                    <NumberInput
                        size="xs"
                        placeholder="Lon"
                        value={value?.lon ?? ''}
                        onChange={lon => onChange({ ...value, lon })}
                        decimalScale={5}
                        classNames={{ root: styles.root, input: styles.input, label: styles.label }}
                    />
                </Box>
            </Box>
        </Box>
    );
}
