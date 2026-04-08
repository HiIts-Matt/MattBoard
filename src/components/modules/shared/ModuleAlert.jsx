import { Box, Loader, Text } from '@mantine/core';
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
        <Box className={styles.stack}>
            <IconAlertTriangle size={42} color='red' />
            <Text className={classNames(styles.message, styles.error)}>Module Requires Setup</Text>
        </Box>
    );
    if (isError) return (
        <Box className={styles.stack}>
            <IconAlertTriangle size={42} color='red' />
            <Text className={classNames(styles.message, styles.error)}>{errorMessage}</Text>
        </Box>
    );
    if (isLoading) return (
        <Box className={styles.stack}>
            <Loader color='var(--glyph-color-minimal)' />
            <Text className={styles.message}>Loading...</Text>
        </Box>
    );
    if (isEmpty) return (
        <Box className={styles.stack}>
            <IconAlertTriangle size={42} color='red' />
            <Text className={classNames(styles.message, styles.error)}>{emptyMessage}</Text>
        </Box>
    );
    return null;
}
