export const settings = [
    { key: 'feedUrls', label: 'RSS Feeds', type: 'feedUrls', required: true },
    {
        type: 'settingGroup',
        toggleKey: 'defaultGoodNews',
        label: 'Good News Filter',
        children: [
            { key: 'threshold', label: 'Filter threshold', type: 'slider', max: 1, min: 0, steps: 0.1 },
        ],
    },
];
