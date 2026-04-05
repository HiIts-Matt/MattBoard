export const moduleSettings = {
    clock: [
        { key: 'variant', label: 'Style', type: 'select', options: ['digital', 'analog', 'both'] },
        { key: 'size', label: 'Size', type: 'select', options: ['sm', 'lg'] },
        { key: 'showNumbers', label: 'Show numbers', type: 'boolean' },
        { key: 'showMarks', label: 'Show marks', type: 'boolean' },
        { key: 'showBorder', label: 'Show border', type: 'boolean' },
    ],
    weather: [
        { key: 'lat', label: 'Latitude', type: 'number' },
        { key: 'lon', label: 'Longitude', type: 'number' },
    ],
    todo: [
        { key: 'clearTime', label: 'Auto-clear (ms)', type: 'number' },
    ],
    news: [
        { key: 'defaultGoodNews', label: 'Good news filter', type: 'boolean' },
        { key: 'threshold', label: 'Filter threshold', type: 'number' },
    ],
    calendar: [],
};