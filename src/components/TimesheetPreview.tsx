"use client";

interface TimeEntry {
  id: string;
  userId: string;
  companyId: string;
  title: string;
  description?: string;
  startTime: string;
  endTime?: string;
  date: string;
}

interface TimesheetPreviewProps {
  data: {
    employee: string;
    company: string;
    approvedBy: string;
    month: string;
    entries: TimeEntry[];
    totalHours: string;
  };
}

export default function TimesheetPreview({ data }: TimesheetPreviewProps) {
  // ฟังก์ชันคืนวันที่ลายเซ็น: เอาวันที่วันนี้ แต่เดือน/ปีตรงกับที่เลือก ถ้าเกินวันสุดท้ายของเดือนให้ใช้วันสุดท้าย
  const getSignatureDate = (monthYear: string) => {
    let month, year;
    if (monthYear.includes("/")) {
      const parts = monthYear.split("/").map(Number);
      if (parts[0] > 12) {
        year = parts[0];
        month = parts[1];
      } else {
        month = parts[0];
        year = parts[1];
      }
    } else if (monthYear.includes("-")) {
      const parts = monthYear.split("-").map(Number);
      year = parts[0];
      month = parts[1];
    }
    if (!month || !year) return "";
    const today = new Date();
    // หาวันสุดท้ายของเดือนที่เลือก
    const lastDay = new Date(year, month, 0).getDate();
    // ถ้าวันนี้เกินวันสุดท้ายของเดือนที่เลือก ให้ใช้วันสุดท้าย
    const day = Math.min(today.getDate(), lastDay);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const calculateDailyHours = (entry: TimeEntry) => {
    const startTime = new Date(`2000-01-01T${entry.startTime}`);
    const endTime = entry.endTime
      ? new Date(`2000-01-01T${entry.endTime}`)
      : new Date(`2000-01-01T${entry.startTime}`);
    let hours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);

    // Exclude lunch break (12:00-13:00) if the work period includes it
    const start = startTime.getHours() + startTime.getMinutes() / 60;
    const end = endTime.getHours() + endTime.getMinutes() / 60;
    if (start < 13 && end > 12) {
      hours -= 1; // Subtract 1 hour for lunch
    }

    return Math.max(0, hours).toFixed(2);
  };
  return (
    <div className="bg-white p-8 font-sans text-base text-black">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-6 text-black">TIMESHEET</h1>
        <div className="border-2 border-black p-6">
          <div className="grid grid-cols-2 gap-6 text-left">
            <div>
              <div className="mb-4 flex items-center">
                <span className="font-bold text-black mr-2 text-lg">
                  Employee Name:
                </span>
                <span className="border-b-2 border-black inline-block w-56 pb-1 text-black text-lg">
                  {data.employee}
                </span>
              </div>
              <div className="flex items-center">
                <span className="font-bold text-black mr-2 text-lg">
                  Company:
                </span>
                <span className="border-b-2 border-black inline-block w-56 pb-1 text-black text-lg">
                  {data.company}
                </span>
              </div>
            </div>
            <div>
              <div className="mb-4 flex items-center">
                <span className="font-bold text-black mr-2 text-lg">
                  Period:
                </span>
                <span className="border-b-2 border-black inline-block w-32 pb-1 text-black text-lg">
                  {data.month}
                </span>
              </div>
              <div className="flex items-center">
                <span className="font-bold text-black mr-2 text-lg">
                  Approved by:
                </span>
                <span className="border-b-2 border-black inline-block w-56 pb-1 text-black text-lg">
                  {data.approvedBy}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <table className="w-full border-collapse border-2 border-black mb-8">
        <thead>
          <tr className="bg-gray-200">
            <th className="border-2 border-black p-4 text-center w-24 font-bold text-black text-base">
              Date
            </th>
            <th className="border-2 border-black p-4 text-center w-28 font-bold text-black text-base">
              Start Time
            </th>
            <th className="border-2 border-black p-4 text-center w-28 font-bold text-black text-base">
              End Time
            </th>
            <th className="border-2 border-black p-4 text-center w-28 font-bold text-black text-base">
              Regular Hours
            </th>
            <th className="border-2 border-black p-4 text-center w-28 font-bold text-black text-base">
              Overtime Hours
            </th>
            <th className="border-2 border-black p-4 text-center w-24 font-bold text-black text-base">
              Total Hours
            </th>
            <th className="border-2 border-black p-4 text-center font-bold text-black text-base">
              Tasks
            </th>
            <th className="border-2 border-black p-4 text-center w-32 font-bold text-black text-base">
              Remarks
            </th>
          </tr>
        </thead>
        <tbody>
          {data.entries.length === 0 ? (
            <tr>
              <td
                colSpan={8}
                className="border-2 border-black p-6 text-center text-gray-600 text-base"
              >
                No time entries for this month
              </td>
            </tr>
          ) : (
            data.entries.map((entry, index) => (
              <tr key={entry.id}>
                <td className="border-2 border-black p-4 text-center font-medium text-black text-base">
                  {formatDate(entry.date)}
                </td>
                <td className="border-2 border-black p-4 text-center font-medium text-black text-base">
                  {entry.startTime}
                </td>
                <td className="border-2 border-black p-4 text-center font-medium text-black text-base">
                  {entry.endTime || ""}
                </td>
                <td className="border-2 border-black p-4 text-center font-medium text-black text-base">
                  {calculateDailyHours(entry)}
                </td>
                <td className="border-2 border-black p-4 text-center font-medium text-black text-base"></td>
                <td className="border-2 border-black p-4 text-center font-medium text-black text-base">
                  {calculateDailyHours(entry)}
                </td>
                <td className="border-2 border-black p-4 text-left text-black text-base">
                  {entry.title}
                  {entry.description ? ` - ${entry.description}` : ""}
                </td>
                <td className="border-2 border-black p-4 text-center font-medium text-black text-base">
                  <button
                    className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-3 rounded"
                    onClick={async () => {
                      if (confirm("ยืนยันการลบรายการนี้?")) {
                        await fetch(`/api/time-entries?id=${entry.id}`, {
                          method: "DELETE",
                        });
                        window.location.reload();
                      }
                    }}
                  >
                    ลบ
                  </button>
                </td>
              </tr>
            ))
          )}

          {/* Empty rows to fill space */}
          {Array.from(
            { length: Math.max(0, 10 - data.entries.length) },
            (_, index) => (
              <tr key={`empty-${index}`}>
                <td className="border-2 border-black p-4 text-center text-black text-base">
                  &nbsp;
                </td>
                <td className="border-2 border-black p-4">&nbsp;</td>
                <td className="border-2 border-black p-4">&nbsp;</td>
                <td className="border-2 border-black p-4">&nbsp;</td>
                <td className="border-2 border-black p-4">&nbsp;</td>
                <td className="border-2 border-black p-4">&nbsp;</td>
                <td className="border-2 border-black p-4">&nbsp;</td>
                <td className="border-2 border-black p-4">&nbsp;</td>
              </tr>
            )
          )}
        </tbody>
      </table>

      {/* Summary */}
      <div className="flex justify-center mb-10">
        <div className="text-center">
          <div className="font-bold text-black text-xl mb-2">Total</div>
          <div className="border-2 border-black p-4 w-32 text-center">
            <span className="font-bold text-black text-lg">
              {data.totalHours}
            </span>
          </div>
        </div>
      </div>

      {/* Signatures */}
      <div className="grid grid-cols-2 gap-12 mt-16">
        <div className="text-left">
          <p className="font-bold text-black text-lg mb-4">
            Employee_________________________________
          </p>
          <p className="text-black text-base">( {data.employee} )</p>
          <br />
          <p className="text-black text-base">
            Date_________{getSignatureDate(data.month)}_______________
          </p>
        </div>
        <div className="text-left">
          <p className="font-bold text-black text-lg mb-4">
            Approved by_____________________________
          </p>
          <p className="text-black text-base">( {data.approvedBy} )</p>
          <br />
          <p className="text-black text-base">
            Date_________{getSignatureDate(data.month)}_______________
          </p>
        </div>
      </div>
    </div>
  );
}
