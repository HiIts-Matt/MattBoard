import { Box, Collapse, Group, Loader, Stack, Text } from "@mantine/core";
import styles from './Weather.module.css'
import { useLayoutEffect, useState } from "react";
import { useWeather } from "../../../api/useWeather";
import { Icon } from '@iconify/react';
import { useMap } from "@mantine/hooks";
import { classNames } from "../../../utils/utils";
import { IconChevronDown, IconChevronUp, IconDropletDown, IconThermometer } from "@tabler/icons-react";

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

export function Weather({ module }) {

    const { lat, lon, units = 'celsius', defaultExpanded = false, refetchTime } = module ?? {}
    const [expanded, setExpanded] = useState(defaultExpanded)
    const { data: weatherData, isLoading, isError } = useWeather({ lat, lon, units, refetchTime })
    const unitLabel = units === 'celsius' ? '°C' : '°F'

    if (isLoading) return (
        <Box className={styles.weatherBox} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Loader size="sm" color="white" />
        </Box>
    )

    if (isError || !weatherData) return (
        <Box className={styles.weatherBox}>
            <Text className={styles.condition}>Weather unavailable</Text>
        </Box>
    )

    const { current_weather, daily } = weatherData
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
            <HourlyList hourlyData={weatherData?.hourly} />
            <WeatherList daily={daily} expanded={expanded} />
        </Box>
    )
}

function HourlyList({ hourlyData, expanded }) {

    const formattedData = useMap();

    useLayoutEffect(() => {
        if (hourlyData) {
            hourlyData?.time?.forEach((hourlyTime, idx) => {
                const hourlyValues = {
                    precipitation_probability: hourlyData?.precipitation_probability?.[idx],
                    weathercode: hourlyData?.weathercode?.[idx],
                    temperature_2m: hourlyData?.temperature_2m?.[idx],
                }
                formattedData.set(hourlyTime, hourlyValues)
            })
        }
    }, [hourlyData])

    return (
        <Box
            className={classNames(styles.hourlyList)}
            onWheel={(e) => { e.currentTarget.scrollLeft += e.deltaY / 5 }}
        >
            {Array.from(formattedData.entries())
                .sort(([a], [b]) => a - b)
                .map(([time, data]) => (
                    <HourlyItem key={time} time={time} data={data} expanded={expanded} />
                ))
            }
        </Box>
    )
}

function HourlyItem({ time, data }) {
    const label = new Date(time).toLocaleTimeString('en-US', { hour: 'numeric', hour12: true })
    const wmo = getWmo(data.weathercode)

    return (
        <Box className={classNames(styles.hourlyItem)}>
            <Text className={styles.hourlyTime}>{label}</Text>
            <Icon icon={wmo.icon} width={50} />
            <Group gap={5} justify="center" w='100%'>
                <Text className={styles.hourlyTemp}>{Math.round(data.temperature_2m)}°</Text>
            </Group>
            <Group gap={5} justify="center">
                <IconDropletDown width={15} color='var(--mantine-color-blue-3)'/>
                <Text className={styles.hourlyPrecip}>{data.precipitation_probability ?? 0}%</Text>
            </Group>
        </Box>
    )
}

function WeatherList({ expanded, daily }) {
    return (
        <Collapse in={expanded}>
            <Stack gap={2} className={styles.weeklyList}>
                {daily.time.slice(1).map((dateStr, i) => {
                    const idx = i + 1
                    const wmo = getWmo(daily.weathercode[idx])
                    const day = DAYS[new Date(dateStr + 'T12:00:00').getDay()]
                    const precip = daily.precipitation_probability_max[idx]
                    return (
                        <Group key={dateStr} className={styles.forecastRow} wrap="nowrap" justify="space-between">
                            <Text className={styles.forecastDay}>{day}</Text>
                            <Icon icon={wmo.icon} className={styles.forecastIcon} height={70} />
                            <Group gap={5}>
                                <IconDropletDown color='var(--mantine-color-blue-3)' />
                                <Text className={styles.precip}>{precip != null ? `${precip}%` : ''}</Text>
                            </Group>
                            <Group gap={6} wrap="nowrap">
                                <IconChevronUp color='var(--mantine-color-red-filled)' />
                                <Text className={styles.forecastHi}>{Math.round(daily.temperature_2m_max[idx])}</Text>
                                <IconChevronDown color='var(--mantine-color-blue-7)' />
                                <Text className={styles.forecastLo}>{Math.round(daily.temperature_2m_min[idx])}</Text>
                            </Group>
                        </Group>
                    )
                })}
            </Stack>
        </Collapse>
    )
}