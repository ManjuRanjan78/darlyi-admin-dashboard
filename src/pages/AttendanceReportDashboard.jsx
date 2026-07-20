import React, { useEffect, useState } from "react";
import axios from "axios";
import { BaseUrl } from "../BaseUrl";
import toast from "react-hot-toast";

const TYPES = [
  "today",
  "yesterday",
  "weekly",
  "monthly",
  "custom",
];

export default function AttendanceReportDashboard({ userId }) {
  const [type, setType] = useState("today");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const params =
        type === "custom"
          ? {
              type,
              startDate: new Date(startDate).toISOString(),
              endDate: new Date(endDate).toISOString(),
            }
          : { type };

      const res = await axios.get(
        `${BaseUrl.baseurl}/admin/attendance-report/${userId}`,
        { params }
      );

      if (res.data?.status) {
        setData(res.data);
      } else {
        toast.error("Failed to load attendance");
      }
    } catch (err) {
      toast.error("Network error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (type !== "custom") {
      fetchAttendance();
    }
  }, [type]);

  const handleCustomFetch = () => {
    if (!startDate || !endDate) {
      toast.error("Select both start and end date");
      return;
    }
    fetchAttendance();
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6 space-y-6 border border-gray-200">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h2 className="text-xl font-bold text-gray-800">
          📊 Attendance Report
        </h2>

        <div className="flex flex-wrap gap-3">
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
          >
            {TYPES.map((t) => (
              <option key={t} value={t}>
                {t.toUpperCase()}
              </option>
            ))}
          </select>

          {type === "custom" && (
            <>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
              />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
              />
              <button
                onClick={handleCustomFetch}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-semibold"
              >
                Apply
              </button>
            </>
          )}
        </div>
      </div>

      {/* DATE RANGE */}
      {data?.dateRange && (
        <div className="text-sm text-gray-500">
          From{" "}
          <span className="font-medium text-gray-700">
            {new Date(data.dateRange.start).toLocaleDateString()}
          </span>{" "}
          to{" "}
          <span className="font-medium text-gray-700">
            {new Date(data.dateRange.end).toLocaleDateString()}
          </span>
        </div>
      )}

      {/* SUMMARY CARDS */}
      {loading ? (
        <div className="text-center text-gray-500 py-10">
          Loading attendance...
        </div>
      ) : data?.summary ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <StatCard
            title="Days Present"
            value={data.summary.totalDaysPresent}
          />
          <StatCard
            title="Online Sessions"
            value={data.summary.totalOnlineCount}
          />
          <StatCard
            title="Offline Sessions"
            value={data.summary.totalOfflineCount}
          />
          <StatCard
            title="Total Online Duration"
            value={data.summary.totalOnlineDurationFormatted}
          />
        </div>
      ) : null}
    </div>
  );
}

/* ---------- Small Stat Card ---------- */
const StatCard = ({ title, value }) => (
  <div className="bg-gray-50 rounded-lg p-5 border border-gray-200 hover:shadow-sm transition">
    <p className="text-sm text-gray-500 mb-1">{title}</p>
    <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
  </div>
);
