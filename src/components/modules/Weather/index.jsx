import styles from './Weather.module.css'
import { memo, useMemo, useState } from "react";
import { useWeather } from "../../../api/useWeather";
import { Icon, addCollection } from '@iconify/react';
import meteocons from '@iconify-json/meteocons/icons.json';
import { IconChevronDown, IconChevronUp, IconDropletDown } from "@tabler/icons-react";
import { ModuleTitle } from '../shared/ModuleTitle';
import { ModuleAlert } from '../shared/ModuleAlert';
import { Collapse, ScrollBox } from '../../primitives';

addCollection(meteocons);

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

export function Weather({ module }) {
    const { loc, units = 'celsius', defaultExpanded = false, refetchTime } = module ?? {}
    const { lat, lon } = loc ?? {}
    const [expanded, setExpanded] = useState(defaultExpanded)
    const { data: weatherData, isLoading, isError } = useWeather({ lat, lon, units, refetchTime })
    const unitLabel = units === 'celsius' ? '°C' : '°F'
    const isSetup = !!lat && !!lon;

    const { current_weather: current, daily } = weatherData ?? {};
    const todayWmo = current ? getWmo(current.weather_code) : null;

    return (
        <div className={styles.weatherBox} onClick={() => setExpanded(e => !e)}>
            <ModuleTitle
                title="Weather"
                rightContent={current && (
                    <div className={styles.smallPreview}>
                        <Icon icon={todayWmo.icon} width={60} />
                        <div className={styles.infoStack}>
                            <span className={styles.info}>{Math.round(current.temperature_2m)}{unitLabel}</span>
                            <span className={styles.info}>{todayWmo.label}</span>
                        </div>
                    </div>
                )}
            />

            <ModuleAlert
                isLoading={isLoading}
                isError={isError}
                isSetup={isSetup}
                errorMessage="Weather unavailable"
            />

            {!isLoading && !isError && isSetup && current && daily && (
                <>
                    <HourlyList hourlyData={weatherData?.hourly} />
                    <WeatherList daily={daily} expanded={expanded} />
                </>
            )}
        </div>
    )
}

function HourlyList({ hourlyData }) {
    const [now] = useState(() => Date.now());
    const sortedEntries = useMemo(() => {
        if (!hourlyData?.time) return [];
        return hourlyData.time
            .map((time, idx) => [time, {
                precipitation_probability: hourlyData.precipitation_probability?.[idx],
                weather_code: hourlyData.weather_code?.[idx],
                temperature_2m: hourlyData.temperature_2m?.[idx],
            }])
            .filter(([time]) => new Date(time).getTime() >= now)
            .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
            .slice(0, 12);
    }, [hourlyData, now]);

    return (
        <ScrollBox
            scrollbars="x"
            className={styles.hourlyList}
            onWheel={(e) => { e.currentTarget.scrollLeft += e.deltaY / 5 }}
        >
            {sortedEntries.map(([time, data]) => (
                <HourlyItem key={time} time={time} data={data} />
            ))}
        </ScrollBox>
    )
}

const HourlyItem = memo(function HourlyItem({ time, data }) {
    const label = new Date(time).toLocaleTimeString('en-US', { hour: 'numeric', hour12: true })
    const wmo = getWmo(data.weather_code)
    return (
        <div className={styles.hourlyItem}>
            <span className={styles.hourlyTime}>{label}</span>
            <Icon icon={wmo.icon} width={50} />
            <div className={styles.hourlyTempRow}>
                <span className={styles.hourlyTemp}>{Math.round(data.temperature_2m)}°</span>
            </div>
            <div className={styles.hourlyPrecipRow}>
                <IconDropletDown width={15} color='#99CCFF' />
                <span className={styles.hourlyPrecip}>{data.precipitation_probability ?? 0}%</span>
            </div>
        </div>
    )
});

function WeatherList({ expanded, daily }) {
    return (
        <Collapse in={expanded}>
            <div className={styles.weeklyList}>
                {daily.time.slice(1).map((dateStr, i) => {
                    const idx = i + 1
                    const wmo = getWmo(daily.weather_code?.[idx])
                    const day = DAYS[new Date(dateStr + 'T12:00:00').getDay()]
                    const precip = daily.precipitation_probability_max?.[idx]
                    return (
                        <div key={dateStr} className={styles.forecastRow}>
                            <span className={styles.forecastDay}>{day}</span>
                            <Icon icon={wmo.icon} className={styles.forecastIcon} height={70} />
                            <div className={styles.forecastPrecip}>
                                <IconDropletDown color='#99CCFF' />
                                <span className={styles.precip}>{precip != null ? `${precip}%` : ''}</span>
                            </div>
                            <div className={styles.forecastTemps}>
                                <IconChevronUp color='#fa5252' />
                                <span className={styles.forecastHi}>{Math.round(daily.temperature_2m_max[idx])}</span>
                                <IconChevronDown color='#4dabf7' />
                                <span className={styles.forecastLo}>{Math.round(daily.temperature_2m_min[idx])}</span>
                            </div>
                        </div>
                    )
                })}
            </div>
        </Collapse>
    )
}
