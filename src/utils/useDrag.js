import { useRef } from 'react';
import { flushSync } from 'react-dom';
import { toAbsolutePosition, computeAnchoredPosition } from './positions';

const EDGE_MARGIN_PX = 10;
const SNAP_THRESHOLD_PX = 30;
const SNAP_COLOR = 'rgba(99, 179, 237, 0.9)';

function computeSnap(rawLeft, rawTop, currentW, currentH, marginX, marginY, snapX, snapY) {
    let left = Math.max(marginX, Math.min(100 - currentW - marginX, rawLeft));
    let top  = Math.max(marginY, Math.min(100 - currentH - marginY, rawTop));

    const snapping = { left: false, right: false, top: false, bottom: false, centerX: false, centerY: false };

    const centerXPos = (100 - currentW) / 2;
    const centerYPos = (100 - currentH) / 2;

    if (Math.abs(left - centerXPos) < snapX) {
        left = centerXPos;
        snapping.centerX = true;
    } else if (left - marginX < snapX) {
        left = marginX;
        snapping.left = true;
    } else if (100 - currentW - marginX - left < snapX) {
        left = 100 - currentW - marginX;
        snapping.right = true;
    }

    if (Math.abs(top - centerYPos) < snapY) {
        top = centerYPos;
        snapping.centerY = true;
    } else if (top - marginY < snapY) {
        top = marginY;
        snapping.top = true;
    } else if (100 - currentH - marginY - top < snapY) {
        top = 100 - currentH - marginY;
        snapping.bottom = true;
    }

    return { left, top, snapping };
}

function makeLine(styles) {
    const el = document.createElement('div');
    Object.assign(el.style, { position: 'absolute', backgroundColor: SNAP_COLOR, pointerEvents: 'none', ...styles });
    return el;
}

function renderSnapLines(overlay, snapping) {
    overlay.innerHTML = '';
    if (snapping.left)    overlay.appendChild(makeLine({ left: `${EDGE_MARGIN_PX}px`, top: 0, width: '2px', height: '100%' }));
    if (snapping.right)   overlay.appendChild(makeLine({ right: `${EDGE_MARGIN_PX}px`, top: 0, width: '2px', height: '100%' }));
    if (snapping.top)     overlay.appendChild(makeLine({ top: `${EDGE_MARGIN_PX}px`, left: 0, height: '2px', width: '100%' }));
    if (snapping.bottom)  overlay.appendChild(makeLine({ bottom: `${EDGE_MARGIN_PX}px`, left: 0, height: '2px', width: '100%' }));
    if (snapping.centerX) overlay.appendChild(makeLine({ left: 'calc(50% - 1px)', top: 0, width: '2px', height: '100%' }));
    if (snapping.centerY) overlay.appendChild(makeLine({ top: 'calc(50% - 1px)', left: 0, height: '2px', width: '100%' }));
}

export function useDrag({ module, onPositionChange }) {
    const drag = useRef(null);

    const onPointerDown = (e, moduleElement) => {
        e.preventDefault();
        e.stopPropagation();

        const section = moduleElement.parentElement;
        const sectionRect = section.getBoundingClientRect();
        const moduleRect = moduleElement.getBoundingClientRect();

        const { left: origAbsLeft, top: origAbsTop } = toAbsolutePosition(module.position);

        const currentW = (moduleRect.width / sectionRect.width) * 100;
        const currentH = (moduleRect.height / sectionRect.height) * 100;

        const marginX = (EDGE_MARGIN_PX / sectionRect.width) * 100;
        const marginY = (EDGE_MARGIN_PX / sectionRect.height) * 100;
        const snapX   = (SNAP_THRESHOLD_PX / sectionRect.width) * 100;
        const snapY   = (SNAP_THRESHOLD_PX / sectionRect.height) * 100;

        const overlay = document.createElement('div');
        Object.assign(overlay.style, { position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 1000 });
        section.appendChild(overlay);

        const onMove = (e) => {
            if (!drag.current) return;
            const { startX, startY, containerW, containerH, origAbsLeft, origAbsTop, currentW, currentH,
                    marginX, marginY, snapX, snapY, element, overlay } = drag.current;

            const rawLeft = origAbsLeft + ((e.clientX - startX) / containerW) * 100;
            const rawTop  = origAbsTop  + ((e.clientY - startY) / containerH) * 100;

            const { left, top, snapping } = computeSnap(rawLeft, rawTop, currentW, currentH, marginX, marginY, snapX, snapY);

            element.style.transform = `translate(${((left - origAbsLeft) / 100) * containerW}px, ${((top - origAbsTop) / 100) * containerH}px)`;
            renderSnapLines(overlay, snapping);
        };

        const onUp = (e) => {
            if (!drag.current) return;
            const { startX, startY, containerW, containerH, origAbsLeft, origAbsTop, currentW, currentH,
                    marginX, marginY, snapX, snapY, element, overlay, section, onMove, onUp } = drag.current;

            const rawLeft = origAbsLeft + ((e.clientX - startX) / containerW) * 100;
            const rawTop  = origAbsTop  + ((e.clientY - startY) / containerH) * 100;

            const { left, top } = computeSnap(rawLeft, rawTop, currentW, currentH, marginX, marginY, snapX, snapY);

            section.removeChild(overlay);
            drag.current = null;
            window.removeEventListener('pointermove', onMove);
            window.removeEventListener('pointerup', onUp);

            flushSync(() => onPositionChange(computeAnchoredPosition(left, top, currentW, currentH)));
            element.style.transform = '';
        };

        drag.current = {
            startX: e.clientX, startY: e.clientY,
            containerW: sectionRect.width, containerH: sectionRect.height,
            origAbsLeft, origAbsTop, currentW, currentH,
            marginX, marginY, snapX, snapY,
            element: moduleElement, overlay, section,
            onMove, onUp,
        };

        window.addEventListener('pointermove', onMove);
        window.addEventListener('pointerup', onUp);
    };

    return { onPointerDown };
}
