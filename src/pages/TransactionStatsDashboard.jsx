import React, { useEffect, useState } from "react";
import api from "../services/axiosClient";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
const userDetails = JSON.parse(localStorage.getItem("LiveStreamAdminDetails"));
const TYPES =
  userDetails?.data?.role?.name === "Super Admin"
    ? ["daily", "yesterday", "weekly", "monthly", "yearly"]
    : ["daily", "yesterday", "weekly"];
const CURRENCIES = ["INR", "USD"];

export default function TransactionStatsDashboard({ currency, setCurrency }) {
  const navigate = useNavigate();
  const [type, setType] = useState("daily");
  const [startDate, setStartDate] = useState("");
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const PAGE_SIZE = 10;

  const [allTransactions, setAllTransactions] = useState([]);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const visibleTransactions = allTransactions.slice(0, visibleCount);
  const hasMore = visibleCount < allTransactions.length;

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await api.get("admin/transaction-stats", {
        params: {
          type,
          accountType: currency,
          fromDate: startDate,
          toDate: startDate,
        },
      });

      if (res.data) {
        const togiloData = (res.data?.togilo?.data || []).map((item) => ({
          ...item,
          app: "togilo",
        }));

        const flirtyVoiceData = (res.data?.flirtyVoice?.data || []).map(
          (item) => ({
            ...item,
            app: "flirtyVoice",
          }),
        );
        const list = [...togiloData, ...flirtyVoiceData].sort(
          (a, b) => (b.totalAmount || 0) - (a.totalAmount || 0),
        );

        setStats(res.data);
        setAllTransactions(list);
        setVisibleCount(PAGE_SIZE);
      } else {
        toast.error("Failed to load stats");
      }
    } catch (err) {
      toast.error("Network error");
    } finally {
      setLoading(false);
    }
  };
  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + PAGE_SIZE);
  };

  useEffect(() => {
    fetchStats();
  }, [type, currency, startDate]);

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
    <section className="block mt-4">
      <h2 className="text-xl font-bold text-[#e7e9ee] mb-4">
        📊 Transaction Stats ({currency})
      </h2>

      {/* FILTERS */}
      <div className="flex flex-wrap gap-3 mb-4 justify-between">
        <div className="flex flex-wrap gap-3">
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
          {userDetails?.data?.role?.name === "Super Admin" && (
            <input
              type="date"
              max={new Date().toISOString().split("T")[0]}
              value={startDate}
              onChange={(e) => {
                setType("custom");
                setStartDate(e.target.value);
              }}
              className="bg-[#0f1320] text-white border border-[#2d3748] rounded-lg py-2 px-3"
            />
          )}
        </div>

        <div className="w-1/6">
          {" "}
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="w-full bg-[#0f1117] border border-white/10 text-[#e7e9ee] rounded px-3 py-2 text-sm"
          >
            {CURRENCIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* SUMMARY CARDS */}
      <div className="space-y-8 mb-6">
        {/* ================= TOGILO ================= */}
        <div className="rounded-2xl border border-blue-500/20 bg-[#101624] overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 bg-blue-500/10 border-b border-blue-500/20">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-blue-500" />
              <h2 className="text-lg font-bold text-white">Togilo</h2>
            </div>

            <span className="text-xs text-blue-300 font-medium">
              Platform Analytics
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 p-5">
            <SummaryCard
              label="Total Transactions"
              value={stats?.togilo?.totalTransactions ?? 0}
            />

            <SummaryCard
              label="Total Users"
              value={stats?.togilo?.totalUsers ?? 0}
            />

            <SummaryCard
              label="Total Amount"
              value={`${currency === "USD" ? "$" : "₹"} ${format(
                stats?.togilo?.totalAmount ?? 0,
              )}`}
            />

            <SummaryCard
              label="From"
              value={formatDate(stats?.dateRange?.from)}
            />

            <SummaryCard label="To" value={formatDate(stats?.dateRange?.to)} />
          </div>
        </div>

        {/* ================= FLIRTY VOICE ================= */}
        <div className="rounded-2xl border border-pink-500/20 bg-[#101624] overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 bg-pink-500/10 border-b border-pink-500/20">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-pink-500" />
              <h2 className="text-lg font-bold text-white">Flirty Voice</h2>
            </div>

            <span className="text-xs text-pink-300 font-medium">
              Platform Analytics
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 p-5">
            <SummaryCard
              label="Total Transactions"
              value={stats?.flirtyVoice?.totalTransactions ?? 0}
            />

            <SummaryCard
              label="Total Users"
              value={stats?.flirtyVoice?.totalUsers ?? 0}
            />

            <SummaryCard
              label="Total Amount"
              value={`${currency === "USD" ? "$" : "₹"} ${format(
                stats?.flirtyVoice?.totalAmount ?? 0,
              )}`}
            />

            <SummaryCard
              label="From"
              value={formatDate(stats?.dateRange?.from)}
            />

            <SummaryCard label="To" value={formatDate(stats?.dateRange?.to)} />
          </div>
        </div>
      </div>

      {/* TOP USER */}
      <div className="flex gap-4 justify-between">
        {stats?.togilo?.topUser && (
          <div className="bg-[#0b0d12]/40 border border-white/10 rounded-xl p-4 shadow mb-6 w-full">
            <h3 className="text-sm text-[#9aa3b2] font-semibold mb-2">
              🏆 Top User Togilo ({currency})
            </h3>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-[#e7e9ee]">
              <div>
                <div className="text-lg font-semibold">
                  {stats?.togilo?.topUser.user?.name}
                </div>
                <div className="text-xs text-[#9aa3b2]">
                  UID: {stats?.togilo?.topUser.user?.uId}
                </div>
              </div>

              <div className="flex gap-6 text-sm">
                <div>
                  <div className="text-[#9aa3b2]">Amount</div>
                  <div className="font-semibold">
                    {currency === "USD" ? "$" : "₹"}{" "}
                    {format(stats?.togilo?.topUser.totalAmount)}
                  </div>
                </div>
                <div>
                  <div className="text-[#9aa3b2]">Transactions</div>
                  <div className="font-semibold">
                    {stats?.togilo?.topUser.totalTransactions}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        {stats?.flirtyVoice?.topUser && (
          <div className="bg-[#0b0d12]/40 border border-white/10 rounded-xl p-4 shadow mb-6 w-full">
            <h3 className="text-sm text-[#9aa3b2] font-semibold mb-2">
              🏆 Top User Flirty Voice ({currency})
            </h3>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-[#e7e9ee]">
              <div>
                <div className="text-lg font-semibold">
                  {stats?.flirtyVoice?.topUser.user?.name}
                </div>
                <div className="text-xs text-[#9aa3b2]">
                  UID: {stats?.flirtyVoice?.topUser.user?.uId}
                </div>
              </div>

              <div className="flex gap-6 text-sm">
                <div>
                  <div className="text-[#9aa3b2]">Amount</div>
                  <div className="font-semibold">
                    {currency === "USD" ? "$" : "₹"}{" "}
                    {format(stats?.flirtyVoice?.topUser.totalAmount)}
                  </div>
                </div>
                <div>
                  <div className="text-[#9aa3b2]">Transactions</div>
                  <div className="font-semibold">
                    {stats?.flirtyVoice?.topUser.totalTransactions}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* USER TABLE */}
      <div className="bg-[#0b0d12]/40 border border-white/10 rounded-xl p-4 shadow mb-4">
        <div className="flex justify-between items-center py-2">
          <h3 className="text-sm text-[#9aa3b2] font-semibold mb-3">
            User Transactions
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="text-[#9aa3b2] text-xs uppercase">
                <th className="p-2 text-left">UID</th>
                <th className="p-2 text-left">Name</th>
                <th className="p-2 text-left">Phone/Email</th>
                <th className="p-2 text-left">Transactions</th>
                <th className="p-2 text-left">Total Amount</th>
                <th className="p-2 text-left">App</th>
                <th className="p-2 text-left">Transactions</th>
                <th className="p-2 text-left">Coins</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="p-4 text-center text-[#9aa3b2]">
                    Loading...
                  </td>
                </tr>
              ) : !allTransactions?.length ? (
                <tr>
                  <td colSpan={4} className="p-4 text-center text-[#9aa3b2]">
                    No data
                  </td>
                </tr>
              ) : (
                visibleTransactions.map((row) => (
                  <tr
                    key={row.userId}
                    className="hover:bg-white/5 text-[#e7e9ee]"
                  >
                    <td className="p-2">{row.user?.uId}</td>
                    <td className="p-2">{row.user?.name}</td>
                    <td className="p-2">
                      {row.user?.phone ? row.user?.phone : row.user?.email}
                    </td>
                    <td className="p-2">{row.totalTransactions}</td>
                    <td className="p-2 font-semibold">
                      {currency === "USD" ? "$" : "₹"} {format(row.totalAmount)}
                    </td>
                    <td className="p-2">{row.app}</td>
                    <td>
                      <button
                        onClick={() =>
                          navigate(`/Transaction-History/${row.userId}`)
                        }
                        className="bg-[#7c3aed] text-black py-1 px-3 rounded-xl hover:bg-[#6d28d9] transition-colors text-sm font-semibold"
                      >
                        View
                      </button>
                    </td>
                    <td>
                      <button
                        onClick={() => navigate(`/Coins-History/${row.userId}`)}
                        className="bg-[#7c3aed] text-black py-1 px-3 rounded-xl hover:bg-[#6d28d9] transition-colors text-sm font-semibold"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {hasMore && (
          <div className="flex justify-center mt-6">
            <button
              onClick={handleLoadMore}
              className="px-6 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
            >
              Load more
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

/* ================= SUMMARY CARD ================= */
function SummaryCard({ label, value }) {
  return (
    <div className="bg-[#0b0d12]/40 border border-white/10 rounded-xl p-4 shadow">
      <div className="text-xs text-[#9aa3b2]">{label}</div>
      <div className="text-lg font-semibold text-[#e7e9ee] mt-1">
        {value ?? "-"}
      </div>
    </div>
  );
}
const format = (num) => num?.toLocaleString("en-IN") || "0";
