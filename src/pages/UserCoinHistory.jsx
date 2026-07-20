import React, { useEffect, useState } from "react";
import axios from "axios";
import { BaseUrl } from "../BaseUrl";

const PAGE_SIZE = 10;

const TYPE_COLORS = {
  live: "text-green-400",
  stream: "text-sky-400",
  gift: "text-pink-400",
  bonus: "text-yellow-400",
  agent_live: "text-purple-400",
  agent_stream: "text-indigo-400",
  agent_gift: "text-fuchsia-400",
  referral: "text-orange-400",
  post: "text-cyan-400",
};

export default function UserCoinHistory({ userId }) {
  const [rows, setRows] = useState([]);
  const [skip, setSkip] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [openRow, setOpenRow] = useState(null);

  const fetchHistory = async (reset = false) => {
    if (!userId || loading) return;

    setLoading(true);
    try {
      const res = await axios.get(
        `${BaseUrl.baseurl}/user/get-user-coins-history/${userId}`,
        {
          params: { skip: reset ? 0 : skip },
        },
      );

      if (res.data?.status) {
        const data = res.data.data || [];
        setRows((prev) => (reset ? data : [...prev, ...data]));
        setSkip((prev) => (reset ? data.length : prev + data.length));
        setHasMore(data.length === PAGE_SIZE);
      }
    } catch (err) {
      console.error("Coin history error", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory(true);
  }, [userId]);

  const formatDate = (d) =>
    d
      ? new Date(d).toLocaleString("en-IN", {
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
      <h2 className="text-xl font-bold text-[#e7e9ee] mb-4">
        🪙 User Coin History
      </h2>

      <div className="bg-[#0b0d12]/40 border border-white/10 rounded-xl shadow">
        {/* table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-[#9aa3b2] uppercase border-b border-white/10">
                <th className="p-3 text-left">Date</th>
                <th className="p-3 text-left">Coins</th>
                <th className="p-3 text-left">Users</th>

                <th className="p-3 text-left">Action</th>
              </tr>
            </thead>

            <tbody>
              {rows.map((r) => {
                const isOpen = openRow === r._id;
                return (
                  <React.Fragment key={r._id}>
                    <tr className="hover:bg-white/5 text-[#e7e9ee]">
                      <td className="p-3">
                        {formatDate(r.date || r.createdAt)}
                      </td>

                      <td
                        className={`p-3 font-semibold ${
                          r.coins < 0 ? "text-red-400" : "text-green-400"
                        }`}
                      >
                        {r.coins}
                      </td>

                      <td className="p-3 text-[#9aa3b2]">
                        {r.userCount?.length || 0}
                      </td>

                      {/* <td className="p-3">
                        <span
                          className={`px-2 py-1 rounded-full text-xs border ${
                            r.isPaid
                              ? "bg-green-500/10 text-green-300 border-green-500/30"
                              : "bg-yellow-500/10 text-yellow-300 border-yellow-500/30"
                          }`}
                        >
                          {r.isPaid ? "Paid" : "Unpaid"}
                        </span>
                      </td> */}

                      <td className="p-3">
                        <button
                          onClick={() => setOpenRow(isOpen ? null : r._id)}
                          className="text-sky-400 text-xs hover:underline"
                        >
                          {isOpen ? "Hide" : "View"}
                        </button>
                      </td>
                    </tr>

                    {/* details */}
                    {isOpen && (
                      <tr className="bg-[#0f1117]">
                        <td colSpan={5} className="p-4">
                          <div className="overflow-x-auto">
                            <table className="w-full text-xs">
                              <thead>
                                <tr className="text-[#9aa3b2] uppercase">
                                  <th className="p-2 text-left">Type</th>
                                  <th className="p-2 text-left">Coins</th>
                                  <th className="p-2 text-left">From User</th>
                                </tr>
                              </thead>
                              <tbody>
                                {r.details?.map((d) => (
                                  <tr key={d._id} className="hover:bg-white/5">
                                    <td
                                      className={`p-2 font-semibold ${
                                        TYPE_COLORS[d.type] || "text-slate-300"
                                      }`}
                                    >
                                      {d.type}
                                    </td>
                                    <td className="p-2 text-[#9aa3b2]">
                                      {d.coins}
                                    </td>
                                    <td className="p-2 text-[#9aa3b2]">
                                      {d.fromUserId}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}

              {!rows.length && !loading && (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-[#9aa3b2]">
                    No history found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* footer */}
        <div className="flex justify-center p-4">
          <button
            onClick={() => fetchHistory()}
            disabled={!hasMore || loading}
            className={`px-5 py-2 rounded-lg text-sm font-semibold ${
              !hasMore || loading
                ? "bg-slate-700 text-slate-400 cursor-not-allowed"
                : "bg-sky-600 hover:bg-sky-700 text-white"
            }`}
          >
            {loading ? "Loading..." : hasMore ? "Load more" : "No more records"}
          </button>
        </div>
      </div>
    </section>
  );
}
