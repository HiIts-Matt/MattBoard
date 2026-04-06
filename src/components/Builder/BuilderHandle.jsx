import { useRef } from 'react';
import { useDrag } from '../../utils/useDrag';
import { useBuilderStore } from './BuilderStore';
import styles from './BuilderHandle.module.css';
import { IconArrowUp, IconArrowDown } from '@tabler/icons-react';

export function BuilderHandle({ module, canMoveUp, canMoveDown }) {
    const handleRef = useRef(null);
    const { updateModulePosition, selectModule, moveSectionUp, moveSectionDown } = useBuilderStore();

    const { onPointerDown } = useDrag({
        onPositionChange: (newPos) => updateModulePosition(module.id, newPos),
    });

    if (module.fullsize) {
        return (
            <div
                ref={handleRef}
                className={styles.fullsizeHandle}
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
            className={styles.handle}
            onPointerDown={(e) => {
                selectModule(module.id);
                onPointerDown(e, handleRef.current.parentElement);
            }}
        >
            <span className={styles.label}>{module.type}</span>
        </div>
    );
}
