import { useEffect, useLayoutEffect, useRef, useState } from 'react';

const GAP = 12;

function computePos(rect, menuW, menuH) {
    const centerX = rect.left + rect.width / 2;
    const x = Math.max(GAP, Math.min(centerX - menuW / 2, window.innerWidth - menuW - GAP));
    const aboveY = rect.top - menuH - GAP;
    const y = Math.max(GAP, Math.min(
        aboveY >= GAP ? aboveY : rect.bottom + GAP,
        window.innerHeight - menuH - GAP
    ));
    return { x, y };
}

// Tracks the position and slide animation state for the floating context menu.
export function useMenuPosition(anchorId, deps = []) {
    const [pos, setPos] = useState({ x: 0, y: 0 });
    const [slide, setSlide] = useState(false);
    const menuRef = useRef(null);
    const anchorRectRef = useRef(null);
    const prevIdRef = useRef(null);

    useEffect(() => {
        if (!anchorId) {
            prevIdRef.current = null;
            return;
        }
        const el = document.querySelector(`[data-module-id="${anchorId}"]`);
        if (!el) return;
        anchorRectRef.current = el.getBoundingClientRect();
        setSlide(prevIdRef.current !== null);
        prevIdRef.current = anchorId;

        const onMove = () => {
            anchorRectRef.current = el.getBoundingClientRect();
            if (menuRef.current) {
                setPos(computePos(anchorRectRef.current, menuRef.current.offsetWidth, menuRef.current.offsetHeight));
            }
        };
        window.addEventListener('pointermove', onMove);
        return () => window.removeEventListener('pointermove', onMove);
    }, [anchorId]);

    // Runs after React commits — offsetWidth/offsetHeight are the real rendered dimensions.
    useLayoutEffect(() => {
        if (!anchorRectRef.current || !menuRef.current) return;
        setPos(computePos(
            anchorRectRef.current,
            menuRef.current.offsetWidth,
            menuRef.current.offsetHeight
        ));
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [anchorId, ...deps]);

    return { pos, slide, menuRef };
}
