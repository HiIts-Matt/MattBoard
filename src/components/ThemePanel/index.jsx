import { createPortal } from 'react-dom';
import { useEffect, useRef, useState, Component } from 'react';
import { IconX, IconChevronRight, IconRefresh } from '@tabler/icons-react';
import { useBuilderStore } from '../Builder/BuilderStore';
import { DEFAULT_THEME, FONTS } from '../../stores/ThemeStore';
import { moduleRegistry, components } from '../../utils/moduleRegistry';
import { classNames } from '../../utils/utils';
import styles from './ThemePanel.module.css';

class PreviewErrorBoundary extends Component {
    constructor(props) { super(props); this.state = { error: false }; }
    static getDerivedStateFromError() { return { error: true }; }
    render() { return this.state.error ? null : this.props.children; }
}

function ModulePreviewCard({ module, name, isSelected, onClick }) {
    const ModuleComponent = components[module.type];
    const viewportRef = useRef(null);
    const [scale, setScale] = useState(0.4);

    useEffect(() => {
        if (!viewportRef.current) return;
        const el = viewportRef.current;
        const componentW = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--component-w')) || 400;
        const viewportW = el.clientWidth;
        setScale(viewportW / componentW);
    }, []);

    return (
        <button
            type="button"
            className={classNames(styles.previewCard, isSelected && styles.previewCardSelected)}
            data-module-type={module.type}
            onClick={onClick}
        >
            <div ref={viewportRef} className={styles.previewCardViewport}>
                {ModuleComponent && (
                    <PreviewErrorBoundary>
                        <div
                            className={styles.previewCardScale}
                            style={{
                                transform: `scale(${scale})`,
                                width: `${100 / scale}%`,
                                height: `${100 / scale}%`,
                            }}
                        >
                            <ModuleComponent module={module} isFullscreen={false} onToggleFullscreen={() => {}} />
                        </div>
                    </PreviewErrorBoundary>
                )}
            </div>
            <span className={styles.previewCardLabel}>{name}</span>
        </button>
    );
}

function DisabledModuleCard({ moduleId, name, onAdd }) {
    return (
        <button
            type="button"
            className={classNames(styles.previewCard, styles.previewCardDisabled)}
            onClick={onAdd}
        >
            <div className={styles.previewCardInner} />
            <span className={styles.previewCardLabel}>{name}</span>
            <div className={styles.previewCardAddIcon}>+</div>
        </button>
    );
}

function ThemeTree({ selected, onSelect, usedTypes }) {
    const modules = Object.values(moduleRegistry);
    return (
        <div className={styles.tree}>
            <button
                type="button"
                className={classNames(styles.treeItem, styles.treeItemTop, selected === 'app' && styles.treeItemSelected)}
                onClick={() => onSelect('app')}
            >
                App
            </button>
            <div className={styles.treeChildren}>
                {modules.map(mod => (
                    <button
                        key={mod.id}
                        type="button"
                        className={classNames(
                            styles.treeItem,
                            selected === mod.id && styles.treeItemSelected,
                            !usedTypes.has(mod.id) && styles.treeItemDisabled
                        )}
                        onClick={() => onSelect(mod.id)}
                    >
                        <IconChevronRight size={10} className={styles.treeArrow} />
                        {mod.name}
                    </button>
                ))}
            </div>
        </div>
    );
}

function ControlRow({ label, children }) {
    return (
        <div className={styles.controlRow}>
            <span className={styles.controlLabel}>{label}</span>
            <div className={styles.controlContent}>{children}</div>
        </div>
    );
}

function SliderControl({ value, min, max, step = 1, onChange, displayValue }) {
    return (
        <div className={styles.sliderWrap}>
            <input
                type="range"
                className={styles.slider}
                min={min}
                max={max}
                step={step}
                value={value}
                onChange={e => onChange(Number(e.target.value))}
            />
            <span className={styles.sliderValue}>{displayValue ?? value}</span>
        </div>
    );
}

function ColorControl({ hex, opacity, onChangeHex, onChangeOpacity }) {
    return (
        <div className={styles.colorWrap}>
            <input
                type="color"
                className={styles.colorSwatch}
                value={hex}
                onChange={e => onChangeHex(e.target.value)}
            />
            <div className={styles.sliderWrap} style={{ flex: 1 }}>
                <input
                    type="range"
                    className={styles.slider}
                    min={0}
                    max={1}
                    step={0.05}
                    value={opacity}
                    onChange={e => onChangeOpacity(Number(e.target.value))}
                />
                <span className={styles.sliderValue}>{Math.round(opacity * 100)}%</span>
            </div>
        </div>
    );
}

