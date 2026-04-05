import { Box, Text } from "@mantine/core"
import { useEffect, useRef, useState } from "react"
import styles from './Clock.module.css'
import Clock from "react-clock"
import "react-clock/dist/Clock.css"
import { classNames } from "../../../utils/utils"
import { getAlignmentFromPosition } from "../../../utils/positions"

export function ClockComponent({ component }) {
    const [time, setTime] = useState(new Date())
    const clearRef = useRef(null)

    useEffect(() => {
        const msUntilNextSecond = 1000 - new Date().getMilliseconds()

        const timeout = setTimeout(() => {
            setTime(new Date())
            const interval = setInterval(() => setTime(new Date()), 1000)
            clearRef.current = () => clearInterval(interval)
        }, msUntilNextSecond)

        return () => {
            clearTimeout(timeout)
            clearRef.current?.()
        }
    }, [])

    const variant = component?.variant || 'digital'
    const bigClock = component?.size === 'lg'

    if (variant === 'digital') return <Digital time={time} />
    if (variant === 'analog') return <Analog time={time} component={component} />
    if (variant === 'both') return (
        <Box
            className={classNames(
                styles.bothWrapper,
                bigClock ? styles.bothWrapperBig : '',
            )}
            style={getAlignmentFromPosition(component?.position)}
        >
            <Analog time={time} component={component} />
            <Digital time={time} type='both' />
        </Box>
    )
}

function Digital({ time }) {
    const hours = time.getHours() % 12 || 12
    const minutes = time.getMinutes().toString().padStart(2, '0')
    const seconds = time.getSeconds().toString().padStart(2, '0')
    const ampm = time.getHours() >= 12 ? 'PM' : 'AM'

    return (
        <Box className={classNames(
            styles.colorScheme,
            styles.digitalWrapper,
        )}>
            <Text className={styles.digitalTime}>
                {hours}:{minutes}:{seconds}
            </Text>
            <Text className={styles.digitalAmPm}>
                {ampm}
            </Text>
        </Box>
    )
}

function Analog({ time, component }) {
    const bigClock = component?.size === 'lg'
    const showMarks = component?.showMarks ?? true
    const showBorder = component?.showBorder ?? true;

    return (
        <Box className={classNames(
            styles.colorScheme,
            styles.analogWrapper,
            bigClock ? styles.analogWrapperBig : ''
        )}>
            <Clock
                value={time}
                size={bigClock ? 'calc(100% - 20px)' : 'var(--component-w)'}
                className={classNames(
                    styles.clock,
                    !showMarks ? styles.noMarks : '',
                    bigClock ? styles.bigClock : '',
                    showBorder ? styles.showBorder : '',
                )}
                renderNumbers={component?.showNumbers}
            />
        </Box>
    )
}