import { Box } from '@mantine/core';
import { useState } from 'react';
import { PageSection } from '../PageSection';
import styles from './Page.module.css';

export function Page({ page }) {
    const [fullscreenModule, setFullscreenModule] = useState(null);

    return (
        <Box
            className={styles.page}
            style={page?.style}
        >
            {page?.sections.map(section => (
                <PageSection
                    section={section}
                    fullscreenModule={fullscreenModule}
                    setFullscreenModule={setFullscreenModule}
                />
            ))}
        </Box>
    )
}