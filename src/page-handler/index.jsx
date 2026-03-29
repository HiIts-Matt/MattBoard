import { Box } from "@mantine/core";
import { useState } from "react";
import styles from './pageHandler.module.css'
import { config } from '../appConfig/appConfig.js'
import { Page } from "../components/Page";
import { PageControls } from "./page-controls";
import { PhotoFrame } from "../components/PhotoFrame";

export function PageHandler() {

    const [activePage, setActivePage] = useState(0);
    const [navDirection, setNavDirection] = useState(1)

    const pages = config.pages;
    const background = config.background;

    function goToPage(index) {
        if (index < 0 || index >= pages.length) return;
        setNavDirection(index > activePage ? 1 : -1);
        setActivePage(index);
    }

    return (
        <Box className={styles.root}>
            {background && <PhotoFrame {...background} />}
            <Box
                className={styles.track}
                style={{ transform: `translateX(-${activePage * 100}vw)` }}
            >
                {pages.map((page) => (
                    <Box key={page.name} className={styles.pageSlot}>
                        <Page page={page} />
                    </Box>
                ))}
            </Box>
            <PageControls
                pages={pages}
                direction={navDirection}
                activePage={activePage}
                onNavigate={goToPage}
            />
        </Box>
    );
}