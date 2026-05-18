import styles from './primitives.module.css';
import { classNames as cx } from '../../utils/utils';
import { createContext, forwardRef, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useDelayedUnmount } from '../../hooks/useDelayedUnmount';

const MenuContext = createContext({ close: () => {} });

// ─── Spinner ─────────────────────────────────────────────────────────────────

export function Spinner({ size = 'md', color, className, style }) {
    return (
        <div
            className={cx(styles.spinner, styles[`spinner_${size}`], className)}
            style={color ? { borderTopColor: color, ...style } : style}
        />
    );
}

// ─── IconButton (replaces Mantine ActionIcon) ────────────────────────────────

export const IconButton = forwardRef(function IconButton(
    { className, children, loading, disabled, onClick, ...rest },
    ref,
) {
    return (
        <button
            ref={ref}
            type="button"
            className={cx(styles.iconButton, className)}
            disabled={disabled || loading}
            data-disabled={(disabled || loading) || undefined}
            onClick={onClick}
            {...rest}
        >
            {loading ? <Spinner size="xs" /> : children}
        </button>
    );
});

// ─── Button (replaces Mantine Button) ────────────────────────────────────────

export const Button = forwardRef(function Button(
    { className, children, loading, disabled, onClick, ...rest },
    ref,
) {
    return (
        <button
            ref={ref}
            type="button"
            className={cx(styles.button, className)}
            disabled={disabled || loading}
            onClick={onClick}
            {...rest}
        >
            {loading && <Spinner size="xs" />}
            {children}
        </button>
    );
});

// ─── UnstyledButton ──────────────────────────────────────────────────────────

export const UnstyledButton = forwardRef(function UnstyledButton(
    { className, children, ...rest },
    ref,
) {
    return (
        <button
            ref={ref}
            type="button"
            className={cx(styles.unstyled, className)}
            {...rest}
        >
            {children}
        </button>
    );
});

// ─── Input (replaces Mantine TextInput / NumberInput) ────────────────────────

export const Input = forwardRef(function Input(
    {
        label,
        leftSection,
        rightSection,
        classNames: cn = {},
        className,
        style,
        variant,
        type = 'text',
        ...inputProps
    },
    ref,
) {
    const wrapper = (
        <div className={cx(
            styles.inputWrapper,
            variant === 'unstyled' && styles.inputUnstyled,
            cn.wrapper,
        )}>
            {leftSection && (
                <span className={cx(styles.inputSection, styles.inputSectionLeft, cn.section)}>
                    {leftSection}
                </span>
            )}
            <input
                ref={ref}
                type={type}
                className={cx(
                    styles.input,
                    leftSection && styles.hasLeftSection,
                    rightSection && styles.hasRightSection,
                    cn.input,
                )}
                {...inputProps}
            />
            {rightSection && (
                <span className={cx(styles.inputSection, styles.inputSectionRight, cn.section)}>
                    {rightSection}
                </span>
            )}
        </div>
    );

    if (!label && !cn.root && !className) return wrapper;

    return (
        <div className={cx(styles.inputRoot, cn.root, className)} style={style}>
            {label && (
                <label className={cx(styles.inputLabel, cn.label)}>{label}</label>
            )}
            {wrapper}
        </div>
    );
});

// ─── Textarea ────────────────────────────────────────────────────────────────

export const Textarea = forwardRef(function Textarea(
    { label, className, classNames: cn = {}, style, ...rest },
    ref,
) {
    const ta = (
        <textarea
            ref={ref}
            className={cx(styles.textarea, cn.input)}
            {...rest}
        />
    );

    if (!label) return <div className={cx(styles.textareaRoot, cn.root, className)} style={style}>{ta}</div>;

    return (
        <div className={cx(styles.textareaRoot, cn.root, className)} style={style}>
            <label className={cx(styles.inputLabel, cn.label)}>{label}</label>
            {ta}
        </div>
    );
});

// ─── Switch ──────────────────────────────────────────────────────────────────

export function Switch({ checked, onChange, disabled, className, ...rest }) {
    return (
        <label className={cx(styles.switch, className)} onClick={e => e.stopPropagation()}>
            <input
                type="checkbox"
                checked={!!checked}
                onChange={onChange}
                disabled={disabled}
                {...rest}
            />
            <span className={styles.switchTrack} />
        </label>
    );
}

// ─── SegmentedControl ────────────────────────────────────────────────────────

export function Segmented({
    value,
    onChange,
    data,
    classNames: cn = {},
    className,
    fullWidth,
}) {
    const items = data.map(d =>
        typeof d === 'string' ? { value: d, label: d } : d,
    );
    const idx = items.findIndex(d => d.value === value);
    const pct = 100 / items.length;

    return (
        <div className={cx(
            styles.segmented,
            fullWidth && styles.segmentedFull,
            cn.root,
            className,
        )}>
            {idx >= 0 && (
                <div
                    className={cx(styles.segmentedIndicator, cn.indicator)}
                    style={{
                        left: `calc(${idx * pct}% + 2px)`,
                        width: `calc(${pct}% - 4px)`,
                    }}
                />
            )}
            {items.map(d => (
                <button
                    type="button"
                    key={d.value}
                    className={cx(styles.segmentedLabel, cn.label)}
                    onClick={() => onChange(d.value)}
                    data-active={d.value === value || undefined}
                >
                    {d.label}
                </button>
            ))}
        </div>
    );
}

// ─── Slider (native range) ───────────────────────────────────────────────────

export function Slider({ value, onChange, min = 0, max = 1, step = 0.1, className, style }) {
    return (
        <input
            type="range"
            className={cx(styles.slider, className)}
            style={style}
            value={value ?? min}
            min={min}
            max={max}
            step={step}
            onChange={e => onChange(Number(e.currentTarget.value))}
        />
    );
}

