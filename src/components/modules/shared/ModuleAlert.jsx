import { Loader } from '@mantine/core';
import { IconAlertTriangle } from '@tabler/icons-react';
import styles from './ModuleAlert.module.css';
import { classNames } from '../../../utils/utils';

export function ModuleAlert({
    isLoading,
    isError,
    isSetup = true,
    isEmpty,
    errorMessage = 'Failed to load',
    emptyMessage = 'Nothing to show',
}) {
    if (!isSetup) return (
        <div className={styles.stack}>
            <IconAlertTriangle size={42} color='red' />
            <span className={classNames(styles.message, styles.error)}>Module Requires Setup</span>
        </div>
    );
    if (isError) return (
        <div className={styles.stack}>
            <IconAlertTriangle size={42} color='red' />
            <span className={classNames(styles.message, styles.error)}>{errorMessage}</span>
        </div>
    );
    if (isLoading) return (
        <div className={styles.stack}>
            <Loader color='var(--glyph-color-minimal)' />
            <span className={styles.message}>Loading...</span>
        </div>
    );
    if (isEmpty) return (
        <div className={styles.stack}>
            <IconAlertTriangle size={42} color='red' />
            <span className={classNames(styles.message, styles.error)}>{emptyMessage}</span>
        </div>
    );
    return null;
}
