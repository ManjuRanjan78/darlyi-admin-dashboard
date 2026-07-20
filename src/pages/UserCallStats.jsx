import React, { useEffect, useState } from "react";
import axios from "axios";
import { BaseUrl } from "../BaseUrl";
import toast from "react-hot-toast";

const TYPES = ["daily", "yesterday","weekly", "monthly", "yearly"];

export default function UserCallStats({ userId }) {
  const [type, setType] = useState("daily");
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchStats = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const res = await axios.get(
        `${BaseUrl.baseurl}/admin/user-call-stats/${userId}`,
        { params: { type } }
      );

      if (res.data?.success) {
        setStats(res.data);
      } else {
        toast.error("Failed to load call stats");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [type, userId]);

  const s = stats?.stats;
  const formatDate = (iso) =>
    iso ? new Date(iso).toLocaleString("en-IN", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: true,
}) : "-";

  return (
    <section className="bg-white rounded-xl shadow-sm border p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        📞 User Call Analytics
      </h2>

      {/* Type filter */}
      <div className="flex flex-wrap gap-2 mb-4">
        {TYPES.map((t) => (
          <button
            key={t}
            onClick={() => setType(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium border transition ${
              type === t
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
            }`}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* Date range */}
      {stats?.dateRange && (
        <div className="text-sm text-gray-500 mb-6">
          <span className="font-medium text-gray-700">From:</span>{" "}
          {formatDate(stats.dateRange.from)} &nbsp;|&nbsp;
          <span className="font-medium text-gray-700">To:</span>{" "}
          {formatDate(stats.dateRange.to)}
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        <StatCard label="Total Calls" value={s?.totalCalls} />
        <StatCard label="Ended" value={s?.endedCount} color="green" />
        <StatCard label="Missed" value={s?.missedCount} color="yellow" />
        <StatCard label="Rejected" value={s?.rejectedCount} color="red" />
        <StatCard label="Failed" value={s?.failedCount} color="orange" />
        <StatCard
          label="Duration (min)"
          value={s?.totalDurationMinutes?.toFixed(2)}
        />
      </div>

      {/* Breakdown */}
      <div className="border rounded-lg p-4 bg-gray-50">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">
          Call Breakdown
        </h3>

        {loading ? (
          <div className="text-center text-gray-500 py-6">
            Loading...
          </div>
        ) : !s ? (
          <div className="text-center text-gray-500 py-6">
            No data
          </div>
        ) : (
          <div className="divide-y">
            <BreakdownRow label="Ended Calls" value={s.endedCount} />
            <BreakdownRow label="Missed Calls" value={s.missedCount} />
            <BreakdownRow label="Rejected Calls" value={s.rejectedCount} />
            <BreakdownRow label="Failed Calls" value={s.failedCount} />
            <BreakdownRow label="Initiated Calls" value={s.initiatedCount} />
          </div>
        )}
      </div>
    </section>
  );
}

/* ---------- small stat card ---------- */
function StatCard({ label, value, color }) {
  const colors = {
    green: "text-green-600",
    yellow: "text-yellow-600",
    red: "text-red-600",
    orange: "text-orange-600",
  };

  return (
    <div className="bg-white border rounded-lg p-4 shadow-sm">
      <div className="text-xs text-gray-500">{label}</div>
      <div
        className={`text-lg font-semibold mt-1 ${
          color ? colors[color] : "text-gray-900"
        }`}
      >
        {value ?? 0}
      </div>
    </div>
  );
}

/* ---------- breakdown row ---------- */
function BreakdownRow({ label, value }) {
  return (
    <div className="flex items-center justify-between py-2 text-sm">
      <span className="text-gray-600">{label}</span>
      <span className="font-semibold text-gray-900">{value}</span>
    </div>
  );
}
