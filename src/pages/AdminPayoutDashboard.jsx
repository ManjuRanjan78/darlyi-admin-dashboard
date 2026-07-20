import React, { useEffect, useState } from "react";
import axios from "axios";
import { BaseUrl } from "../BaseUrl";
import { useParams, useNavigate } from "react-router-dom";
export default function AdminPayoutDashboard() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [payouts, setPayouts] = useState([]);
  const [page, setPage] = useState(1);

  const ITEMS_PER_PAGE = 20;

  /* ================= FETCH DATA ================= */
  const fetchData = async () => {
    const res = await axios.get(
      `${BaseUrl.baseurl}/admin/get-payout-details/${id}`,
    );

    setData(res.data.data);
    setPayouts(res.data.data.payoutDetails);
  };

  useEffect(() => {
    fetchData();
  }, []);

  /* ================= PAGINATION ================= */
  const totalPages = Math.ceil(payouts.length / ITEMS_PER_PAGE);

  const paginatedData = payouts.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE,
  );

  if (!data) return <div className="text-white p-5">Loading...</div>;

  return (
    <div className="min-h-screen bg-[#05080f] text-white p-6">
      {/* ================= HEADER ================= */}
      <div className="flex justify-between">
        <h1 className="text-2xl font-bold mb-6 tracking-wide">
          💰 Payout Dashboard
        </h1>
        <div>
          <span
            onClick={() => navigate(-1)}
            className={`px-8 py-4 rounded-full text-md font-semibold bg-fuchsia-500/20 text-fuchsia-300 cursor-pointer`}
          >
            Back
          </span>
        </div>
      </div>
      {/* ================= SUMMARY CARDS ================= */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* PAID */}
        <div className="bg-gradient-to-br from-green-500/10 to-green-700/10 border border-green-500/20 rounded-2xl p-6 shadow-xl backdrop-blur">
          <h2 className="text-green-400 text-sm mb-2">PAID</h2>
          <p className="text-3xl font-bold">
            {format(data.earningDetails.paid.totalCoins)} Coins
          </p>
          <p className="text-sm text-slate-400 mt-2">
            {data.earningDetails.paid.totalEntries} Transactions
          </p>
        </div>

        {/* UNPAID */}
        <div className="bg-gradient-to-br from-red-500/10 to-red-700/10 border border-red-500/20 rounded-2xl p-6 shadow-xl backdrop-blur">
          <h2 className="text-red-400 text-sm mb-2">UNPAID</h2>
          <p className="text-3xl font-bold">
            {format(data.earningDetails.unpaid.totalCoins)} Coins
          </p>
          <p className="text-sm text-slate-400 mt-2">
            {data.earningDetails.unpaid.totalEntries} Pending
          </p>
        </div>
      </div>

      {/* ================= TABLE ================= */}
      <div className="bg-slate-900/40 border border-slate-700/40 rounded-2xl shadow-xl backdrop-blur overflow-hidden">
        <div className="p-4 border-b border-slate-700 text-slate-400 text-sm font-semibold">
          Payout History
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-800/40 text-slate-400">
              <tr>
                <th className="p-3 text-left">#</th>
                <th className="p-3 text-left">Coins</th>
                <th className="p-3 text-left">Amount (₹)</th>
                <th className="p-3 text-left">Date</th>
              </tr>
            </thead>

            <tbody>
              {paginatedData.map((item, index) => (
                <tr
                  key={item._id}
                  className="border-b border-slate-800 hover:bg-slate-800/30 transition"
                >
                  <td className="p-3">
                    {(page - 1) * ITEMS_PER_PAGE + index + 1}
                  </td>

                  <td className="p-3 text-yellow-400 font-semibold">
                    {format(item.coins)}
                  </td>

                  <td className="p-3 text-green-400 font-semibold">
                    ₹{format(item.finalAmount)}
                  </td>

                  <td className="p-3 text-slate-400">
                    {new Date(item.createdAt).toLocaleString("en-IN", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true,
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ================= PAGINATION ================= */}
        <div className="flex justify-between items-center p-4">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30"
          >
            Prev
          </button>

          <div className="text-sm text-slate-400">
            Page {page} of {totalPages}
          </div>

          <button
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
const format = (num) => num?.toLocaleString("en-IN") || "0";
