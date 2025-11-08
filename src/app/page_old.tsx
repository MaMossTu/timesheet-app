"use client";

import { useState, useRef, useEffect } from "react";
import {
  Clock,
  Calendar,
  List,
  Plus,
  Download,
  LogOut,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Settings,
  Building2,
} from "lucide-react";
import { TimeTrackingCalendar } from "../components/TimeTrackingCalendar";
import { TimeEntryForm } from "../components/TimeEntryForm";
import { ProfileEditForm } from "../components/ProfileEditForm";
import { CompanyManagement } from "../components/CompanyManagement";
import { useAuth } from "../contexts/AuthContext";
import { useRouter } from "next/navigation";

export default function Home() {
  const {
    user,
    logout,
    isLoading,
    timeEntries,
    selectedCompany,
    selectCompany,
    addTimeEntry,
    updateTimeEntry,
    deleteTimeEntry,
    updateProfile,
    addCompany,
    updateCompany,
  } = useAuth();
  const router = useRouter();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isCompanyManagementOpen, setIsCompanyManagementOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [formInitialData, setFormInitialData] = useState<any | undefined>(
    undefined
  );
  const [currentView, setCurrentView] = useState("dayGridMonth");
  const [viewMode, setViewMode] = useState<"calendar" | "list">("calendar");
  const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth());
  const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());
  const calendarRef = useRef<any>(null);

  // Authentication check
  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  // Handle logout
  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  // Show loading if still checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">กำลังโหลด...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return null;
  }

  // Calendar navigation functions
  const handleCalendarDateChange = (year: number, month: number) => {
    // This function is kept for compatibility but not used to prevent loops
    setCalendarYear(year);
    setCalendarMonth(month);
  };

  const handlePrevMonth = () => {
    const api = calendarRef.current?.getApi();
    if (api) {
      api.prev();
      // Update state based on the new calendar position
      const currentDate = api.getDate();
      setCalendarMonth(currentDate.getMonth());
      setCalendarYear(currentDate.getFullYear());
    }
  };

  const handleNextMonth = () => {
    const api = calendarRef.current?.getApi();
    if (api) {
      api.next();
      // Update state based on the new calendar position
      const currentDate = api.getDate();
      setCalendarMonth(currentDate.getMonth());
      setCalendarYear(currentDate.getFullYear());
    }
  };

  const handleToday = () => {
    const api = calendarRef.current?.getApi();
    if (api) {
      api.today();
      const today = new Date();
      setCalendarMonth(today.getMonth());
      setCalendarYear(today.getFullYear());
    }
  };

  const handleMonthYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedDate = new Date(e.target.value + "-01");
    const api = calendarRef.current?.getApi();
    if (api) {
      api.gotoDate(selectedDate);
      setCalendarMonth(selectedDate.getMonth());
      setCalendarYear(selectedDate.getFullYear());
    }
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

  // Debug: Log timeEntries to check for duplicates
  console.log("All timeEntries:", timeEntries);
  console.log("TimeEntries count:", timeEntries.length);
  timeEntries.forEach((entry, index) => {
    console.log(`Entry ${index}:`, {
      id: entry.id,
      title: entry.title,
      date: entry.date,
      startTime: entry.startTime,
    });
  });

  // Check for and report duplicate entries by date
  const entriesByDate: { [key: string]: any[] } = {};
  timeEntries.forEach((entry) => {
    const entryDate =
      entry.date || new Date(entry.startTime).toISOString().split("T")[0];
    if (!entriesByDate[entryDate]) {
      entriesByDate[entryDate] = [];
    }
    entriesByDate[entryDate].push(entry);
  });

  Object.keys(entriesByDate).forEach((date) => {
    if (entriesByDate[date].length > 1) {
      console.warn(`Duplicate entries found for ${date}:`, entriesByDate[date]);
    }
  });

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

  const progress = (monthlyHours / monthlyTarget) * 100;
  const isTargetMet = monthlyHours >= monthlyTarget;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Simple Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo and Title */}
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Clock className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-xl font-semibold text-gray-900">
                Time Sheet
              </h1>
            </div>

            {/* Right Side Controls */}
            <div className="flex items-center space-x-3">
              {/* Company Selector */}
              {user?.companies && user.companies.length > 0 && (
                <select
                  value={selectedCompany?.id || ""}
                  onChange={(e) => selectCompany(e.target.value)}
                  className="px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700 cursor-pointer min-w-[160px]"
                >
                  <option value="" disabled>
                    เลือกบริษัท
                  </option>
                  {user.companies.map((company) => (
                    <option key={company.id} value={company.id}>
                      {company.name}
                    </option>
                  ))}
                </select>
              )}

              {/* User Info */}
              <div className="text-sm text-gray-600 hidden md:block">
                สวัสดี, {user?.name || user?.username || user?.email}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setIsCompanyManagementOpen(true)}
                  className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="จัดการบริษัท"
                >
                  <Building2 className="h-5 w-5" />
                </button>
                
                <button
                  onClick={() => setIsProfileOpen(true)}
                  className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="แก้ไขโปรไฟล์"
                >
                  <Settings className="h-5 w-5" />
                </button>
                
                <button
                  onClick={handleLogout}
                  className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="ออกจากระบบ"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-6">
        {/* Monthly Summary Card */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              ความคืบหน้าประจำเดือน
            </h2>
            <div className="text-sm text-gray-600">
              {new Date().toLocaleDateString('th-TH', { 
                year: 'numeric', 
                month: 'long' 
              })}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">
                  {monthlyHours.toFixed(1)} / {monthlyTarget} ชั่วโมง
                </span>
                <span className={`text-sm font-medium ${
                  isTargetMet ? "text-green-600" : "text-blue-600"
                }`}>
                  {progress.toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className={`h-3 rounded-full transition-all duration-500 ${
                    isTargetMet
                      ? "bg-green-500"
                      : progress > 75
                      ? "bg-orange-500"
                      : "bg-blue-500"
                  }`}
                  style={{ width: `${Math.min(progress, 100)}%` }}
                ></div>
              </div>
            </div>
            <div className="flex items-center justify-center">
              <div className={`text-2xl font-bold ${
                isTargetMet ? "text-green-600" : "text-gray-900"
              }`}>
                {isTargetMet ? "✓ เสร็จสิ้น" : `เหลืออีก ${(monthlyTarget - monthlyHours).toFixed(1)} ชม.`}
              </div>
            </div>
          </div>
        </div>
                <div
                  className={`text-2xl sm:text-3xl font-bold ${
                    isTargetMet ? "text-emerald-600" : "text-indigo-600"
                  }`}
                >
                  {monthlyHours.toFixed(1)}
                </div>
                <div className="text-sm text-gray-500">Hours this month</div>
              </div>
            </div>
          </div>
        </div>

        {/* Calendar/List Toggle and Add Button */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-6">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode("calendar")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                viewMode === "calendar"
                  ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md"
                  : "text-gray-600 hover:text-indigo-600 hover:bg-indigo-50"
              }`}
            >
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">Calendar</span>
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                viewMode === "list"
                  ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md"
                  : "text-gray-600 hover:text-indigo-600 hover:bg-indigo-50"
              }`}
            >
              <List className="h-4 w-4" />
              <span className="hidden sm:inline">List</span>
            </button>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => setIsPreviewOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg hover:from-emerald-600 hover:to-teal-700 transition-all duration-200 text-sm font-medium w-full sm:w-auto justify-center shadow-md hover:shadow-lg"
            >
              <Download className="h-4 w-4" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Content Area */}
        {viewMode === "calendar" ? (
          <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-indigo-100 overflow-hidden shadow-lg">
            {/* Custom Calendar Navigation Header */}
            <div className="border-b border-indigo-100 p-4 bg-gradient-to-r from-indigo-50 to-blue-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    onClick={handlePrevMonth}
                    className="p-2 text-white bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 hover:shadow-lg rounded-lg transition-all duration-200 border border-indigo-300"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={handleNextMonth}
                    className="p-2 text-white bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 hover:shadow-lg rounded-lg transition-all duration-200 border border-indigo-300"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  {/* Month/Year Picker as Button Style */}
                  <button
                    onClick={() => {
                      // Click to open the hidden month input
                      const monthInput = document.getElementById(
                        "month-picker"
                      ) as HTMLInputElement;
                      if (monthInput?.showPicker) {
                        monthInput.showPicker();
                      } else {
                        monthInput?.click();
                      }
                    }}
                    className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2 min-w-[160px] justify-center text-sm"
                  >
                    <span>📅</span>
                    <span>
                      {new Date(calendarYear, calendarMonth).toLocaleDateString(
                        "en-US",
                        { month: "long", year: "numeric" }
                      )}
                    </span>
                    <span className="text-xs opacity-75">▼</span>
                  </button>

                  {/* Hidden month input */}
                  <input
                    id="month-picker"
                    type="month"
                    value={`${calendarYear}-${String(
                      calendarMonth + 1
                    ).padStart(2, "0")}`}
                    onChange={(e) => {
                      const selectedDate = new Date(e.target.value + "-01");
                      setCalendarMonth(selectedDate.getMonth());
                      setCalendarYear(selectedDate.getFullYear());
                      const api = calendarRef.current?.getApi();
                      if (api) {
                        api.gotoDate(selectedDate);
                      }
                    }}
                    min="2020-01"
                    max="2030-12"
                    className="sr-only opacity-0 absolute -z-10"
                  />
                  <button
                    onClick={handleToday}
                    className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    Today
                  </button>
                </div>
              </div>
            </div>

            <TimeTrackingCalendar
              ref={calendarRef}
              timeEntries={timeEntries}
              onDateClick={(date: Date) => {
                console.log("Date received from calendar:", date);
                // Create proper date string without timezone issues
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, "0");
                const day = String(date.getDate()).padStart(2, "0");
                const dateString = `${year}-${month}-${day}`;
                console.log("Date string created:", dateString);

                // Create a proper local date object to avoid timezone issues
                const localDate = new Date(
                  year,
                  date.getMonth(),
                  date.getDate()
                );
                console.log("Local date created:", localDate);

                // Find ALL entries for this date
                console.log("=== DEBUG: Checking entries for date ===");
                console.log("Target dateString:", dateString);
                console.log("All timeEntries:", timeEntries);

                const entriesForDate = timeEntries.filter((entry) => {
                  // Compare using the date field
                  if (entry.date) {
                    console.log(
                      `Comparing entry.date "${entry.date}" with "${dateString}"`
                    );
                    return entry.date === dateString;
                  }
                  // Fallback to comparing startTime if date field doesn't exist
                  const entryDate = new Date(entry.startTime);
                  const entryDateString = entryDate.toISOString().split("T")[0];
                  console.log(
                    `Comparing startTime-derived "${entryDateString}" with "${dateString}"`
                  );
                  return entryDateString === dateString;
                });

                console.log("=== DEBUG: Filtered entries ===");
                console.log("Entries found for this date:", entriesForDate);

                console.log(
                  `Found ${entriesForDate.length} entries for ${dateString}:`,
                  entriesForDate
                );

                if (entriesForDate.length > 0) {
                  // If there are existing entries, show alert about multiple entries
                  if (entriesForDate.length > 1) {
                    alert(
                      `⚠️ พบข้อมูลซ้ำในวันที่ ${dateString}!\n\nกรุณาลบข้อมูลซ้ำก่อน แล้วลองใหม่อีกครั้ง`
                    );
                    return;
                  }
                  // If there's exactly one entry, edit it
                  setFormInitialData(entriesForDate[0]);
                } else {
                  // If no existing entry, create new one
                  console.log("=== Creating new entry data ===");
                  console.log("dateString:", dateString);
                  console.log("localDate:", localDate);

                  setFormInitialData({
                    date: dateString,
                    selectedDate: dateString, // ส่งเป็น string แทน Date object
                  });
                }
                setIsFormOpen(true);
              }}
              onEventClick={(entry: any) => {
                setFormInitialData(entry);
                setIsFormOpen(true);
              }}
              currentView={currentView}
              onViewChange={handleViewChange}
              onDateChange={handleCalendarDateChange}
              onToday={handleToday}
            />
          </div>
        ) : (
          <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-indigo-100 shadow-lg">
            {/* Header */}
            <div className="border-b border-indigo-100 p-4 sm:p-6 bg-gradient-to-r from-indigo-50 to-blue-50">
              <h3 className="text-lg font-semibold text-gray-900">
                Time Sheet
              </h3>
            </div>

            {/* List Content */}
            <div className="divide-y divide-gray-200">
              {timeEntries.length === 0 ? (
                <div className="p-8 text-center">
                  <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No time entries yet
                  </h3>
                  <p className="text-gray-500 mb-6">
                    Start tracking your work hours
                  </p>
                  <button
                    onClick={() => setIsFormOpen(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                    Add Time Entry
                  </button>
                </div>
              ) : (
                timeEntries
                  .sort(
                    (a, b) =>
                      new Date(b.startTime).getTime() -
                      new Date(a.startTime).getTime()
                  )
                  .map((entry) => (
                    <div
                      key={entry.id}
                      className="p-4 sm:p-6 hover:bg-indigo-50/50 transition-colors duration-200"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="text-sm sm:text-base font-medium text-gray-900 mb-1">
                            {entry.title}
                          </h4>
                          <div className="text-xs sm:text-sm text-gray-500 space-y-1">
                            <div>
                              📅{" "}
                              {new Date(entry.startTime).toLocaleDateString(
                                "th-TH"
                              )}
                            </div>
                            <div>
                              ⏰{" "}
                              {new Date(entry.startTime).toLocaleTimeString(
                                "th-TH",
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }
                              )}
                              {entry.endTime && (
                                <>
                                  {" - "}
                                  {new Date(entry.endTime).toLocaleTimeString(
                                    "th-TH",
                                    {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    }
                                  )}
                                </>
                              )}
                            </div>
                            {entry.description && (
                              <div className="text-gray-600">
                                📝 {entry.description}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="ml-4 flex items-center gap-2">
                          {entry.endTime && (
                            <div className="text-sm font-medium text-indigo-600">
                              {calculateWorkingHours(
                                new Date(entry.startTime),
                                new Date(entry.endTime)
                              ).toFixed(1)}{" "}
                              hrs
                            </div>
                          )}
                          <button
                            onClick={() => deleteTimeEntry(entry.id)}
                            className="p-2 text-red-500 hover:text-red-700 hover:bg-red-100 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
                            title="Delete entry"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>
        )}
      </main>

      {/* Form Modal */}
      {isFormOpen && (
        <TimeEntryForm
          isOpen={isFormOpen}
          onClose={() => {
            setIsFormOpen(false);
            setFormInitialData(undefined);
          }}
          onSubmit={async (data: any) => {
            // Ensure we have the date field properly set
            const entryData = {
              title: data.title,
              description: data.description,
              startTime: data.startTime.toISOString(),
              endTime: data.endTime?.toISOString(),
              date: data.date || data.startTime.toISOString().split("T")[0],
            };

            console.log("=== MAIN PAGE: Submit ===");
            console.log("Entry data:", entryData);
            console.log("FormInitialData:", formInitialData);
            console.log("Is editing:", formInitialData?.id ? true : false);

            // Check if we're editing an existing entry
            if (formInitialData?.id) {
              // Update existing entry
              console.log(
                "Updating existing entry with ID:",
                formInitialData.id
              );
              updateTimeEntry(formInitialData.id, entryData);
              setIsFormOpen(false);
              setFormInitialData(undefined);
            } else {
              // Add new entry
              console.log("Adding new entry");
              const success = addTimeEntry(entryData);
              if (success !== false) {
                setIsFormOpen(false);
                setFormInitialData(undefined);
              }
              // If success is false, keep form open so user can see the error
            }
          }}
          onDelete={(id: string) => {
            console.log("Deleting entry with ID:", id);
            deleteTimeEntry(id);
            setIsFormOpen(false);
            setFormInitialData(undefined);
          }}
          initialData={formInitialData}
          selectedDate={formInitialData?.selectedDate}
          existingEntries={timeEntries}
        />
      )}

      {/* Profile Edit Modal */}
      {isProfileOpen && user && (
        <ProfileEditForm
          isOpen={isProfileOpen}
          onClose={() => setIsProfileOpen(false)}
          onSubmit={(updates) => {
            console.log("Updating profile:", updates);
            updateProfile(updates);
            setIsProfileOpen(false);
          }}
          user={user}
        />
      )}

      {/* Company Management Modal */}
      {isCompanyManagementOpen && user && (
        <CompanyManagement
          isOpen={isCompanyManagementOpen}
          onClose={() => setIsCompanyManagementOpen(false)}
          user={user}
          onAddCompany={addCompany}
          onUpdateCompany={updateCompany}
          onDeleteCompany={(companyId) => {
            // Delete all time entries for this company first
            const companyEntries = timeEntries.filter(
              (entry) => entry.companyId === companyId
            );
            companyEntries.forEach((entry) => deleteTimeEntry(entry.id));

            // Then delete the company
            if (user.companies) {
              const updatedCompanies = user.companies.filter(
                (c) => c.id !== companyId
              );
              updateProfile({ companies: updatedCompanies });

              // If deleted company was selected, switch to first available company
              if (
                user.selectedCompanyId === companyId &&
                updatedCompanies.length > 0
              ) {
                selectCompany(updatedCompanies[0].id);
              }
            }
            return true;
          }}
        />
      )}

      {/* Template Preview Modal */}
      {/* Template Preview Modal Component will be added here */}
    </div>
  );
}
