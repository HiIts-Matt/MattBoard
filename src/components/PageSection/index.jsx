import { Box } from "@mantine/core";
import styles from './PageSection.module.css'
import { positions } from "../../utils/positions";
import { components } from "../../utils/componentMap";

export function PageSection({ section }) {
    return (
        <Box
            flex={section.flex || 1}
            className={styles.section}
        >
            {section?.components?.map(component => (
                <Component component={component} />
            ))}
        </Box>
    )
}

function Component({ component }) {
    const SelectedComponent = components[component?.type]
    const isBackgroundImg = component?.variant === 'cover';

    if (!SelectedComponent) return null

    return (
        <Box
            className={isBackgroundImg ? styles.backgroundComponent : styles.component}
            style={{
                ...component.style,
                ...positions[component?.position]
            }}
        >
            <SelectedComponent component={component} />
        </Box>
    )
}