import React, { useEffect, useState } from "react";
import axios from "axios";
import { BaseUrl } from "../BaseUrl";
import { useNavigate } from "react-router-dom";
const TABS = ["today", "yesterday", "weekly", "monthly"];

export default function HostCallHistoryDashboard() {
  const [activeTab, setActiveTab] = useState("today");
  const [data, setData] = useState({});
  const [expandedHost, setExpandedHost] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCallHistory();
  }, []);

  const fetchCallHistory = async () => {
    const res = await axios.get(`${BaseUrl.baseurl}/admin/host-call-history`);

    if (res.data.status) {
      setData(res.data.data);
    }
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleString("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatDuration = (start, end) => {
    if (!start || !end) return "—";
    const diff = (new Date(end) - new Date(start)) / 1000;
    const mins = Math.floor(diff / 60);
    const secs = Math.floor(diff % 60);
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="min-h-screen bg-[#0b0d12] p-6 text-white">
      {/* ================= HEADER ================= */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <button
            onClick={() => navigate(-1)}
            className="px-3 py-2 rounded-lg text-sm font-semibold bg-purple-600 hover:bg-purple-700"
          >
            Back
          </button>
        </div>
        <h2 className="text-2xl font-bold">📞 Host Call History</h2>
      </div>

      {/* ================= TABS ================= */}
      <div className="flex gap-3 mb-6 flex-wrap">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setExpandedHost(null);
              setActiveTab(tab);
            }}
            className={`px-4 py-2 rounded-lg text-sm font-semibold capitalize transition ${
              activeTab === tab
                ? "bg-indigo-600 text-white"
                : "bg-[#11151f] border border-white/10 text-[#9aa3b2] hover:bg-[#1a1f33]"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ================= HOST LIST ================= */}
      <div className="space-y-4">
        {data[activeTab]?.length === 0 && (
          <div className="text-center text-[#9aa3b2] py-12">
            No call records found.
          </div>
        )}

        {data[activeTab]?.map((host) => (
          <div
            key={host._id}
            className="bg-[#11151f] border border-white/10 rounded-xl overflow-hidden"
          >
            {/* ===== Host Summary Row ===== */}
            <div
              className="flex justify-between items-center p-4 cursor-pointer hover:bg-[#1a1f33] transition"
              onClick={() =>
                setExpandedHost(expandedHost === host._id ? null : host._id)
              }
            >
              <div>
                <p className="font-semibold text-lg">{host.name}</p>
                <p className="text-xs text-[#9aa3b2]">User ID: {host.userId}</p>
              </div>

              <div className="flex gap-6 items-center text-sm">
                <div>
                  <p className="text-[#9aa3b2]">Total Calls</p>
                  <p className="font-bold">{host.totalCalls}</p>
                </div>

                <div>
                  <p className="text-[#9aa3b2]">Missed Calls</p>
                  <p className="font-bold text-red-400">
                    {host.totalMissedCalls}
                  </p>
                </div>

                <div className="text-indigo-400 text-lg">
                  {expandedHost === host._id ? "▲" : "▼"}
                </div>
              </div>
            </div>

            {/* ===== Expanded Call List ===== */}
            {expandedHost === host._id && (
              <div className="border-t border-white/10">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-[#9aa3b2] text-xs uppercase">
                        <th className="p-3 text-left">Call ID</th>
                        <th className="p-3 text-left">Type</th>
                        <th className="p-3 text-left">Started</th>
                        <th className="p-3 text-left">Ended</th>
                        <th className="p-3 text-left">Duration</th>
                      </tr>
                    </thead>
                    <tbody>
                      {host.missedCallDetails.map((call) => (
                        <tr
                          key={call.callId}
                          className="border-t border-white/5 hover:bg-white/5"
                        >
                          <td className="p-3 text-indigo-400">{call.callId}</td>

                          <td className="p-3 capitalize">
                            <span
                              className={`px-2 py-1 rounded-full text-xs ${
                                call.callType === "video"
                                  ? "bg-purple-500/20 text-purple-300"
                                  : "bg-blue-500/20 text-blue-300"
                              }`}
                            >
                              {call.callType}
                            </span>
                          </td>

                          <td className="p-3">{formatTime(call.startedAt)}</td>

                          <td className="p-3">
                            {call.endedAt
                              ? formatTime(call.endedAt)
                              : "Ongoing"}
                          </td>

                          <td className="p-3 font-semibold text-green-400">
                            {call.duration}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
