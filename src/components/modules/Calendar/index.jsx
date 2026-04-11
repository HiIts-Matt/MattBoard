import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Modal, Stack, TextInput, Textarea, Button, Group, Text, ActionIcon, SegmentedControl, Box, Popover } from '@mantine/core';
import { useState } from 'react';
import { useCalendar } from '../../../api/useCalendar';
import styles from './Calendar.module.css';
import { IconX, IconCalendarOff, IconChevronLeft, IconChevronRight } from '@tabler/icons-react';
import { useCalendarAuth } from '../../../api/useCalendarAuth';
import { classNames } from '../../../utils/utils';

// ─── Shared helpers ──────────────────────────────────────────────────────────

function toLocalDateTimeInput(isoString) {
    if (!isoString) return '';
    const d = new Date(isoString);
    const pad = n => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function toLocalDateInput(isoString) {
    if (!isoString) return '';
    return new Date(isoString).toISOString().slice(0, 10);
}

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
    return <CalendarFullsize module={module} />;
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

// ─── Fullsize calendar ────────────────────────────────────────────────────────

const emptyForm = { title: '', description: '', location: '', start: '', end: '', allDay: false };

function CalendarFullsize({ module }) {
    const { calendarId = 'primary', refetchTime } = module ?? {};
    const { events, isAuthError, createEvent, updateEvent, deleteEvent } = useCalendar({ calendarId, refetchTime });
    const { openAuthTab } = useCalendarAuth();
    const [modal, setModal] = useState(null);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);

    if (isAuthError) return (
        <div className={styles.calendarWrapper}>
            <NotConnected onConnect={openAuthTab} />
        </div>
    );

    const openCreate = (dateInfo) => {
        const allDay = dateInfo.allDay;
        setModal({
            mode: 'create',
            form: {
                ...emptyForm,
                allDay,
                start: allDay ? toLocalDateInput(dateInfo.startStr) : toLocalDateTimeInput(dateInfo.startStr),
                end: allDay ? toLocalDateInput(dateInfo.endStr) : toLocalDateTimeInput(dateInfo.endStr),
            },
        });
    };

    const openEdit = (clickInfo) => {
        const e = clickInfo.event;
        const allDay = e.allDay;
        setModal({
            mode: 'edit',
            eventId: e.id,
            form: {
                title: e.title,
                description: e.extendedProps.description ?? '',
                location: e.extendedProps.location ?? '',
                allDay,
                start: allDay ? toLocalDateInput(e.startStr) : toLocalDateTimeInput(e.startStr),
                end: allDay ? toLocalDateInput(e.endStr) : toLocalDateTimeInput(e.endStr),
            },
        });
    };

    const handleDrop = async (dropInfo) => {
        const e = dropInfo.event;
        await updateEvent({
            id: e.id, calendarId, title: e.title,
            description: e.extendedProps.description, location: e.extendedProps.location,
            allDay: e.allDay,
            start: e.allDay ? e.startStr : e.start.toISOString(),
            end: e.allDay ? e.endStr : (e.end ?? e.start).toISOString(),
        });
    };

    const handleResize = async (resizeInfo) => {
        const e = resizeInfo.event;
        await updateEvent({
            id: e.id, calendarId, title: e.title,
            description: e.extendedProps.description, location: e.extendedProps.location,
            allDay: e.allDay,
            start: e.allDay ? e.startStr : e.start.toISOString(),
            end: e.allDay ? e.endStr : (e.end ?? e.start).toISOString(),
        });
    };

    const setField = (key, value) => setModal(m => ({ ...m, form: { ...m.form, [key]: value } }));

    const handleSave = async () => {
        if (!modal.form.title.trim()) return;
        setSaving(true);
        const { form } = modal;
        const payload = {
            calendarId, title: form.title, description: form.description,
            location: form.location, allDay: form.allDay, start: form.start,
            end: form.end || form.start,
        };
        if (modal.mode === 'create') await createEvent(payload);
        else await updateEvent({ id: modal.eventId, ...payload });
        setSaving(false);
        setModal(null);
    };

    const handleDelete = async () => {
        setDeleting(true);
        await deleteEvent({ id: modal.eventId, calendarId });
        setDeleting(false);
        setModal(null);
    };

    const fullCalendarEvents = events.map(e => ({
        id: e.id, title: e.title, start: e.start, end: e.end, allDay: e.allDay,
        extendedProps: { description: e.description, location: e.location },
    }));

    return (
        <div className={styles.calendarWrapper}>
            <FullCalendar
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                headerToolbar={{ left: 'prev,next today', center: 'title', right: 'dayGridMonth,timeGridWeek,timeGridDay' }}
                events={fullCalendarEvents}
                editable selectable selectMirror dayMaxEvents
                select={openCreate}
                eventClick={openEdit}
                eventDrop={handleDrop}
                eventResize={handleResize}
                height="100%"
            />

            <Modal
                opened={modal !== null}
                onClose={() => setModal(null)}
                withCloseButton={false}
                centered
                classNames={{ content: styles.modal, overlay: styles.overlay }}
                radius='var(--component-)'
                withinPortal={false}
            >
                <Stack gap="sm">
                    <Group className={styles.titleGroup}>
                        <Stack className={styles.headingStack}>
                            <Text className={styles.modalTitle}>
                                {modal?.mode === 'create' ? 'New Event' : 'Edit Event'}
                            </Text>
                            <TextInput
                                placeholder='Event Title'
                                variant='unstyled'
                                value={modal?.form.title ?? ''}
                                onChange={e => setField('title', e.target.value)}
                                required
                                data-autofocus
                            />
                        </Stack>
                        <ActionIcon className={styles.xButton} onClick={() => setModal(null)}>
                            <IconX />
                        </ActionIcon>
                    </Group>
                    <SegmentedControl
                        value={modal?.form.allDay ? 'allDay' : 'timed'}
                        onChange={value => setField('allDay', value === 'allDay')}
                        data={[{ label: 'All Day', value: 'allDay' }, { label: 'Between Times', value: 'timed' }]}
                        className={styles.allDayControl}
                    />
                    <TextInput label="Start" type={modal?.form.allDay ? 'date' : 'datetime-local'} value={modal?.form.start ?? ''} onChange={e => setField('start', e.target.value)} />
                    <TextInput label="End" type={modal?.form.allDay ? 'date' : 'datetime-local'} value={modal?.form.end ?? ''} onChange={e => setField('end', e.target.value)} />
                    <TextInput label="Location" value={modal?.form.location ?? ''} onChange={e => setField('location', e.target.value)} />
                    <Textarea label="Description" value={modal?.form.description ?? ''} onChange={e => setField('description', e.target.value)} rows={3} />
                    <Group justify="space-between" mt="xs">
                        {modal?.mode === 'edit' ? (
                            <Button color="red" variant="subtle" loading={deleting} onClick={handleDelete}>Delete</Button>
                        ) : <span />}
                        <Group gap="sm">
                            <Button variant="subtle" onClick={() => setModal(null)}>Cancel</Button>
                            <Button loading={saving} onClick={handleSave}>Save</Button>
                        </Group>
                    </Group>
                </Stack>
            </Modal>
        </div>
    );
}
