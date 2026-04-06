import { Box, Text, Switch, Select, NumberInput, ActionIcon, Divider, Stack, Transition, Tooltip } from '@mantine/core';
import { IconTrash } from '@tabler/icons-react';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useBuilderStore } from './BuilderStore';
import { moduleSettings } from '../../utils/moduleSettings';
import { components } from '../../utils/componentMap';
import styles from './BuilderContextMenu.module.css';
import { classNames, seconds } from '../../utils/utils';
import { useTempState } from '../../hooks/useTempState';

const MENU_W = 220;
const GAP = 12;

const scaleTransition = (origin) => ({
    in: { opacity: 1, transform: 'scale(1)' },
    out: { opacity: 0, transform: 'scale(0.5)' },
    common: { transformOrigin: origin },
    transitionProperty: 'transform, opacity',
});

export function BuilderContextMenu({ builderMode }) {
    const { selectedModuleId, pages, updateModuleSetting, removeModule, swapModuleType, selectModule } = useBuilderStore();
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
                                <Divider color="rgba(255,255,255,0.1)" />
                                <Stack gap={10} className={styles.settings}>
                                    {settings.map(setting => (
                                        <SettingRow
                                            key={setting.key}
                                            setting={setting}
                                            value={displayedModule?.[setting.key]}
                                            onChange={val => updateModuleSetting(displayedModule?.id, setting.key, val)}
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

    return null;
}
