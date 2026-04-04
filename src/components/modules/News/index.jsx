import { ActionIcon, Anchor, Box, Group, Loader, Stack, Text, Tooltip } from '@mantine/core'
import styles from './News.module.css'
import { classNames } from '../../../utils/utils';
import { useState } from 'react';
import { useNews } from '../../../api/useNews';
import { IconAlertTriangle, IconMoodConfuzed, IconMoodHappy, IconNews } from '@tabler/icons-react';

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

export function NewsDisplay({ component, isFullscreen, onToggleFullscreen }) {

    const defaultGoodNews = component?.defaultGoodNews ?? true;
    const feedUrls = component?.feedUrls ?? [];
    const threshold = component?.threshold ?? 0.5;

    const [goodNews, setGoodNews] = useState(defaultGoodNews);
    const [visibleCount, setVisibleCount] = useState(10);

    const { articles: allArticles, isLoading, isError } = useNews({
        feedUrls,
        refetchTime: component?.refetchTime,
    });

    const visibleArticles = goodNews
        ? allArticles.filter(a => a.sentiment >= threshold)
        : allArticles;

    const sorted = [...visibleArticles].sort((a, b) => new Date(b.pubDate ?? 0) - new Date(a.pubDate ?? 0));

    const displayedArticles = sorted.slice(0, visibleCount);

    const articlesBySource = feedUrls.map(url => {
        const source = new URL(url).hostname.replace(/^www\./, '');
        return {
            source,
            articles: sorted.filter(a => a.source === source),
        };
    });

    const sourceRows = [];
    for (let i = 0; i < articlesBySource.length; i += 3) {
        sourceRows.push(articlesBySource.slice(i, i + 3));
    }

    const handleScroll = (e) => {
        const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
        if (scrollHeight - scrollTop - clientHeight < 50) {
            setVisibleCount(prev => Math.min(prev + 10, visibleArticles.length));
        }
    };

    return (
        <Box className={classNames(styles.newsBox, isFullscreen ? styles.opened : '')}>
            <Group className={styles.titleGroup}>
                <Group gap={5} className={styles.titleClickable} onClick={onToggleFullscreen}>
                    <IconNews color='var(--glyph-color-filled)' size={40} />
                    <Text className={styles.title}>News</Text>
                </Group>
                <Tooltip
                    label={goodNews ? 'Only Showing Good News' : 'Showing All News'}
                    withArrow
                >
                    <ActionIcon
                        onClick={() => { setGoodNews(prev => !prev); setVisibleCount(10); }}
                        className={styles.goodNewsButton}
                    >
                        {goodNews ? <IconMoodHappy /> : <IconMoodConfuzed />}
                    </ActionIcon>
                </Tooltip>
            </Group>

            {isLoading && (
                <Stack className={styles.loadingStack}>
                    <Loader color='var(--glyph-color-minimal)' />
                    <Text className={styles.statusText}>Loading...</Text>
                </Stack>
            )}

            {isError && (
                <Stack className={styles.loadingStack}>
                    <IconAlertTriangle size={40} color='var(--mantine-color-red-9)' />
                    <Text className={styles.statusText}>Failed to load feeds.</Text>
                </Stack>
            )}

            {!isLoading && !isError && sorted.length === 0 && (
                <Text className={styles.statusText}>No articles to show.</Text>
            )}

            {!isLoading && !isError && sorted.length > 0 && (
                <>
                    <Stack className={styles.articleList} gap={0} onScroll={handleScroll}>
                        {displayedArticles.map((article, i) => (
                            <ArticleItem key={i} article={article} />
                        ))}
                    </Stack>
                    <Stack className={styles.feedColumns} gap={0}>
                        {sourceRows.map((row, rowIdx) => (
                            <Group key={rowIdx} className={styles.feedRow} align="stretch" gap={0} wrap="nowrap">
                                {row.map(({ source, articles }) => (
                                    <Stack key={source} className={styles.feedColumnWrapper} gap={0}>
                                        <Text className={styles.feedColumnTitle}>{source}</Text>
                                        <Stack className={styles.feedColumn} gap={0}>
                                            {articles.map((article, i) => (
                                                <ArticleItem key={i} article={article} />
                                            ))}
                                        </Stack>
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
