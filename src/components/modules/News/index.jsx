import { Box, Group, Loader, Stack, Text } from '@mantine/core'
import styles from './News.module.css'
import { classNames } from '../../../utils/utils';
import { useState } from 'react';
import { useNews } from '../../../api/useNews';
import { IconAlertTriangle } from '@tabler/icons-react';

export function NewsDisplay({ component }) {

    const fullSize = component?.size === 'lg';
    const defaultGoodNews = component?.defaultGoodNews ?? true;
    const feedUrls = component?.feedUrls ?? [];
    const threshold = component?.threshold ?? 0.5;

    const [goodNews] = useState(defaultGoodNews);

    const { articles: allArticles, isLoading, isError } = useNews({
        feedUrls,
        refetchTime: component?.refetchTime,
    });

    const articles = goodNews
        ? allArticles.filter(a => a.sentiment >= threshold)
        : allArticles;

    return (
        <Box className={classNames(
            styles.newsBox,
            fullSize ? styles.fullSize : '',
        )}>
            <Group className={styles.titleGroup}>
                <Text className={styles.title}>News</Text>
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

            {!isLoading && !isError && articles.length === 0 && (
                <Text className={styles.statusText}>No articles to show.</Text>
            )}

            {articles.length > 0 && (
                <Stack className={styles.articleList} gap={0}>
                    {articles.map((article, i) => (
                        <Box key={i} className={styles.article}>
                            <Text className={styles.articleTitle}>{article.title}</Text>
                        </Box>
                    ))}
                </Stack>
            )}
        </Box>
    )
}
