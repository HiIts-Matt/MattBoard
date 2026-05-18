import { Box, Button, Popover, Text, ActionIcon } from '@mantine/core';
import { lazy, Suspense, useState } from 'react';
import { useCalendar } from '../../../api/useCalendar';
import styles from './Calendar.module.css';
import { IconCalendarOff, IconChevronLeft, IconChevronRight } from '@tabler/icons-react';
import { useCalendarAuth } from '../../../api/useCalendarAuth';
import { classNames } from '../../../utils/utils';

const CalendarFullsize = lazy(() => import('./CalendarFullsize'));

function NotConnected({ onConnect }) {
    return (
        <div className={styles.notConnected}>
            <IconCalendarOff size={52} className={styles.notConnectedIcon} />
            <Text className={styles.notConnectedTitle}>Google Calendar</Text>
            <Text className={styles.notConnectedSub}>Not connected</Text>
            <Button className={styles.connectButton} onClick={onConnect}>
                Connect with Google
            </Button>
        </div>
    );
}

// ─── Entry point ─────────────────────────────────────────────────────────────

export function CalendarModule({ module }) {
    if (!module?.fullsize) return <CalendarWidget module={module} />;
    return (
        <Suspense fallback={<div className={styles.calendarWrapper} />}>
            <CalendarFullsize module={module} />
        </Suspense>
    );
}

// ─── Compact widget ───────────────────────────────────────────────────────────

const DAY_NAMES = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

function buildEventDayMap(events) {
    const map = new Map(); // dateString → event[]
    events.forEach(event => {
        const start = new Date(event.start);
        const end = event.end ? new Date(event.end) : new Date(event.start);
        // allDay end is exclusive in Google's API
        if (event.allDay && event.end) end.setDate(end.getDate() - 1);

        const d = new Date(start.getFullYear(), start.getMonth(), start.getDate());
        const endD = new Date(end.getFullYear(), end.getMonth(), end.getDate());

        let iterations = 0;
        while (d <= endD && iterations++ < 365) {
            const key = d.toDateString();
            if (!map.has(key)) map.set(key, []);
            map.get(key).push(event);
            d.setDate(d.getDate() + 1);
        }
    });
    return map;
}

function formatEventTime(event) {
    if (event.allDay) return 'All day';
    return new Date(event.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function DayCell({ date, isToday, events }) {
    const [opened, setOpened] = useState(false);
    const hasEvents = events.length > 0;

    return (
        <Popover
            opened={opened && hasEvents}
            position="top"
            withinPortal
            shadow="md"
            offset={4}
        >
            <Popover.Target>
                <Box
                    className={classNames(styles.dayCell, isToday && styles.dayCellToday)}
                    onMouseEnter={() => setOpened(true)}
                    onMouseLeave={() => setOpened(false)}
                >
                    <Text className={styles.dayNumber}>{date.getDate()}</Text>
                    {hasEvents && <Box className={styles.eventDot} />}
                </Box>
            </Popover.Target>
            <Popover.Dropdown className={styles.dayPopover}>
                <Text className={styles.popoverDate}>
                    {date.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })}
                </Text>
                {events.map((e, i) => (
                    <Box key={e.id ?? i} className={styles.popoverEvent}>
                        <Text className={styles.popoverEventTitle}>{e.title}</Text>
                        <Text className={styles.popoverEventTime}>{formatEventTime(e)}</Text>
                    </Box>
                ))}
            </Popover.Dropdown>
        </Popover>
    );
}

function CalendarWidget({ module }) {
    const { calendarId = 'primary', refetchTime } = module ?? {};
    const { events, isAuthError } = useCalendar({ calendarId, refetchTime });
    const { openAuthTab } = useCalendarAuth();

    const today = new Date();
    const [viewYear, setViewYear] = useState(today.getFullYear());
    const [viewMonth, setViewMonth] = useState(today.getMonth());

    const prevMonth = () => {
        if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
        else setViewMonth(m => m - 1);
    };
    const nextMonth = () => {
        if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
        else setViewMonth(m => m + 1);
    };

    const firstOfMonth = new Date(viewYear, viewMonth, 1);
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const startOffset = firstOfMonth.getDay(); // 0=Sunday

    const cells = [];
    for (let i = 0; i < startOffset; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(viewYear, viewMonth, d));
    while (cells.length % 7 !== 0) cells.push(null);

    const eventDayMap = buildEventDayMap(events);
    const todayStr = today.toDateString();

    const monthLabel = firstOfMonth.toLocaleDateString([], { month: 'long', year: 'numeric' });

    if (isAuthError) return (
        <Box className={styles.widget}>
            <NotConnected onConnect={openAuthTab} />
        </Box>
    );

    return (
        <Box className={styles.widget}>
            <Box className={styles.widgetHeader}>
                <ActionIcon className={styles.widgetNavButton} onClick={prevMonth} size="sm" variant="subtle">
                    <IconChevronLeft size={14} />
                </ActionIcon>
                <Text className={styles.widgetMonthTitle}>{monthLabel}</Text>
                <ActionIcon className={styles.widgetNavButton} onClick={nextMonth} size="sm" variant="subtle">
                    <IconChevronRight size={14} />
                </ActionIcon>
            </Box>
            <Box className={styles.dayGrid}>
                {DAY_NAMES.map(d => (
                    <Text key={d} className={styles.dayName}>{d}</Text>
                ))}
                {cells.map((date, i) =>
                    date ? (
                        <DayCell
                            key={i}
                            date={date}
                            isToday={date.toDateString() === todayStr}
                            events={eventDayMap.get(date.toDateString()) ?? []}
                        />
                    ) : (
                        <Box key={i} />
                    )
                )}
            </Box>
        </Box>
    );
}

