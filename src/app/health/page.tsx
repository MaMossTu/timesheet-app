"use client";

import { useState, useEffect } from "react";

interface HealthData {
  timestamp: string;
  status: string;
  database: {
    status: string;
    connection: boolean;
    recordCount: number;
    error: string | null;
    details?: {
      users: number;
      companies: number;
      timeEntries: number;
    };
  };
  server: {
    environment: string;
    vercel: boolean;
    region: string;
  };
}

export default function HealthCheck() {
  const [health, setHealth] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);

  const checkHealth = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/health");
      const data = await response.json();
      setHealth(data);
    } catch (error) {
      console.error("Health check failed:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(checkHealth, 5000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "healthy":
        return "text-green-600 bg-green-50";
      case "degraded":
        return "text-yellow-600 bg-yellow-50";
      case "error":
        return "text-red-600 bg-red-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const getDbStatusColor = (connected: boolean) => {
    return connected ? "text-green-600" : "text-red-600";
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              🏥 System Health Check
            </h1>
            <div className="flex gap-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                />
                <span className="text-sm">Auto Refresh (5s)</span>
              </label>
              <button
                onClick={checkHealth}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? "🔄 กำลังเช็ค..." : "🔍 เช็คสถานะ"}
              </button>
            </div>
          </div>

          {health && (
            <div className="space-y-6">
              {/* Overall Status */}
              <div
                className={`p-4 rounded-lg ${getStatusColor(health.status)}`}
              >
                <h2 className="text-lg font-semibold mb-2">
                  📊 Overall Status: {health.status.toUpperCase()}
                </h2>
                <p className="text-sm opacity-75">
                  Last checked: {new Date(health.timestamp).toLocaleString()}
                </p>
              </div>

              {/* Database Status */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-3">
                  🗄️ Database Status
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div
                      className={`text-2xl font-bold ${getDbStatusColor(
                        health.database.connection
                      )}`}
                    >
                      {health.database.connection ? "✅" : "❌"}
                    </div>
                    <div className="text-sm text-gray-600">Connection</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {health.database.recordCount}
                    </div>
                    <div className="text-sm text-gray-600">Total Records</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {health.database.details?.users || 0}
                    </div>
                    <div className="text-sm text-gray-600">Users</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {health.database.details?.companies || 0}
                    </div>
                    <div className="text-sm text-gray-600">Companies</div>
                  </div>
                </div>

                {health.database.error && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded">
                    <p className="text-red-600 text-sm font-medium">
                      Database Error:
                    </p>
                    <p className="text-red-500 text-sm">
                      {health.database.error}
                    </p>
                  </div>
                )}
              </div>

              {/* Server Info */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-3">
                  🖥️ Server Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <span className="text-sm font-medium text-gray-700">
                      Environment:
                    </span>
                    <div className="text-lg font-semibold text-blue-600">
                      {health.server.environment}
                    </div>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">
                      Platform:
                    </span>
                    <div className="text-lg font-semibold text-green-600">
                      {health.server.vercel ? "Vercel" : "Local"}
                    </div>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">
                      Region:
                    </span>
                    <div className="text-lg font-semibold text-purple-600">
                      {health.server.region}
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-3">🚀 Quick Actions</h3>
                <div className="flex flex-wrap gap-2">
                  <a
                    href="/admin/database"
                    className="px-3 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                  >
                    📊 View Database Data
                  </a>
                  <a
                    href="/debug"
                    className="px-3 py-2 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
                  >
                    🔧 Debug API
                  </a>
                  <a
                    href="/api/health"
                    target="_blank"
                    className="px-3 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                  >
                    🔗 Raw Health API
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
