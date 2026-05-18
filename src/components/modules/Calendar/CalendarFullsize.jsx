import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { useState } from 'react';
import { useCalendar } from '../../../api/useCalendar';
import styles from './Calendar.module.css';
import { IconX, IconCalendarOff } from '@tabler/icons-react';
import { useCalendarAuth } from '../../../api/useCalendarAuth';
import { Button, IconButton, Input, Textarea, Segmented } from '../../primitives';
import { displayModal, useModal } from '../../ModalHandler';

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
            <span className={styles.notConnectedTitle}>Google Calendar</span>
            <span className={styles.notConnectedSub}>Not connected</span>
            <Button className={styles.connectButton} onClick={onConnect}>
                Connect with Google
            </Button>
        </div>
    );
}

function EventEditModal({ mode, eventId, initialForm, calendarId, createEvent, updateEvent, deleteEvent }) {
    const { close } = useModal();
    const [form, setForm] = useState(initialForm);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const setField = (key, value) => setForm(f => ({ ...f, [key]: value }));

    const handleSave = async () => {
        if (!form.title.trim()) return;
        setSaving(true);
        const payload = {
            calendarId, title: form.title, description: form.description,
            location: form.location, allDay: form.allDay, start: form.start,
            end: form.end || form.start,
        };
        if (mode === 'create') await createEvent(payload);
        else await updateEvent({ id: eventId, ...payload });
        setSaving(false);
        close();
    };

    const handleDelete = async () => {
        setDeleting(true);
        await deleteEvent({ id: eventId, calendarId });
        setDeleting(false);
        close();
    };

    return (
        <div className={styles.modalStack}>
            <div className={styles.titleGroup}>
                <div className={styles.headingStack}>
                    <span className={styles.modalTitle}>
                        {mode === 'create' ? 'New Event' : 'Edit Event'}
                    </span>
                    <Input
                        placeholder='Event Title'
                        variant='unstyled'
                        value={form.title}
                        onChange={e => setField('title', e.target.value)}
                        required
                        autoFocus
                    />
                </div>
                <IconButton className={styles.xButton} onClick={close}>
                    <IconX />
                </IconButton>
            </div>
            <Segmented
                value={form.allDay ? 'allDay' : 'timed'}
                onChange={value => setField('allDay', value === 'allDay')}
                data={[{ label: 'All Day', value: 'allDay' }, { label: 'Between Times', value: 'timed' }]}
                className={styles.allDayControl}
                fullWidth
            />
            <Input label="Start" type={form.allDay ? 'date' : 'datetime-local'} value={form.start} onChange={e => setField('start', e.target.value)} />
            <Input label="End" type={form.allDay ? 'date' : 'datetime-local'} value={form.end} onChange={e => setField('end', e.target.value)} />
            <Input label="Location" value={form.location} onChange={e => setField('location', e.target.value)} />
            <Textarea label="Description" value={form.description} onChange={e => setField('description', e.target.value)} rows={3} />
            <div className={styles.modalActions}>
                {mode === 'edit' ? (
                    <Button className={styles.deleteButton} loading={deleting} onClick={handleDelete}>Delete</Button>
                ) : <span />}
                <div className={styles.modalActionsRight}>
                    <Button onClick={close}>Cancel</Button>
                    <Button loading={saving} onClick={handleSave}>Save</Button>
                </div>
            </div>
        </div>
    );
}

const emptyForm = { title: '', description: '', location: '', start: '', end: '', allDay: false };

export default function CalendarFullsize({ module }) {
    const { calendarId = 'primary', refetchTime } = module ?? {};
    const { events, isAuthError, createEvent, updateEvent, deleteEvent } = useCalendar({ calendarId, refetchTime });
    const { openAuthTab } = useCalendarAuth();

    if (isAuthError) return (
        <div className={styles.calendarWrapper}>
            <NotConnected onConnect={openAuthTab} />
        </div>
    );

    const openCreate = (dateInfo) => {
        const allDay = dateInfo.allDay;
        const initialForm = {
            ...emptyForm,
            allDay,
            start: allDay ? toLocalDateInput(dateInfo.startStr) : toLocalDateTimeInput(dateInfo.startStr),
            end: allDay ? toLocalDateInput(dateInfo.endStr) : toLocalDateTimeInput(dateInfo.endStr),
        };
        displayModal(
            <EventEditModal
                mode="create"
                initialForm={initialForm}
                calendarId={calendarId}
                createEvent={createEvent}
                updateEvent={updateEvent}
                deleteEvent={deleteEvent}
            />
        );
    };

    const openEdit = (clickInfo) => {
        const e = clickInfo.event;
        const allDay = e.allDay;
        const initialForm = {
            title: e.title,
            description: e.extendedProps.description ?? '',
            location: e.extendedProps.location ?? '',
            allDay,
            start: allDay ? toLocalDateInput(e.startStr) : toLocalDateTimeInput(e.startStr),
            end: allDay ? toLocalDateInput(e.endStr) : toLocalDateTimeInput(e.endStr),
        };
        displayModal(
            <EventEditModal
                mode="edit"
                eventId={e.id}
                initialForm={initialForm}
                calendarId={calendarId}
                createEvent={createEvent}
                updateEvent={updateEvent}
                deleteEvent={deleteEvent}
            />
        );
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
        </div>
    );
}
