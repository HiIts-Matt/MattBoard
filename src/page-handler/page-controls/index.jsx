import { Box, Text } from "@mantine/core";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import styles from "./PageControls.module.css";
import { useLayoutEffect, useRef, useState } from "react";

export function PageControls({ pages, direction, activePage, onNavigate }) {
    const canGoBack = activePage > 0;
    const canGoForward = activePage < pages.length - 1;

    return (
        <Box className={styles.controller}>
            <Box
                className={styles.arrowPill}
                style={{
                    transform: canGoBack ? "translateX(0)" : "translateX(-150%)",
                    opacity: canGoBack ? 1 : 0,
                    pointerEvents: canGoBack ? "auto" : "none",
                }}
                onClick={() => onNavigate(activePage - 1)}
            >
                <IconChevronLeft size={24} color="white" />
            </Box>

            <NamePill pages={pages} direction={direction} activePage={activePage} />

            <Box
                className={styles.arrowPill}
                style={{
                    transform: canGoForward ? "translateX(0)" : "translateX(150%)",
                    opacity: canGoForward ? 1 : 0,
                    pointerEvents: canGoForward ? "auto" : "none",
                }}
                onClick={() => onNavigate(activePage + 1)}
            >
                <IconChevronRight size={24} color="white" />
            </Box>
        </Box>
    );
}

function NamePill({ pages, direction, activePage }) {
    const currentPage = pages[activePage];
    const showLabel = currentPage?.showTitle !== false;

    const prevIndexRef = useRef(activePage);
    const [outgoing, setOutgoing] = useState(null);

    useLayoutEffect(() => {
        const prevIndex = prevIndexRef.current;
        if (prevIndex === activePage) return;

        const prevPage = pages[prevIndex];
        prevIndexRef.current = activePage;

        if (prevPage?.showTitle !== false) {
            setOutgoing({ name: prevPage.name });
            const timer = setTimeout(() => setOutgoing(null), 350);
            return () => clearTimeout(timer);
        }
    }, [activePage]);

    return (
        <Box className={styles.namePillClip}>
            <Box
                className={styles.namePill}
                style={{
                    transform: showLabel ? "translateY(0)" : "translateY(150%)",
                    opacity: showLabel ? 1 : 0,
                    pointerEvents: showLabel ? "auto" : "none",
                }}
            >
                <Box className={styles.namePillContent}>
                    {outgoing && (
                        <Text
                            className={showLabel
                                ? `${styles.nameText} ${direction === 1 ? styles.slideOutLeft : styles.slideOutRight}`
                                : styles.nameText
                            }
                            style={showLabel ? { position: "absolute" } : undefined}
                        >
                            {outgoing.name}
                        </Text>
                    )}
                    {showLabel && (
                        <Text
                            key={activePage}
                            className={`${styles.nameText} ${direction === 1 ? styles.slideInFromRight : styles.slideInFromLeft}`}
                        >
                            {currentPage.name}
                        </Text>
                    )}
                </Box>
            </Box>
        </Box>
    );
}