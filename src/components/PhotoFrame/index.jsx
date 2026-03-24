import { Box, Loader } from "@mantine/core";
import { useApplePhoto } from "../../api/useApplePhoto";
import { IconAlertTriangle } from "@tabler/icons-react";

import styles from './PhotoFrame.module.css'

export function PhotoFrame({ component }) {
    const { data: photo, isError, isLoading } = useApplePhoto(component?.changeMins);

    const getPhotoContent = () => {
        if (isError) return <IconAlertTriangle />
        if (isLoading) return <Loader size='lg' />
        return <img src={photo?.url} />
    }

    return (
        <Box className={styles.photoWrapper}>
            {getPhotoContent()}
        </Box>
    )
}