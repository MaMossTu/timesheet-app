"use client";

import { useState, useRef } from "react";
import { Clock, Calendar, List, Plus, Download } from "lucide-react";
import { TimeTrackingCalendar } from "../components/TimeTrackingCalendar";
import { TimeEntryForm } from "../components/TimeEntryForm";

export default function Home() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [formInitialData, setFormInitialData] = useState<any | undefined>(
    undefined
  );
  const [timeEntries, setTimeEntries] = useState<any[]>([]);
  const [currentView, setCurrentView] = useState("dayGridMonth");
  const [viewMode, setViewMode] = useState<"calendar" | "list">("calendar");
  const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth());
  const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());
  const calendarRef = useRef<any>(null);

  // Calendar navigation functions
  const handleCalendarDateChange = (year: number, month: number) => {
    setCalendarYear(year);
    setCalendarMonth(month);
    const api = calendarRef.current?.getApi();
    if (api) {
      api.gotoDate(new Date(year, month, 1));
    }
  };

  const handleToday = () => {
    const today = new Date();
    setCalendarMonth(today.getMonth());
    setCalendarYear(today.getFullYear());
    calendarRef.current?.today();
  };

  const handleViewChange = (view: string) => {
    setCurrentView(view);
    calendarRef.current?.changeView(view);
  };

  // Function to calculate working hours excluding lunch break (12:00-13:00)
  const calculateWorkingHours = (startTime: Date, endTime: Date) => {
    const start = new Date(startTime);
    const end = new Date(endTime);

    // Get total hours first
    let totalHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);

    // Create lunch break times for the same date as work start
    const lunchStart = new Date(start);
    lunchStart.setHours(12, 0, 0, 0);
    const lunchEnd = new Date(start);
    lunchEnd.setHours(13, 0, 0, 0);

    // Check if working time overlaps with lunch break (12:00-13:00)
    const lunchStartTime = lunchStart.getTime();
    const lunchEndTime = lunchEnd.getTime();

    // If work time overlaps with lunch break, subtract the overlapping time
    if (start.getTime() < lunchEndTime && end.getTime() > lunchStartTime) {
      const overlapStart = Math.max(start.getTime(), lunchStartTime);
      const overlapEnd = Math.min(end.getTime(), lunchEndTime);
      const lunchHours = (overlapEnd - overlapStart) / (1000 * 60 * 60);
      totalHours -= Math.max(0, lunchHours);
    }

    return Math.max(0, totalHours);
  };

  // Calculate monthly hours for current month
  const monthlyTarget = 160;
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const monthlyHours = timeEntries
    .filter((entry) => {
      const entryDate = new Date(entry.startTime);
      return (
        entryDate.getMonth() === currentMonth &&
        entryDate.getFullYear() === currentYear
      );
    })
    .reduce((total, entry) => {
      if (entry.startTime && entry.endTime) {
        const hours = calculateWorkingHours(
          new Date(entry.startTime),
          new Date(entry.endTime)
        );
        return total + hours;
      }
      return total;
    }, 0);

  const isTargetMet = monthlyHours >= monthlyTarget;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Minimal Header */}
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
              <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
            </div>
            <h1 className="text-lg sm:text-xl font-semibold text-gray-900">
              Timesheet
            </h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
        {/* Monthly Hours Card - Minimal Design */}
        <div className="mb-4 sm:mb-8">
          <div
            className={`bg-white rounded-xl p-4 sm:p-6 border-l-4 ${
              isTargetMet ? "border-emerald-500" : "border-red-500"
            } shadow-sm`}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="text-xs sm:text-sm font-medium text-gray-600 mb-2">
                  Monthly Progress
                </h3>
                <div className="flex items-baseline space-x-1 sm:space-x-2">
                  <span className="text-2xl sm:text-3xl font-bold text-gray-900">
                    {Math.round(monthlyHours)}
                  </span>
                  <span className="text-base sm:text-lg text-gray-500">
                    / {monthlyTarget}h
                  </span>
                </div>
              </div>
              <div
                className={`w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center ${
                  isTargetMet ? "bg-emerald-100" : "bg-red-100"
                }`}
              >
                <Clock
                  className={`h-6 w-6 sm:h-8 sm:w-8 ${
                    isTargetMet ? "text-emerald-600" : "text-red-600"
                  }`}
                />
              </div>
            </div>
            <div className="mt-3 sm:mt-4">
              <div className="w-full bg-gray-200 rounded-full h-1.5 sm:h-2">
                <div
                  className={`h-1.5 sm:h-2 rounded-full transition-all duration-300 ${
                    isTargetMet ? "bg-emerald-500" : "bg-red-500"
                  }`}
                  style={{
                    width: `${Math.min(
                      (monthlyHours / monthlyTarget) * 100,
                      100
                    )}%`,
                  }}
                ></div>
              </div>
              <p className="text-xs sm:text-sm text-gray-600 mt-2">
                {isTargetMet
                  ? "🎉 Target reached!"
                  : `${monthlyTarget - Math.round(monthlyHours)}h remaining`}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                * Lunch break (12:00-13:00) excluded from calculation
              </p>
            </div>
          </div>
        </div>

        {/* Calendar/List Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          {/* Header */}
          <div className="p-3 sm:p-6 border-b border-gray-100">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-3 sm:mb-4">
              <div className="flex items-center gap-3">
                <h2 className="text-base sm:text-lg font-semibold text-gray-900">
                  Time Sheet
                </h2>
                <div className="flex bg-gray-100 rounded-lg p-0.5">
                  <button
                    onClick={() => setViewMode("calendar")}
                    className={`px-2 py-1 sm:px-3 sm:py-1.5 text-xs sm:text-sm font-medium font-inter tracking-tight rounded-md transition-colors flex items-center gap-1 ${
                      viewMode === "calendar"
                        ? "bg-white text-black shadow-sm"
                        : "text-gray-700 hover:text-black"
                    }`}
                  >
                    <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                    Calendar
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`px-2 py-1 sm:px-3 sm:py-1.5 text-xs sm:text-sm font-medium font-inter tracking-tight rounded-md transition-colors flex items-center gap-1 ${
                      viewMode === "list"
                        ? "bg-white text-black shadow-sm"
                        : "text-gray-700 hover:text-black"
                    }`}
                  >
                    <List className="h-3 w-3 sm:h-4 sm:w-4" />
                    List
                  </button>
                </div>
              </div>

              {viewMode === "calendar" && (
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    type="month"
                    value={`${calendarYear}-${(calendarMonth + 1)
                      .toString()
                      .padStart(2, "0")}`}
                    onChange={(e) => {
                      const [year, month] = e.target.value.split("-");
                      handleCalendarDateChange(
                        parseInt(year),
                        parseInt(month) - 1
                      );
                    }}
                    className="px-2 py-1.5 sm:px-3 sm:py-2 border border-gray-300 rounded-lg font-inter font-medium tracking-tight text-black text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <div className="flex bg-gray-100 rounded-lg p-0.5 sm:p-1">
                    <button
                      onClick={() => handleViewChange("timeGridWeek")}
                      className={`px-2 py-1 sm:px-3 sm:py-1.5 text-xs sm:text-sm font-medium font-inter tracking-tight rounded-md transition-colors ${
                        currentView === "timeGridWeek"
                          ? "bg-white text-black shadow-sm"
                          : "text-gray-700 hover:text-black"
                      }`}
                    >
                      Week
                    </button>
                    <button
                      onClick={() => handleViewChange("dayGridMonth")}
                      className={`px-2 py-1 sm:px-3 sm:py-1.5 text-xs sm:text-sm font-medium font-inter tracking-tight rounded-md transition-colors ${
                        currentView === "dayGridMonth"
                          ? "bg-white text-black shadow-sm"
                          : "text-gray-700 hover:text-black"
                      }`}
                    >
                      Month
                    </button>
                  </div>
                  <button
                    onClick={handleToday}
                    className="px-2 py-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm font-medium font-inter tracking-tight text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 rounded-lg transition-colors"
                  >
                    Today
                  </button>
                  <button
                    onClick={() => {
                      console.log("Export button clicked");
                      setIsPreviewOpen(true);
                    }}
                    className="px-2 py-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm font-medium font-inter tracking-tight text-blue-700 hover:bg-blue-50 hover:text-blue-800 rounded-lg transition-colors border border-blue-300"
                  >
                    📄 Export Template
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Content Body */}
          {viewMode === "calendar" ? (
            <div className="h-[400px] sm:h-[500px] p-2 sm:p-4 overflow-hidden">
              <TimeTrackingCalendar
                ref={calendarRef}
                currentView={currentView}
                timeEntries={timeEntries}
                onDateSelect={(start: Date, end: Date) => {
                  const selectedDate = new Date(start);
                  selectedDate.setHours(0, 0, 0, 0);

                  const existingEntry = timeEntries.find((entry) => {
                    const entryDate = new Date(entry.startTime);
                    entryDate.setHours(0, 0, 0, 0);
                    return entryDate.getTime() === selectedDate.getTime();
                  });

                  if (existingEntry) {
                    alert(
                      "วันนี้มีการบันทึกเวลาแล้ว กรุณาคลิกที่รายการเพื่อแก้ไข"
                    );
                    return;
                  }

                  // เพิ่มใหม่ด้วยเวลา 9:00-18:00
                  const startDate = new Date(start);
                  startDate.setHours(9, 0, 0, 0);
                  const endDate = new Date(start);
                  endDate.setHours(18, 0, 0, 0);
                  setFormInitialData({
                    startTime: startDate,
                    endTime: endDate,
                  });
                  setIsFormOpen(true);
                }}
                onEventClick={(entry: any) => {
                  setFormInitialData(entry);
                  setIsFormOpen(true);
                }}
              />
            </div>
          ) : (
            <div className="p-3 sm:p-6">
              {timeEntries.length === 0 ? (
                <div className="text-center py-8 sm:py-12">
                  <Clock className="h-10 w-10 sm:h-12 sm:w-12 text-gray-300 mx-auto mb-3 sm:mb-4" />
                  <p className="text-gray-600 text-base sm:text-lg mb-2">
                    No time entries yet
                  </p>
                  <p className="text-gray-500 text-sm mb-4 sm:mb-6 px-2">
                    Start tracking your time by adding your first entry
                  </p>
                  <button
                    onClick={() => setIsFormOpen(true)}
                    className="inline-flex items-center px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors text-sm font-medium"
                  >
                    Add Entry
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {timeEntries
                    .sort(
                      (a, b) =>
                        new Date(b.startTime).getTime() -
                        new Date(a.startTime).getTime()
                    )
                    .map((entry) => (
                      <div
                        key={entry.id}
                        onClick={() => {
                          setFormInitialData(entry);
                          setIsFormOpen(true);
                        }}
                        className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors border border-gray-200"
                      >
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900 text-sm sm:text-base">
                            {entry.title}
                          </h3>
                          <div className="flex items-center gap-4 text-xs sm:text-sm text-gray-600 mt-1">
                            <span>
                              {new Date(entry.startTime).toLocaleDateString(
                                "en-US",
                                {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                }
                              )}
                            </span>
                            <span>
                              {new Date(entry.startTime).toLocaleTimeString(
                                "en-US",
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  hour12: false,
                                }
                              )}{" "}
                              -{" "}
                              {new Date(entry.endTime).toLocaleTimeString(
                                "en-US",
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  hour12: false,
                                }
                              )}
                            </span>
                            <span className="font-medium">
                              {Math.round(
                                calculateWorkingHours(
                                  new Date(entry.startTime),
                                  new Date(entry.endTime)
                                ) * 100
                              ) / 100}
                              h
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Floating Action Button - Only show in list mode */}
      {viewMode === "list" && (
        <button
          onClick={() => setIsFormOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center z-50"
        >
          <Plus className="h-6 w-6" />
        </button>
      )}

      {/* Time Entry Form Modal */}
      {isFormOpen && (
        <TimeEntryForm
          isOpen={isFormOpen}
          onClose={() => {
            setIsFormOpen(false);
            setFormInitialData(undefined);
          }}
          onSubmit={(data: any) => {
            setTimeEntries([
              ...timeEntries,
              {
                ...data,
                id: Date.now().toString(),
                project: { name: "", color: "#3B82F6" },
              },
            ]);
            setIsFormOpen(false);
            setFormInitialData(undefined);
          }}
          initialData={formInitialData}
          existingEntries={timeEntries}
        />
      )}

      {/* Template Preview Modal */}
      {isPreviewOpen && (
        <TemplatePreviewModal
          isOpen={isPreviewOpen}
          onClose={() => setIsPreviewOpen(false)}
          timeEntries={timeEntries}
          selectedMonth={calendarMonth}
          selectedYear={calendarYear}
        />
      )}
    </div>
  );
}

function TemplatePreviewModal({
  isOpen,
  onClose,
  timeEntries,
  selectedMonth,
  selectedYear,
}: {
  isOpen: boolean;
  onClose: () => void;
  timeEntries: any[];
  selectedMonth: number;
  selectedYear: number;
}) {
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const calculateWorkingHours = (startTime: Date, endTime: Date) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    let totalHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);

    const lunchStart = new Date(start);
    lunchStart.setHours(12, 0, 0, 0);
    const lunchEnd = new Date(start);
    lunchEnd.setHours(13, 0, 0, 0);

    const lunchStartTime = lunchStart.getTime();
    const lunchEndTime = lunchEnd.getTime();

    if (start.getTime() < lunchEndTime && end.getTime() > lunchStartTime) {
      const overlapStart = Math.max(start.getTime(), lunchStartTime);
      const overlapEnd = Math.min(end.getTime(), lunchEndTime);
      const lunchHours = (overlapEnd - overlapStart) / (1000 * 60 * 60);
      totalHours -= Math.max(0, lunchHours);
    }

    return Math.max(0, totalHours);
  };

  // Filter entries for selected month/year
  const filteredEntries = timeEntries.filter((entry) => {
    const entryDate = new Date(entry.startTime);
    return (
      entryDate.getMonth() === selectedMonth &&
      entryDate.getFullYear() === selectedYear
    );
  });

  // Sort entries by date
  const sortedEntries = filteredEntries.sort(
    (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
  );

  const totalHours = sortedEntries.reduce((total, entry) => {
    if (entry.startTime && entry.endTime) {
      return (
        total +
        calculateWorkingHours(
          new Date(entry.startTime),
          new Date(entry.endTime)
        )
      );
    }
    return total;
  }, 0);

  const generateCSV = () => {
    // Create exactly like the sample spreadsheet format
    let csvContent = "";
    
    // Top header (filename)
    csvContent += "timesheet_" + monthNames[selectedMonth] + "_" + selectedYear + " (" + sortedEntries.length + ")\n";
    csvContent += "\n"; // Empty row
    csvContent += "TIMESHEET\n";
    csvContent += "\n"; // Empty row
    
    // NAME and PERIOD row - using commas for proper CSV columns
    csvContent += "NAME: Kittapath Sangvikulkit,,,,,PERIOD: 1 " + monthNames[selectedMonth] + " " + selectedYear + " - 30 " + monthNames[selectedMonth] + " " + selectedYear + "\n";
    csvContent += "\n"; // Empty row
    
    // Table headers
    csvContent += "Date,Start Time,End Time,Regular Hours,Overtime Hours,Total Hours,Tasks,Remarks\n";
    
    // Data rows
    sortedEntries.forEach((entry) => {
      const date = new Date(entry.startTime);
      const formattedDate = String(date.getDate()).padStart(2, '0') + '/' + 
                           String(date.getMonth() + 1).padStart(2, '0') + '/' + 
                           date.getFullYear();
      const hours = calculateWorkingHours(new Date(entry.startTime), new Date(entry.endTime));
      
      csvContent += formattedDate + ",09:00,18:00,,," + Math.floor(hours) + "," + entry.title + ",\n";
    });
    
    // Add empty rows to match the sample layout
    const totalRows = 20;
    const emptyRowsNeeded = Math.max(0, totalRows - sortedEntries.length);
    for (let i = 0; i < emptyRowsNeeded; i++) {
      csvContent += ",,,,,,,\n";
    }
    
    // Total row
    csvContent += ",,,,," + Math.floor(totalHours) + ",,\n";
    csvContent += "\n"; // Empty row
    
    // Signature section
    csvContent += "Employee กฤติกาล์,แก้วกาล์ใส,,,Approved by,\n";
    csvContent += "( Mr. Kittapath Sangvikulkit ),,,( Mr. Autapong Budhsombatwaraku ),\n";
    csvContent += "\n"; // Empty row  
    csvContent += "Date,25/10/2025,,,Date,25/10/2025\n";

    // Create and download
    const blob = new Blob(["\ufeff" + csvContent], { 
      type: "text/csv;charset=utf-8;" 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `timesheet_${monthNames[selectedMonth]}_${selectedYear}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

// Template Preview Modal Component
function TemplatePreviewModal({
  isOpen,
  onClose,
  timeEntries,
  selectedMonth,
  selectedYear,
}: {
  isOpen: boolean;
  onClose: () => void;
  timeEntries: any[];
  selectedMonth: number;
  selectedYear: number;
}) {
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const calculateWorkingHours = (startTime: Date, endTime: Date) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    let totalHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);

    const lunchStart = new Date(start);
    lunchStart.setHours(12, 0, 0, 0);
    const lunchEnd = new Date(start);
    lunchEnd.setHours(13, 0, 0, 0);

    const lunchStartTime = lunchStart.getTime();
    const lunchEndTime = lunchEnd.getTime();

    if (start.getTime() < lunchEndTime && end.getTime() > lunchStartTime) {
      const overlapStart = Math.max(start.getTime(), lunchStartTime);
      const overlapEnd = Math.min(end.getTime(), lunchEndTime);
      const lunchHours = (overlapEnd - overlapStart) / (1000 * 60 * 60);
      totalHours -= Math.max(0, lunchHours);
    }

    return Math.max(0, totalHours);
  };

  // Filter entries for selected month/year
  const filteredEntries = timeEntries.filter((entry) => {
    const entryDate = new Date(entry.startTime);
    return (
      entryDate.getMonth() === selectedMonth &&
      entryDate.getFullYear() === selectedYear
    );
  });

  // Sort entries by date
  const sortedEntries = filteredEntries.sort((a, b) => 
    new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
  );

  const totalHours = sortedEntries.reduce((total, entry) => {
    if (entry.startTime && entry.endTime) {
      return total + calculateWorkingHours(new Date(entry.startTime), new Date(entry.endTime));
    }
    return total;
  }, 0);

  const generateCSV = () => {
    // Create exactly like the sample spreadsheet format
    let csvContent = "";
    
    // Top header (filename)
    csvContent += "timesheet_" + monthNames[selectedMonth] + "_" + selectedYear + " (" + sortedEntries.length + ")\n";
    csvContent += "\n"; // Empty row
    csvContent += "TIMESHEET\n";
    csvContent += "\n"; // Empty row
    
    // NAME and PERIOD row - using commas for proper CSV columns
    csvContent += "NAME: Kittapath Sangvikulkit,,,,,PERIOD: 1 " + monthNames[selectedMonth] + " " + selectedYear + " - 30 " + monthNames[selectedMonth] + " " + selectedYear + "\n";
    csvContent += "\n"; // Empty row
    
    // Table headers
    csvContent += "Date,Start Time,End Time,Regular Hours,Overtime Hours,Total Hours,Tasks,Remarks\n";
    
    // Data rows
    sortedEntries.forEach((entry) => {
      const date = new Date(entry.startTime);
      const formattedDate = String(date.getDate()).padStart(2, '0') + '/' + 
                           String(date.getMonth() + 1).padStart(2, '0') + '/' + 
                           date.getFullYear();
      const hours = calculateWorkingHours(new Date(entry.startTime), new Date(entry.endTime));
      
      csvContent += formattedDate + ",09:00,18:00,,," + Math.floor(hours) + "," + entry.title + ",\n";
    });
    
    // Add empty rows to match the sample layout
    const totalRows = 20;
    const emptyRowsNeeded = Math.max(0, totalRows - sortedEntries.length);
    for (let i = 0; i < emptyRowsNeeded; i++) {
      csvContent += ",,,,,,,\n";
    }
    
    // Total row
    csvContent += ",,,,," + Math.floor(totalHours) + ",,\n";
    csvContent += "\n"; // Empty row
    
    // Signature section
    csvContent += "Employee กฤติกาล์,แก้วกาล์ใส,,,Approved by,\n";
    csvContent += "( Mr. Kittapath Sangvikulkit ),,,( Mr. Autapong Budhsombatwaraku ),\n";
    csvContent += "\n"; // Empty row  
    csvContent += "Date,25/10/2025,,,Date,25/10/2025\n";

    // Create and download
    const blob = new Blob(["\ufeff" + csvContent], { 
      type: "text/csv;charset=utf-8;" 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `timesheet_${monthNames[selectedMonth]}_${selectedYear}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-5xl max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900">
              Timesheet Template Preview - {monthNames[selectedMonth]}{" "}
              {selectedYear}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-lg hover:bg-gray-100"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <div className="border-2 border-gray-800 bg-white shadow-lg">
            {/* Header with NAME and PERIOD */}
            <div className="border-b-2 border-gray-800 p-4 bg-gray-50">
              <div className="text-center mb-4">
                <h3 className="text-xl font-bold tracking-wider text-gray-800">
                  TIMESHEET
                </h3>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm text-gray-700">
                <div>
                  <span className="font-bold">NAME: </span>
                  <span className="underline decoration-2">
                    Kittapath Sangvikulkit
                  </span>
                </div>
                <div>
                  <span className="font-bold">PERIOD: </span>
                  <span>
                    1 {monthNames[selectedMonth]} {selectedYear} -{" "}
                    {new Date(selectedYear, selectedMonth + 1, 0).getDate()}{" "}
                    {monthNames[selectedMonth]} {selectedYear}
                  </span>
                </div>
              </div>
            </div>

            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-gray-200">
                  <th className="border border-gray-800 p-2 text-center font-bold w-20 text-gray-800">
                    Date
                  </th>
                  <th className="border border-gray-800 p-2 text-center font-bold w-20 text-gray-800">
                    Start Time
                  </th>
                  <th className="border border-gray-800 p-2 text-center font-bold w-20 text-gray-800">
                    End Time
                  </th>
                  <th className="border border-gray-800 p-2 text-center font-bold w-20 text-gray-800">
                    Regular Hours
                  </th>
                  <th className="border border-gray-800 p-2 text-center font-bold w-20 text-gray-800">
                    Overtime Hours
                  </th>
                  <th className="border border-gray-800 p-2 text-center font-bold w-20 text-gray-800">
                    Total Hours
                  </th>
                  <th className="border border-gray-800 p-2 text-center font-bold text-gray-800">
                    Tasks
                  </th>
                  <th className="border border-gray-800 p-2 text-center font-bold text-gray-800">
                    Remarks
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedEntries.map((entry, index) => {
                  const date = new Date(entry.startTime);
                  const startTime = new Date(entry.startTime);
                  const endTime = new Date(entry.endTime);
                  const hours = calculateWorkingHours(startTime, endTime);

                  return (
                    <tr
                      key={index}
                      className="even:bg-gray-50 hover:bg-blue-50 transition-colors"
                    >
                      <td className="border border-gray-800 p-1 text-center text-xs text-gray-700">
                        {date.toLocaleDateString("en-GB")}
                      </td>
                      <td className="border border-gray-800 p-1 text-center text-xs text-gray-700">
                        {startTime.toLocaleTimeString("en-GB", {
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: false,
                        })}
                      </td>
                      <td className="border border-gray-800 p-1 text-center text-xs text-gray-700">
                        {endTime.toLocaleTimeString("en-GB", {
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: false,
                        })}
                      </td>
                      <td className="border border-gray-800 p-1 text-center text-xs text-gray-400"></td>
                      <td className="border border-gray-800 p-1 text-center text-xs text-gray-400"></td>
                      <td className="border border-gray-800 p-1 text-center text-xs font-bold text-blue-600">
                        {Math.floor(hours)}
                      </td>
                      <td className="border border-gray-800 p-1 text-xs text-gray-700">
                        {entry.title}
                      </td>
                      <td className="border border-gray-800 p-1 text-xs text-gray-600">
                        {entry.description || ""}
                      </td>
                    </tr>
                  );
                })}
                {/* Empty rows to fill space like the template */}
                {Array.from({
                  length: Math.max(0, 10 - sortedEntries.length),
                }).map((_, index) => (
                  <tr key={`empty-${index}`} className="even:bg-gray-50">
                    <td className="border border-gray-800 p-1 text-center text-xs h-6"></td>
                    <td className="border border-gray-800 p-1 text-center text-xs"></td>
                    <td className="border border-gray-800 p-1 text-center text-xs"></td>
                    <td className="border border-gray-800 p-1 text-center text-xs"></td>
                    <td className="border border-gray-800 p-1 text-center text-xs"></td>
                    <td className="border border-gray-800 p-1 text-center text-xs"></td>
                    <td className="border border-gray-800 p-1 text-xs"></td>
                    <td className="border border-gray-800 p-1 text-xs"></td>
                  </tr>
                ))}
                <tr className="bg-emerald-50">
                  <td
                    className="border-t-2 border-gray-800 p-1 text-center text-xs font-bold text-gray-800"
                    colSpan={5}
                  >
                    Total
                  </td>
                  <td className="border-t-2 border-gray-800 border-l border-r border-b p-1 text-center text-xs font-bold text-emerald-700 bg-emerald-100">
                    {Math.floor(totalHours)}
                  </td>
                  <td
                    className="border-t-2 border-gray-800 border-l border-r border-b p-1 text-xs"
                    colSpan={2}
                  ></td>
                </tr>
              </tbody>
            </table>

            {/* Signature Section */}
            <div className="mt-8 p-4 bg-gray-50 grid grid-cols-2 gap-8 border-t border-gray-300">
              <div className="text-sm text-gray-700">
                <p className="mb-4">
                  <span className="font-bold text-gray-800">Employee: </span>
                  <span className="underline decoration-dotted text-blue-600">
                    กฤติกาล์
                  </span>
                  <span className="ml-4 underline decoration-dotted text-blue-600">
                    แก้วกาล์ใส
                  </span>
                </p>
                <p className="mb-8 ml-8 text-gray-600">
                  ({" "}
                  <span className="underline decoration-dotted text-blue-600">
                    Mr. Kittapath Sangvikulkit
                  </span>{" "}
                  )
                </p>
                <p className="text-gray-600">
                  <span className="font-bold text-gray-800">Date</span>
                  <span className="underline decoration-dotted ml-4 text-gray-700">
                    25/10/2025
                  </span>
                </p>
              </div>
              <div className="text-sm text-gray-700">
                <p className="mb-4">
                  <span className="font-bold text-gray-800">Approved by </span>
                  <span className="underline decoration-dotted ml-4 text-gray-500">
                    _________________
                  </span>
                </p>
                <p className="mb-8 ml-8 text-gray-600">
                  ({" "}
                  <span className="underline decoration-dotted text-gray-500">
                    Mr. _______________
                  </span>{" "}
                  )
                </p>
                <p className="text-gray-600">
                  <span className="font-bold text-gray-800">Date</span>
                  <span className="underline decoration-dotted ml-4 text-gray-700">
                    25/10/2025
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 flex justify-end gap-3 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={generateCSV}
            className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Download CSV
          </button>
        </div>
      </div>
    </div>
  );
}
