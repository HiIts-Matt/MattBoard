import { Box } from "@mantine/core";
import styles from './PageSection.module.css'
import { positions } from "../../utils/positions";
import { components } from "../../utils/componentMap";
import { classNames } from "../../utils/utils";

export function PageSection({ section, fullscreenModule, setFullscreenModule }) {
    return (
        <Box
            flex={section.flex || 1}
            className={styles.section}
        >
            {section?.modules?.map(module => (
                <Component
                    module={module}
                    fullscreenModule={fullscreenModule}
                    setFullscreenModule={setFullscreenModule}
                />
            ))}
        </Box>
    )
}

function Component({ module, fullscreenModule, setFullscreenModule }) {
    const SelectedComponent = components[module?.type]
    const isBackgroundImg = module?.variant === 'cover';
    const isFullscreen = fullscreenModule === module;
    const isDimmed = fullscreenModule !== null && !isFullscreen;

    if (!SelectedComponent) return null

    return (
        <Box
            className={classNames(
                isBackgroundImg ? styles.backgroundComponent : styles.component,
                styles.sharedPalette,
                isDimmed ? styles.dimmed : ''
            )}
            style={{
                ...module.style,
                ...positions[module?.position]
            }}
        >
            <SelectedComponent
                component={module}
                isFullscreen={isFullscreen}
                onToggleFullscreen={() => setFullscreenModule(isFullscreen ? null : module)}
            />
        </Box>
    )
}