function FontControl({ value, onChange }) {
    const fontNames = Object.keys(FONTS);
    return (
        <div className={styles.fontOptions}>
            {fontNames.map(name => (
                <button
                    key={name}
                    type="button"
                    className={classNames(styles.fontOption, value === name && styles.fontOptionSelected)}
                    style={{ fontFamily: FONTS[name] }}
                    onClick={() => onChange(name)}
                >
                    {name}
                </button>
            ))}
        </div>
    );
}

function BlurControl({ blur, blurAmount, onChangeBlur, onChangeAmount }) {
    const options = [
        { value: 'none', label: 'None' },
        { value: 'css', label: 'Glass' },
        { value: 'prerendered', label: 'Heavy' },
    ];
    return (
        <div className={styles.blurWrap}>
            <div className={styles.segmented}>
                {options.map(opt => (
                    <button
                        key={opt.value}
                        type="button"
                        className={classNames(styles.segItem, blur === opt.value && styles.segItemActive)}
                        onClick={() => onChangeBlur(opt.value)}
                    >
                        {opt.label}
                    </button>
                ))}
            </div>
            {blur !== 'none' && (
                <SliderControl
                    value={blurAmount}
                    min={0}
                    max={20}
                    step={0.5}
                    onChange={onChangeAmount}
                    displayValue={`${blurAmount}px`}
                />
            )}
        </div>
    );
}

function AppControls({ theme, updateTheme }) {
    return (
        <>
            <ControlRow label="Background">
                <ColorControl
                    hex={theme.bgColorHex ?? DEFAULT_THEME.bgColorHex}
                    opacity={theme.bgOpacity ?? DEFAULT_THEME.bgOpacity}
                    onChangeHex={v => updateTheme({ bgColorHex: v })}
                    onChangeOpacity={v => updateTheme({ bgOpacity: v })}
                />
            </ControlRow>
            <ControlRow label="Backdrop Blur">
                <BlurControl
                    blur={theme.blur ?? DEFAULT_THEME.blur}
                    blurAmount={theme.blurAmount ?? DEFAULT_THEME.blurAmount}
                    onChangeBlur={v => updateTheme({ blur: v })}
                    onChangeAmount={v => updateTheme({ blurAmount: v })}
                />
            </ControlRow>
            <ControlRow label="Corner Radius">
                <SliderControl
                    value={theme.componentRadius ?? DEFAULT_THEME.componentRadius}
                    min={0}
                    max={32}
                    onChange={v => updateTheme({ componentRadius: v })}
                    displayValue={`${theme.componentRadius ?? DEFAULT_THEME.componentRadius}px`}
                />
            </ControlRow>
            <ControlRow label="Font">
                <FontControl
                    value={theme.mainFont ?? DEFAULT_THEME.mainFont}
                    onChange={v => updateTheme({ mainFont: v })}
                />
            </ControlRow>
            <ControlRow label="Text Brightness">
                <SliderControl
                    value={theme.textBrightness ?? DEFAULT_THEME.textBrightness}
                    min={0.1}
                    max={1}
                    step={0.05}
                    onChange={v => updateTheme({ textBrightness: v })}
                    displayValue={`${Math.round((theme.textBrightness ?? DEFAULT_THEME.textBrightness) * 100)}%`}
                />
            </ControlRow>
        </>
    );
}

function ModuleControls({ moduleId, override, updateModuleTheme, onReset }) {
    const o = override ?? {};
    const hasOverride = override && Object.keys(override).length > 0;

    return (
        <>
            <ControlRow label="Background">
                <ColorControl
                    hex={o.bgColorHex ?? DEFAULT_THEME.bgColorHex}
                    opacity={o.bgOpacity ?? DEFAULT_THEME.bgOpacity}
                    onChangeHex={v => updateModuleTheme(moduleId, { bgColorHex: v })}
                    onChangeOpacity={v => updateModuleTheme(moduleId, { bgOpacity: v })}
                />
            </ControlRow>
            <ControlRow label="Corner Radius">
                <SliderControl
                    value={o.componentRadius ?? DEFAULT_THEME.componentRadius}
                    min={0}
                    max={32}
                    onChange={v => updateModuleTheme(moduleId, { componentRadius: v })}
                    displayValue={`${o.componentRadius ?? DEFAULT_THEME.componentRadius}px`}
                />
            </ControlRow>
            <ControlRow label="Text Brightness">
                <SliderControl
                    value={o.textBrightness ?? DEFAULT_THEME.textBrightness}
                    min={0.1}
                    max={1}
                    step={0.05}
                    onChange={v => updateModuleTheme(moduleId, { textBrightness: v })}
                    displayValue={`${Math.round((o.textBrightness ?? DEFAULT_THEME.textBrightness) * 100)}%`}
                />
            </ControlRow>
            {hasOverride && (
                <button
                    type="button"
                    className={styles.resetButton}
                    onClick={onReset}
                >
                    <IconRefresh size={12} />
                    Reset to App defaults
                </button>
            )}
        </>
    );
}

