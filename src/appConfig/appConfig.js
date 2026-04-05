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
                        },
                        {
                            type: 'news',
                            position: 'bottom-right',
                            feedUrls: [
                                'https://www.abc.net.au/news/feed/51120/rss.xml',
                                'https://www.sbs.com.au/news/feed',
                                'https://www.theguardian.com/australia-news/rss',
                                'https://theconversation.com/au/articles.atom'
                            ],
                            defaultGoodNews: true,
                            threshold: 0.5,
                            refetchTime: minutes(15),
                        }
                    ]
                },
            ]
        },
        {
            name: "Calendar",
            showTitle: true,
            sections: [
                {
                    flex: 1,
                    modules: [
                        {
                            type: "clock",
                            position: 'fullsize',
                            variant: 'both',
                            size: 'lg',
                            showNumbers: false,
                            showMarks: false,
                            showBorder: false,
                        },
                    ]
                },
                {
                    flex: 1,
                    modules: [
                        {
                            type: 'calendar',
                            position: 'fullsize',
                            calendarId: 'd9d0c5780ea18685ab3ce9226057c622da26507d3b89d0d1a61d8345a08c7a23@group.calendar.google.com'
                        }
                    ]
                }
            ]
        }
    ]
}