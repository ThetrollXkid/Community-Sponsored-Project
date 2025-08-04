'use client'
import React, { useEffect, useState, useRef } from 'react'
import AnnounceContent from '@/components/AnnounceContent'
import Layout from '@/components/design/Layout'
import Section from '@/components/Section'
import { useUserRole } from '@/components/UserContext'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'

const Dashboard = () => {
  const [date, setDate] = useState(new Date())
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const { role, email } = useUserRole()
  const [schedule, setSchedule] = useState([])
  const [columns, setColumns] = useState([])
  const [events, setEvents] = useState([])
  const [activeTab, setActiveTab] = useState('schedule')
  const [viewMode, setViewMode] = useState('tabular')
  const [calendarView, setCalendarView] = useState('dayGridMonth')
  const calendarRef = useRef(null)
  const [selectedEvent, setSelectedEvent] = useState(null)

  useEffect(() => {
    if (role === 1) getCount()
    else if (role === 2) getSchedule()
  }, [role, email])

  const getCount = async () => {
    const res = await fetch('/api/infoCount')
    const data = await res.json()
    setCount(data)
  }

  const getSchedule = async () => {
    const res = await fetch('/api/schedule/instructor_schedule')
    const data = await res.json()
    setSchedule(data)
    setColumns(Object.keys(data[0] || []))
  }

useEffect(() => {
  const mappedEvents = schedule.map(item => {
    const startDateOnly = item.start_date || '';
    const endDateOnly = item.end_date || '';
    const startTime = item.start_time?.slice(0, 5) || '';
    const endTime = item.end_time?.slice(0, 5) || '';
    const timeRange = startTime && endTime ? `${startTime} - ${endTime}` : '';

    return {
      title: `${item.course_name} ${timeRange}` || 'Scheduled',
      start: `${startDateOnly}T${item.start_time}`,
      end: `${endDateOnly}T${item.end_time}`,
      displayTitle: `${item.course_name} ${timeRange}`,
    };
  });

  console.log('Mapped events for calendar:', mappedEvents);
  setEvents(mappedEvents);
}, [schedule]);



  useEffect(() => {
    if (calendarRef.current) {
      const calendarApi = calendarRef.current.getApi()
      calendarApi.changeView(calendarView)
    }
  }, [calendarView])

  const handleDateClick = arg => {
    setSelectedEvent({ title: 'Date clicked', date: arg.dateStr })
  }

  const handleEventClick = clickInfo => {
    setSelectedEvent({ title: clickInfo.event.title, date: clickInfo.event.startStr })
  }

  const renderEventContent = eventInfo => {
    const displayText = eventInfo.event.extendedProps.displayTitle || eventInfo.event.title
    return (
      <div
        style={{
          backgroundColor: '#facc15',
          padding: '4px 6px',
          borderRadius: '6px',
          color: 'black',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
        title={displayText}
      >
        <b>{displayText}</b>
      </div>
    )
  }

  return (
    <Layout>
      <Section title={'Dashboard'}>
        <div className='flex flex-col'>
          <div className='font-semibold text-lg my-5'>Date: {date.toDateString()}</div>

          {role === 2 && (
            <>
              <div className="mb-4 border-b border-gray-300">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                  <button
                    className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'schedule' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                    onClick={() => setActiveTab('schedule')}
                  >
                    My Schedule
                  </button>
                </nav>
              </div>

              {activeTab === 'schedule' && (
                <div className="mb-4">
                  <label htmlFor="viewMode" className="mr-2 font-medium">View Mode:</label>
                  <select
                    id="viewMode"
                    value={viewMode}
                    onChange={(e) => setViewMode(e.target.value)}
                    className="border rounded px-2 py-1"
                  >
                    <option value="tabular">Tabular</option>
                    <option value="calendar">Calendar</option>
                  </select>
                </div>
              )}
            </>
          )}

          {/* Tabular View */}
          {role === 2 && activeTab === 'schedule' && viewMode === 'tabular' && (
            <div className="overflow-scroll max-w-[70vw] max-h-[80vh]">
              <h2 className="h2">My Schedule</h2>
              <table className="table-basic">
                <thead>
                  <tr>
                    {columns.map((col, index) => (
                      <th key={index}>{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {schedule.map((item, idx) => (
                    <tr key={idx}>
                      {columns.map((col, index) => (
                        <td key={index}>{item[col]}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              {schedule.length === 0 && <div className="mt-5 text-center text-lg">No data to display</div>}
            </div>
          )}

          {/* Calendar View */}
          {role === 2 && activeTab === 'schedule' && viewMode === 'calendar' && (
            <div className="mb-4">
              <h2 className="h2 mb-4">My Schedule - Calendar View</h2>

              <div className="mb-4 flex items-center justify-between">
                <label htmlFor="calendarView" className="mr-2 font-medium">Calendar View:</label>
                <select
                  id="calendarView"
                  value={calendarView}
                  onChange={(e) => setCalendarView(e.target.value)}
                  className="border rounded px-2 py-1"
                >
                  <option value="dayGridMonth">Month</option>
                  <option value="timeGridWeek">Week</option>
                </select>
              </div>

              <FullCalendar
                ref={calendarRef}
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                initialView={calendarView}
                events={events}
                dateClick={handleDateClick}
                eventClick={handleEventClick}
                eventContent={renderEventContent}
                height="auto"
                allDaySlot={false}
              />
            </div>
          )}

          {/* Selected Event Info */}
          {selectedEvent && (
            <div className="mb-4 p-4 border rounded bg-gray-100">
              <h3 className="font-semibold">Selected Event</h3>
              <p><strong>Title:</strong> {selectedEvent.title}</p>
              <p><strong>Date:</strong> {new Date(selectedEvent.date).toLocaleString()}</p>
              <button
                className="mt-2 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                onClick={() => setSelectedEvent(null)}
              >
                Close
              </button>
            </div>
          )}

          <AnnounceContent className='!p-0' hideUsername={true} />
        </div>
      </Section>
    </Layout>
  )
}

export default Dashboard
