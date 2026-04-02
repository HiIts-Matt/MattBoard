import { Box, Collapse, Group, Loader, Stack, Text } from "@mantine/core";
import styles from './Weather.module.css'
import { useState } from "react";
import { useWeather } from "../../../api/useWeather";
import { Icon } from '@iconify/react';

const WMO = {
    0: { label: 'Clear', icon: 'meteocons:clear-day-fill' },
    1: { label: 'Mostly Clear', icon: 'meteocons:clear-day-fill' },
    2: { label: 'Partly Cloudy', icon: 'meteocons:partly-cloudy-day-fill' },
    3: { label: 'Overcast', icon: 'meteocons:overcast-day-fill' },
    45: { label: 'Foggy', icon: 'meteocons:fog-day-fill' },
    48: { label: 'Foggy', icon: 'meteocons:fog-day-fill' },
    51: { label: 'Light Drizzle', icon: 'meteocons:drizzle-fill' },
    53: { label: 'Drizzle', icon: 'meteocons:drizzle-fill' },
    55: { label: 'Heavy Drizzle', icon: 'meteocons:drizzle-fill' },
    61: { label: 'Light Rain', icon: 'meteocons:rain-fill' },
    63: { label: 'Rain', icon: 'meteocons:rain-fill' },
    65: { label: 'Heavy Rain', icon: 'meteocons:rain-heavy-fill' },
    71: { label: 'Light Snow', icon: 'meteocons:snow-fill' },
    73: { label: 'Snow', icon: 'meteocons:snow-fill' },
    75: { label: 'Heavy Snow', icon: 'meteocons:snow-heavy-fill' },
    80: { label: 'Showers', icon: 'meteocons:partly-cloudy-day-rain-fill' },
    81: { label: 'Showers', icon: 'meteocons:partly-cloudy-day-rain-fill' },
    82: { label: 'Heavy Showers', icon: 'meteocons:rain-heavy-fill' },
    95: { label: 'Thunderstorm', icon: 'meteocons:thunderstorm-fill' },
    96: { label: 'Thunderstorm', icon: 'meteocons:thunderstorm-fill' },
    99: { label: 'Thunderstorm', icon: 'meteocons:thunderstorm-fill' },
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function getWmo(code) {
    return WMO[code] ?? { label: 'Unknown', icon: 'meteocons:not-available' }
}

const supportedOpts = [
    'type',
    'position',
    'lat',
    'lon',
    'refetchTime'
]

export function Weather({ component }) {

    const { lat, lon, units = 'celsius', defaultExpanded = false, refetchTime } = component ?? {}
    const [expanded, setExpanded] = useState(defaultExpanded)
    const { data, isLoading, isError } = useWeather({ lat, lon, units, refetchTime })
    const unitLabel = units === 'celsius' ? '°C' : '°F'

    if (isLoading) return (
        <Box className={styles.weatherBox} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Loader size="sm" color="white" />
        </Box>
    )

    if (isError || !data) return (
        <Box className={styles.weatherBox}>
            <Text className={styles.condition}>Weather unavailable</Text>
        </Box>
    )

    const { current_weather, daily } = data
    const todayWmo = getWmo(current_weather.weathercode)

    return (
        <Box className={styles.weatherBox} onClick={() => setExpanded(e => !e)}>
            <Group className={styles.titleGroup}>
                <Text className={styles.title}>
                    Weather
                </Text>
                <Group className={styles.smallPreview}>
                    <Icon icon={todayWmo.icon} width={60} />
                    <Stack className={styles.infoStack}>
                        <Text className={styles.info}>{Math.round(current_weather.temperature)}{unitLabel}</Text>
                        <Text className={styles.info}>{todayWmo.label}</Text>
                    </Stack>
                </Group>
            </Group>
            <WeatherList daily={daily} expanded={expanded} />
        </Box>
    )
}

function WeatherList({ expanded, daily }) {
    return (
        <Collapse in={expanded}>
            <Stack gap={2} className={styles.forecastList}>
                {daily.time.slice(1).map((dateStr, i) => {
                    const idx = i + 1
                    const wmo = getWmo(daily.weathercode[idx])
                    const day = DAYS[new Date(dateStr + 'T12:00:00').getDay()]
                    const precip = daily.precipitation_probability_max[idx]
                    return (
                        <Group key={dateStr} className={styles.forecastRow} wrap="nowrap" justify="space-between">
                            <Text className={styles.forecastDay}>{day}</Text>
                            <Icon icon={wmo.icon} className={styles.forecastIcon} width={100} height={100} />
                            <Text className={styles.precip}>{precip != null ? `${precip}%` : ''}</Text>
                            <Group gap={6} wrap="nowrap">
                                <Text className={styles.forecastHi}>{Math.round(daily.temperature_2m_max[idx])}</Text>
                                <Text className={styles.forecastLo}>{Math.round(daily.temperature_2m_min[idx])}</Text>
                            </Group>
                        </Group>
                    )
                })}
            </Stack>
        </Collapse>
    )
}