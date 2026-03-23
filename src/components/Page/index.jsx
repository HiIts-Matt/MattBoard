import { Box } from '@mantine/core';
import { PageSection } from '../PageSection';
import { PageTitle } from '../PageSection/PageTitle';
import styles from './Page.module.css';

export function Page({ page }) {
    return (
        <Box
            className={styles.page}
            style={page?.style}
        >
            {page?.showTitle && (
                <PageTitle page={page} />
            )}
            {page?.sections.map(section => (
                <PageSection section={section} />
            ))}
        </Box>
    )
}