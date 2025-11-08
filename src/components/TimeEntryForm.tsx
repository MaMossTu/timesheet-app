"use client";

import React, { useState } from "react";
import { format } from "date-fns";

interface TimeEntryData {
  title: string;
  description?: string;
  startTime: Date;
  endTime?: Date;
  projectId: string;
  categoryId?: string;
}

interface TimeEntryFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (data: TimeEntryData) => void;
  onDelete?: (id: string) => void;
  initialData?: Partial<
    TimeEntryData & { date?: string; selectedDate?: Date; id?: string }
  >;
  selectedDate?: Date;
  existingEntries?: any[];
}

export function TimeEntryForm({
  isOpen,
  onClose,
  onSubmit,
  onDelete,
  initialData,
  selectedDate,
  existingEntries = [],
}: TimeEntryFormProps) {
  console.log("=== Form received data ===");
  console.log("selectedDate:", selectedDate, typeof selectedDate);
  console.log("initialData:", initialData);

  const today = selectedDate
    ? typeof selectedDate === "string"
      ? new Date(selectedDate + "T12:00:00") // เพิ่ม time เพื่อหลีกเลี่ยง timezone issue
      : selectedDate
    : initialData?.date
    ? new Date(initialData.date + "T12:00:00")
    : initialData?.startTime
    ? new Date(initialData.startTime)
    : new Date();

  console.log("=== Calculated today ===");
  console.log("today:", today);
  console.log("today.toDateString():", today.toDateString());
  console.log("today.toISOString():", today.toISOString());
  const start = new Date(today);
  start.setHours(9, 0, 0, 0);
  const end = new Date(today);
  end.setHours(18, 0, 0, 0);

  // Function to format date in Thai and English
  const formatBilingualDate = (date: Date) => {
    const thaiDays = [
      "อาทิตย์",
      "จันทร์",
      "อังคาร",
      "พุธ",
      "พฤหัสบดี",
      "ศุกร์",
      "เสาร์",
    ];
    const thaiMonths = [
      "มกราคม",
      "กุมภาพันธ์",
      "มีนาคม",
      "เมษายน",
      "พฤษภาคม",
      "มิถุนายน",
      "กรกฎาคม",
      "สิงหาคม",
      "กันยายน",
      "ตุลาคม",
      "พฤศจิกายน",
      "ธันวาคม",
    ];

    const englishDays = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const englishMonths = [
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

    const thaiDayName = thaiDays[date.getDay()];
    const englishDayName = englishDays[date.getDay()];
    const day = date.getDate();
    const thaiMonth = thaiMonths[date.getMonth()];
    const englishMonth = englishMonths[date.getMonth()];
    const thaiYear = date.getFullYear() + 543; // Buddhist Era
    const englishYear = date.getFullYear(); // Christian Era

    return {
      thai: `วัน${thaiDayName}ที่ ${day} ${thaiMonth} ${thaiYear}`,
      english: `${englishDayName}, ${englishMonth} ${day}, ${englishYear}`,
    };
  };

  const [formData, setFormData] = useState<TimeEntryData & { date: Date }>({
    title: initialData?.title || "Team Meeting, ",
    description: initialData?.description || "",
    date: today,
    startTime: (() => {
      const startTime = new Date(today);
      startTime.setHours(9, 0, 0, 0);
      return startTime;
    })(),
    endTime: (() => {
      const endTime = new Date(today);
      endTime.setHours(18, 0, 0, 0);
      return endTime;
    })(),
    projectId: initialData?.projectId || "project1",
    categoryId: initialData?.categoryId || "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    console.log("=== FORM SUBMIT DEBUG ===");
    console.log("initialData:", initialData);
    console.log("initialData.id:", initialData?.id);

    // Check if this is editing an existing entry or creating a new one
    const isEditing = initialData && initialData.id;
    console.log("isEditing:", isEditing);

    if (!isEditing) {
      // If it's a new entry, check if there's already an entry for this date
      const selectedDateString = formData.date.toISOString().split("T")[0];
      console.log("=== NEW ENTRY VALIDATION ===");
      console.log(
        "Form validation: Checking for existing entries on",
        selectedDateString
      );
      console.log("Total existingEntries:", existingEntries.length);
      console.log("All existingEntries:", existingEntries);

      const existingEntriesForDate = existingEntries.filter((entry) => {
        console.log("Checking entry:", entry);

        // Compare using the date field which should be more reliable
        if (entry.date) {
          console.log(
            `Comparing entry.date "${entry.date}" with "${selectedDateString}"`
          );
          const matches = entry.date === selectedDateString;
          console.log("Date field match:", matches);
          return matches;
        }
        // Fallback to comparing startTime if date field doesn't exist
        const entryDate = new Date(entry.startTime);
        const entryDateString = entryDate.toISOString().split("T")[0];
        console.log(
          `Comparing startTime-derived "${entryDateString}" with "${selectedDateString}"`
        );
        const matches = entryDateString === selectedDateString;
        console.log("StartTime field match:", matches);
        return matches;
      });

      console.log("=== VALIDATION RESULT ===");
      console.log(
        "Found existing entries for this date:",
        existingEntriesForDate
      );
      console.log("Number of existing entries:", existingEntriesForDate.length);

      if (existingEntriesForDate.length > 0) {
        const existingEntry = existingEntriesForDate[0];
        console.log(
          "BLOCKING submission - found existing entry:",
          existingEntry
        );
        alert(
          `📅 วันละ 1 งานเท่านั้น!\n\nมีงานในวันที่ ${selectedDateString} แล้ว:\n"${existingEntry.title}"\n\nกรุณาลบงานเดิมก่อน หรือแก้ไขงานที่มีอยู่แทน`
        );
        return;
      }

      console.log("ALLOWING submission - no existing entries found");
    } else {
      console.log("EDITING existing entry:", initialData);
    }

    if (onSubmit) {
      // Prepare the data with the correct format
      const submissionData = {
        title: formData.title,
        description: formData.description,
        startTime: formData.startTime,
        endTime: formData.endTime,
        projectId: formData.projectId,
        categoryId: formData.categoryId,
        // Add the date field for validation
        date: formData.date.toISOString().split("T")[0],
      };
      onSubmit(submissionData as any);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 font-inter">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md border border-gray-100 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900 tracking-tight">
              {initialData ? "Task" : "Task"}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100"
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

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Date Display */}
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-3 tracking-wide">
                📅 Date
              </label>
              <div className="w-full px-4 py-3 border border-emerald-200 rounded-lg bg-gradient-to-r from-emerald-50 to-green-50 shadow-sm">
                <div className="text-emerald-800 font-bold text-base tracking-tight">
                  {formatBilingualDate(formData.date).english}
                </div>
                <div className="text-emerald-600 text-sm mt-1 font-medium tracking-wide">
                  {formatBilingualDate(formData.date).thai}
                </div>
              </div>
            </div>

            {/* Quick Tasks */}
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-3 tracking-wide">
                ⚡ Quick Tasks
              </label>
              <div className="flex flex-wrap gap-2 mb-4">
                <button
                  type="button"
                  onClick={() =>
                    setFormData({
                      ...formData,
                      title: formData.title + "Team Meeting, ",
                    })
                  }
                  className="px-4 py-2 bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 rounded-lg text-sm hover:from-purple-200 hover:to-purple-300 transition-all duration-200 border border-purple-300 font-semibold shadow-sm hover:shadow-md tracking-wide"
                >
                  👥 Team Meeting
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setFormData({
                      ...formData,
                      title: formData.title + "Sprint Review, ",
                    })
                  }
                  className="px-4 py-2 bg-gradient-to-r from-emerald-100 to-emerald-200 text-emerald-800 rounded-lg text-sm hover:from-emerald-200 hover:to-emerald-300 transition-all duration-200 border border-emerald-300 font-semibold shadow-sm hover:shadow-md tracking-wide"
                >
                  🔍 Sprint Review
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setFormData({
                      ...formData,
                      title: formData.title + "Sprint Planning, ",
                    })
                  }
                  className="px-4 py-2 bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 rounded-lg text-sm hover:from-blue-200 hover:to-blue-300 transition-all duration-200 border border-blue-300 font-semibold shadow-sm hover:shadow-md tracking-wide"
                >
                  📋 Sprint Planning
                </button>
              </div>

              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 text-sm text-gray-900 bg-white shadow-sm hover:shadow-md font-medium"
                placeholder="📝 กรอกรายละเอียดงาน..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2 tracking-wide">
                  🕐 Start Time
                </label>
                <input
                  type="time"
                  required
                  value={format(formData.startTime, "HH:mm")}
                  onChange={(e) => {
                    const [h, m] = e.target.value.split(":");
                    const newStart = new Date(formData.date);
                    newStart.setHours(Number(h), Number(m), 0, 0);
                    setFormData({ ...formData, startTime: newStart });
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 text-sm text-gray-900 bg-white shadow-sm hover:shadow-md font-semibold tracking-wider"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2 tracking-wide">
                  🕐 End Time
                </label>
                <input
                  type="time"
                  required
                  value={
                    formData.endTime ? format(formData.endTime, "HH:mm") : ""
                  }
                  onChange={(e) => {
                    const [h, m] = e.target.value.split(":");
                    const newEnd = new Date(formData.date);
                    newEnd.setHours(Number(h), Number(m), 0, 0);
                    setFormData({ ...formData, endTime: newEnd });
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 text-sm text-gray-900 bg-white shadow-sm hover:shadow-md font-semibold tracking-wider"
                />
              </div>
            </div>

            <div className="flex justify-between items-center pt-6 border-t border-gray-100">
              {/* Delete button - only show when editing, on the left */}
              {initialData && initialData.id ? (
                <button
                  type="button"
                  onClick={() => {
                    if (
                      window.confirm(
                        "⚠️ Are you sure you want to delete this task?\n\nThis action cannot be undone."
                      )
                    ) {
                      if (onDelete && initialData?.id) {
                        onDelete(initialData.id);
                      }
                      onClose();
                    }
                  }}
                  className="px-5 py-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 text-sm font-semibold shadow-md hover:shadow-lg tracking-wide flex items-center space-x-2"
                >
                  <span>🗑️</span>
                  <span>Delete</span>
                </button>
              ) : (
                <div></div>
              )}

              {/* Right side buttons */}
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2.5 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-700 transition-all duration-200 text-sm font-semibold bg-white shadow-sm hover:shadow-md tracking-wide"
                >
                  ✕ Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-lg hover:from-emerald-700 hover:to-emerald-800 transition-all duration-200 text-sm font-bold shadow-md hover:shadow-lg tracking-wide"
                >
                  {initialData ? "💾 Update" : "➕ Add Task"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
