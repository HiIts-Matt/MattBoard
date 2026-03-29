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
                    ]
                },
            ]
        }
    ]
}