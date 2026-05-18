import { Loader } from "@mantine/core";
import { useApplePhoto } from "../../api/useApplePhoto";
import { IconAlertTriangle } from "@tabler/icons-react";

import styles from './PhotoFrame.module.css'

export function PhotoFrame({ module }) {

    const { data: photo, isError, isLoading } = useApplePhoto(module?.changeTime);

    const getPhotoContent = () => {
        if (isError) return (
            <div className={styles.displayWrapper}>
                <IconAlertTriangle color='#c92a2a' size={60} />
            </div>
        )
        if (isLoading) return (
            <div className={styles.displayWrapper}>
                <Loader size='lg' />
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