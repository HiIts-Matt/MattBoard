import { hours, minutes } from "../utils/utils";

export const config = {
    background: {
        changeTime: minutes(2),
        brightness: 0.5,
    },
    pages: [
        {
            name: "Home",
            showTitle: true,
            sections: [
                {
                    flex: 1,
                    modules: [
                        {
                            type: "clock",
                            position: 'top-right',
                            variant: 'both',
                            size: 'sm',
                            showNumbers: false,
                            showMarks: false,
                            showBorder: false,
                        },
                        {
                            type: 'todo',
                            position: 'top-left',
                            clearTime: hours(12),
                        },
                        {
                            type: 'weather',
                            position: 'bottom-left',
                            lat: 37.8136,
                            lon: 144.9631,
                            refetchTime: minutes(15),
                        }
                    ]
                },
            ]
        },
        {
            name: "News",
            showTitle: true,
            sections: [
                {
                    flex: 1,
                    modules: [
                        {
                            type: "clock",
                            position: 'top-right',
                            variant: 'both',
                            size: 'sm',
                            showNumbers: false,
                            showMarks: false,
                            showBorder: false,
                        },
                        {
                            type: 'todo',
                            position: 'top-left',
                            clearTime: hours(12),
                        },
                        {
                            type: 'news',
                            position: 'bottom-left',
                            feedUrls: [
                                'https://feeds.bbci.co.uk/news/rss.xml',
                            ],
                            defaultGoodNews: true,
                            threshold: 0.5,
                            refetchTime: minutes(15),
                        }
                    ]
                },
            ]
        }
    ]
}