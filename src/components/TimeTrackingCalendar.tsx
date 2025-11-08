"use client";

import { useState, useRef, useImperativeHandle, forwardRef } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { getThaiHolidays, getHolidayColor } from "../lib/thaiHolidays";

interface TimeEntry {
  id: string;
  userId: string;
  title: string;
  description?: string;
  startTime: string;
  endTime?: string;
  date: string;
}

interface TimeTrackingCalendarProps {
  timeEntries: TimeEntry[];
  onDateClick?: (date: Date) => void;
  onEventClick?: (entry: TimeEntry) => void;
  currentView?: string;
  onViewChange?: (view: string) => void;
  onDateChange?: (year: number, month: number) => void;
  onToday?: () => void;
  initialDate?: Date;
}

export const TimeTrackingCalendar = forwardRef<any, TimeTrackingCalendarProps>(
  (
    {
      timeEntries,
      onDateClick,
      onEventClick,
      currentView = "dayGridMonth",
      initialDate,
    },
    ref
  ) => {
    const calendarRef = useRef<FullCalendar>(null);
    const [currentCalendarYear, setCurrentCalendarYear] = useState(
      new Date().getFullYear()
    );

    useImperativeHandle(ref, () => ({
      getApi: () => calendarRef.current?.getApi(),
      next: () => calendarRef.current?.getApi().next(),
      prev: () => calendarRef.current?.getApi().prev(),
      today: () => calendarRef.current?.getApi().today(),
      changeView: (view: string) =>
        calendarRef.current?.getApi().changeView(view),
    }));

    // Handle when calendar view changes to update holidays
    const handleDatesSet = (dateInfo: any) => {
      const calendarYear = dateInfo.start.getFullYear();
      setCurrentCalendarYear(calendarYear);

      // Just update the internal state for holidays, no need to call parent
    };
    // Define better color palette for events with modern gradients
    const eventColors = [
      { bg: "#6366f1", border: "#4f46e5" }, // Indigo
      { bg: "#8b5cf6", border: "#7c3aed" }, // Violet
      { bg: "#10b981", border: "#059669" }, // Emerald
      { bg: "#f59e0b", border: "#d97706" }, // Amber
      { bg: "#ef4444", border: "#dc2626" }, // Red
      { bg: "#06b6d4", border: "#0891b2" }, // Cyan
      { bg: "#84cc16", border: "#65a30d" }, // Lime
      { bg: "#ec4899", border: "#db2777" }, // Pink
    ];

    // Get current year for holidays - use calendar year instead of system year
    const thaiHolidays = getThaiHolidays(currentCalendarYear);

    // Function to calculate working hours (excluding lunch break 12:00-13:00)
    const calculateWorkingHours = (
      startTime: string,
      endTime?: string
    ): number => {
      if (!endTime) return 0;

      const start = new Date(startTime);
      const end = new Date(endTime);

      // Get hours and minutes
      const startHour = start.getHours();
      const startMinute = start.getMinutes();
      const endHour = end.getHours();
      const endMinute = end.getMinutes();

      // Calculate total time in hours
      const diffMs = end.getTime() - start.getTime();
      let diffHours = diffMs / (1000 * 60 * 60);

      // Check if lunch break (12:00-13:00) overlaps with working time
      const lunchStart = 12; // 12:00
      const lunchEnd = 13; // 13:00

      // If work time spans across lunch break, subtract 1 hour
      if (
        (startHour < lunchEnd && endHour > lunchStart) ||
        (startHour === lunchStart &&
          startMinute === 0 &&
          endHour > lunchStart) ||
        (startHour < lunchEnd && endHour === lunchEnd && endMinute === 0)
      ) {
        diffHours = Math.max(0, diffHours - 1); // Subtract lunch break hour
      }

      return Math.max(0, Math.round(diffHours * 100) / 100); // Round to 2 decimal places
    };

    // Convert time entries to calendar events
    const timeEvents = timeEntries.map((entry, index) => {
      const colorIndex = index % eventColors.length;
      const colors = eventColors[colorIndex];

      // Calculate hours for this entry
      const hours = calculateWorkingHours(entry.startTime, entry.endTime);
      const hoursText = hours > 0 ? `(${hours}hrs) ` : "";

      return {
        id: entry.id,
        title: `${hoursText}${entry.title}`,
        date: entry.date, // Use the date field from TimeEntry
        allDay: true, // Make it all-day to hide time
        backgroundColor: colors.bg,
        borderColor: colors.border,
        textColor: "#ffffff",
        extendedProps: {
          entry,
          type: "timeEntry",
          hours: hours,
        },
      };
    });

    // Convert Thai holidays to calendar events
    const holidayEvents = thaiHolidays.map((holiday) => ({
      id: `holiday-${holiday.date}`,
      title: `🇹🇭 ${holiday.name}`,
      date: holiday.date,
      allDay: true,
      backgroundColor: getHolidayColor(holiday.type),
      borderColor: getHolidayColor(holiday.type),
      textColor: "#ffffff",
      classNames: ["thai-holiday"],
      extendedProps: {
        holiday,
        type: "holiday",
      },
    }));

    // Combine all events
    const events = [...timeEvents, ...holidayEvents];

    const handleDateClick = (info: any) => {
      console.log("Date clicked:", info.date);
      // Create a proper local date to avoid timezone issues
      const clickedDate = new Date(info.date);
      const localDate = new Date(
        clickedDate.getFullYear(),
        clickedDate.getMonth(),
        clickedDate.getDate()
      );
      console.log("Local date created:", localDate);
      if (onDateClick) {
        onDateClick(localDate);
      }
    };

    const handleDateSelect = (selectInfo: any) => {
      console.log("Date selected:", selectInfo.start);
      // Create a proper local date to avoid timezone issues
      const selectedDate = new Date(selectInfo.start);
      const localDate = new Date(
        selectedDate.getFullYear(),
        selectedDate.getMonth(),
        selectedDate.getDate()
      );
      console.log("Local date created:", localDate);
      if (onDateClick) {
        onDateClick(localDate);
      }
    };

    const handleEventClick = (clickInfo: any) => {
      console.log("Event clicked:", clickInfo.event);
      const eventType = clickInfo.event.extendedProps.type;

      if (eventType === "timeEntry") {
        if (onEventClick) {
          onEventClick(clickInfo.event.extendedProps.entry);
        }
      } else if (eventType === "holiday") {
        const holiday = clickInfo.event.extendedProps.holiday;
        // Show holiday info (could be expanded to show a modal)
        alert(
          `🇹🇭 ${holiday.name}\n${holiday.nameEn}\n\nประเภท: ${
            holiday.type === "royal"
              ? "วันสำคัญของพระมหากษัตริย์"
              : holiday.type === "religious"
              ? "วันสำคัญทางศาสนา"
              : holiday.type === "public"
              ? "วันหยุดราชการ"
              : "วันพิเศษ"
          }`
        );
      }
    };

    return (
      <div
        className="w-full calendar-container"
        style={{ height: "600px", overflow: "hidden" }}
      >
        <style jsx global>{`
          .fc {
            background: #ffffff;
            border-radius: 0.5rem;
            overflow: hidden;
          }
          .fc .fc-view-harness {
            height: 550px !important;
            overflow: hidden !important;
          }
          .fc .fc-scroller {
            overflow: hidden !important;
          }
          .fc .fc-daygrid-body {
            width: 100% !important;
          }
          .fc .fc-toolbar {
            margin-bottom: 1rem;
          }
          .fc .fc-toolbar-title {
            font-size: 1.25rem !important;
            font-weight: 700 !important;
            color: #1f2937 !important;
            text-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            background: linear-gradient(135deg, #6366f1, #8b5cf6);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            letter-spacing: 0.025em;
          }
          @media (min-width: 640px) {
            .fc .fc-toolbar-title {
              font-size: 1.5rem !important;
            }
          }
          .fc .fc-button-primary {
            background: linear-gradient(135deg, #6366f1, #8b5cf6);
            border-color: #6366f1;
            color: white;
            border-radius: 0.5rem;
            font-weight: 600;
            transition: all 0.3s ease;
            box-shadow: 0 2px 4px rgba(99, 102, 241, 0.2);
          }
          .fc .fc-button-primary:hover {
            background: linear-gradient(135deg, #4f46e5, #7c3aed);
            border-color: #4f46e5;
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
          }
          .fc .fc-button-primary:focus {
            box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.3);
          }
          .fc .fc-button-primary:disabled {
            background: #d1d5db;
            border-color: #d1d5db;
            transform: none;
          }
            font-weight: 600;
            font-size: 0.75rem;
            border-radius: 0.375rem;
            padding: 0.375rem 0.75rem;
          }
          @media (min-width: 640px) {
            .fc .fc-button-primary {
              font-size: 0.875rem;
              border-radius: 0.5rem;
              padding: 0.5rem 1rem;
            }
          }
          .fc .fc-button-primary:hover {
            background-color: #2563eb;
            border-color: #2563eb;
            transform: translateY(-1px);
            box-shadow: 0 4px 8px rgba(59, 130, 246, 0.3);
          }
          .fc .fc-button-primary:focus {
            box-shadow: 0 0 0 0.2rem rgba(59, 130, 246, 0.25);
          }
          .fc .fc-button-primary:not(:disabled):active {
            background-color: #1d4ed8;
            border-color: #1d4ed8;
          }
          .fc-theme-standard .fc-scrollgrid {
            border-color: #e5e7eb;
          }
          .fc-theme-standard td,
          .fc-theme-standard th {
            border-color: #e5e7eb;
          }
          .fc .fc-col-header-cell {
            background-color: #f8fafc;
            font-weight: 600;
            color: #374151;
            border-bottom: 2px solid #e5e7eb;
            font-size: 0.75rem;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            padding: 0.5rem 0.25rem;
          }
          @media (min-width: 640px) {
            .fc .fc-col-header-cell {
              font-size: 0.875rem;
              padding: 0.75rem 0.5rem;
            }
          }
          .fc .fc-daygrid-day {
            background-color: #ffffff;
            min-height: 50px;
          }
          @media (min-width: 640px) {
            .fc .fc-daygrid-day {
              min-height: 60px;
            }
          }
          .fc .fc-daygrid-day:hover {
            background-color: #f1f5f9;
          }
          .fc .fc-daygrid-day-frame {
            min-height: 50px;
          }
          @media (min-width: 640px) {
            .fc .fc-daygrid-day-frame {
              min-height: 60px;
            }
          }
          .fc .fc-scrollgrid-sync-table {
            height: 100% !important;
          }
          .fc .fc-day-today {
            background-color: #dbeafe !important;
          }
          .fc .fc-day-today .fc-daygrid-day-number {
            background-color: #3b82f6;
            color: white;
            border-radius: 50%;
            width: 1.5rem;
            height: 1.5rem;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 600;
            font-size: 0.75rem;
          }
          @media (min-width: 640px) {
            .fc .fc-day-today .fc-daygrid-day-number {
              width: 2rem;
              height: 2rem;
              font-size: 0.875rem;
            }
          }
          .fc .fc-daygrid-day-number {
            color: #374151;
            font-weight: 500;
            padding: 0.125rem;
            font-size: 0.75rem;
          }
          @media (min-width: 640px) {
            .fc .fc-daygrid-day-number {
              padding: 0.25rem;
              font-size: 0.875rem;
            }
          }
          .fc .fc-event {
            border-radius: 0.375rem;
            border: none;
            font-weight: 600;
            box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
          }
          .fc .fc-event:hover {
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            transform: translateY(-1px);
            transition: all 0.2s ease-in-out;
          }
          .fc .fc-event-title {
            color: white !important;
            font-weight: 600;
          }
          .fc .fc-more-link {
            background-color: #6366f1;
            color: white;
            border-radius: 0.25rem;
            font-weight: 500;
          }
          .fc .thai-holiday {
            font-size: 0.75rem !important;
            font-weight: 600 !important;
            border-radius: 0.5rem !important;
            border: 2px solid rgba(255, 255, 255, 0.3) !important;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2) !important;
            background-image: linear-gradient(
              45deg,
              rgba(255, 255, 255, 0.1) 25%,
              transparent 25%,
              transparent 75%,
              rgba(255, 255, 255, 0.1) 75%,
              rgba(255, 255, 255, 0.1)
            ) !important;
            background-size: 8px 8px !important;
          }
          .fc .thai-holiday:hover {
            transform: scale(1.02) !important;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3) !important;
          }
          .fc .thai-holiday .fc-event-title {
            text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.7) !important;
            font-weight: 700 !important;
          }

          /* Mobile responsive styles */
          @media (max-width: 640px) {
            .fc-toolbar {
              font-size: 0.8rem !important;
            }
            .fc-daygrid-day-number {
              font-size: 0.75rem !important;
              padding: 2px !important;
            }
            .fc-event {
              font-size: 0.7rem !important;
              margin-bottom: 1px !important;
            }
            .fc-event-title {
              padding: 1px 2px !important;
            }
            .fc-col-header-cell {
              padding: 4px 2px !important;
            }
            .fc-daygrid-day {
              min-height: 2rem !important;
              cursor: pointer !important;
              position: relative !important;
            }
            .fc-daygrid-day-frame {
              cursor: pointer !important;
              pointer-events: auto !important;
              position: relative !important;
              height: 100% !important;
              min-height: 2rem !important;
            }
            .fc-daygrid-day-number {
              cursor: pointer !important;
              pointer-events: auto !important;
            }
            .fc-daygrid-day-top {
              cursor: pointer !important;
              pointer-events: auto !important;
            }
            .fc-daygrid-day-bg {
              cursor: pointer !important;
              pointer-events: auto !important;
            }
            .fc-daygrid-day:hover {
              background-color: rgba(99, 102, 241, 0.1) !important;
            }
            .fc-daygrid-day:hover .fc-daygrid-day-frame {
              background-color: rgba(99, 102, 241, 0.05) !important;
            }
          }
        `}</style>
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          headerToolbar={false}
          initialView={currentView}
          initialDate={initialDate}
          editable={false}
          selectable={true}
          selectMirror={false}
          dayMaxEvents={1}
          weekends={true}
          events={events}
          dateClick={handleDateClick}
          select={handleDateSelect}
          eventClick={handleEventClick}
          datesSet={handleDatesSet}
          selectAllow={() => true}
          unselectAuto={false}
          height="auto"
          contentHeight="auto"
          aspectRatio={1.2}
          slotMinTime="06:00:00"
          slotMaxTime="22:00:00"
          allDaySlot={false}
          nowIndicator={true}
          eventDisplay="block"
          eventBackgroundColor="#10b981"
          eventBorderColor="#059669"
          eventTextColor="#ffffff"
          businessHours={{
            daysOfWeek: [1, 2, 3, 4, 5], // Monday - Friday
            startTime: "09:00",
            endTime: "17:00",
          }}
        />
      </div>
    );
  }
);
