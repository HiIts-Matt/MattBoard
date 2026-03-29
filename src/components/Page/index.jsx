import { Box } from '@mantine/core';
import { PageSection } from '../PageSection';
import styles from './Page.module.css';

export function Page({ page }) {
    return (
        <Box
            className={styles.page}
            style={page?.style}
        >
            {page?.sections.map(section => (
                <PageSection section={section} />
            ))}
        </Box>
    )
}