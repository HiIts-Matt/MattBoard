import { Box, Loader } from "@mantine/core";
import { useState } from "react";
import styles from './pageHandler.module.css';
import { config as localConfig } from '../appConfig/appConfig.js';
import { Page } from "../components/Page";
import { PageControls } from "./page-controls";
import { PhotoFrame } from "../components/PhotoFrame";
import { classNames } from "../utils/utils";
import { useConfig } from "../api/useConfig";
import { useBuilderMode } from "../hooks/useBuilderMode";
import { BuilderContextMenu } from "../components/Builder/BuilderContextMenu";

export function PageHandler() {
    const [activePage, setActivePage] = useState(0);
    const [navDirection, setNavDirection] = useState(1);

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


    const builderMode = builderPages !== null;
    const activePages = builderMode ? builderPages : config.pages;
    const background = config.background;

    function goToPage(index) {
        if (index < 0 || index >= activePages.length) return;
        setNavDirection(index > activePage ? 1 : -1);
        setActivePage(index);
    }

    if (isLoading) return (
        <Box style={{ width: '100vw', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Loader color="white" />
        </Box>
    );

    return (
        <Box className={classNames(styles.root, builderMode ? styles.builderMode : '')}>
            {background && <PhotoFrame {...background} />}
            <Box
                className={styles.track}
                style={{ transform: `translateX(-${activePage * 100}vw)` }}
            >
                {activePages?.map((page) => (
                    <Box key={page.name} className={styles.pageSlot}>
                        <Page page={page} builderMode={builderMode} />
                    </Box>
                ))}
            </Box>
            <BuilderContextMenu builderMode={builderMode} />
            <PageControls
                activeConfig={activeConfig}
                configData={data}
                pages={activePages}
                direction={navDirection}
                activePage={activePage}
                onNavigate={goToPage}
                builderMode={builderMode}
                onEnterBuilder={() => enterBuilder(config.pages)}
                onSave={handleSave}
                onDiscard={exitBuilder}
                onAddModule={(pageIndex, type) => handleAddModule(pageIndex, type)}
                onSwap={handleSwap}
            />
        </Box>
    );
}

