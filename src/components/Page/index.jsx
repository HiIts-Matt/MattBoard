import { useRef, useState } from 'react';
import { PageSection } from '../PageSection';
import styles from './Page.module.css';
import { useBuilderStore } from '../Builder/BuilderStore';

const MIN_FLEX_FRACTION = 0.1;

function deriveSections(modules = []) {
    const sections = [];
    let currentGroup = [];
    modules.forEach(m => {
        if (m.fullsize) {
            if (currentGroup.length > 0) {
                sections.push({
                    flex: currentGroup[0]._sectionFlex || 1,
                    leadModuleId: currentGroup[0].id,
                    modules: currentGroup,
                });
                currentGroup = [];
            }
            sections.push({
                flex: m._sectionFlex || 1,
                leadModuleId: m.id,
                modules: [m],
            });
        } else {
            currentGroup.push(m);
        }
    });
    if (currentGroup.length > 0) {
        sections.push({
            flex: currentGroup[0]._sectionFlex || 1,
            leadModuleId: currentGroup[0].id,
            modules: currentGroup,
        });
    }
    return sections;
}

function isLandscape() {
    return window.matchMedia('(aspect-ratio > 1)').matches;
}

function SectionDivider({ getSectionA, getSectionB, onResize }) {
    const dividerRef = useRef(null);

    const onPointerDown = (e) => {
        e.preventDefault();
        const divEl = dividerRef.current;
        divEl.setPointerCapture(e.pointerId);
        divEl.classList.add(styles.sectionDividerActive);

        const horizontal = isLandscape();
        const sectionA = getSectionA();
        const sectionB = getSectionB();
        const rect = (el) => el.getBoundingClientRect();
        const startPos = horizontal ? e.clientX : e.clientY;
        const startSizeA = horizontal ? rect(sectionA).width : rect(sectionA).height;
        const startSizeB = horizontal ? rect(sectionB).width : rect(sectionB).height;
        const totalSize = startSizeA + startSizeB;

        const fA = parseFloat(getComputedStyle(sectionA).flexGrow) || 1;
        const fB = parseFloat(getComputedStyle(sectionB).flexGrow) || 1;
        const totalFlex = fA + fB;

        const compute = (clientPos) => {
            const delta = clientPos - startPos;
            const clampedA = Math.max(totalSize * MIN_FLEX_FRACTION, Math.min(totalSize * (1 - MIN_FLEX_FRACTION), startSizeA + delta));
            const newFlexA = (clampedA / totalSize) * totalFlex;
            const newFlexB = totalFlex - newFlexA;
            return { newFlexA, newFlexB };
        };

        const onMove = (e) => {
            const { newFlexA, newFlexB } = compute(horizontal ? e.clientX : e.clientY);
            sectionA.style.flex = newFlexA;
            sectionB.style.flex = newFlexB;
        };

        const onUp = (e) => {
            divEl.releasePointerCapture(e.pointerId);
            divEl.classList.remove(styles.sectionDividerActive);
            divEl.removeEventListener('pointermove', onMove);
            divEl.removeEventListener('pointerup', onUp);
            divEl.removeEventListener('pointercancel', onUp);

            sectionA.style.flex = '';
            sectionB.style.flex = '';

            const { newFlexA, newFlexB } = compute(horizontal ? e.clientX : e.clientY);
            onResize(newFlexA, newFlexB);
        };

        divEl.addEventListener('pointermove', onMove);
        divEl.addEventListener('pointerup', onUp);
        divEl.addEventListener('pointercancel', onUp);
    };

    return (
        <div
            ref={dividerRef}
            className={styles.sectionDivider}
            onPointerDown={onPointerDown}
        >
            <div className={styles.sectionDividerGrip} />
        </div>
    );
}

export function Page({ page, builderMode }) {
    const [fullscreenModule, setFullscreenModule] = useState(null);
    const sections = deriveSections(page?.modules);
    const pageRef = useRef(null);
    const sectionEls = useRef([]);
    const { updateSectionFlex } = useBuilderStore();

    return (
        <div className={`${styles.page}${builderMode ? ` ${styles.builderMode}` : ''}`} style={page?.style} ref={pageRef}>
            {sections.flatMap((section, i) => {
                const sectionEl = (
                    <PageSection
                        key={`s${i}`}
                        section={section}
                        sectionIdx={i}
                        totalSections={sections.length}
                        fullscreenModule={fullscreenModule}
                        setFullscreenModule={setFullscreenModule}
                        builderMode={builderMode}
                        pageRef={pageRef}
                        sectionRef={el => { sectionEls.current[i] = el; }}
                    />
                );
                if (builderMode && i < sections.length - 1) {
                    return [
                        sectionEl,
                        <SectionDivider
                            key={`d${i}`}
                            getSectionA={() => sectionEls.current[i]}
                            getSectionB={() => sectionEls.current[i + 1]}
                            onResize={(fA, fB) => {
                                updateSectionFlex(section.leadModuleId, fA);
                                updateSectionFlex(sections[i + 1].leadModuleId, fB);
                            }}
                        />,
                    ];
                }
                return [sectionEl];
            })}
        </div>
    );
}
