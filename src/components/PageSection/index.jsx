import { Box } from "@mantine/core";
import styles from './PageSection.module.css';
import { getPositionStyle } from "../../utils/positions";
import { components } from "../../utils/componentMap";
import { classNames } from "../../utils/utils";
import { BuilderHandle } from "../Builder/BuilderHandle";
import { useEffect, useLayoutEffect, useRef, useState } from "react";

export function PageSection({ section, sectionIdx, totalSections, fullscreenModule, setFullscreenModule, builderMode, pageRef }) {
    const hasFullscreenModule = section?.modules?.some(m => m === fullscreenModule);
    return (
        <Box
            flex={section.flex || 1}
            className={classNames(
                styles.section,
                hasFullscreenModule ? styles.hasFullscreenModule : ''
            )}
        >
            {section?.modules?.map(module => (
                <Module
                    key={module.id}
                    module={module}
                    fullscreenModule={fullscreenModule}
                    setFullscreenModule={setFullscreenModule}
                    builderMode={builderMode}
                    canMoveUp={sectionIdx > 0}
                    canMoveDown={sectionIdx < totalSections - 1}
                    pageRef={pageRef}
                />
            ))}
        </Box>
    );
}

function Module({ module, fullscreenModule, setFullscreenModule, builderMode, canMoveUp, canMoveDown, pageRef }) {
    const SelectedComponent = components[module?.type];
    const isBackground = module?.variant === 'cover';
    const isFullscreen = fullscreenModule === module;
    const isDimmed = fullscreenModule !== null && !isFullscreen;
    const isFullsize = module?.fullsize

    const moduleRef = useRef(null);
    const [pos, setPos] = useState(null);
    const [useFullscreenPos, setUseFullscreenPos] = useState(false);
    const timeoutRef = useRef(null)

    useLayoutEffect(() => {
        if (isFullscreen) {
            const pageCoords = pageRef.current.getBoundingClientRect();
            const boxCoords = moduleRef.current.getBoundingClientRect();
            setPos({
                top: boxCoords.top - pageCoords.top,
                left: boxCoords.left - pageCoords.left,
                right: pageCoords.right - boxCoords.right,
                bottom: pageCoords.bottom - boxCoords.bottom,
            });
        } else {
            setUseFullscreenPos(false);
            timeoutRef.current = setTimeout(() => {
                if (timeoutRef.current) {
                    clearTimeout(timeoutRef.current)
                }
                setPos(null);
            }, 300)
        }
    }, [isFullscreen]);

    useEffect(() => {
        if (pos) setUseFullscreenPos(true)
    }, [pos])

    if (!SelectedComponent) return null;

    return (
        <Box
            ref={moduleRef}
            data-module-id={module.id}
            className={classNames(
                isBackground ? styles.backgroundComponent : styles.component,
                isDimmed ? styles.dimmed : '',
                isFullsize ? styles.fullsize : ''
            )}
            style={{
                ...getPositionStyle(module),
                ...(pos ? {
                    width: 'auto',
                    height: 'auto',
                    transition: 'top 0.3s ease, left 0.3s ease, right 0.3s ease, bottom 0.3s ease',
                    ...(useFullscreenPos
                        ? { top: 10, left: 10, right: 10, bottom: 10 }
                        : { top: pos.top, left: pos.left, right: pos.right, bottom: pos.bottom }
                    ),
                } : {})
            }}
        >
            <SelectedComponent
                module={module}
                isFullscreen={pos}
                onToggleFullscreen={() => setFullscreenModule(isFullscreen ? null : module)}
            />
            {builderMode && (
                <BuilderHandle
                    module={module}
                    canMoveUp={canMoveUp}
                    canMoveDown={canMoveDown}
                />
            )}
        </Box>
    );
}
