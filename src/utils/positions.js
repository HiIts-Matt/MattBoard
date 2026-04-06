export function toAbsolutePosition({ x, y, w, h, anchor = 'top-left' }) {
    const [anchorY, anchorX] = anchor.split('-');
    return {
        left: anchorX === 'left' ? x : 100 - x - w,
        top: anchorY === 'top' ? y : 100 - y - h,
        w,
        h,
    };
}

export function computeAnchoredPosition(absLeft, absTop, w, h) {
    const anchorX = absLeft <= 100 - absLeft - w ? 'left' : 'right';
    const anchorY = absTop <= 100 - absTop - h ? 'top' : 'bottom';
    return {
        anchor: `${anchorY}-${anchorX}`,
        x: anchorX === 'left' ? absLeft : 100 - absLeft - w,
        y: anchorY === 'top' ? absTop : 100 - absTop - h,
        w,
        h,
    };
}

export function getPositionAnchor(module) {
    if (module.fullsize || !module.position) return { position: 'absolute', inset: 0 };
    const { x, y, anchor = 'top-left' } = module.position;
    const [anchorY, anchorX] = anchor.split('-');
    return {
        position: 'absolute',
        [anchorX]: `${x}%`,
        [anchorY]: `${y}%`,
    };
}

export function getPositionSize(module) {
    return {};
}

export function getPositionStyle(module) {
    if (module.fullsize) return { position: 'absolute', inset: 10 };
    return { ...getPositionAnchor(module), ...getPositionSize(module) };
}