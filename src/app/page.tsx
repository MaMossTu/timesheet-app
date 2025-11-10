"use client";

import { useState, useRef, useEffect } from "react";
import ExcelJS from "exceljs";
import jsPDF from "jspdf";
import {
  Clock,
  Calendar,
  List,
  Plus,
  Download,
  LogOut,
  Settings,
  Building2,
  ChevronDown,
} from "lucide-react";
import { TimeTrackingCalendar } from "@/components/TimeTrackingCalendar";
import { TimeEntryForm } from "@/components/TimeEntryForm";
import { ProfileEditForm } from "@/components/ProfileEditForm";
import { CompanyManagement } from "@/components/CompanyManagement";
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
    changePassword,
    addCompany,
    updateCompany,
  } = useAuth();
  const router = useRouter();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isCompanyManagementOpen, setIsCompanyManagementOpen] = useState(false);
  const [isDownloadOpen, setIsDownloadOpen] = useState(false);
  const [formInitialData, setFormInitialData] = useState<any | undefined>(
    undefined
  );
  const [viewMode, setViewMode] = useState<"calendar" | "list">("calendar");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const monthInputRef = useRef<HTMLInputElement>(null);
  const calendarRef = useRef<any>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setIsDownloadOpen(false);
    };

    if (isDownloadOpen) {
      document.addEventListener("click", handleClickOutside);
    }

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [isDownloadOpen]);

  // Redirect to login if no user
  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  // Update calendar when selectedDate changes
  useEffect(() => {
    if (calendarRef.current && viewMode === "calendar") {
      const api = calendarRef.current.getApi();
      if (api) {
        api.gotoDate(selectedDate);
      }
    }
  }, [selectedDate, viewMode]);

  // Export Functions
  const downloadXLSX = async () => {
    const previewData = generatePreviewData();

    // Create a new workbook and worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Timesheet");

    // Set default font for entire worksheet
    worksheet.eachRow((row) => {
      row.eachCell((cell) => {
        if (!cell.font) cell.font = {};
        cell.font.name = "Helvetica Neue";
        cell.font.size = 8;
      });
    });

    // Add TIMESHEET title centered in row 1
    worksheet.getCell("A1").value = "TIMESHEET";
    worksheet.mergeCells("A1:H1");

    // Style the first row - CENTERED, no background, no borders
    worksheet.getCell("A1").alignment = {
      horizontal: "center",
      vertical: "middle",
    };
    worksheet.getCell("A1").font = {
      bold: true,
      name: "Helvetica Neue",
      size: 7,
    };

    // Add NAME and PERIOD in row 2
    worksheet.getCell("A2").value = `NAME: ${previewData.employee}`;
    worksheet.getCell("F2").value = `PERIOD: ${previewData.month}`;

    // Merge cells for NAME (A2:E2) and PERIOD (F2:H2)
    worksheet.mergeCells("A2:E2");
    worksheet.mergeCells("F2:H2");

    // Style row 2 - no background, bottom border only
    worksheet.getCell("A2").alignment = {
      horizontal: "left",
      vertical: "middle",
    };
    worksheet.getCell("A2").font = {
      bold: true,
      name: "Helvetica Neue",
      size: 7,
    };
    worksheet.getCell("A2").border = {
      bottom: { style: "thin" },
    };

    worksheet.getCell("F2").alignment = {
      horizontal: "left",
      vertical: "middle",
    };
    worksheet.getCell("F2").font = {
      bold: true,
      name: "Helvetica Neue",
      size: 7,
    };
    worksheet.getCell("F2").border = {
      bottom: { style: "thin" },
    };

    // Add headers in row 3
    const headers = [
      "Date",
      "Start Time",
      "End Time",
      "Regular\nHours",
      "Overtime\nHours",
      "Total\nHours",
      "Tasks",
      "Remarks",
    ];

    headers.forEach((header, index) => {
      const cell = worksheet.getCell(3, index + 1);
      cell.value = header;
      cell.alignment = {
        horizontal: "center",
        vertical: "middle",
        wrapText: true,
      };
      cell.font = { bold: true, name: "Helvetica Neue", size: 7 };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFD3D3D3" }, // Light gray background for headers
      };
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    });

    // Add data rows
    previewData.entries.forEach((entry, rowIndex) => {
      const row = rowIndex + 4; // Start from row 4 (after headers in row 3)

      const date = new Date(entry.date).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });

      const endTime = entry.endTime || "";
      const task =
        entry.title + (entry.description ? ` - ${entry.description}` : "");
      const hours = calculateDailyHours(entry);

      // Set cell values and alignment
      const cells = [
        { value: date, align: "center" },
        {
          value: entry.startTime.includes("T")
            ? new Date(entry.startTime).toLocaleTimeString("en-GB", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
              })
            : entry.startTime,
          align: "center",
        },
        {
          value: endTime
            ? endTime.includes("T")
              ? new Date(endTime).toLocaleTimeString("en-GB", {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: false,
                })
              : endTime
            : "",
          align: "center",
        },
        { value: "", align: "center" }, // Regular Hours
        { value: "", align: "center" }, // Overtime Hours
        { value: hours, align: "center" }, // Total Hours
        { value: task, align: "left" }, // Tasks - left aligned
        { value: "", align: "center" }, // Remarks
      ];

      cells.forEach((cellData, colIndex) => {
        const cell = worksheet.getCell(row, colIndex + 1);
        cell.value = cellData.value;
        cell.alignment = {
          horizontal: cellData.align as "center" | "left",
          vertical: "middle",
        };
        cell.font = { name: "Helvetica Neue", size: 7 };
        // Add borders to data cells
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
      });
    });

    // Add empty rows to reach row 26 (before total at row 27)
    const lastDataRow = previewData.entries.length + 3; // Last row with actual data
    const targetRow = 26; // We want empty rows up to row 26
    const emptyRowsNeeded = Math.max(0, targetRow - lastDataRow);

    for (let i = 0; i < emptyRowsNeeded; i++) {
      const row = lastDataRow + 1 + i;
      for (let col = 1; col <= 8; col++) {
        const cell = worksheet.getCell(row, col);
        cell.value = "";
        cell.font = { name: "Helvetica Neue", size: 7 };
        if (col === 7) {
          // Tasks column
          cell.alignment = { horizontal: "left", vertical: "middle" };
        } else {
          cell.alignment = { horizontal: "center", vertical: "middle" };
        }
        // Add borders to empty cells
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
      }
    }

    // Add alternating row colors from row 5 to row 34
    for (let row = 5; row <= 34; row++) {
      const isGrayRow = row % 2 === 1; // Row 5, 7, 9, 11... will be gray (odd rows starting from 5)

      if (isGrayRow) {
        for (let col = 1; col <= 8; col++) {
          const cell = worksheet.getCell(row, col);
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFF5F5F5" }, // Light gray
          };
        }
      }
    }

    // Add total row
    const totalRow = 27; // Row 27 for total (moved up)
    worksheet.getCell(totalRow, 3).value = "Total"; // คอลัมน์ 3 (Regular Hours)
    worksheet.getCell(totalRow, 3).alignment = {
      horizontal: "center",
      vertical: "middle",
    };
    worksheet.getCell(totalRow, 3).font = {
      bold: true,
      name: "Helvetica Neue",
      size: 7,
    };
    worksheet.getCell(totalRow, 4).border = {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thick" },
      right: { style: "thin" },
    };
    worksheet.getCell(totalRow, 5).border = {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thick" },
      right: { style: "thin" },
    };

    worksheet.getCell(totalRow, 6).value = previewData.totalHours; // คอลัมน์ 6 (Total Hours)
    worksheet.getCell(totalRow, 6).alignment = {
      horizontal: "center",
      vertical: "middle",
    };
    worksheet.getCell(totalRow, 6).font = {
      bold: true,
      name: "Helvetica Neue",
      size: 7,
    };
    worksheet.getCell(totalRow, 6).border = {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thick" },
      right: { style: "thin" },
    };

    // Add signature rows (moved down)
    const empRow = 30;
    const approvedRow = 30;
    const empNameRow = 31;
    const dateRow = 34; // เปลี่ยนจาก 33 เป็น 34

    // Employee section (left side - merge A30:D30)
    worksheet.getCell(empRow, 1).value =
      "Employee_____________________________________";
    worksheet.mergeCells("A30:D30");
    worksheet.getCell(empRow, 1).alignment = {
      horizontal: "center",
      vertical: "middle",
    };
    worksheet.getCell(empRow, 1).font = {
      bold: true,
      name: "Helvetica Neue",
      size: 7,
    };

    // Approved by section (right side - merge E30:H30)
    worksheet.getCell(approvedRow, 7).value =
      "Approved by_______________________________________";
    worksheet.getCell(approvedRow, 7).alignment = {
      horizontal: "center",
      vertical: "middle",
    };
    worksheet.getCell(approvedRow, 7).font = {
      bold: true,
      name: "Helvetica Neue",
      size: 7,
    };

    // Employee name (merge A31:D31)
    worksheet.getCell(empNameRow, 1).value = `( ${previewData.employee} )`;
    worksheet.mergeCells("A31:D31");
    worksheet.getCell(empNameRow, 1).alignment = {
      horizontal: "center",
      vertical: "middle",
    };
    worksheet.getCell(empNameRow, 1).font = {
      bold: true,
      name: "Helvetica Neue",
      size: 7,
    };

    // Approved by name (merge E31:H31)
    worksheet.getCell(empNameRow, 7).value = `( ${previewData.approvedBy} )`;
    worksheet.getCell(empNameRow, 7).alignment = {
      horizontal: "center",
      vertical: "middle",
    };
    worksheet.getCell(empNameRow, 7).font = {
      bold: true,
      name: "Helvetica Neue",
      size: 7,
    };

    // Empty row 32 with merge A32:D32
    worksheet.mergeCells("A32:D32");

    // Empty row 33 with merge A33:D33
    worksheet.mergeCells("A33:D33");

    // Date sections
    const currentDate = new Date().toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

    // Employee date (merge A34:D34)
    worksheet.getCell(
      dateRow,
      1
    ).value = `Date___________${previewData.dateSign}________________`;
    worksheet.mergeCells("A34:D34");
    worksheet.getCell(dateRow, 1).alignment = {
      horizontal: "center",
      vertical: "middle",
    };
    worksheet.getCell(dateRow, 1).font = {
      bold: true,
      name: "Helvetica Neue",
      size: 7,
    };

    // Approved by date (merge E34:H34)
    worksheet.getCell(
      dateRow,
      7
    ).value = `Date___________${previewData.dateSign}________________`;
    worksheet.getCell(dateRow, 7).alignment = {
      horizontal: "center",
      vertical: "middle",
    };
    worksheet.getCell(dateRow, 7).font = {
      bold: true,
      name: "Helvetica Neue",
      size: 7,
    };

    // Set column widths - Optimized for A4 paper
    worksheet.getColumn(1).width = 8; // Date
    worksheet.getColumn(2).width = 7; // Start Time
    worksheet.getColumn(3).width = 7; // End Time
    worksheet.getColumn(4).width = 6; // Regular Hours
    worksheet.getColumn(5).width = 6; // Overtime Hours
    worksheet.getColumn(6).width = 6; // Total Hours
    worksheet.getColumn(7).width = 33; // Tasks - ลดลงจาก 50
    worksheet.getColumn(8).width = 9; // Remarks

    // Set row heights - ปรับให้พอดีกับ font
    worksheet.getRow(1).height = 20; // Title row - ลดความสูง
    worksheet.getRow(2).height = 20; // Name row - ลดความสูง
    worksheet.getRow(3).height = 40; // Header row for wrap text - เพิ่มความสูงสำหรับ 2 บรรทัด

    // Row 1 และ 2 ไม่ต้องมี borders เพิ่มเติม เพราะได้ตั้งค่าไว้แล้วข้างบน

    // Generate Excel file and download
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "TIMESHEET.xlsx";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const downloadPDF = () => {
    const previewData = generatePreviewData();

    // Create new PDF document
    const doc = new jsPDF("p", "mm", "a4");

    // Set font to Helvetica (closest to Helvetica Neue)
    doc.setFont("helvetica");

    // Title
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("TIMESHEET", 105, 20, { align: "center" });

    // Name and Period
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text(`NAME: ${previewData.employee}`, 20, 35);
    doc.text(`PERIOD: ${previewData.month}`, 105, 35);

    // Draw line under NAME and PERIOD
    doc.line(20, 38, 190, 38);

    // Headers
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    const headers = [
      "Date",
      "Start Time",
      "End Time",
      "Regular Hours",
      "Overtime Hours",
      "Total Hours",
      "Tasks",
      "Remarks",
    ];
    const headerY = 50;
    const colWidths = [20, 18, 18, 16, 16, 16, 60, 26];
    let currentX = 20;

    // Draw header background
    doc.setFillColor(211, 211, 211); // Light gray
    doc.rect(20, headerY - 5, 170, 8, "F");

    // Draw header borders and text
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.1);
    headers.forEach((header, i) => {
      // Draw cell border
      doc.rect(currentX, headerY - 5, colWidths[i], 8);

      // Draw text
      doc.text(header, currentX + colWidths[i] / 2, headerY, {
        align: "center",
      });
      currentX += colWidths[i];
    });

    // Data rows
    doc.setFont("helvetica", "normal");
    let rowY = headerY + 8;
    const maxRows = 22;

    // Render actual data
    previewData.entries.forEach((entry: any, index: number) => {
      if (index >= maxRows) return;

      const isGrayRow = (index + 1) % 2 === 1; // Alternating colors

      // Set row background
      if (isGrayRow) {
        doc.setFillColor(245, 245, 245); // Light gray
        doc.rect(20, rowY - 3, 170, 6, "F");
      }

      const date = new Date(entry.date).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });

      const startTime = entry.startTime.includes("T")
        ? new Date(entry.startTime).toLocaleTimeString("en-GB", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          })
        : entry.startTime;

      const endTime = entry.endTime
        ? entry.endTime.includes("T")
          ? new Date(entry.endTime).toLocaleTimeString("en-GB", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            })
          : entry.endTime
        : "";

      const hours = calculateDailyHours(entry);
      const task =
        entry.title + (entry.description ? ` - ${entry.description}` : "");

      const rowData = [date, startTime, endTime, "", "", hours, task, ""];

      // Draw cell borders and data
      currentX = 20;
      rowData.forEach((data, i) => {
        // Draw cell border
        doc.setDrawColor(0, 0, 0);
        doc.setLineWidth(0.1);
        doc.rect(currentX, rowY - 3, colWidths[i], 6);

        // Draw text
        const align = i === 6 ? "left" : "center"; // Tasks column left-aligned
        const textX =
          align === "left" ? currentX + 2 : currentX + colWidths[i] / 2;
        const text = String(data);

        // Truncate text if too long
        const maxWidth = colWidths[i] - 4;
        if (i === 6 && text.length > 50) {
          // Tasks column
          const truncated = text.substring(0, 50) + "...";
          doc.text(truncated, textX, rowY, {
            align: align,
            maxWidth: maxWidth,
          });
        } else {
          doc.text(text, textX, rowY, { align: align });
        }

        currentX += colWidths[i];
      });

      rowY += 6;
    });

    // Fill empty rows
    for (let i = previewData.entries.length; i < maxRows; i++) {
      const isGrayRow = (i + 1) % 2 === 1;

      if (isGrayRow) {
        doc.setFillColor(245, 245, 245);
        doc.rect(20, rowY - 3, 170, 6, "F");
      }

      // Draw empty row borders
      currentX = 20;
      colWidths.forEach((width) => {
        doc.setDrawColor(0, 0, 0);
        doc.setLineWidth(0.1);
        doc.rect(currentX, rowY - 3, width, 6);
        currentX += width;
      });

      rowY += 6;
    }

    // Total row
    doc.setFont("helvetica", "bold");
    currentX = 20;
    const totalData = ["", "", "Total", "", "", previewData.totalHours, "", ""];

    totalData.forEach((data, i) => {
      // Draw cell border with thick bottom
      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(i >= 2 && i <= 5 ? 0.5 : 0.1); // Thick border for total cells
      doc.rect(currentX, rowY - 3, colWidths[i], 6);

      // Draw text
      const align = i === 6 ? "left" : "center";
      const textX =
        align === "left" ? currentX + 2 : currentX + colWidths[i] / 2;
      doc.text(String(data), textX, rowY, { align: align });
      currentX += colWidths[i];
    });

    // Signature section
    const sigY = rowY + 20;
    doc.setFont("helvetica", "bold");
    doc.text("Employee___________________________________", 20, sigY);
    doc.text("Approved by_______________________________________", 110, sigY);

    // Names
    doc.setFont("helvetica", "normal");
    doc.text(`( ${previewData.employee} )`, 20, sigY + 10);
    doc.text(`( ${previewData.approvedBy} )`, 110, sigY + 10);

    // Dates
    doc.setFont("helvetica", "bold");
    doc.text(
      `Date___________${previewData.dateSign}________________`,
      20,
      sigY + 25
    );
    doc.text(
      `Date___________${previewData.dateSign}________________`,
      110,
      sigY + 25
    );

    // Save PDF
    doc.save("TIMESHEET.pdf");
  };

  const downloadNumbers = async () => {
    const previewData = generatePreviewData();

    // Create Excel format file that Numbers can open
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Timesheet");

    // Set default font for entire worksheet
    worksheet.eachRow((row) => {
      row.eachCell((cell) => {
        if (!cell.font) cell.font = {};
        cell.font.name = "Arial";
        cell.font.size = 11;
      });
    });

    // Add TIMESHEET title centered in row 1
    worksheet.getCell("A1").value = "TIMESHEET";
    worksheet.mergeCells("A1:H1");
    worksheet.getCell("A1").alignment = {
      horizontal: "center",
      vertical: "middle",
    };
    worksheet.getCell("A1").font = {
      bold: true,
      name: "Arial",
      size: 10,
    };

    // Add NAME and PERIOD in row 2
    worksheet.getCell("A2").value = `NAME: ${previewData.employee}`;
    worksheet.getCell("F2").value = `PERIOD: ${previewData.month}`;
    worksheet.mergeCells("A2:E2");
    worksheet.mergeCells("F2:H2");

    worksheet.getCell("A2").font = { bold: true, name: "Arial", size: 7 };
    worksheet.getCell("F2").font = { bold: true, name: "Arial", size: 7 };

    // Add headers in row 4
    const headers = [
      "Date",
      "Start Time",
      "End Time",
      "Regular Hours",
      "Overtime Hours",
      "Total Hours",
      "Tasks",
      "Remarks",
    ];

    headers.forEach((header, index) => {
      const cell = worksheet.getCell(4, index + 1);
      cell.value = header;
      cell.alignment = {
        horizontal: "center",
        vertical: "middle",
      };
      cell.font = { bold: true, name: "Arial", size: 7 };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFCCCCCC" },
      };

      // Skip borders for Regular Hours (column 4) and Overtime Hours (column 5) headers
      if (index !== 3 && index !== 4) {
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
      }
    });

    // Add data rows starting from row 5
    previewData.entries.forEach((entry: any, rowIndex: number) => {
      const row = rowIndex + 5;

      const date = new Date(entry.date).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });

      const startTime = entry.startTime.includes("T")
        ? new Date(entry.startTime).toLocaleTimeString("en-GB", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          })
        : entry.startTime;

      const endTime = entry.endTime
        ? entry.endTime.includes("T")
          ? new Date(entry.endTime).toLocaleTimeString("en-GB", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            })
          : entry.endTime
        : "";

      const task =
        entry.title + (entry.description ? ` - ${entry.description}` : "");
      const hours = calculateDailyHours(entry);

      const cells = [
        { value: date, align: "center" },
        { value: startTime, align: "center" },
        { value: endTime, align: "center" },
        { value: "", align: "center" },
        { value: "", align: "center" },
        { value: hours, align: "center" },
        { value: task, align: "left" },
        { value: "", align: "center" },
      ];

      cells.forEach((cellData, colIndex) => {
        const cell = worksheet.getCell(row, colIndex + 1);
        cell.value = cellData.value;
        cell.alignment = {
          horizontal: cellData.align as "center" | "left",
          vertical: "middle",
        };
        cell.font = { name: "Arial", size: 7 };

        // Skip borders for Regular Hours (column 4) and Overtime Hours (column 5)
        if (colIndex !== 3 && colIndex !== 4) {
          cell.border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" },
          };
        }
      });
    });

    // Add total row
    const totalRow = Math.max(25, previewData.entries.length + 6);

    // Add "Total" text in a cell before Total Hours column
    const totalLabelCell = worksheet.getCell(totalRow, 3);
    totalLabelCell.value = "Total";
    totalLabelCell.font = {
      bold: true,
      name: "Arial",
      size: 7,
    };
    totalLabelCell.alignment = {
      horizontal: "center",
      vertical: "middle",
    };
    totalLabelCell.border = {
      top: { style: "thick" },
      bottom: { style: "thick" },
      left: { style: "thin" },
      right: { style: "thin" },
    };

    // Add total hours value
    const totalValueCell = worksheet.getCell(totalRow, 6);
    totalValueCell.value = previewData.totalHours;
    totalValueCell.font = {
      bold: true,
      name: "Arial",
      size: 7,
    };
    totalValueCell.alignment = {
      horizontal: "center",
      vertical: "middle",
    };
    // Add thick border only for Total Hours column
    totalValueCell.border = {
      top: { style: "thick" },
      bottom: { style: "thick" },
      left: { style: "thin" },
      right: { style: "thin" },
    };

    // Add signature section
    const sigRow = totalRow + 3;
    worksheet.getCell(sigRow, 1).value = "Employee:";
    worksheet.getCell(sigRow, 5).value = "Approved by:";

    worksheet.getCell(sigRow + 1, 1).value = previewData.employee;
    worksheet.getCell(sigRow + 1, 5).value = previewData.approvedBy;

    worksheet.getCell(sigRow + 3, 1).value = `Date: ${previewData.dateSign}`;
    worksheet.getCell(sigRow + 3, 5).value = `Date: ${previewData.dateSign}`;

    // Set column widths
    worksheet.getColumn(1).width = 12;
    worksheet.getColumn(2).width = 12;
    worksheet.getColumn(3).width = 12;
    worksheet.getColumn(4).width = 15;
    worksheet.getColumn(5).width = 15;
    worksheet.getColumn(6).width = 12;
    worksheet.getColumn(7).width = 40;
    worksheet.getColumn(8).width = 15;

    // Generate file and download
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.ms-excel",
    });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "TIMESHEET.xlsx";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const downloadCSV = () => {
    const previewData = generatePreviewData();

    // Create CSV content
    let csvContent = "";

    // Add title row
    csvContent += "TIMESHEET\n\n";

    // Add employee and period info
    csvContent += `NAME:,${previewData.employee},,,,PERIOD:,${previewData.month}\n\n`;

    // Add headers
    csvContent +=
      "Date,Start Time,End Time,Regular Hours,Overtime Hours,Total Hours,Tasks,Remarks\n";

    // Add data rows
    previewData.entries.forEach((entry: any) => {
      const date = new Date(entry.date).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });

      const startTime = entry.startTime.includes("T")
        ? new Date(entry.startTime).toLocaleTimeString("en-GB", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          })
        : entry.startTime;

      const endTime = entry.endTime
        ? entry.endTime.includes("T")
          ? new Date(entry.endTime).toLocaleTimeString("en-GB", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            })
          : entry.endTime
        : "";

      const task =
        entry.title + (entry.description ? ` - ${entry.description}` : "");
      const hours = calculateDailyHours(entry);

      // Escape commas and quotes in task description
      const escapedTask =
        task.includes(",") || task.includes('"')
          ? `"${task.replace(/"/g, '""')}"`
          : task;

      csvContent += `${date},${startTime},${endTime},,${hours},${escapedTask},\n`;
    });

    // Add empty lines for remaining rows
    for (let i = previewData.entries.length; i < 20; i++) {
      csvContent += ",,,,,,\n";
    }

    csvContent += "\n";
    csvContent += `,,,,Total,${previewData.totalHours},,\n\n\n`;

    // Add signature section
    csvContent += "Employee,,,,,Approved by\n";
    csvContent += `${previewData.employee},,,,,${previewData.approvedBy}\n\n`;
    csvContent += `Date: ${previewData.dateSign},,,,,Date: ${previewData.dateSign}\n`;

    // Create and download the file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "TIMESHEET.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const calculateDailyHours = (entry: any) => {
    // Handle different time formats
    let startTime, endTime;

    if (entry.startTime.includes("T")) {
      // ISO format
      startTime = new Date(entry.startTime);
      endTime = entry.endTime
        ? new Date(entry.endTime)
        : new Date(entry.startTime);
    } else {
      // Time only format (HH:MM)
      startTime = new Date(`2000-01-01T${entry.startTime}`);
      endTime = entry.endTime
        ? new Date(`2000-01-01T${entry.endTime}`)
        : new Date(`2000-01-01T${entry.startTime}`);
    }

    let hours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);

    // Exclude lunch break (12:00-13:00) if the work period includes it
    const start = startTime.getHours() + startTime.getMinutes() / 60;
    const end = endTime.getHours() + endTime.getMinutes() / 60;
    if (start < 13 && end > 12) {
      hours -= 1; // Subtract 1 hour for lunch
    }

    return Math.max(0, hours).toFixed(0);
  };

  const generatePreviewData = () => {
    const currentMonth = selectedDate.getMonth() + 1;
    const currentYear = selectedDate.getFullYear();

    // Filter entries for current month (สำหรับ user และ company ปัจจุบัน)
    const monthEntries = timeEntries.filter((entry) => {
      const entryDate = new Date(entry.date);
      return (
        entry.userId === user?.id &&
        entry.companyId === selectedCompany?.id &&
        entryDate.getMonth() + 1 === currentMonth &&
        entryDate.getFullYear() === currentYear
      );
    });

    // Calculate total hours for the month
    const monthTotalHours = monthEntries.reduce((total: number, entry) => {
      // Use the existing calculateDailyHours function but convert to number
      const hours = parseFloat(calculateDailyHours(entry));
      return total + (isNaN(hours) ? 0 : hours);
    }, 0);

    // Create period format: "1 October 2025 - 31 October 2025"
    const firstDay = new Date(currentYear, selectedDate.getMonth(), 1);
    const lastDay = new Date(currentYear, selectedDate.getMonth() + 1, 0);

    const monthPeriod = `${firstDay.getDate()} ${firstDay.toLocaleDateString(
      "en-US",
      { month: "long" }
    )} ${currentYear} - ${lastDay.getDate()} ${lastDay.toLocaleDateString(
      "en-US",
      { month: "long" }
    )} ${currentYear}`;

    return {
      employee: `${user?.prefix ? user.prefix + " " : ""}${
        user?.name || user?.username || "Employee Name"
      }`,
      company:
        user?.companies?.find((c: any) => c.id === selectedCompany?.id)?.name ||
        "Company",
      approvedBy:
        user?.companies?.find((c: any) => c.id === selectedCompany?.id)
          ?.approvedBy || "Mr. Auttapong Budhsombatwarakul",
      dateSign: (() => {
        // Use company dateSign (day) if set, with selected month/year
        const companyDateSign = (
          user?.companies?.find((c: any) => c.id === selectedCompany?.id) as any
        )?.dateSign;
        if (companyDateSign) {
          // companyDateSign is just the day (e.g. "25")
          const day = parseInt(companyDateSign, 10);
          const lastDay = new Date(currentYear, currentMonth, 0).getDate();
          const safeDay = Math.min(day, lastDay);
          const date = new Date(currentYear, currentMonth - 1, safeDay);
          return date.toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          });
        }
        // fallback: today's date capped at last day of selected month
        const today = new Date();
        const lastDay = new Date(currentYear, currentMonth, 0).getDate();
        const day = Math.min(today.getDate(), lastDay);
        const date = new Date(currentYear, currentMonth - 1, day);
        return date.toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        });
      })(),
      month: monthPeriod,
      entries: monthEntries.sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      ),
      totalHours: monthTotalHours.toFixed(0),
    };
  };

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    router.push("/login");
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecting to login...</p>
        </div>
      </div>
    );
  }

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
    let totalHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);

    // Check if the work period overlaps with lunch break (12:00-13:00)
    const lunchStart = 12;
    const lunchEnd = 13;

    // Convert times to decimal hours for easier calculation
    const startDecimal = startHour + startMinute / 60;
    const endDecimal = endHour + endMinute / 60;

    // If work period overlaps with lunch break, subtract 1 hour
    if (startDecimal < lunchEnd && endDecimal > lunchStart) {
      // Calculate overlap duration
      const overlapStart = Math.max(startDecimal, lunchStart);
      const overlapEnd = Math.min(endDecimal, lunchEnd);
      const overlapDuration = Math.max(0, overlapEnd - overlapStart);

      totalHours -= overlapDuration;
    }

    return Math.max(0, totalHours);
  };

  // Calculate monthly statistics
  const monthlyTarget = 160;
  const currentMonth = selectedDate.getMonth();
  const currentYear = selectedDate.getFullYear();

  const monthlyHours = timeEntries
    .filter((entry) => {
      const entryDate = new Date(entry.startTime);
      return (
        entryDate.getMonth() === currentMonth &&
        entryDate.getFullYear() === currentYear &&
        entry.companyId === selectedCompany?.id
      );
    })
    .reduce((total, entry) => {
      const workingHours = calculateWorkingHours(
        entry.startTime,
        entry.endTime
      );
      return total + workingHours;
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
                    Select Company
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
                Hello, {user?.name || user?.username || user?.email}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setIsCompanyManagementOpen(true)}
                  className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Manage Companies"
                >
                  <Building2 className="h-5 w-5" />
                </button>

                <button
                  onClick={() => setIsProfileOpen(true)}
                  className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Edit Profile"
                >
                  <Settings className="h-5 w-5" />
                </button>

                <button
                  onClick={handleLogout}
                  className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Logout"
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
              Monthly Progress
            </h2>
            <div className="text-sm text-gray-600">
              {selectedDate.toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">
                  {Math.round(monthlyHours)} / {monthlyTarget} hours
                </span>
                <span
                  className={`text-sm font-medium ${
                    isTargetMet ? "text-green-600" : "text-blue-600"
                  }`}
                >
                  {Math.round(progress)}%
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
              <div
                className={`text-2xl font-bold ${
                  isTargetMet ? "text-green-600" : "text-gray-900"
                }`}
              >
                {isTargetMet
                  ? "✓ Completed"
                  : `${Math.round(monthlyTarget - monthlyHours)} hrs left`}
              </div>
            </div>
          </div>
        </div>

        {/* View Toggle and Add Button */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode("calendar")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors text-sm ${
                  viewMode === "calendar"
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
                }`}
              >
                <Calendar className="h-3.5 w-3.5" />
                Calendar
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors text-sm ${
                  viewMode === "list"
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
                }`}
              >
                <List className="h-3.5 w-3.5" />
                List
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Month Navigation Buttons */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  const prevMonth = new Date(selectedDate);
                  prevMonth.setMonth(prevMonth.getMonth() - 1);
                  setSelectedDate(prevMonth);
                }}
                className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-800 transition-colors"
                title="Previous month"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
              <button
                onClick={() => {
                  const nextMonth = new Date(selectedDate);
                  nextMonth.setMonth(nextMonth.getMonth() + 1);
                  setSelectedDate(nextMonth);
                }}
                className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-800 transition-colors"
                title="Next month"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>

            {/* Month/Year Picker */}
            <div className="relative group">
              <div
                className="flex items-center bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl hover:from-blue-100 hover:to-indigo-100 hover:border-blue-400 focus-within:ring-4 focus-within:ring-blue-200 focus-within:border-blue-500 transition-all duration-300 cursor-pointer shadow-sm hover:shadow-md"
                onClick={() => {
                  // Focus และเปิด date picker เมื่อคลิกที่ wrapper
                  if (monthInputRef.current) {
                    monthInputRef.current.focus();
                    monthInputRef.current.showPicker?.();
                  }
                }}
              >
                <div className="flex items-center pl-4 pr-3 py-3 space-x-3">
                  <Calendar className="h-5 w-5 text-blue-600 group-hover:text-blue-700 transition-colors" />
                  <span className="text-sm font-bold text-blue-900 group-hover:text-blue-800 transition-colors">
                    {selectedDate.toLocaleDateString("en-US", {
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                  <svg
                    className="h-4 w-4 text-blue-500 group-hover:text-blue-600 transition-colors ml-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
                <input
                  ref={monthInputRef}
                  type="month"
                  value={`${selectedDate.getFullYear()}-${String(
                    selectedDate.getMonth() + 1
                  ).padStart(2, "0")}`}
                  onChange={(e) => {
                    const [year, month] = e.target.value.split("-");
                    setSelectedDate(
                      new Date(parseInt(year), parseInt(month) - 1, 1)
                    );
                  }}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>
            </div>

            {/* Download Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsDownloadOpen(!isDownloadOpen)}
                className="bg-blue-600 text-white px-3 py-1.5 rounded-md hover:bg-blue-700 transition-all duration-200 flex items-center gap-1.5 text-sm shadow-sm"
              >
                <Download className="h-3.5 w-3.5" />
                Download
                <ChevronDown className="h-3.5 w-3.5" />
              </button>

              {isDownloadOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                  <button
                    onClick={() => {
                      downloadXLSX();
                      setIsDownloadOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-blue-50 hover:text-blue-700 rounded-t-lg text-sm text-gray-700 font-medium"
                  >
                    Excel (.xlsx)
                  </button>
                  <button
                    onClick={() => {
                      downloadPDF();
                      setIsDownloadOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-blue-50 hover:text-blue-700 text-sm text-gray-700 font-medium"
                  >
                    PDF (.pdf)
                  </button>
                  <button
                    onClick={() => {
                      downloadCSV();
                      setIsDownloadOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-blue-50 hover:text-blue-700 text-sm text-gray-700 font-medium"
                  >
                    CSV (.csv)
                  </button>
                  <button
                    onClick={() => {
                      downloadNumbers();
                      setIsDownloadOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-blue-50 hover:text-blue-700 rounded-b-lg text-sm text-gray-700 font-medium"
                  >
                    Numbers (.xlsx)
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content Area */}
        {viewMode === "calendar" ? (
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <TimeTrackingCalendar
              ref={calendarRef}
              timeEntries={timeEntries.filter(
                (entry) =>
                  entry.userId === user?.id &&
                  entry.companyId === selectedCompany?.id
              )}
              initialDate={selectedDate}
              onDateClick={(date: Date) => {
                // ใช้ format ที่ไม่เกี่ยวกับ timezone เพื่อป้องกันปัญหาการเลื่อนวันที่
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, "0");
                const day = String(date.getDate()).padStart(2, "0");
                const dateString = `${year}-${month}-${day}`;

                const entriesForDate = timeEntries.filter(
                  (entry) =>
                    entry.userId === user?.id &&
                    entry.date === dateString &&
                    entry.companyId === selectedCompany?.id
                );

                if (entriesForDate.length > 0) {
                  if (entriesForDate.length > 1) {
                    alert(
                      `⚠️ Duplicate entries found for ${dateString}!\n\nPlease delete duplicate entries first and try again.`
                    );
                    return;
                  }
                  setFormInitialData(entriesForDate[0]);
                } else {
                  setFormInitialData({
                    date: dateString,
                    companyId: selectedCompany?.id,
                  });
                }
                setIsFormOpen(true);
              }}
              onEventClick={(entry: any) => {
                setFormInitialData(entry);
                setIsFormOpen(true);
              }}
              onDateChange={(year: number, month: number) => {
                setSelectedDate(new Date(year, month, 1));
              }}
            />
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="border-b border-gray-200 p-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Time Sheet
              </h3>
            </div>
            <div className="divide-y divide-gray-200">
              {timeEntries.filter(
                (entry) =>
                  entry.userId === user?.id &&
                  entry.companyId === selectedCompany?.id
              ).length === 0 ? (
                <div className="p-8 text-center">
                  <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No time entries yet
                  </h3>
                  <p className="text-gray-500">
                    คลิกที่วันในปฏิทินเพื่อเพิ่มข้อมูลการทำงาน
                  </p>
                </div>
              ) : (
                timeEntries
                  .filter(
                    (entry) =>
                      entry.userId === user?.id &&
                      entry.companyId === selectedCompany?.id
                  )
                  .sort(
                    (a, b) =>
                      new Date(b.date || b.startTime).getTime() -
                      new Date(a.date || a.startTime).getTime()
                  )
                  .map((entry) => (
                    <div key={entry.id} className="p-4 hover:bg-gray-50">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="font-semibold text-gray-900 text-base">
                              {new Date(
                                entry.date || entry.startTime
                              ).toLocaleDateString("en-US", {
                                weekday: "long",
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })}
                            </span>
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                              {new Date(
                                entry.date || entry.startTime
                              ).toLocaleDateString("en-US", {
                                weekday: "short",
                              })}
                            </span>
                          </div>

                          <div className="space-y-1">
                            <div className="flex items-center gap-4 text-sm">
                              <div className="flex items-center gap-1 text-gray-600">
                                <Clock className="h-4 w-4" />
                                <span className="font-medium">Time:</span>
                                <span>
                                  {new Date(entry.startTime).toLocaleTimeString(
                                    "en-US",
                                    {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    }
                                  )}{" "}
                                  -{" "}
                                  {entry.endTime
                                    ? new Date(
                                        entry.endTime
                                      ).toLocaleTimeString("en-US", {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })
                                    : "In Progress"}
                                </span>
                              </div>

                              <div className="flex items-center gap-1 text-gray-600">
                                <span className="font-medium">Duration:</span>
                                <span className="font-semibold text-blue-600">
                                  {entry.endTime
                                    ? Math.round(
                                        calculateWorkingHours(
                                          entry.startTime,
                                          entry.endTime
                                        )
                                      )
                                    : "Working"}{" "}
                                  hrs
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Task Details */}
                          {entry.title && (
                            <div className="mt-2 p-2 bg-blue-50 rounded text-sm">
                              <span className="font-medium text-blue-900">
                                Task:{" "}
                              </span>
                              <span className="text-blue-800">
                                {entry.title}
                              </span>
                            </div>
                          )}

                          {entry.description && (
                            <div className="mt-2 p-2 bg-gray-50 rounded text-sm text-gray-700">
                              <span className="font-medium text-gray-900">
                                Notes:{" "}
                              </span>
                              {entry.description}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center">
                          <button
                            onClick={() => {
                              setFormInitialData(entry);
                              setIsFormOpen(true);
                            }}
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit entry"
                          >
                            <Settings className="h-5 w-5" />
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

      {/* Modals */}
      {isFormOpen && (
        <TimeEntryForm
          isOpen={isFormOpen}
          onClose={() => {
            setIsFormOpen(false);
            setFormInitialData(undefined);
          }}
          onSubmit={async (timeEntry) => {
            if (formInitialData?.id) {
              await updateTimeEntry(formInitialData.id, {
                ...timeEntry,
                startTime: timeEntry.startTime.toISOString(),
                endTime: timeEntry.endTime?.toISOString(),
              });
            } else {
              await addTimeEntry({
                ...timeEntry,
                startTime: timeEntry.startTime.toISOString(),
                endTime: timeEntry.endTime?.toISOString(),
                date: timeEntry.startTime.toISOString().split("T")[0],
              });
            }

            // ปิด form หลังจากบันทึกสำเร็จ
            setIsFormOpen(false);
            setFormInitialData(undefined);
          }}
          onDelete={
            formInitialData?.id
              ? async () => {
                  await deleteTimeEntry(formInitialData.id);
                  setIsFormOpen(false);
                  setFormInitialData(undefined);
                }
              : undefined
          }
          initialData={formInitialData}
          selectedDate={
            formInitialData?.date
              ? new Date(formInitialData.date + "T12:00:00")
              : new Date()
          }
          existingEntries={timeEntries.filter(
            (entry) =>
              entry.userId === user?.id &&
              entry.companyId === selectedCompany?.id
          )}
        />
      )}

      {isProfileOpen && user && (
        <ProfileEditForm
          isOpen={isProfileOpen}
          onClose={() => setIsProfileOpen(false)}
          onSubmit={async (updates) => {
            await updateProfile(updates);
            setIsProfileOpen(false);
          }}
          onPasswordChange={changePassword}
          user={user}
        />
      )}

      {isCompanyManagementOpen && user && (
        <CompanyManagement
          isOpen={isCompanyManagementOpen}
          onClose={() => setIsCompanyManagementOpen(false)}
          user={user}
          onAddCompany={addCompany}
          onUpdateCompany={updateCompany}
          onDeleteCompany={async (companyId: string) => {
            try {
              // ลบ company ผ่าน API (API จะจัดการลบ time entries ด้วย)
              const response = await fetch(
                `/api/companies?id=${companyId}&userId=${user?.id}`,
                {
                  method: "DELETE",
                }
              );

              if (response.ok && user?.companies) {
                const updatedCompanies = user.companies.filter(
                  (c) => c.id !== companyId
                );

                // อัพเดต user ผ่าน updateProfile
                await updateProfile({ companies: updatedCompanies });

                if (
                  user.selectedCompanyId === companyId &&
                  updatedCompanies.length > 0
                ) {
                  selectCompany(updatedCompanies[0].id);
                }
              }
              return true;
            } catch (error) {
              console.error("Delete company error:", error);
              return false;
            }
          }}
        />
      )}
    </div>
  );
}
