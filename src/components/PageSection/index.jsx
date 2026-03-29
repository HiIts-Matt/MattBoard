import { Box } from "@mantine/core";
import styles from './PageSection.module.css'
import { positions } from "../../utils/positions";
import { components } from "../../utils/componentMap";
import { classNames } from "../../utils/utils";

export function PageSection({ section }) {
    return (
        <Box
            flex={section.flex || 1}
            className={styles.section}
        >
            {section?.modules?.map(modules => (
                <Component module={modules} />
            ))}
        </Box>
    )
}

function Component({ module }) {
    const SelectedComponent = components[module?.type]
    const isBackgroundImg = module?.variant === 'cover';

    if (!SelectedComponent) return null

    return (
        <Box
            className={classNames(
                isBackgroundImg ? styles.backgroundComponent : styles.component,
                styles.sharedPalette
            )}
            style={{
                ...module.style,
                ...positions[module?.position]
            }}
        >
            <SelectedComponent component={module} />
        </Box>
    )
}