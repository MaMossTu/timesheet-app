"use client";

import { useState } from "react";

export default function DebugAPI() {
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const testAPI = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/database?key=admin123");
      const data = await response.json();
      setResult(JSON.stringify(data, null, 2));
    } catch (error) {
      setResult(`Error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">🔧 API Debug Test</h1>

      <button
        onClick={testAPI}
        disabled={loading}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 mb-4"
      >
        {loading ? "กำลังทดสอบ..." : "ทดสอบ API"}
      </button>

      {result && (
        <div className="bg-gray-900 text-green-400 p-4 rounded font-mono text-sm overflow-auto">
          <pre>{result}</pre>
        </div>
      )}
    </div>
  );
}
