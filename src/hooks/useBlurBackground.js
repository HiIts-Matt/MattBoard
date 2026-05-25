import { useLayoutEffect } from 'react';
import { useThemeStore } from '../stores/ThemeStore';

function getCoverMetrics(imgW, imgH, vpW, vpH) {
    if (imgW / imgH >= vpW / vpH) {
        const scale = vpH / imgH;
        const rW = imgW * scale;
        return { bgW: rW, bgH: vpH, offsetX: (rW - vpW) / 2, offsetY: 0 };
    }
    const scale = vpW / imgW;
    const rH = imgH * scale;
    return { bgW: vpW, bgH: rH, offsetX: 0, offsetY: (rH - vpH) / 2 };
}

export function useBlurBackground(elRef, { enabled = true } = {}) {
    const { activeTheme, blurredImageUrl, blurredImageSize } = useThemeStore();
    const isPrerendered = enabled && activeTheme.blur === 'prerendered' && !!blurredImageUrl;

    useLayoutEffect(() => {
        const el = elRef.current;
        if (!isPrerendered || !el) {
            if (el) el.style.backgroundPosition = '';
            return;
        }
        let rafId;
        function loop() {
            if (!elRef.current) return;
            const rect = elRef.current.getBoundingClientRect();
            let bgX = -rect.left;
            let bgY = -rect.top;
            if (blurredImageSize) {
                const { offsetX, offsetY } = getCoverMetrics(
                    blurredImageSize.width, blurredImageSize.height,
                    window.innerWidth, window.innerHeight
                );
                bgX = -(offsetX + rect.left);
                bgY = -(offsetY + rect.top);
            }
            elRef.current.style.backgroundPosition = `0 0, ${bgX}px ${bgY}px`;
            rafId = requestAnimationFrame(loop);
        }
        rafId = requestAnimationFrame(loop);
        return () => {
            cancelAnimationFrame(rafId);
            if (elRef.current) elRef.current.style.backgroundPosition = '';
        };
    }, [isPrerendered, blurredImageSize]);

    if (!isPrerendered) return null;

    let bgSize = '100vw 100vh';
    if (blurredImageSize) {
        const { bgW, bgH } = getCoverMetrics(
            blurredImageSize.width, blurredImageSize.height,
            window.innerWidth, window.innerHeight
        );
        bgSize = `${bgW}px ${bgH}px`;
    }

    return {
        backgroundImage: `linear-gradient(rgba(0,0,0,0.35), rgba(0,0,0,0.35)), url(${blurredImageUrl})`,
        backgroundSize: `auto, ${bgSize}`,
    };
}