// ─── Checkbox indicator (used inside clickable cards) ────────────────────────

export function CheckIndicator({ checked, className, children }) {
    return (
        <span className={cx(styles.checkboxIndicator, className)} data-checked={checked || undefined}>
            {children}
        </span>
    );
}

// ─── Divider ─────────────────────────────────────────────────────────────────

export function Divider({ label, className, style }) {
    if (label) return (
        <div className={cx(styles.dividerWithLabel, className)} style={style}>{label}</div>
    );
    return <hr className={cx(styles.divider, className)} style={style} />;
}

// ─── Collapse (CSS grid-row-template animation) ──────────────────────────────

export function Collapse({ in: open, children, duration = 200 }) {
    return (
        <div
            className={styles.collapse}
            data-open={open || undefined}
            style={{ transitionDuration: `${duration}ms` }}
        >
            <div className={styles.collapseInner}>{children}</div>
        </div>
    );
}

// ─── Transition (render-prop, matches Mantine API) ───────────────────────────

export function Transition({ mounted, duration = 200, children }) {
    const { rendered, open } = useDelayedUnmount(mounted, duration);
    if (!rendered) return null;

    const transitionStyle = {
        opacity: open ? 1 : 0,
        transform: open ? 'scale(1)' : 'scale(0.92)',
        transition: `opacity ${duration}ms ease, transform ${duration}ms ease`,
        transformOrigin: 'center',
    };

    return children(transitionStyle);
}

// ─── HoverPopover (target + dropdown, hover or controlled) ───────────────────

export function HoverPopover({
    opened,
    disabled,
    position = 'bottom',
    offset = 8,
    dropdown,
    dropdownClassName,
    className,
    style,
    children,
    ...rest
}) {
    const [hovered, setHovered] = useState(false);
    const isControlled = opened !== undefined;
    const visible = !disabled && (isControlled ? opened : hovered);

    const handlers = isControlled ? {} : {
        onMouseEnter: () => setHovered(true),
        onMouseLeave: () => setHovered(false),
    };

    return (
        <div
            className={cx(styles.popoverRoot, className)}
            style={{ '--popover-offset': `${offset}px`, ...style }}
            {...handlers}
            {...rest}
        >
            {children}
            {visible && (
                <div
                    className={cx(
                        styles.popoverDropdown,
                        styles[`popover_${position}`],
                        dropdownClassName,
                    )}
                >
                    {dropdown}
                </div>
            )}
        </div>
    );
}

// ─── DropdownMenu (click-triggered popover with auto-closing items) ──────────

export function DropdownMenu({
    className,
    dropdownClassName,
    items,
    children,
    onClose,
    position = 'bottom',
    offset = 8,
    style,
    onClick: onClickProp,
    ...rest
}) {
    const [open, setOpen] = useState(false);
    const wrapperRef = useRef(null);

    const close = useCallback(() => {
        setOpen(false);
        onClose?.();
    }, [onClose]);

    useEffect(() => {
        if (!open) return;
        const handler = (e) => {
            if (!wrapperRef.current?.contains(e.target)) close();
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [open, close]);

    const handleClick = (e) => {
        onClickProp?.(e);
        setOpen(o => !o);
    };

    return (
        <MenuContext.Provider value={{ close }}>
            <div
                ref={wrapperRef}
                className={cx(styles.popoverRoot, className)}
                style={{ '--popover-offset': `${offset}px`, ...style }}
                onClick={handleClick}
                {...rest}
            >
                {children}
                {open && (
                    <div
                        className={cx(
                            styles.popoverDropdown,
                            styles[`popover_${position}`],
                            dropdownClassName,
                        )}
                        onClick={e => e.stopPropagation()}
                    >
                        {items}
                    </div>
                )}
            </div>
        </MenuContext.Provider>
    );
}

export function MenuItem({
    children,
    onClick,
    leftSection,
    closeOnClick = true,
    className,
    disabled,
    ...rest
}) {
    const { close } = useContext(MenuContext);
    return (
        <button
            type="button"
            className={cx(styles.menuItem, className)}
            disabled={disabled}
            onClick={(e) => {
                onClick?.(e);
                if (closeOnClick) close();
            }}
            {...rest}
        >
            {leftSection && <span className={styles.menuItemLeft}>{leftSection}</span>}
            <span className={styles.menuItemLabel}>{children}</span>
        </button>
    );
}

export function MenuLabel({ children, className }) {
    return <div className={cx(styles.menuLabel, className)}>{children}</div>;
}

// ─── Tooltip (thin wrapper over HoverPopover for text labels) ────────────────

export function Tooltip({
    label,
    disabled,
    opened,
    position = 'top',
    offset = 6,
    className,
    children,
}) {
    if (!label) return children;
    return (
        <HoverPopover
            opened={opened}
            disabled={disabled}
            position={position}
            offset={offset}
            dropdownClassName={cx(styles.tooltipBubble, className)}
            dropdown={label}
        >
            {children}
        </HoverPopover>
    );
}

// ─── ScrollBox (replaces Mantine ScrollArea) ─────────────────────────────────

export const ScrollBox = forwardRef(function ScrollBox(
    {
        scrollbars = 'y',
        className,
        children,
        onScroll,
        style,
        ...rest
    },
    ref,
) {
    const dirClass = scrollbars === 'x'
        ? styles.scrollBoxX
        : scrollbars === 'xy'
            ? null
            : styles.scrollBoxY;

    return (
        <div
            ref={ref}
            className={cx(styles.scrollBox, dirClass, className)}
            onScroll={onScroll}
            style={style}
            {...rest}
        >
            {children}
        </div>
    );
});
