import { Box } from '@mantine/core';
import { useRef, useState } from 'react';
import { PageSection } from '../PageSection';
import styles from './Page.module.css';

function deriveSections(modules = []) {
    const sections = [];
    let currentGroup = [];
    modules.forEach(m => {
        if (m.fullsize) {
            if (currentGroup.length > 0) { sections.push({ flex: 1, modules: currentGroup }); currentGroup = []; }
            sections.push({ flex: 1, modules: [m] });
        } else {
            currentGroup.push(m);
        }
    });
    if (currentGroup.length > 0) sections.push({ flex: 1, modules: currentGroup });
    return sections;
}

export function Page({ page, builderMode }) {
    const [fullscreenModule, setFullscreenModule] = useState(null);
    const sections = deriveSections(page?.modules);
    const pageRef = useRef(null)


    return (
        <Box className={styles.page} style={page?.style} ref={pageRef}>
            {sections.map((section, i) => (
                <PageSection
                    key={i}
                    section={section}
                    sectionIdx={i}
                    totalSections={sections.length}
                    fullscreenModule={fullscreenModule}
                    setFullscreenModule={setFullscreenModule}
                    builderMode={builderMode}
                    pageRef={pageRef}
                />
            ))}
        </Box>
    );
}
