import { Box } from '@mantine/core';
import { useState } from 'react';
import { PageSection } from '../PageSection';
import styles from './Page.module.css';

function deriveSections(modules = []) {
    const positioned = modules.filter(m => !m.fullsize);
    const fullsize = modules.filter(m => m.fullsize);
    const sections = [];
    if (positioned.length > 0) sections.push({ flex: 1, modules: positioned });
    fullsize.forEach(m => sections.push({ flex: 1, modules: [m] }));
    return sections;
}

export function Page({ page, builderMode }) {
    const [fullscreenModule, setFullscreenModule] = useState(null);
    const sections = deriveSections(page?.modules);

    return (
        <Box className={styles.page} style={page?.style}>
            {sections.map((section, i) => (
                <PageSection
                    key={i}
                    section={section}
                    fullscreenModule={fullscreenModule}
                    setFullscreenModule={setFullscreenModule}
                    builderMode={builderMode}
                />
            ))}
        </Box>
    );
}