import { useRef } from 'react';
import { useDrag } from '../../utils/useDrag';
import { useBuilderStore } from './BuilderStore';
import styles from './BuilderHandle.module.css';
import { classNames } from '../../utils/utils';
import { IconArrowUp, IconArrowDown } from '@tabler/icons-react';

export function BuilderHandle({ module, canMoveUp, canMoveDown }) {
    const handleRef = useRef(null);
    const { updateModulePosition, selectModule, moveSectionUp, moveSectionDown, selectedModuleId } = useBuilderStore();
    const isSelected = selectedModuleId === module.id;

    const { onPointerDown } = useDrag({
        onPositionChange: (newPos) => updateModulePosition(module.id, newPos),
    });

    if (module.fullsize) {
        return (
            <div
                ref={handleRef}
                className={classNames(styles.fullsizeHandle, isSelected && styles.selected)}
                onClick={() => selectModule(module.id)}
            >
                <span className={styles.label}>{module.type}</span>
                {canMoveUp && (
                    <button
                        className={`${styles.swapButton} ${styles.swapUp}`}
                        onClick={e => { e.stopPropagation(); moveSectionUp(module.id); }}
                    >
                        <IconArrowUp size={14} />
                    </button>
                )}
                {canMoveDown && (
                    <button
                        className={`${styles.swapButton} ${styles.swapDown}`}
                        onClick={e => { e.stopPropagation(); moveSectionDown(module.id); }}
                    >
                        <IconArrowDown size={14} />
                    </button>
                )}
            </div>
        );
    }

    return (
        <div
            ref={handleRef}
            className={classNames(styles.handle, isSelected && styles.selected)}
            onPointerDown={(e) => {
                selectModule(module.id);
                onPointerDown(e, handleRef.current.parentElement);
            }}
        >
            <span className={styles.label}>{module.type}</span>
        </div>
    );
}
