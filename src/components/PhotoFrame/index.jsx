import { Box, Loader } from "@mantine/core";
import { useApplePhoto } from "../../api/useApplePhoto";
import { IconAlertTriangle } from "@tabler/icons-react";

import styles from './PhotoFrame.module.css'

export function PhotoFrame({ component }) {
    const { data: photo, isError, isLoading } = useApplePhoto(component?.changeTime);

    const getPhotoContent = () => {
        if (isError) return (
            <Box className={styles.displayWrapper}>
                <IconAlertTriangle color='var(--mantine-color-red-9)' size={60} />
            </Box>
        )
        if (isLoading) return (
            <Box className={styles.displayWrapper}>
                <Loader size='lg' />
            </Box>
        )
        return <img src={photo?.url} />
    }

    return (
        <Box className={styles.photoWrapper}>
            {getPhotoContent()}
        </Box>
    )
}