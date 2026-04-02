export const positions = {
    'top-left': {
        top: '10px',
        left: '10px'
    },
    'top': {
        top: '10px',
        left: '50%',
        translate: '-50% 0'
    },
    'top-right': {
        top: '10px',
        right: '10px'
    },
    'left': {
        left: '10px',
        top: '50%',
        translate: '0 -50%'
    },
    'center': {
        top: '50%',
        left: '50%',
        translate: '-50% -50%'
    },
    'right': {
        right: '10px',
        top: '50%',
        translate: '0 -50%'
    },
    'bottom-left': {
        bottom: '100px',
        left: '10px'
    },
    'bottom': {
        bottom: '10px',
        left: '50%',
        translate: '-50% 0'
    },
    'bottom-right': {
        bottom: '10px',
        right: '10px'
    },
}

export const getAlignmentFromPosition = (position) => {
    if (!position) return {}

    switch (position) {
        case 'top-left':
            return { flexDirection: 'column', alignItems: 'flex-start' }
        case 'top':
            return { flexDirection: 'column', alignItems: 'center' }
        case 'top-right':
            return { flexDirection: 'column', alignItems: 'flex-end' }
        case 'right':
            return { flexDirection: 'row-reverse', alignItems: 'center' }
        case 'bottom-right':
            return { flexDirection: 'row-reverse', alignItems: 'flex-end' }
        case 'bottom':
            return { flexDirection: 'column-reverse', alignItems: 'center' }
        case 'bottom-left':
            return { flexDirection: 'row', alignItems: 'flex-end' }
        case 'left':
            return { flexDirection: 'row', alignItems: 'center' }
        default:
            return { flexDirection: 'column', alignItems: 'center' }
    }
}