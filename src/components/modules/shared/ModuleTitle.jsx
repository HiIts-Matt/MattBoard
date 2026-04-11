import { ActionIcon, Group, Text, Tooltip } from '@mantine/core';
import styles from './ModuleTitle.module.css';
import { classNames } from '../../../utils/utils';

export function ModuleTitle({ icon, title, onTitleClick, actions, rightContent }) {
    const left = (
        <Group gap={5} className={classNames(styles.left, onTitleClick && styles.clickable)} onClick={onTitleClick}>
            {icon}
            {typeof title === 'string' ? (
                <Text className={styles.title}>{title}</Text>
            ) : (
                title
            )}

        </Group>
    );

    const right = rightContent ?? (
        actions?.length > 0 && (
            <Group gap={8}>
                {actions.map((action, i) => (
                    <Tooltip key={i} label={action.tooltip} withArrow disabled={!action.tooltip}>
                        <ActionIcon
                            className={classNames(styles.actionButton, action.className)}
                            onClick={action.onClick}
                        >
                            {action.icon}
                        </ActionIcon>
                    </Tooltip>
                ))}
            </Group>
        )
    );

    return (
        <Group className={styles.titleRow} justify="space-between" align="center">
            {left}
            {right}
        </Group>
    );
}
