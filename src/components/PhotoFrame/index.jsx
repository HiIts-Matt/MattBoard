import { useEffect } from "react";
import { useApplePhoto } from "../../api/useApplePhoto";
import { IconAlertTriangle } from "@tabler/icons-react";
import { Spinner } from "../primitives";
import { useThemeStore } from "../../stores/ThemeStore";
import { API_BASE } from "../../utils/apiBase";

import styles from './PhotoFrame.module.css'

export function PhotoFrame({ module }) {
    const { data: photo, isError, isLoading } = useApplePhoto(module?.changeTime);
    const { activeTheme, setBlurredImage } = useThemeStore();
    const { blur, blurAmount } = activeTheme;

    useEffect(() => {
        if (blur !== 'prerendered' || !photo?.url) {
            setBlurredImage(null, null);
            return;
        }
        const url = `${API_BASE}/apple-album/blur?url=${encodeURIComponent(photo.url)}&amount=${blurAmount ?? 5}`;
        setBlurredImage(url, photo.width && photo.height ? { width: photo.width, height: photo.height } : null);
    }, [photo?.url, blur, blurAmount]);

    const getPhotoContent = () => {
        if (isError) return (
            <div className={styles.displayWrapper}>
                <IconAlertTriangle color='#c92a2a' size={60} />
            </div>
        )
        if (isLoading) return (
            <div className={styles.displayWrapper}>
                <Spinner size='lg' />
            </div>
        )
        return <img src={photo?.url} />
    }

    return (
        <div className={styles.photoWrapper}>
            {getPhotoContent()}
        </div>
    )
}
