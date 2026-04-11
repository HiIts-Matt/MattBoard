import { Anchor, Box, Group, ScrollArea, Stack, Text } from '@mantine/core'
import styles from './News.module.css'
import { classNames } from '../../../utils/utils';
import { useRef, useState } from 'react';
import { useNews } from '../../../api/useNews';
import { IconArrowsMaximize, IconArrowsMinimize, IconMoodConfuzed, IconMoodHappy, IconNews } from '@tabler/icons-react';
import { ModuleTitle } from '../shared/ModuleTitle';
import { ModuleAlert } from '../shared/ModuleAlert';

function timeAgo(dateStr) {
    if (!dateStr) return '';
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
}

function ArticleItem({ article }) {
    return (
        <Anchor
            href={article.link}
            target="_blank"
            rel="noreferrer"
            className={classNames(styles.article, styles.articleAnchor)}
        >
            <Text className={styles.articleTitle}>{article.title}</Text>
            <Text className={styles.subText} truncate>{article?.contentSnippet}</Text>
            <Text className={styles.bottomText}>
                {[article.source, timeAgo(article.pubDate)].filter(Boolean).join(' / ')}
            </Text>
        </Anchor>
    );
}

export function NewsDisplay({ module, isFullscreen, onToggleFullscreen }) {

    const filterEnabled = module?.defaultGoodNews ?? false;
    const feedUrls = module?.feedUrls ?? [];
    const threshold = module?.threshold ?? 0.5;

    const isSetup = feedUrls.length > 0;

    const [goodNewsActive, setGoodNewsActive] = useState(true);
    const [visibleCount, setVisibleCount] = useState(10);
    const articleListRef = useRef(null);

    const { articles: allArticles, isLoading, isError } = useNews({
        feedUrls,
        refetchTime: module?.refetchTime,
        enabled: isSetup
    });

    const visibleArticles = filterEnabled && goodNewsActive
        ? allArticles.filter(a => a.sentiment >= threshold)
        : allArticles;

    const sorted = [...visibleArticles].sort((a, b) => new Date(b.pubDate ?? 0) - new Date(a.pubDate ?? 0));

    const displayedArticles = sorted.slice(0, visibleCount);

    const articlesBySource = feedUrls.map(url => {
        let source;
        try { source = new URL(url).hostname.replace(/^www\./, ''); }
        catch { source = url; }
        return { source, articles: sorted.filter(a => a.source === source) };
    });

    const sourceRows = [];
    for (let i = 0; i < articlesBySource.length; i += 3) {
        sourceRows.push(articlesBySource.slice(i, i + 3));
    }

    const handleScrollPosition = ({ y }) => {
        const el = articleListRef.current;
        if (!el) return;
        if (el.scrollHeight - y - el.clientHeight < 50) {
            setVisibleCount(prev => Math.min(prev + 10, visibleArticles.length));
        }
    };

    return (
        <Box className={classNames(styles.newsBox, isFullscreen ? styles.opened : '')}>
            <ModuleTitle
                icon={<IconNews color='var(--glyph-color-filled)' size={40} />}
                title="News"
                actions={[
                    filterEnabled && {
                        icon: goodNewsActive ? <IconMoodHappy /> : <IconMoodConfuzed />,
                        tooltip: goodNewsActive ? 'Showing Good News' : 'Showing All News',
                        onClick: () => { setGoodNewsActive(prev => !prev); setVisibleCount(10); },
                    },
                    {
                        icon: isFullscreen ? <IconArrowsMinimize /> : <IconArrowsMaximize />,
                        tooltip: isFullscreen ? 'Collapse' : 'Expand',
                        onClick: onToggleFullscreen,
                    },
                ].filter(Boolean)}
            />

            <ModuleAlert
                isLoading={isLoading}
                isError={isError}
                isSetup={isSetup}
                isEmpty={!isLoading && !isError && sorted.length === 0}
                errorMessage="Failed To Load Feed"
                emptyMessage="No articles to show"
            />

            {!isLoading && !isError && sorted.length > 0 && (
                <>
                    <ScrollArea.Autosize
                        type="hover"
                        scrollbars="y"
                        classNames={{ root: styles.articleList, viewport: styles.articleListViewport }}
                        viewportRef={articleListRef}
                        onScrollPositionChange={handleScrollPosition}
                    >
                        {displayedArticles.map((article, i) => (
                            <ArticleItem key={i} article={article} />
                        ))}
                    </ScrollArea.Autosize>
                    <Stack className={styles.feedColumns} gap={0}>
                        {sourceRows.map((row, rowIdx) => (
                            <Group key={rowIdx} className={styles.feedRow} align="stretch" gap={0} wrap="nowrap">
                                {row.map(({ source, articles }) => (
                                    <Stack key={source} className={styles.feedColumnWrapper} gap={0}>
                                        <Text className={styles.feedColumnTitle}>{source}</Text>
                                        <ScrollArea
                                            type="hover"
                                            classNames={{ root: styles.feedColumn }}
                                        >
                                            {articles.map((article, i) => (
                                                <ArticleItem key={i} article={article} />
                                            ))}
                                        </ScrollArea>
                                    </Stack>
                                ))}
                            </Group>
                        ))}
                    </Stack>
                </>
            )}
        </Box>
    )
}
