import { Text } from "@mantine/core"
import { useEffect, useState } from "react"

export function Clock() {
    const [time, setTime] = useState(new Date())

    useEffect(() => {
        const interval = setInterval(() => setTime(new Date()), 1000)
        return () => clearInterval(interval)
    }, [])

    return (
        <Text ff="monospace" fw={700}>
            {time.toLocaleTimeString()}
        </Text>
    )
}