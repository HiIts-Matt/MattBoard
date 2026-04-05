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
                            id: 'clock-home',
                            type: "clock",
                            position: { anchor: 'top-right', x: 2, y: 2, w: 36, h: 45 },
                            variant: 'both',
                            size: 'sm',
                            showNumbers: false,
                            showMarks: false,
                            showBorder: false,
                        },
                        {
                            id: 'todo-home',
                            type: 'todo',
                            position: { anchor: 'top-left', x: 1, y: 2, w: 28, h: 50 },
                            clearTime: hours(12),
                        },
                        {
                            id: 'weather-home',
                            type: 'weather',
                            position: { anchor: 'bottom-left', x: 1, y: 3, w: 28, h: 42 },
                            lat: 37.8136,
                            lon: 144.9631,
                            refetchTime: minutes(15),
                        },
                        {
                            id: 'news-home',
                            type: 'news',
                            position: { anchor: 'bottom-right', x: 2, y: 2, w: 36, h: 48 },
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
                            id: 'clock-calendar',
                            type: "clock",
                            fullsize: true,   // fills this section, not draggable
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
                            id: 'calendar-main',
                            type: 'calendar',
                            fullsize: true,   // fills this section, not draggable
                            calendarId: 'd9d0c5780ea18685ab3ce9226057c622da26507d3b89d0d1a61d8345a08c7a23@group.calendar.google.com'
                        }
                    ]
                }
            ]
        }
    ]
}