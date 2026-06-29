import { useEffect } from "react";
import { useApplePhoto } from "../../api/useApplePhoto";
import { useNasaPhoto } from "../../api/useNasaPhotos";
import { IconAlertTriangle } from "@tabler/icons-react";
import { Spinner } from "../primitives";
import { useThemeStore } from "../../stores/ThemeStore";
import { API_BASE } from "../../utils/apiBase";
import { normalizeBackground } from "../../utils/background";

import styles from './PhotoFrame.module.css'

export function PhotoFrame({ module }) {
    const bg = normalizeBackground(module);
    const { activeTheme, setBlurredImage } = useThemeStore();
    const { blur, blurAmount } = activeTheme;

    const isApple = bg.source === 'apple';
    const isNasa = bg.source === 'nasa';
    const isPinned = bg.mode === 'pinned';
    const pinnedPhoto = isApple ? bg.apple.pinned : bg.nasa.pinned;

    // Both hooks always run, but only the active, non-pinned source fetches.
    const apple = useApplePhoto(bg.changeTime, isApple && !isPinned);
    const nasa = useNasaPhoto(bg.nasa.query, bg.changeTime, isNasa && !isPinned);

    const active = isPinned
        ? { data: pinnedPhoto, isLoading: false, isError: !pinnedPhoto?.url }
        : (isApple ? apple : nasa);
    const photo = active.data;

    useEffect(() => {
        if (blur !== 'prerendered' || !photo?.url) {
            setBlurredImage(null, null);
            return;
        }
        const url = `${API_BASE}/apple-album/blur?url=${encodeURIComponent(photo.url)}&amount=${blurAmount ?? 5}`;
        setBlurredImage(url, photo.width && photo.height ? { width: photo.width, height: photo.height } : null);
    }, [photo?.url, blur, blurAmount]);

    const getPhotoContent = () => {
        if (active.isError) return (
            <div className={styles.displayWrapper}>
                <IconAlertTriangle color='#c92a2a' size={60} />
            </div>
        )
        if (active.isLoading) return (
            <div className={styles.displayWrapper}>
                <Spinner size='lg' />
            </div>
        )
        return <img src={photo?.url} />
    }

    return (
        <div className={styles.photoWrapper}>
            {getPhotoContent()}
            <div className={styles.dim} style={{ opacity: 1 - (bg.brightness ?? 0.5) }} />
        </div>
    )
}
