import { Box, Text } from '@mantine/core'
import styles from './Title.module.css'

export function PageTitle({ page }) {
    return (
        <Box
            className={styles.pageTitle}
            style={page?.titleStyle}
        >
            <Text className={styles.titleText}>
                {page?.name}
            </Text>
        </Box>
    )
}