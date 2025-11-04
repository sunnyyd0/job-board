"use client";
import { useEffect, useState } from "react";

export default function ImportHistoryPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let isMounted = true;

    const loadLogs = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/import-logs");
        const data = await res.json();
        if (isMounted) {
          setLogs(data);
          setLoading(false);
        }
      } catch (err) {
        console.error("❌ Error fetching import logs:", err);
      }
    };

    // ✅ Fetch after initial mount
    loadLogs();

    // ✅ Refresh every 60s
    const interval = setInterval(() => {
      console.log("🔁 Auto-refreshing logs...");
      loadLogs();
    }, 60 * 1000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">
        📊 Import History Dashboard
      </h1>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <table className="min-w-full border text-sm">
          <thead>
            <tr className="bg-gray-200">
              <th className="border px-4 py-2">File Name (Feed URL)</th>
              <th className="border px-4 py-2">Total</th>
              <th className="border px-4 py-2">New</th>
              <th className="border px-4 py-2">Updated</th>
              <th className="border px-4 py-2">Failed</th>
              <th className="border px-4 py-2">Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log._id} className="text-center">
                <td className="border px-2 py-1 text-blue-600 underline">
                  <a href={log.source} target="_blank" rel="noreferrer">
                    {log.source}
                  </a>
                </td>
                <td className="border px-2 py-1">{log.totalFetched}</td>
                <td className="border px-2 py-1 text-green-600">
                  {log.newJobs}
                </td>
                <td className="border px-2 py-1 text-orange-500">
                  {log.updatedJobs}
                </td>
                <td className="border px-2 py-1 text-red-600">
                  {log.failedJobs.length}
                </td>
                <td className="border px-2 py-1">
                  {new Date(log.timestamp).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