export function ThemePanel({ open, onClose, builderMode, onAddModule, activePage, triggerRef }) {
    const { theme, updateTheme, updateModuleTheme, pages } = useBuilderStore();
    const activeTheme = theme ?? DEFAULT_THEME;

    const [selected, setSelected] = useState('app');
    const panelRef = useRef(null);

    useEffect(() => {
        if (!open) setSelected('app');
    }, [open]);

    useEffect(() => {
        if (!open) return;
        const handler = (e) => {
            if (panelRef.current?.contains(e.target)) return;
            if (triggerRef?.current?.contains(e.target)) return;
            onClose();
        };
        document.addEventListener('pointerdown', handler);
        return () => document.removeEventListener('pointerdown', handler);
    }, [open, onClose, triggerRef]);

    const allModuleTypes = Object.values(moduleRegistry);
    const allModules = pages?.flatMap(p => p.modules) ?? [];
    const seenTypes = new Set();
    const uniqueModules = allModules.filter(m => {
        if (seenTypes.has(m.type)) return false;
        seenTypes.add(m.type);
        return true;
    });
    const usedTypes = seenTypes;
    const unusedTypes = allModuleTypes.filter(m => !usedTypes.has(m.id));
    const override = activeTheme.moduleOverrides?.[selected];

    function resetModuleOverride() {
        const overrides = { ...(activeTheme.moduleOverrides ?? {}) };
        delete overrides[selected];
        updateTheme({ moduleOverrides: overrides });
    }

    return createPortal(
        <div
            ref={panelRef}
            className={classNames(styles.panel, open && styles.panelOpen)}
            onPointerDown={e => e.stopPropagation()}
        >
            {/* Header */}
            <div className={styles.header}>
                <span className={styles.headerTitle}>Theme</span>
                <button
                    type="button"
                    className={styles.closeButton}
                    onClick={onClose}
                >
                    <IconX size={14} />
                </button>
            </div>

            {/* Preview strip */}
            <div className={styles.previewStripWrapper}>
                <div className={styles.previewStrip}>
                    <button
                        type="button"
                        className={classNames(styles.previewCard, styles.previewCardApp, selected === 'app' && styles.previewCardSelected)}
                        onClick={() => setSelected('app')}
                    >
                        <div className={styles.previewCardInner} />
                        <span className={styles.previewCardLabel}>App</span>
                    </button>
                    {uniqueModules.map(mod => (
                        <ModulePreviewCard
                            key={mod.id}
                            module={mod}
                            name={moduleRegistry[mod.type]?.name ?? mod.type}
                            isSelected={selected === mod.type}
                            onClick={() => setSelected(mod.type)}
                        />
                    ))}
                    {unusedTypes.map(mod => (
                        <DisabledModuleCard
                            key={mod.id}
                            moduleId={mod.id}
                            name={mod.name}
                            onAdd={() => onAddModule?.(activePage, mod.id)}
                        />
                    ))}
                </div>
            </div>

            {/* Controls area */}
            <div className={styles.controls}>
                <ThemeTree selected={selected} onSelect={setSelected} usedTypes={usedTypes} />
                <div className={styles.controlsRight}>
                    <div className={styles.controlsScope}>
                        {selected === 'app' ? 'App' : allModuleTypes.find(m => m.id === selected)?.name ?? selected}
                        {selected !== 'app' && override && Object.keys(override).length > 0 && (
                            <span className={styles.overrideBadge}>overridden</span>
                        )}
                    </div>
                    <div className={styles.controlsList}>
                        {selected === 'app' ? (
                            <AppControls theme={activeTheme} updateTheme={updateTheme} />
                        ) : (
                            <ModuleControls
                                moduleId={selected}
                                override={override}
                                updateModuleTheme={updateModuleTheme}
                                onReset={resetModuleOverride}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
}
