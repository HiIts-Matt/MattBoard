export const moduleSettings = {
    clock: [
        { key: 'variant', label: 'Style', type: 'select', options: ['digital', 'analog', 'both'] },
        { key: 'fullsize', trueLabel: 'Full size', falseLabel: 'Module', type: 'control' },
        { key: 'showNumbers', label: 'Show numbers', type: 'boolean' },
        { key: 'showMarks', label: 'Show marks', type: 'boolean' },
        { key: 'showBorder', label: 'Show border', type: 'boolean' },

    ],
    weather: [
        { key: 'loc', label: 'Location', type: 'location', required: true },
    ],
    todo: [
        { key: 'fullsize', trueLabel: 'Full size', falseLabel: 'Module', type: 'control' },
        { key: 'listName', label: 'List Name', type: 'text' },
        { key: 'clearTime', label: 'Auto Archive (hr)', type: 'number' },
    ],
    news: [
        { key: 'feedUrls', label: 'RSS Feeds', type: 'feedUrls', required: true },
        {
            type: 'settingGroup',
            toggleKey: 'defaultGoodNews',
            label: 'Good News Filter',
            children: [
                { key: 'threshold', label: 'Filter threshold', type: 'slider', max: 1, min: 0, steps: 0.1 },
            ],
        },
    ],
    calendar: [
        { type: 'googleAuth' },
        { key: 'calendarId', label: 'Calendar', type: 'calendarPicker' },
        { key: 'fullsize', trueLabel: 'Full size', falseLabel: 'Widget', type: 'control' },
    ],
};