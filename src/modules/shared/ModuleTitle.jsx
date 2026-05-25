import styles from './ModuleTitle.module.css';
import { classNames } from '../../utils/utils';
import { IconButton, Tooltip } from '../../components/primitives';

export function ModuleTitle({ icon, title, onTitleClick, actions, rightContent }) {
    const left = (
        <div className={classNames(styles.left, onTitleClick && styles.clickable)} onClick={onTitleClick}>
            {icon}
            {typeof title === 'string' ? (
                <span className={styles.title}>{title}</span>
            ) : (
                title
            )}
        </div>
    );

    const right = rightContent ?? (
        actions?.length > 0 && (
            <div className={styles.actions}>
                {actions.map((action, i) => (
                    <Tooltip key={i} label={action.tooltip} withArrow disabled={!action.tooltip}>
                        <IconButton
                            className={classNames(styles.actionButton, action.className)}
                            onClick={action.onClick}
                        >
                            {action.icon}
                        </IconButton>
                    </Tooltip>
                ))}
            </div>
        )
    );

    return (
        <div className={styles.titleRow}>
            {left}
            {right}
        </div>
    );
}
