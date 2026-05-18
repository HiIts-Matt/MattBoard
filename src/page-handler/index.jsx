import { useEffect, useRef, useState } from "react";
import styles from './pageHandler.module.css';
import { Spinner } from "../components/primitives";
import { config as localConfig } from '../appConfig/appConfig.js';
import { Page } from "../components/Page";
import { PageControls } from "./page-controls";
import { PhotoFrame } from "../components/PhotoFrame";
import { classNames } from "../utils/utils";
import { useConfig } from "../api/useConfig";
import { useToDo } from "../api/useToDo";
import { useBuilderMode } from "../hooks/useBuilderMode";
import { BuilderContextMenu } from "../components/Builder/BuilderContextMenu";

export function PageHandler() {
    const [activePage, setActivePage] = useState(0);
    const [prevPage, setPrevPage] = useState(null);
    const [navDirection, setNavDirection] = useState(1);
    const transitionRef = useRef(null);

    const { activeConfig, isLoading, data, save } = useConfig();
    const config = activeConfig ?? localConfig;

    const {
        builderPages,
        enterBuilder,
        exitBuilder,
        handleSave,
        handleSwap,
        handleAddModule,
    } = useBuilderMode(save, config, data);

    const { data: toDoData } = useToDo();

    const builderMode = builderPages !== null;
    const activePages = builderMode ? builderPages : config.pages;
    const background = config.background;

    useEffect(() => () => clearTimeout(transitionRef.current), []);

    function goToPage(index) {
        if (index < 0 || index >= activePages.length) return;
        setNavDirection(index > activePage ? 1 : -1);
        setPrevPage(activePage);
        setActivePage(index);
        clearTimeout(transitionRef.current);
        transitionRef.current = setTimeout(() => setPrevPage(null), 500);
    }

    if (isLoading) return (
        <div style={{ width: '100vw', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Spinner color="white" />
        </div>
    );

    return (
        <div className={classNames(styles.root, builderMode ? styles.builderMode : '')}>
            {background && <PhotoFrame module={background} />}
            <div
                className={classNames(styles.track, prevPage !== null ? styles.trackTransitioning : '')}
                style={{ transform: `translateX(-${activePage * 100}vw)` }}
            >
                {activePages?.map((page, index) => (
                    <div key={page.name} className={styles.pageSlot}>
                        {(index === activePage || index === prevPage) ? (
                            <Page page={page} builderMode={builderMode} />
                        ) : (
                            <div className={styles.dummyPage}/>
                        )}
                    </div>
                ))}
            </div>
            <BuilderContextMenu builderMode={builderMode} />
            <PageControls
                activeConfig={activeConfig}
                configData={data}
                pages={activePages}
                direction={navDirection}
                activePage={activePage}
                onNavigate={goToPage}
                builderMode={builderMode}
                onEnterBuilder={() => enterBuilder(config.pages, toDoData)}
                onSave={handleSave}
                onDiscard={exitBuilder}
                onAddModule={(pageIndex, type) => handleAddModule(pageIndex, type)}
                onSwap={handleSwap}
            />
        </div>
    );
}