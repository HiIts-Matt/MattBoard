export const classNames = (...args) => {
    return args.filter(Boolean).join(' ');
}

export const minutes = (mins) => {
    return 1000 * 60 * mins;
}