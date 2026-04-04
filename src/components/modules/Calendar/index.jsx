import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Modal, Stack, TextInput, Textarea, Button, Group, Text, ActionIcon, SegmentedControl } from '@mantine/core';
import { useState } from 'react';
import { useCalendar } from '../../../api/useCalendar';
import styles from './Calendar.module.css';
import { IconX } from '@tabler/icons-react';

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

const emptyForm = { title: '', description: '', location: '', start: '', end: '', allDay: false };

export function CalendarModule({ component }) {
    const { calendarId = 'primary', refetchTime } = component ?? {};
    const { events, createEvent, updateEvent, deleteEvent } = useCalendar({ calendarId, refetchTime });

    const [modal, setModal] = useState(null); // null | { mode: 'create'|'edit', form, eventId? }
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);

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
            id: e.id,
            calendarId,
            title: e.title,
            description: e.extendedProps.description,
            location: e.extendedProps.location,
            allDay: e.allDay,
            start: e.allDay ? e.startStr : e.start.toISOString(),
            end: e.allDay ? e.endStr : (e.end ?? e.start).toISOString(),
        });
    };

    const handleResize = async (resizeInfo) => {
        const e = resizeInfo.event;
        await updateEvent({
            id: e.id,
            calendarId,
            title: e.title,
            description: e.extendedProps.description,
            location: e.extendedProps.location,
            allDay: e.allDay,
            start: e.allDay ? e.startStr : e.start.toISOString(),
            end: e.allDay ? e.endStr : (e.end ?? e.start).toISOString(),
        });
    };

    const setField = (key, value) =>
        setModal(m => ({ ...m, form: { ...m.form, [key]: value } }));

    const handleSave = async () => {
        if (!modal.form.title.trim()) return;
        setSaving(true);
        const { form } = modal;
        const payload = {
            calendarId,
            title: form.title,
            description: form.description,
            location: form.location,
            allDay: form.allDay,
            start: form.start,
            end: form.end || form.start,
        };
        if (modal.mode === 'create') {
            await createEvent(payload);
        } else {
            await updateEvent({ id: modal.eventId, ...payload });
        }
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
        id: e.id,
        title: e.title,
        start: e.start,
        end: e.end,
        allDay: e.allDay,
        extendedProps: { description: e.description, location: e.location },
    }));

    return (
        <div className={styles.calendarWrapper}>
            <FullCalendar
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                headerToolbar={{
                    left: 'prev,next today',
                    center: 'title',
                    right: 'dayGridMonth,timeGridWeek,timeGridDay',
                }}
                events={fullCalendarEvents}
                editable
                selectable
                selectMirror
                dayMaxEvents
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
                classNames={{
                    content: styles.modal,
                    overlay: styles.overlay
                }}
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
                                F placeholder='Event Title'
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
                        data={[
                            { label: 'All Day', value: 'allDay' },
                            { label: 'Between Times', value: 'timed' },
                        ]}
                        className={styles.allDayControl}
                    />
                    <TextInput
                        label="Start"
                        type={modal?.form.allDay ? 'date' : 'datetime-local'}
                        value={modal?.form.start ?? ''}
                        onChange={e => setField('start', e.target.value)}
                    />
                    <TextInput
                        label="End"
                        type={modal?.form.allDay ? 'date' : 'datetime-local'}
                        value={modal?.form.end ?? ''}
                        onChange={e => setField('end', e.target.value)}
                    />
                    <TextInput
                        label="Location"
                        value={modal?.form.location ?? ''}
                        onChange={e => setField('location', e.target.value)}
                    />
                    <Textarea
                        label="Description"
                        value={modal?.form.description ?? ''}
                        onChange={e => setField('description', e.target.value)}
                        rows={3}
                    />
                    <Group justify="space-between" mt="xs">
                        {modal?.mode === 'edit' ? (
                            <Button color="red" variant="subtle" loading={deleting} onClick={handleDelete}>
                                Delete
                            </Button>
                        ) : <span />}
                        <Group gap="sm">
                            <Button variant="subtle" onClick={() => setModal(null)}>Cancel</Button>
                            <Button loading={saving} onClick={handleSave}>Save</Button>
                        </Group>
                    </Group>
                </Stack>
            </Modal>
        </div >
    );
}
