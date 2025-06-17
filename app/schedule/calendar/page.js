'use client'
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import Layout from '@/components/design/Layout';
import Section from '@/components/Section';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog';



import { useEffect } from 'react';

const CalendarPage = () => {
  const router = useRouter();
  const [events, setEvents] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedEvents = localStorage.getItem('calendarEvents');
      return savedEvents ? JSON.parse(savedEvents) : [
        {
          id: '1',
          title: 'Events Handling',
          date: new Date().toISOString().split('T')[0],
          importance: 'medium', // new importance property
        },
      ];
    }
    return [
      {
        id: '1',
        title: 'Events Handling',
        date: new Date().toISOString().split('T')[0],
        importance: 'medium',
      },
    ];
  });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventDescription, setNewEventDescription] = useState('');
  const [newEventTime, setNewEventTime] = useState('');
  const [newEventEndTime, setNewEventEndTime] = useState('');
  const [editingEventId, setEditingEventId] = useState(null);
  const [newEventImportance, setNewEventImportance] = useState('medium'); // new state for importance

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('calendarEvents', JSON.stringify(events));
    }
  }, [events]);

  // New state for calendar view: 'month', 'year', or 'week'
  const [calendarView, setCalendarView] = useState('month');

  // New state to track focused month in month view (0-11)
  const [focusedMonth, setFocusedMonth] = useState(null);

  // New state to track selected year in year view and focused views
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const handleDateClick = (info) => {
    setSelectedDate(info.dateStr);
    setNewEventTitle('');
    setNewEventDescription('');
    setNewEventTime('');
    setNewEventEndTime('');
    setNewEventImportance('medium'); // reset importance on new event
    setEditingEventId(null);
    setDialogOpen(true);
  };

  const handleEventClick = (clickInfo) => {
    const event = clickInfo.event;
    setEditingEventId(event.id);
    setSelectedDate(event.startStr.split('T')[0]);
    setNewEventTitle(event.title || '');
    setNewEventDescription(event.extendedProps.description || '');
    setNewEventTime(event.startStr.split('T')[1] ? event.startStr.split('T')[1].substring(0,5) : '');
    setNewEventEndTime(event.endStr ? event.endStr.split('T')[1].substring(0,5) : '');
    setNewEventImportance(event.extendedProps.importance || 'medium'); // set importance on edit
    setDialogOpen(true);
  };

  const handleAddEvent = () => {
    if (newEventTitle.trim() !== '') {
      const eventStartDateTime = newEventTime ? `${selectedDate}T${newEventTime}` : selectedDate;
      const eventEndDateTime = newEventEndTime ? `${selectedDate}T${newEventEndTime}` : null;
      if (editingEventId) {
        // Update existing event
        setEvents(events.map(ev => ev.id === editingEventId ? { ...ev, title: newEventTitle, date: eventStartDateTime, end: eventEndDateTime, description: newEventDescription, importance: newEventImportance } : ev));
      } else {
        // Add new event with unique id
        const newId = String(Date.now());
        setEvents([...events, { id: newId, title: newEventTitle, date: eventStartDateTime, end: eventEndDateTime, description: newEventDescription, importance: newEventImportance }]);
      }
      setDialogOpen(false);
      setEditingEventId(null);
    }
  };

  const handleViewChange = (e) => {
    const value = e.target.value;
    if (value === 'tabular') {
      router.push('/schedule');
    }
  };

  // Handle calendar view toggle between month and year
  const handleCalendarViewToggle = (e) => {
    setCalendarView(e.target.value);
  };

  // Helper to group events by month for year view
  const groupEventsByMonth = (events) => {
    const grouped = {};
    events.forEach(event => {
      const date = new Date(event.date || event.start || event.startStr);
      const month = date.toLocaleString('default', { month: 'long' });
      const year = date.getFullYear();
      const key = `${year}-${month}`;
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(event);
    });
    return grouped;
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderEventContent = (eventInfo) => {
    const startTime = formatTime(eventInfo.event.startStr);
    const endTime = eventInfo.event.endStr ? formatTime(eventInfo.event.endStr) : '';
    const importance = eventInfo.event.extendedProps.importance || 'medium';

    // Define colors for importance levels
    const importanceColors = {
      low: '#a3e635', // green-400
      medium: '#facc15', // yellow-400
      high: '#ef4444', // red-500
    };

    const backgroundColor = importanceColors[importance] || '#facc15';

    return (
      <div style={{ 
        backgroundColor, 
        padding: '2px 4px', 
        borderRadius: '4px', 
        color: 'black',
        maxWidth: '100%',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        boxSizing: 'border-box',
      }}>
        <b>{eventInfo.event.title}</b>
        <div>{startTime}{endTime ? ` - ${endTime}` : ''}</div>
      </div>
    );
  };

  return (
    <Layout>
      <Section title="Calendar View">
        <div className="mb-4 flex justify-end">
          <div className="mb-4 flex justify-end space-x-4 items-center">
            <select
              className="border border-gray-300 rounded px-3 py-1"
              value="calendar"
              onChange={handleViewChange}
            >
              <option value="tabular">Tabular View</option>
              <option value="calendar">Calendar View</option>
            </select>
            <div className="btn-group" role="group" aria-label="Toggle calendar views">
              <button
                type="button"
                className={`btn ${calendarView === 'year' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setCalendarView('year')}
              >
                Year
              </button>
              <button
                type="button"
                className={`btn ${calendarView === 'month' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setCalendarView('month')}
              >
                Month
              </button>
              <button
                type="button"
                className={`btn ${calendarView === 'week' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setCalendarView('week')}
              >
                Week
              </button>
            </div>
            {calendarView === 'year' && (
              <input
                type="number"
                min="1970"
                max="2100"
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value) || new Date().getFullYear())}
                className="ml-4 border border-gray-300 rounded px-3 py-1 w-24"
                aria-label="Select year"
              />
            )}
          </div>
        </div>
        <div className="p-4 bg-white rounded-md shadow" style={{ height: "100vh" }}>
          {calendarView === 'month' ? (
            <>
              {focusedMonth !== null && (
                <button
                  className="btn btn-secondary mb-4"
                  onClick={() => {
                    setFocusedMonth(null);
                    setCalendarView('year');
                  }}
                >
                  Back to Year View
                </button>
              )}
              <FullCalendar
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                events={events}
                dateClick={handleDateClick}
                eventClick={handleEventClick}
                eventContent={renderEventContent}
                height="100%"
                buttonText={{ today: 'Today' }}
                initialDate={new Date(selectedYear, focusedMonth !== null ? focusedMonth : 0, 1).toISOString().split('T')[0]}
              />
            </>
          ) : calendarView === 'week' ? (
            <FullCalendar
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView="timeGridWeek"
              events={events}
              dateClick={handleDateClick}
              eventClick={handleEventClick}
              eventContent={renderEventContent}
              height="100%"
              buttonText={{ today: 'Today' }}
              initialDate={new Date(selectedYear, focusedMonth || 0, 1).toISOString().split('T')[0]}
            />
          ) : (
            <div className="year-view grid grid-cols-3 gap-4 p-4 overflow-auto" style={{ height: "100%" }}>
              {[...Array(12)].map((_, i) => {
                const month = i; // 0-based month index
                const year = selectedYear;
                // Filter events for this month
                const monthEvents = events.filter(event => {
                  const date = new Date(event.date || event.start || event.startStr);
                  return date.getMonth() === month && date.getFullYear() === year;
                });
                const monthName = new Date(year, month).toLocaleString('default', { month: 'long' });
                return (
                  <div
                    key={month}
                    className="border rounded p-2 bg-white shadow-sm cursor-pointer"
                    style={{ height: '300px' }}
                    onClick={() => {
                      setFocusedMonth(month);
                      setCalendarView('month');
                    }}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        setFocusedMonth(month);
                        setCalendarView('month');
                      }
                    }}
                    aria-label={`Focus on ${monthName} month`}
                  >
                    <h3 className="text-center font-semibold mb-2">{monthName}</h3>
              <FullCalendar
                plugins={[dayGridPlugin]}
                initialView="dayGridMonth"
                headerToolbar={false}
                events={monthEvents}
                height={250}
                fixedWeekCount={false}
                dayMaxEventRows={3}
                eventContent={renderEventContent}
                selectable={false}
                editable={false}
                weekends={true}
                showNonCurrentDates={false}
                allDaySlot={false}
                eventDisplay="block"
              />
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold mb-2">Add / Edit Entry</DialogTitle>
              <DialogDescription className="mb-6 text-gray-600">
                Add or update a schedule for <span className="font-semibold">{selectedDate}</span>
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-1 gap-4">
              <input
                type="text"
                placeholder="Title"
                value={newEventTitle}
                onChange={(e) => setNewEventTitle(e.target.value)}
                className="w-full border border-indigo-500 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="time"
                  placeholder="Start Time"
                  value={newEventTime}
                  onChange={(e) => setNewEventTime(e.target.value)}
                  className="w-full border border-indigo-500 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
                <input
                  type="time"
                  placeholder="End Time"
                  value={newEventEndTime}
                  onChange={(e) => setNewEventEndTime(e.target.value)}
                  className="w-full border border-indigo-500 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
              </div>
              <div>
                <label className="block mb-2 font-semibold text-indigo-700">Importance</label>
                <select
                  value={newEventImportance}
                  onChange={(e) => setNewEventImportance(e.target.value)}
                  className="w-full border border-indigo-500 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                >
                  <option value="low" className="bg-green-100 text-green-800">Low</option>
                  <option value="medium" className="bg-yellow-100 text-yellow-800">Medium</option>
                  <option value="high" className="bg-red-100 text-red-800">High</option>
                </select>
              </div>
            </div>
            <DialogFooter className="space-x-2 mt-6">
              <button
                className="btn-primary bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500"
                onClick={handleAddEvent}
              >
                {editingEventId ? 'Update' : 'Add'}
              </button>
              {editingEventId && (
                <button
                  className="btn-danger bg-red-600 hover:bg-red-700 focus:ring-red-500"
                  onClick={() => {
                    setEvents(events.filter(ev => ev.id !== editingEventId));
                    setDialogOpen(false);
                    setEditingEventId(null);
                  }}
                >
                  Delete
                </button>
              )}
              <DialogClose asChild>
                <button className="btn-secondary bg-gray-300 hover:bg-gray-400 focus:ring-gray-400">Cancel</button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </Section>
    </Layout>
  );
};

export default CalendarPage;
