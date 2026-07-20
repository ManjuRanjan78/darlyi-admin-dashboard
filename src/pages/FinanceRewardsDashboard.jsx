import React, { useEffect, useState } from "react";
import axios from "axios";
import { BaseUrl } from "../BaseUrl";
import toast from "react-hot-toast";

export default function FinanceRewardsDashboard() {
  const [summary, setSummary] = useState(null);
  const [rewardStats, setRewardStats] = useState([]);
  const [saturdayData, setSaturdayData] = useState([]);
  const [loadingRelease, setLoadingRelease] = useState(null);
const [confirmUser, setConfirmUser] = useState(null);
  /* ================= FETCH ================= */

  useEffect(() => {
    fetchSummary();
    fetchRewardStats();
    fetchSaturday();
  }, []);

  const fetchSummary = async () => {
    const res = await axios.get(
      `${BaseUrl.baseurl}/admin/get-user-finance-summary`
    );
    if (res.data.status) setSummary(res.data.data);
  };

  const fetchRewardStats = async () => {
    const res = await axios.get(
      `${BaseUrl.baseurl}/admin/get-reward-stats`
    );
    if (res.data.status) setRewardStats(res.data.data);
  };

  const fetchSaturday = async () => {
    const res = await axios.get(
      `${BaseUrl.baseurl}/admin/get-all-earnings-saturday`
    );
    if (res.data.status) setSaturdayData(res.data.data);
  };

  /* ================= RELEASE ================= */

  const handleRelease = async (userId) => {
  try {
    setLoadingRelease(userId);
    const res = await axios.put(
    //   `${BaseUrl.baseurl}/admin/release-coins-saturday/${userId}`
    );

    if (res.data.status) {
      toast.success("Payout released successfully");
      fetchSaturday();
    } else {
      toast.error("Failed to release payout");
    }
  } catch {
    toast.error("Network error");
  } finally {
    setLoadingRelease(null);
  }
};

  return (
    <div className=" bg-[#0b0d12] p-6 text-white space-y-8">

      {/* ================= FINANCE SUMMARY ================= */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <FinanceCard title="Paid Coins" value={summary.totalPaidCoins} />
          <FinanceCard title="Paid Amount ₹" value={`₹ ${format(parseFloat(summary.toalPaidAmount))}`} />
          <FinanceCard title="Unpaid Coins" value={summary.totalUnpaidCoins} />
          <FinanceCard title="Unpaid Amount ₹" value={`₹ ${format(parseFloat(summary.totalUnpaidAmount))}`} />
          <FinanceCard title="Total Amount ₹" value={`₹ ${format(parseFloat(summary.totalAmountINR))}`} />
          <FinanceCard title="Purchased Coins" value={summary.totalPurchasedCoins} />
          <FinanceCard title="Company Earning" value={`₹ ${format(parseFloat(summary.totalAmountINR)-(parseFloat(summary.totalUnpaidAmount)+parseFloat(summary.toalPaidAmount)))}`} />
          <FinanceCard title="Purchased Coins" value={summary.totalPurchasedCoins} />
          <FinanceCard title="Remaining Coins (inside Users)" value={summary.totalAvailableCoins?.totalCoins} />
          <FinanceCard title="Number of Users (holding coins)" value={summary.totalAvailableCoins?.totalUsers} />
        </div>
      )}

      {/* ================= REWARD STATS ================= */}
      <div className="bg-[#11151f] border border-white/10 rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4">🎖 Reward Statistics</h3>

        <div className="grid md:grid-cols-3 gap-6">
          {rewardStats.map((r, i) => (
            <div
              key={i}
              className="bg-[#0f1117] border border-white/5 rounded-lg p-4"
            >
              <p className="text-sm font-semibold capitalize mb-3">
                {r.role.replace("_", " ")}
              </p>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <MiniStat label="Today" value={r.todayCoins} />
                <MiniStat label="Yesterday" value={r.yesterdayCoins} />
                <MiniStat label="Weekly" value={r.weeklyCoins} />
                <MiniStat label="Monthly" value={r.monthlyCoins} />
              </div>

              <div className="mt-4 text-right font-bold text-indigo-400">
                Total: {format(r.totalCoins)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ================= SATURDAY PAYOUT ================= */}
      {/* <div className="bg-[#11151f] border border-white/10 rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4">🗓 Saturday Payout Control</h3>

        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[#9aa3b2] text-xs uppercase">
                <th className="p-2 text-left">User</th>
                <th className="p-2 text-left">Coins (Earned/Spent)</th>
                <th className="p-2 text-left">Wallet Coins</th>
                <th className="p-2 text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              {saturdayData.map((u) => {
                const eligible = u.totalCoins >= 5000;

                return (
                  <tr
                    key={u.userId}
                    className={`border-t border-white/5 ${
                      eligible ? "bg-green-500/5" : ""
                    }`}
                  >
                    <td className="p-2 font-semibold">{u.name} (ID: {u.userId})</td>

                    <td
                      className={`p-2 font-bold ${
                        u.totalCoins < 0
                          ? "text-red-400"
                          : "text-green-400"
                      }`}
                    >
                      {format(u.totalCoins)}
                    </td>

                    <td className="p-2">{format(u.currentWalletCoins)}</td>

                    <td className="p-2">
                      <button
                        disabled={!eligible || loadingRelease === u.userId}
                        onClick={() => setConfirmUser(u)}
                        className={`px-4 py-1 rounded-lg text-xs font-semibold transition ${
                          eligible
                            ? "bg-indigo-600 hover:bg-indigo-700 text-white"
                            : "bg-slate-700 text-slate-400 cursor-not-allowed"
                        }`}
                      >
                        {loadingRelease === u.userId
                          ? "Releasing..."
                          : eligible
                          ? "Release"
                          : "Not Eligible"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <p className="text-xs text-[#9aa3b2] mt-4">
          * Only users with more than 5000 earned coins are eligible for payout.
        </p>
      </div> */}
{confirmUser && (
  <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
    <div className="bg-[#11151f] border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl">

      <div className="text-center space-y-4">
        <div className="text-4xl">💸</div>

        <h3 className="text-lg font-semibold text-white">
          Confirm Payout Release
        </h3>

        <p className="text-sm text-[#9aa3b2]">
          Are you sure you want to release payout to
        </p>

        <p className="font-bold text-indigo-400">
          {confirmUser.name} (ID: {confirmUser.userId})
        </p>

        <p className="text-sm">
          Coins to Release:{" "}
          <span className="text-green-400 font-bold">
            {confirmUser.totalCoins}
          </span>
        </p>

        <div className="flex gap-4 justify-center pt-4">
          <button
            onClick={() => setConfirmUser(null)}
            className="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white text-sm"
          >
            Cancel
          </button>

          <button
            onClick={async () => {
              // await handleRelease(confirmUser.userId);
              setConfirmUser(null);
            }}
            className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold"
          >
            Yes, Release
          </button>
        </div>
      </div>

    </div>
  </div>
)}
    </div>
  );
}

/* ================= UI HELPERS ================= */

const FinanceCard = ({ title, value }) => (
  <div className="bg-[#11151f] border border-white/10 rounded-xl p-4">
    <p className="text-xs text-[#9aa3b2]">{title}</p>
    <p className="text-lg font-bold mt-1">{format(value)}</p>
  </div>
);

const MiniStat = ({ label, value }) => (
  <div className="bg-[#151a24] rounded-md p-2 text-center">
    <p className="text-xs text-[#9aa3b2]">{label}</p>
    <p className="font-semibold">{format(value)}</p>
  </div>
);
const format = (num) => num?.toLocaleString("en-IN") || "0";