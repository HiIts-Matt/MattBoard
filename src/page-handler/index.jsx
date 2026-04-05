import { Box, Loader } from "@mantine/core";
import { useState } from "react";
import styles from './pageHandler.module.css';
import { config as localConfig } from '../appConfig/appConfig.js';
import { Page } from "../components/Page";
import { PageControls } from "./page-controls";
import { PhotoFrame } from "../components/PhotoFrame";
import { useBuilderStore } from "../components/Builder/BuilderStore";
import { classNames } from "../utils/utils";
import { useConfig } from "../api/useConfig";

export function PageHandler() {
    const [activePage, setActivePage] = useState(0);
    const [navDirection, setNavDirection] = useState(1);

    const { activeConfig, isLoading, data, save } = useConfig();
    const { pages: builderPages, enterBuilder, exitBuilder, addModule, exportConfig } = useBuilderStore();

    const config = activeConfig ?? localConfig;
    const builderMode = builderPages !== null;
    const activePages = builderMode ? builderPages : config.pages;
    const background = config.background;

    function goToPage(index) {
        if (index < 0 || index >= activePages.length) return;
        setNavDirection(index > activePage ? 1 : -1);
        setActivePage(index);
    }

    function handleSave(targetId, newName) {
        const updatedPages = exportConfig();
        const target = newName
            ? { name: newName, background: config.background }
            : targetId
                ? data.configs.find(c => c.id === targetId)
                : config;
        save.mutate({ ...target, pages: updatedPages });
        exitBuilder();
    }

    function handleSwap(targetId) {
        const target = data.configs.find(c => c.id === targetId);
        save.mutate(target);
        exitBuilder();
    }

    function handleAddModule(pageIndex, type) {
        addModule(pageIndex, 0, { type });
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