import { createPortal } from 'react-dom';
import { useEffect, useRef, useState } from 'react';
import { IconX, IconSearch, IconCheck } from '@tabler/icons-react';
import { Segmented, Slider, Input, Spinner } from '../primitives';
import { useBuilderStore } from '../Builder/BuilderStore';
import { DEFAULT_BACKGROUND, NASA_CATEGORIES } from '../../utils/background';
import { useApplePhotoList } from '../../api/useApplePhotoList';
import { useNasaSearch } from '../../api/useNasaPhotos';
import { classNames, minutes } from '../../utils/utils';
import styles from './BackgroundPanel.module.css';

const INTERVAL_OPTIONS = [
    { label: '30s', value: 30 * 1000 },
    { label: '2m', value: minutes(2) },
    { label: '10m', value: minutes(10) },
    { label: '30m', value: minutes(30) },
    { label: '1h', value: minutes(60) },
];

function PhotoGrid({ items, selectedKey, onSelect, isLoading, isError, emptyText }) {
    if (isLoading) return <div className={styles.gridState}><Spinner /></div>;
    if (isError) return <div className={styles.gridState}>Couldn't load photos. Check the source above.</div>;
    if (!items || items.length === 0) return <div className={styles.gridState}>{emptyText}</div>;

    return (
        <div className={styles.grid}>
            {items.map(item => (
                <Thumb
                    key={item.key}
                    item={item}
                    selected={item.key === selectedKey}
                    onSelect={onSelect}
                />
            ))}
        </div>
    );
}

function Thumb({ item, selected, onSelect }) {
    const [loaded, setLoaded] = useState(false);

    return (
        <button
            type="button"
            className={classNames(styles.thumb, selected && styles.thumbSelected)}
            onClick={() => onSelect(item)}
            title={item.title}
        >
            {!loaded && <div className={styles.thumbShimmer} aria-hidden="true" />}
            <img
                src={item.thumb}
                alt={item.title}
                loading="lazy"
                data-loaded={loaded}
                onLoad={() => setLoaded(true)}
                onError={() => setLoaded(true)}
            />
            {selected && (
                <span className={styles.thumbCheck}><IconCheck size={14} stroke={3} /></span>
            )}
        </button>
    );
}

function AppleTab({ bg, update }) {
    const [token, setToken] = useState(bg.apple.albumToken ?? '');
    const list = useApplePhotoList(bg.apple.albumToken || undefined, true);

    const items = (list.data?.items ?? []).map(p => ({
        key: p.guid,
        thumb: p.url,
        title: p.caption || 'Album photo',
        photo: { guid: p.guid, url: p.url, width: p.width, height: p.height },
    }));

    function applyToken() {
        const trimmed = token.trim();
        if (trimmed === (bg.apple.albumToken ?? '')) return;
        update({ apple: { ...bg.apple, albumToken: trimmed || null } });
    }

    function pick(item) {
        update({ mode: 'pinned', apple: { ...bg.apple, pinned: item.photo } });
    }

    return (
        <>
            <div className={styles.sourceRow}>
                <span className={styles.fieldLabel}>Album token</span>
                <Input
                    value={token}
                    onChange={e => setToken(e.currentTarget.value)}
                    onBlur={applyToken}
                    onKeyDown={e => e.key === 'Enter' && applyToken()}
                    placeholder="Apple shared album token"
                    classNames={{ input: styles.tokenInput }}
                />
            </div>
            <PhotoGrid
                items={items}
                selectedKey={bg.mode === 'pinned' ? bg.apple.pinned?.guid : null}
                onSelect={pick}
                isLoading={list.isLoading}
                isError={list.isError}
                emptyText={bg.apple.albumToken ? 'No photos in this album.' : 'Enter an album token to load photos.'}
            />
        </>
    );
}

