import { Box, Text } from "@mantine/core"
import { useEffect, useState } from "react"
import styles from './Clock.module.css'
import Clock from "react-clock"
import "react-clock/dist/Clock.css"
import { classNames } from "../../utils/utils"

export function ClockComponent({ component }) {
    const [time, setTime] = useState(new Date())

    useEffect(() => {
        const interval = setInterval(() => setTime(new Date()), 1000)
        return () => clearInterval(interval)
    }, [])

    const variant = component?.variant || 'digital'

    if (variant === 'digital') return <Digital time={time} />
    if (variant === 'analog') return <Analog time={time} component={component} />
    if (variant === 'both') return (
        <Box style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Analog time={time} component={component} />
            <Digital time={time} />
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
            styles.digitalWrapper
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

    return (
        <Box className={classNames(
            styles.colorScheme,
            styles.analogWrapper
        )}>
            <Clock
                value={time}
                size={bigClock ? 500 : 200}
                className={classNames(
                    styles.clock,
                    bigClock ? styles.bigClock : '',
                )}
                renderNumbers={component?.showNumbers}
            />
        </Box>
    )
}