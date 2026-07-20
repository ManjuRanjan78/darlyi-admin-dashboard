// src/pages/AdminMonthlyStats?.jsx

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  CalendarDays,
  IndianRupee,
  DollarSign,
  Coins,
  Phone,
  Video,
  Users,
  TrendingUp,
  Wallet,
  RefreshCcw,
  Receipt,
  Equal,
  BanknoteIcon,
  LucideBanknote,
} from "lucide-react";
import { BaseUrl } from "../BaseUrl";

export default function AdminMonthlyStats() {
  const now = new Date();

  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());

  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);

  const months = [
    { value: 1, label: "January" },
    { value: 2, label: "February" },
    { value: 3, label: "March" },
    { value: 4, label: "April" },
    { value: 5, label: "May" },
    { value: 6, label: "June" },
    { value: 7, label: "July" },
    { value: 8, label: "August" },
    { value: 9, label: "September" },
    { value: 10, label: "October" },
    { value: 11, label: "November" },
    { value: 12, label: "December" },
  ];

  const years = useMemo(() => {
    const arr = [];
    for (let y = 2024; y <= 2035; y++) arr.push(y);
    return arr;
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);

      const res = await axios.get(
        `${BaseUrl.baseurl}/get-stats?month=${month}&year=${year}`,
      );

      if (res.data?.status) {
        setStats(res.data.data);
      }
    } catch (error) {
      console.error(error);
      alert("Failed to load stats");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const card =
    "rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900 to-slate-950 p-5 shadow-xl";

  const StatCard = ({ title, value, icon, sub }) => (
    <div className={card}>
      <div className="flex items-center justify-between mb-4">
        <p className="text-slate-400 text-sm">{title}</p>
        <div className="p-2 rounded-xl bg-white/5">{icon}</div>
      </div>

      <h2 className="text-2xl font-bold text-white">{value}</h2>

      {sub && <p className="text-xs text-slate-500 mt-2">{sub}</p>}
    </div>
  );
  const audioEnded = stats?.call?.audio?.ended || {};
  const audioRejected = stats?.call?.audio?.rejected || {};

  const audioTotalCalls =
    (audioEnded.totalCalls || 0) + (audioRejected.totalCalls || 0);

  const audioTotalMinutes =
    (audioEnded.totalMinutes || 0) + (audioRejected.totalMinutes || 0);
  const videoEnded = stats?.call?.video?.ended || {};
  const videoRejected = stats?.call?.video?.rejected || {};

  const videoTotalCalls =
    (videoEnded.totalCalls || 0) + (videoRejected.totalCalls || 0);

  const videoTotalMinutes =
    (videoEnded.totalMinutes || 0) + (videoRejected.totalMinutes || 0);
  const connectedAudioAmount = (audioEnded.totalMinutes || 0) * 0.2;
  const connectedVideoAmount = (videoEnded.totalMinutes || 0) * 0.8;
  const totalConnectedBilling = connectedAudioAmount + connectedVideoAmount;

  // REJECTED BILLING
  const rejectedAudioAmount = (audioRejected.totalMinutes || 0) * 0.1;
  const rejectedVideoAmount = (videoRejected.totalMinutes || 0) * 0.4;
  const totalRejectedBilling = rejectedAudioAmount + rejectedVideoAmount;

  // TOTAL
  const totalAghoraBilling = totalConnectedBilling + totalRejectedBilling;
  return (
    <div className=" bg-[#050816] text-white p-6">
      {/* Header */}
      <div className="rounded-3xl border border-white/10 bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 p-6 shadow-2xl">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5">
          <div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight">
              Monthly Analytics
            </h1>
            <p className="text-slate-400 mt-2">
              Select month and year to view complete platform performance.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <div>
              <label className="text-xs text-slate-400 block mb-2">
                Select Month
              </label>
              <select
                value={month}
                onChange={(e) => setMonth(Number(e.target.value))}
                className="bg-slate-800 border border-white/10 rounded-xl px-4 py-3 min-w-[180px]"
              >
                {months.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-2">
                Select Year
              </label>
              <select
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="bg-slate-800 border border-white/10 rounded-xl px-4 py-3 min-w-[140px]"
              >
                {years.map((y) => (
                  <option key={y}>{y}</option>
                ))}
              </select>
            </div>

            <button
              onClick={fetchStats}
              disabled={loading}
              className="h-[50px] mt-auto px-6 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-500 transition-all shadow-lg flex items-center gap-2"
            >
              <RefreshCcw size={16} className={loading ? "animate-spin" : ""} />
              {loading ? "Loading..." : "Get Stats"}
            </button>
          </div>
        </div>
      </div>

      {/* Loader */}
      {loading && (
        <div className="mt-6 rounded-2xl bg-slate-900 border border-white/10 p-5">
          <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
            <div className="h-2 w-full bg-indigo-500 animate-pulse"></div>
          </div>
          <p className="text-sm text-slate-400 mt-3">
            Fetching dashboard analytics...
          </p>
        </div>
      )}

      {/* Data */}
      {stats && !loading && (
        <>
          {/* Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-6">
            <div className={card}>
              <p className="text-slate-400 text-sm">Profit INR</p>
              <h2 className="text-3xl font-black mt-3 text-cyan-400">
                ₹ {format(stats?.profit?.INR)}
              </h2>
              <p className="text-sm text-slate-500 mt-2">After Redeem</p>
            </div>
            <div className={card}>
              <p className="text-slate-400 text-sm">Profit USD</p>
              <h2 className="text-3xl font-black mt-3 text-cyan-400">
                $ {format(stats?.profit?.USD)}
              </h2>
              <p className="text-sm text-slate-500 mt-2">Foreign Revenue</p>
            </div>
          </div>

          {/* Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mt-6">
            <StatCard
              title="INR Revenue"
              value={`₹ ${format(stats?.transaction?.INR?.totalAmount)}`}
              sub={`${format(stats?.transaction?.INR?.totalTransactions)} Payments`}
              icon={<IndianRupee size={18} />}
            />
            <StatCard
              title="USD Revenue"
              value={`$ ${format(stats?.transaction?.USD?.totalAmount)}`}
              sub={`${format(stats?.transaction?.USD?.totalTransactions)} Payments`}
              icon={<DollarSign size={18} />}
            />
            <StatCard
              title="Redeem Final Amount"
              value={`₹ ${format(stats?.redeemData?.totalFinalAmount)}`}
              sub={`Tax ₹ ${format(stats?.redeemData?.totalTax)}`}
              icon={<Wallet size={18} />}
            />
            <StatCard
              title="Redeem Coins"
              value={format(stats?.redeemData?.totalCoins)}
              sub={`Transactions: ${format(stats?.redeemData?.totalTransactions)}`}
              icon={<Coins size={18} />}
            />

            <StatCard
              title="Male Coins Distributed"
              value={`₹ ${format(stats?.maleCoinsData?.totalCoins)}`}
              sub={`Users: ${format(stats?.maleCoinsData?.totalUsers)}`}
              icon={<TrendingUp size={18} />}
            />
            <StatCard
              title="Payout Paid"
              value={`₹ ${format(stats?.payouts?.paid?.amount)}`}
              sub={`Coins: ${format(stats?.payouts?.paid?.coins)}`}
              icon={<BanknoteIcon size={18} />}
            />
            <StatCard
              title="Payout UnPaid"
              value={`₹ ${format(stats?.payouts?.unpaid?.amount)}`}
              sub={`Coins: ${format(stats?.payouts?.unpaid?.coins)}`}
              icon={<LucideBanknote size={18} />}
            />

            <StatCard
              title="Audio Calls"
              value={
                <div className="flex gap-3 items-center ">
                  <span className="text-green-400">
                    {console.log("jabbeshaa", audioEnded)}✔{" "}
                    {format(audioEnded.totalCalls)}
                  </span>
                  <span className="text-red-400">
                    ✖ {format(audioRejected.totalCalls)}
                  </span>
                  <span className="text-fuchsia-400 flex ">
                    <Equal size={18} className="mt-[6px]" />{" "}
                    {format(audioTotalCalls)}
                  </span>
                </div>
              }
              sub={`
Total: ${format(audioTotalMinutes)} mins - ₹ ${format(audioEnded.totalMinutes * 0.2 + audioRejected.totalMinutes * 0.1)}
(✔ ${format(audioEnded.totalMinutes)} mins - ₹ ${format(audioEnded.totalMinutes * 0.2)})
(✖ ${format(audioRejected.totalMinutes)} mins - ₹ ${format(audioRejected.totalMinutes * 0.1)})
`}
              icon={<Phone size={18} />}
            />

            <StatCard
              title="Video Calls"
              value={
                <div className="flex gap-3 items-center ">
                  <span className="text-green-400">
                    ✔ {format(videoEnded.totalCalls)}
                  </span>
                  <span className="text-red-400">
                    ✖ {format(videoRejected.totalCalls)}
                  </span>
                  <span className="text-fuchsia-400 flex ">
                    <Equal size={18} className="mt-[6px]" />{" "}
                    {format(videoTotalCalls)}
                  </span>
                </div>
              }
              sub={`
Total: ${format(videoTotalMinutes)} mins - ₹ ${format(videoEnded.totalMinutes * 0.8 + videoRejected.totalMinutes * 0.4)}
(✔ ${format(videoEnded.totalMinutes)} mins - ₹ ${format(videoEnded.totalMinutes * 0.8)})
(✖ ${format(videoRejected.totalMinutes)} mins - ₹ ${format(videoRejected.totalMinutes * 0.4)})
`}
              icon={<Video size={18} />}
            />
            <StatCard
              title="Aghora Billing Amount"
              value={`₹ ${format(totalAghoraBilling)}`}
              sub={
                <div className="space-y-1 text-xs">
                  <div className="text-green-400">
                    ✔ Connected: ₹ {format(totalConnectedBilling)}
                    (Audio ₹ {format(connectedAudioAmount)} | Video ₹{" "}
                    {format(connectedVideoAmount)})
                  </div>

                  <div className="text-red-400">
                    ✖ Rejected: ₹ {format(totalRejectedBilling)}
                    (Audio ₹ {format(rejectedAudioAmount)} | Video ₹{" "}
                    {format(rejectedVideoAmount)})
                  </div>
                </div>
              }
              icon={<Receipt size={18} />}
            />
          </div>
        </>
      )}
    </div>
  );
}
const format = (num) => num?.toLocaleString("en-IN") || "0";
