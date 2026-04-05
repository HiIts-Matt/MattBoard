import { Box } from "@mantine/core";
import styles from './PageSection.module.css';
import { getPositionAnchor } from "../../utils/positions";
import { components } from "../../utils/componentMap";
import { classNames } from "../../utils/utils";
import { BuilderHandle } from "../Builder/BuilderHandle";

export function PageSection({ section, fullscreenModule, setFullscreenModule, builderMode }) {
    return (
        <Box
            flex={section.flex || 1}
            className={styles.section}
        >
            {section?.modules?.map(module => (
                <Module
                    key={module.id}
                    module={module}
                    fullscreenModule={fullscreenModule}
                    setFullscreenModule={setFullscreenModule}
                    builderMode={builderMode}
                />
            ))}
        </Box>
    );
}

function Module({ module, fullscreenModule, setFullscreenModule, builderMode }) {
    const SelectedComponent = components[module?.type];
    const isBackground = module?.variant === 'cover';
    const isFullscreen = fullscreenModule === module;
    const isDimmed = fullscreenModule !== null && !isFullscreen;

    if (!SelectedComponent) return null;

    return (
        <Box
            data-module-id={module.id}
            className={classNames(
                isBackground ? styles.backgroundComponent : styles.component,
                styles.sharedPalette,
                isDimmed ? styles.dimmed : ''
            )}
            style={getPositionAnchor(module)}
        >
            <SelectedComponent
                module={module}
                isFullscreen={isFullscreen}
                onToggleFullscreen={() => setFullscreenModule(isFullscreen ? null : module)}
            />
            {builderMode && !module.fullsize && (
                <BuilderHandle module={module} />
            )}
        </Box>
    );
}