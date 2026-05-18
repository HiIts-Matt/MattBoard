import { ScrollArea } from '@mantine/core'
import styles from './News.module.css'
import { classNames } from '../../../utils/utils';
import { memo, useCallback, useMemo, useRef, useState } from 'react';
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

const ArticleItem = memo(function ArticleItem({ article }) {
    return (
        <a
            href={article.link}
            target="_blank"
            rel="noreferrer"
            className={classNames(styles.article, styles.articleAnchor)}
        >
            <span className={styles.articleTitle}>{article.title}</span>
            <span className={styles.subText}>{article?.contentSnippet}</span>
            <span className={styles.bottomText}>
                {[article.source, timeAgo(article.pubDate)].filter(Boolean).join(' / ')}
            </span>
        </a>
    );
});

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

    const visibleArticles = useMemo(() =>
        filterEnabled && goodNewsActive
            ? allArticles.filter(a => a.sentiment >= threshold)
            : allArticles,
        [allArticles, filterEnabled, goodNewsActive, threshold]
    );

    const sorted = useMemo(() =>
        [...visibleArticles].sort((a, b) => new Date(b.pubDate ?? 0) - new Date(a.pubDate ?? 0)),
        [visibleArticles]
    );

    const displayedArticles = useMemo(() => sorted.slice(0, visibleCount), [sorted, visibleCount]);

    const articlesBySource = useMemo(() =>
        feedUrls.map(url => {
            let source;
            try { source = new URL(url).hostname.replace(/^www\./, ''); }
            catch { source = url; }
            return { source, articles: sorted.filter(a => a.source === source) };
        }),
        [feedUrls, sorted]
    );

    const sourceRows = useMemo(() => {
        const rows = [];
        for (let i = 0; i < articlesBySource.length; i += 3) {
            rows.push(articlesBySource.slice(i, i + 3));
        }
        return rows;
    }, [articlesBySource]);

    const handleScrollPosition = useCallback(({ y }) => {
        const el = articleListRef.current;
        if (!el) return;
        if (el.scrollHeight - y - el.clientHeight < 50) {
            setVisibleCount(prev => Math.min(prev + 10, visibleArticles.length));
        }
    }, [visibleArticles.length]);

    return (
        <div className={classNames(styles.newsBox, isFullscreen ? styles.opened : '')}>
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
                    <div className={styles.feedColumns}>
                        {sourceRows.map((row, rowIdx) => (
                            <div key={rowIdx} className={styles.feedRow}>
                                {row.map(({ source, articles }) => (
                                    <div key={source} className={styles.feedColumnWrapper}>
                                        <span className={styles.feedColumnTitle}>{source}</span>
                                        <ScrollArea
                                            type="hover"
                                            classNames={{ root: styles.feedColumn }}
                                        >
                                            {articles.map((article, i) => (
                                                <ArticleItem key={i} article={article} />
                                            ))}
                                        </ScrollArea>
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    )
}
