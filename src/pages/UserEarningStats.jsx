import React, { useEffect, useState } from "react";
import axios from "axios";
import { BaseUrl } from "../BaseUrl";
import { useNavigate } from "react-router-dom";
const TYPES = ["daily", "yesterday", "weekly", "monthly", "yearly"];

const TYPE_COLORS = {
  live: "bg-green-500/10 text-green-400 border-green-500/30",
  stream: "bg-sky-500/10 text-sky-400 border-sky-500/30",
  gift: "bg-pink-500/10 text-pink-400 border-pink-500/30",
  bonus: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
  agent_live: "bg-purple-500/10 text-purple-400 border-purple-500/30",
  agent_stream: "bg-indigo-500/10 text-indigo-400 border-indigo-500/30",
  agent_gift: "bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/30",
  referral: "bg-orange-500/10 text-orange-400 border-orange-500/30",
  post: "bg-cyan-500/10 text-cyan-400 border-cyan-500/30",
};

export default function UserEarningStats({ userId }) {
  const navigate = useNavigate();
  const [type, setType] = useState("daily");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [openType, setOpenType] = useState(null);

  const fetchEarnings = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const res = await axios.get(
        `${BaseUrl.baseurl}/admin/earning-stats/${userId}`,
        { params: { type } },
      );

      if (res.data?.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error("Earning stats error", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEarnings();
  }, [type, userId]);

  const formatDate = (iso) =>
    iso
      ? new Date(iso).toLocaleString("en-IN", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        })
      : "-";

  return (
    <section className="block">
      {/* ---------- Type Filter ---------- */}
      <div className="flex justify-between">
        <div>
          <button
            onClick={() => navigate(-1)}
            className="px-3 py-2 rounded-lg text-sm font-semibold bg-purple-600 hover:bg-purple-700"
          >
            Back
          </button>
        </div>
        <div className="flex flex-wrap gap-2 mb-4">
          {TYPES.map((t) => (
            <button
              key={t}
              onClick={() => setType(t)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold ${
                type === t
                  ? "bg-sky-600 text-white"
                  : "bg-[#0f1117] border border-white/10 text-[#9aa3b2] hover:bg-white/5"
              }`}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
      </div>
      {/* ---------- Summary ---------- */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <SummaryCard label="Total Coins" value={data?.totalCoins ?? 0} />
        <SummaryCard
          label="Total Amount"
          value={`₹ ${((data?.totalCoins ?? 0) * 0.2).toFixed(2)}`}
        />
        <SummaryCard label="From" value={formatDate(data?.dateRange?.from)} />
        <SummaryCard label="To" value={formatDate(data?.dateRange?.to)} />
      </div>

      {/* ---------- Breakdown ---------- */}
      <div className="bg-[#0b0d12]/40 border border-white/10 rounded-xl p-4 shadow">
        <h3 className="text-sm text-[#9aa3b2] font-semibold mb-3">Breakdown</h3>

        {loading ? (
          <div className="text-center text-[#9aa3b2] py-6">Loading...</div>
        ) : !data?.breakdown?.length ? (
          <div className="text-center text-[#9aa3b2] py-6">No data</div>
        ) : (
          <div className="space-y-3">
            {data.breakdown.map((b) => {
              const isOpen = openType === b.type;
              return (
                <div
                  key={b.type}
                  className="border border-white/10 rounded-lg bg-[#0f1117]"
                >
                  {/* Header */}
                  <div
                    className="flex items-center justify-between p-3 cursor-pointer hover:bg-white/5"
                    onClick={() => setOpenType(isOpen ? null : b.type)}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold border ${
                          TYPE_COLORS[b.type] ||
                          "bg-slate-500/10 text-slate-300 border-white/10"
                        }`}
                      >
                         {b.type==="live"?"video":b.type==="call"?"audio":b.type}
                      </span>
                      <span className="text-sm text-[#e7e9ee]">
                        {b.userCount} users
                      </span>
                    </div>

                    <div className="text-sm font-semibold text-[#e7e9ee]">
                      {b.totalCoins} coins
                    </div>
                  </div>

                  {/* Users table */}
                  {isOpen && (
                    <div className="overflow-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-xs text-[#9aa3b2] uppercase">
                            <th className="p-2 text-left">UID</th>
                            <th className="p-2 text-left">Name</th>
                            <th className="p-2 text-left">Coins</th>
                          </tr>
                        </thead>
                        <tbody>
                          {b.users.map((u) => {
                            if(u.userId===56){
                              return null
                            }
                            return(
                            <tr
                              key={u._id}
                              className="hover:bg-white/5 text-[#e7e9ee]"
                            >
                              <td className="p-2">{u.userId}</td>
                              <td className="p-2">{u.name}</td>
                              <td className="p-2 font-semibold">{u.coins}</td>
                            </tr>
                          )})}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

/* ------------------ helpers ------------------ */

function SummaryCard({ label, value }) {
  return (
    <div className="bg-[#0b0d12]/40 border border-white/10 rounded-xl p-4 shadow">
      <div className="text-xs text-[#9aa3b2]">{label}</div>
      <div className="text-lg font-semibold text-[#e7e9ee] mt-1">{value}</div>
    </div>
  );
}
