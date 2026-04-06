import { useRef } from 'react';
import { useDrag } from '../../utils/useDrag';
import { useBuilderStore } from './BuilderStore';
import styles from './BuilderHandle.module.css';

export function BuilderHandle({ module }) {
    const handleRef = useRef(null);
    const { updateModulePosition, selectModule } = useBuilderStore();

    const { onPointerDown } = useDrag({
        onPositionChange: (newPos) => updateModulePosition(module.id, newPos),
    });

    return (
        <div
            ref={handleRef}
            className={styles.handle}
            onPointerDown={(e) => {
                selectModule(module.id);
                // Pass the module's outer Box element (handle's parent)
                onPointerDown(e, handleRef.current.parentElement);
            }}
        >
            <span className={styles.label}>{module.type}</span>
        </div>
    );
}