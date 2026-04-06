import { Box, Text, Switch, Select, NumberInput, ActionIcon, Divider, Stack, Transition, Tooltip, UnstyledButton, TextInput, Slider, SegmentedControl } from '@mantine/core';
import { IconLocationSearch, IconTrash, IconPlus, IconX, IconCheck, IconPlugConnectedX } from '@tabler/icons-react';
import { useCalendarAuth } from '../../api/useCalendarAuth';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useBuilderStore } from './BuilderStore';
import { moduleSettings } from '../../utils/moduleSettings';
import { components } from '../../utils/componentMap';
import styles from './BuilderContextMenu.module.css';
import { classNames, seconds } from '../../utils/utils';
import { useTempState } from '../../hooks/useTempState';
import { stubFalse } from 'lodash';

const MENU_W = 220;
const GAP = 12;

const scaleTransition = (origin) => ({
    in: { opacity: 1, transform: 'scale(1)' },
    out: { opacity: 0, transform: 'scale(0.5)' },
    common: { transformOrigin: origin },
    transitionProperty: 'transform, opacity',
});

export function BuilderContextMenu({ builderMode }) {
    const { selectedModuleId, pages, updateModuleSetting, updateModuleSettings, removeModule, swapModuleType, selectModule } = useBuilderStore();
    const moduleTypes = Object.keys(components);
    const [pos, setPos] = useState({ x: 0, y: 0 });
    const [origin, setOrigin] = useState('center bottom');
    const [slide, setSlide] = useState(false);
    const [displayedModule, setDisplayedModule] = useState(null);
    const prevIdRef = useRef(null);
    const menuRef = useRef(null);

    const [deleteOpen, setDeleteOpen, resetDeleteOpen] = useTempState(false, seconds(3));

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
    }, [selectedModuleId, builderMode, selectModule]);

    useLayoutEffect(() => {
        if (!selectedModuleId) {
            prevIdRef.current = null;
            return;
        }

        const el = document.querySelector(`[data-module-id="${selectedModuleId}"]`);
        if (!el) return;

        const module = pages?.flatMap(p => p.modules).find(m => m.id === selectedModuleId);
        const rect = el.getBoundingClientRect();
        const menuH = menuRef.current?.offsetHeight ?? 200;
        const centerX = rect.left + rect.width / 2;
        const x = Math.max(GAP, Math.min(centerX - MENU_W / 2, window.innerWidth - MENU_W - GAP));

        const aboveY = rect.top - menuH - GAP;
        let y, newOrigin;
        if (aboveY >= GAP) {
            y = aboveY;
            newOrigin = 'center bottom';
        } else {
            y = rect.bottom + GAP;
            newOrigin = 'center top';
        }

        setSlide(prevIdRef.current !== null);
        setOrigin(newOrigin);
        setPos({ x, y });
        resetDeleteOpen();
        if (module) setDisplayedModule(module);
        prevIdRef.current = selectedModuleId;
    }, [selectedModuleId, pages]);

    const settings = moduleSettings[displayedModule?.type] ?? [];

    return (
        <Transition
            mounted={!!(selectedModuleId && builderMode)}
            transition={scaleTransition(origin)}
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
                                <Stack gap={5} className={styles.settings}>
                                    {settings.map(setting => (
                                        <SettingRow
                                            key={setting.key ?? setting.type}
                                            setting={setting}
                                            value={displayedModule?.[setting.key]}
                                            onChange={setting.type === 'location'
                                                ? loc => updateModuleSettings(displayedModule?.id, { [setting.key]: loc })
                                                : val => updateModuleSetting(displayedModule?.id, setting.key, val)}
                                        />
                                    ))}
                                </Stack>
                            </>
                        )}
                    </Box>
                </div>
            )}
        </Transition>
    );
}

function SettingRow({ setting, value, onChange }) {
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
                size="xs"
                fullWidth
                classNames={{
                    root: styles.segmentedRoot,
                    indicator: styles.segmentedIndicator,
                    label: styles.segmentedLabel,
                }}
            />
        </Box>
    );

    if (setting.type === 'googleAuth') return <GoogleAuthRow />;
    if (setting.type === 'location') return <LocationRow value={value} onChange={onChange} />;
    if (setting.type === 'feedUrls') return <FeedUrlsRow value={value} onChange={onChange} />;

    return null;
}

function GoogleAuthRow() {
    const { connected, isLoading, authUrl, openAuthTab, disconnect, isDisconnecting } = useCalendarAuth();

    return (
        <Box className={classNames(styles.row, styles.googleAuthRow)}>
            <Box className={styles.titleBox}>
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

function FeedUrlsRow({ value = [], onChange }) {
    const [input, setInput] = useState('');

    function add() {
        const url = input.trim();
        if (!url || value.includes(url)) return;
        onChange([...value, url]);
        setInput('');
    }

    return (
        <Box className={classNames(styles.row, styles.feedUrls)}>
            <Box className={styles.titleBox}>
                <Text className={styles.title}>RSS Feeds</Text>
            </Box>
            {value.map(url => (
                <Box key={url} className={styles.feedItem}>
                    <Text className={styles.feedLabel} truncate title={url}>{feedLabel(url)}</Text>
                    <ActionIcon size="xs" variant="subtle" color="red" onClick={() => onChange(value.filter(u => u !== url))}>
                        <IconX size={12} />
                    </ActionIcon>
                </Box>
            ))}
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

function LocationRow({ value, onChange }) {
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
            <Box className={styles.titleBox}>
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

            <Divider color="rgba(255,255,255,0.15)" label="OR" labelProps={{ style: { color: 'rgba(255,255,255,0.3)', fontSize: 10 } }} />
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
