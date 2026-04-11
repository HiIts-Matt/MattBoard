export const classNames = (...args) => {
    return args.filter(Boolean).join(' ');
}

export const seconds = (secs) => {
    return 1000 * secs;
}

export const minutes = (mins) => {
    return 1000 * 60 * mins;
}

export const hours = (hours) => {
    return 1000 * 60 * 60 * hours;
}

export const days = (days) => {
    return 1000 * 60 * 60 * 24 * days;
}

export function formatSeparatorDate(date) {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
}

export const toTitleCase = (str) => {
    if (typeof str !== 'string') return str;
    return str.replace(/\b\w/g, (char) => char.toUpperCase());
}