function NasaTab({ bg, update }) {
    const [search, setSearch] = useState('');
    const query = bg.nasa.query || 'nebula';
    const results = useNasaSearch(query, 1, true);

    const items = (results.data?.items ?? []).map(p => ({
        key: p.id,
        thumb: p.thumb,
        title: p.title,
        photo: { id: p.id, url: p.full, width: p.width, height: p.height },
    }));

    function setQuery(q) {
        update({ nasa: { ...bg.nasa, query: q } });
    }

    function submitSearch(e) {
        e.preventDefault();
        const trimmed = search.trim();
        if (trimmed) setQuery(trimmed);
    }

    function pick(item) {
        update({ mode: 'pinned', nasa: { ...bg.nasa, pinned: item.photo } });
    }

    return (
        <>
            <div className={styles.chipsRow}>
                {NASA_CATEGORIES.map(cat => (
                    <button
                        type="button"
                        key={cat.query}
                        className={classNames(styles.chip, query === cat.query && styles.chipActive)}
                        onClick={() => setQuery(cat.query)}
                    >
                        {cat.label}
                    </button>
                ))}
                <form className={styles.searchForm} onSubmit={submitSearch}>
                    <IconSearch size={14} className={styles.searchIcon} />
                    <input
                        className={styles.searchInput}
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search…"
                    />
                </form>
            </div>
            <PhotoGrid
                items={items}
                selectedKey={bg.mode === 'pinned' ? bg.nasa.pinned?.id : null}
                onSelect={pick}
                isLoading={results.isLoading}
                isError={results.isError}
                emptyText="No images found."
            />
        </>
    );
}

export function BackgroundPanel({ open, onClose, builderMode, triggerRef }) {
    const { background, updateBackground } = useBuilderStore();
    const bg = background ?? DEFAULT_BACKGROUND;
    const panelRef = useRef(null);

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

    return createPortal(
        <div
            ref={panelRef}
            className={classNames(styles.panel, open && builderMode && styles.panelOpen)}
            onPointerDown={e => e.stopPropagation()}
        >
            <div className={styles.header}>
                <span className={styles.headerTitle}>Background</span>
                <button type="button" className={styles.closeButton} onClick={onClose}>
                    <IconX size={14} />
                </button>
            </div>

            <div className={styles.tabsRow}>
                <Segmented
                    fullWidth
                    value={bg.source}
                    onChange={v => updateBackground({ source: v })}
                    data={[
                        { value: 'apple', label: 'Apple Album' },
                        { value: 'nasa', label: 'NASA' },
                    ]}
                />
            </div>

            <div className={styles.body}>
                {bg.source === 'apple'
                    ? <AppleTab bg={bg} update={updateBackground} />
                    : <NasaTab bg={bg} update={updateBackground} />}
            </div>

            <div className={styles.footer}>
                <div className={styles.footerControl}>
                    <span className={styles.fieldLabel}>Mode</span>
                    <Segmented
                        value={bg.mode}
                        onChange={v => updateBackground({ mode: v })}
                        data={[
                            { value: 'shuffle', label: 'Shuffle' },
                            { value: 'pinned', label: 'Pinned' },
                        ]}
                    />
                </div>

                {bg.mode === 'shuffle' && (
                    <div className={styles.footerControl}>
                        <span className={styles.fieldLabel}>Every</span>
                        <Segmented
                            value={bg.changeTime}
                            onChange={v => updateBackground({ changeTime: v })}
                            data={INTERVAL_OPTIONS}
                        />
                    </div>
                )}

                <div className={classNames(styles.footerControl, styles.footerControlGrow)}>
                    <span className={styles.fieldLabel}>Brightness</span>
                    <div className={styles.sliderWrap}>
                        <Slider
                            min={0.1}
                            max={1}
                            step={0.05}
                            value={bg.brightness}
                            onChange={v => updateBackground({ brightness: v })}
                        />
                        <span className={styles.sliderValue}>{Math.round((bg.brightness ?? 0.5) * 100)}%</span>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
}
