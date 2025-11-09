"use client";

import { useState, useEffect } from "react";

interface DatabaseData {
  users: any[];
  companies: any[];
  timeEntries: any[];
  summary: {
    totalUsers: number;
    totalCompanies: number;
    totalTimeEntries: number;
  };
}

export default function DatabaseViewer() {
  const [data, setData] = useState<DatabaseData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [adminKey, setAdminKey] = useState("");

  const fetchData = async () => {
    if (!adminKey) {
      setError("กรุณากรอก Admin Key");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/admin/database?key=${adminKey}`);

      if (response.ok) {
        const result = await response.json();
        setData(result.data);
      } else {
        setError("ไม่สามารถดึงข้อมูลได้ - ตรวจสอบ Admin Key");
      }
    } catch (err) {
      setError("เกิดข้อผิดพลาดในการเชื่อมต่อ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            📊 Database Viewer (Vercel Production)
          </h1>

          {/* Admin Key Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Admin Key
            </label>
            <div className="flex gap-4">
              <input
                type="password"
                value={adminKey}
                onChange={(e) => setAdminKey(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="กรอก admin key"
              />
              <button
                onClick={fetchData}
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? "กำลังโหลด..." : "ดูข้อมูล"}
              </button>
            </div>
            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
          </div>

          {/* Summary */}
          {data && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">📈 สรุปข้อมูล</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-medium text-blue-900">👥 Users</h3>
                  <p className="text-2xl font-bold text-blue-600">
                    {data.summary.totalUsers}
                  </p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-medium text-green-900">🏢 Companies</h3>
                  <p className="text-2xl font-bold text-green-600">
                    {data.summary.totalCompanies}
                  </p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h3 className="font-medium text-purple-900">
                    ⏰ Time Entries
                  </h3>
                  <p className="text-2xl font-bold text-purple-600">
                    {data.summary.totalTimeEntries}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Users Table */}
          {data && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">👥 Users</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Username
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Companies
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Time Entries
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {data.users.map((user) => (
                      <tr key={user.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {user.prefix} {user.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {user.username}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {user.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {user.companies?.length || 0}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {user.timeEntries?.length || 0}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Time Entries Table */}
          {data && data.timeEntries.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">⏰ Time Entries</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Title
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Company
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Time
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {data.timeEntries.map((entry) => (
                      <tr key={entry.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {entry.title}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {entry.user.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {entry.company.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {entry.date}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(entry.startTime).toLocaleTimeString()} -
                          {entry.endTime
                            ? new Date(entry.endTime).toLocaleTimeString()
                            : "ongoing"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="mt-8 p-4 bg-yellow-50 rounded-lg">
            <h3 className="font-medium text-yellow-900 mb-2">📝 วิธีใช้:</h3>
            <ul className="text-sm text-yellow-800 space-y-1">
              <li>
                • Admin Key:{" "}
                <code className="bg-yellow-200 px-2 py-1 rounded">
                  admin123
                </code>
              </li>
              <li>• หน้านี้สามารถดูข้อมูลจาก Production Database บน Vercel</li>
              <li>• ข้อมูลจะแสดงแบบ real-time จากฐานข้อมูลจริง</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
