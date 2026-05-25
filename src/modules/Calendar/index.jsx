import { lazy, Suspense, useState } from 'react';
import { useCalendar } from '../../api/useCalendar';
import styles from './Calendar.module.css';
import { IconCalendarOff, IconChevronLeft, IconChevronRight } from '@tabler/icons-react';
import { useCalendarAuth } from '../../api/useCalendarAuth';
import { classNames } from '../../utils/utils';
import { Button, IconButton, HoverPopover } from '../../components/primitives';

const CalendarFullsize = lazy(() => import('./CalendarFullsize'));

function NotConnected({ onConnect }) {
    return (
        <div className={styles.notConnected}>
            <IconCalendarOff size={52} className={styles.notConnectedIcon} />
            <span className={styles.notConnectedTitle}>Google Calendar</span>
            <span className={styles.notConnectedSub}>Not connected</span>
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
    const hasEvents = events.length > 0;

    return (
        <HoverPopover
            position="top"
            offset={4}
            disabled={!hasEvents}
            className={classNames(styles.dayCell, isToday && styles.dayCellToday)}
            dropdownClassName={styles.dayPopover}
            dropdown={
                <>
                    <div className={styles.popoverDate}>
                        {date.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })}
                    </div>
                    {events.map((e, i) => (
                        <div key={e.id ?? i} className={styles.popoverEvent}>
                            <span className={styles.popoverEventTitle}>{e.title}</span>
                            <span className={styles.popoverEventTime}>{formatEventTime(e)}</span>
                        </div>
                    ))}
                </>
            }
        >
            <span className={styles.dayNumber}>{date.getDate()}</span>
            {hasEvents && <div className={styles.eventDot} />}
        </HoverPopover>
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
        <div className={styles.widget}>
            <NotConnected onConnect={openAuthTab} />
        </div>
    );

    return (
        <div className={styles.widget}>
            <div className={styles.widgetHeader}>
                <IconButton className={styles.widgetNavButton} onClick={prevMonth}>
                    <IconChevronLeft size={14} />
                </IconButton>
                <span className={styles.widgetMonthTitle}>{monthLabel}</span>
                <IconButton className={styles.widgetNavButton} onClick={nextMonth}>
                    <IconChevronRight size={14} />
                </IconButton>
            </div>
            <div className={styles.dayGrid}>
                {DAY_NAMES.map(d => (
                    <span key={d} className={styles.dayName}>{d}</span>
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
                        <div key={i} />
                    )
                )}
            </div>
        </div>
    );
}


export default CalendarModule;
