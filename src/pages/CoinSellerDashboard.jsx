import React, { useEffect, useState } from "react";
import axios from "axios";
import { BaseUrl } from "../BaseUrl";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import OfflineSellerStats from "./OfflineSellerStats";
export default function CoinSellerDashboard() {
  const [userIdInput, setUserIdInput] = useState("");
  const [sellers, setSellers] = useState([]);
  const [coinStats, setCoinStats] = useState(null);
  const [topSellers, setTopSellers] = useState([]);
  const [topBuyers, setTopBuyers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openRow, setOpenRow] = useState(null);
  const navigate = useNavigate();
  const [removeConfirmSeller, setRemoveConfirmSeller] = useState(null);
  /* ================= CREATE SELLER ================= */

  const createSeller = async () => {
    if (!userIdInput) {
      toast.error("Please enter userId");
      return;
    }

    try {
      setLoading(true);
      const res = await axios.put(
        `${BaseUrl.baseurl}/admin/make-coin-seller/${userIdInput}`,
      );

      if (res.data.status) {
        toast.success("Coin Seller Created");
        fetchSellers();
        setUserIdInput("");
      } else {
        toast.error("Failed to create seller");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setLoading(false);
    }
  };

  /* ================= FETCH DATA ================= */

  const fetchSellers = async () => {
    const res = await axios.get(`${BaseUrl.baseurl}/admin/get-all-coin-seller`);
    if (res.data.status) {
      setSellers(res.data.data);
    }
  };

  const fetchCoinStats = async () => {
    const res = await axios.get(
      `${BaseUrl.baseurl}/admin/get-total-coin-stats`,
    );
    if (res.data.status) {
      setCoinStats(res.data.data);
    }
  };

  const fetchTopSellers = async () => {
    const res = await axios.get(`${BaseUrl.baseurl}/admin/get-top-coin-seller`);
    if (res.data.status) {
      setTopSellers(res.data.data);
    }
  };

  const fetchTopBuyers = async () => {
    const res = await axios.get(`${BaseUrl.baseurl}/admin/get-top-coin-buyers`);
    if (res.data.status) {
      setTopBuyers(res.data.data);
    }
  };

  useEffect(() => {
    fetchSellers();
    fetchCoinStats();
    fetchTopSellers();
    fetchTopBuyers();
  }, []);

  /* ================= UI ================= */
  const handleRemoveSeller = async (userId) => {
    try {
      setLoading(true);

      const res = await axios.put(
        `${BaseUrl.baseurl}/admin/remove-coin-seller/${userId}`,
      );

      if (res.data.status) {
        toast.success("Coin Seller removed successfully");
        fetchSellers();
      } else {
        toast.error("Failed to remove seller");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen bg-[#0b0d12] p-6 text-white space-y-6">
      {/* ================= HEADER ================= */}
      <div className="bg-[#11151f] border border-white/10 rounded-xl p-6 shadow">
        <h2 className="text-xl font-bold mb-4">🏦 Coin Seller Management</h2>

        <div className="flex gap-4 flex-wrap">
          <input
            type="number"
            placeholder="Enter User ID"
            value={userIdInput}
            onChange={(e) => setUserIdInput(e.target.value)}
            className="bg-[#0f1117] border border-white/10 px-4 py-2 rounded-lg text-sm w-64"
          />

          <button
            onClick={createSeller}
            disabled={loading}
            className="px-6 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 font-semibold"
          >
            {loading ? "Creating..." : "Make Coin Seller"}
          </button>
        </div>
      </div>

      {/* ================= TOTAL STATS ================= */}
      {coinStats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            ["Today", coinStats.todayCoins],
            ["Yesterday", coinStats.yesterdayCoins],
            ["Weekly", coinStats.weeklyCoins],
            ["Monthly", coinStats.monthlyCoins],
            ["Total", coinStats.totalCoins],
          ].map(([label, value], i) => (
            <div
              key={i}
              className="bg-[#11151f] border border-white/10 rounded-xl p-4"
            >
              <p className="text-xs text-[#9aa3b2]">{label} Coins</p>
              <p className="text-xl font-bold mt-1">{format(value)}</p>
            </div>
          ))}
        </div>
      )}
      <OfflineSellerStats setRemoveConfirmSeller={setRemoveConfirmSeller} />

      <div className="bg-slate-900 border border-slate-700 rounded-xl overflow-hidden shadow-2xl">
        <div className="p-4 border-b border-slate-800 text-sm text-slate-400">
          Merchant Performance
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-800 text-slate-400">
              <tr>
                <th className="p-3 text-left">Merchant</th>
                <th className="p-3">User ID</th>
                <th className="p-3">Total Coins</th>
                <th className="p-3">Today</th>
                <th className="p-3">Yesterday</th>
                <th className="p-3">Weekly</th>
                <th className="p-3">Monthly</th>
                <th className="p-3">Total</th>
                <th className="p-3">Action</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" className="text-center p-6">
                    Loading...
                  </td>
                </tr>
              ) : (
                sellers.map((seller, i) => {
                  const isTop = seller.todayCoins > 50000;
                  const isOpen = openRow === i;

                  return (
                    <>
                      {/* MAIN ROW */}
                      <tr
                        key={i}
                        className={`border-b border-slate-800 hover:bg-slate-800/50 cursor-pointer ${
                          isTop && "bg-yellow-500/10"
                        }`}
                        onClick={() => setOpenRow(isOpen ? null : i)}
                      >
                        <td className="p-3 font-semibold flex items-center gap-2">
                          <span className="text-lg">{isTop ? "🔥" : "👤"}</span>
                          {seller.name}
                        </td>

                        <td className="p-3 text-center">{seller.userId}</td>

                        <td className="p-3 text-center font-bold text-yellow-400">
                          {format(seller.offlineCoins)}
                        </td>

                        <td className="p-3 text-center text-green-400">
                          +{format(seller.todayCoins)}
                        </td>

                        <td className="p-3 text-center text-orange-400">
                          {format(seller.yesterdayCoins)}
                        </td>

                        <td className="p-3 text-center text-blue-400">
                          {format(seller.weeklyCoins)}
                        </td>

                        <td className="p-3 text-center text-purple-400">
                          {format(seller.monthlyCoins)}
                        </td>

                        <td className="p-3 text-center text-fuchsia-400">
                          {format(seller.totalCoins)}
                        </td>
                        <td className="p-3 text-center">
                          <button
                            onClick={(e) => {
                                e.stopPropagation()
                              setRemoveConfirmSeller(seller)}}
                            className="px-3 py-1 text-xs rounded-lg bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500 hover:text-white transition"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>

                      {/* 🔽 TRANSACTION EXPAND */}
                      {isOpen && (
                        <tr className="bg-slate-950">
                          <td colSpan="9" className="p-4">
                            <div className="grid gap-3">
                              {seller.todayTransactions?.length > 0 ? (
                                seller.todayTransactions.map((tx) => (
                                  <div
                                    key={tx._id}
                                    className="flex items-center justify-between bg-slate-900 border border-slate-800 rounded-lg p-3 hover:bg-slate-800 transition"
                                  >
                                    {/* LEFT */}
                                    <div className="flex items-center gap-3">
                                      <img
                                      referrerPolicy="no-referrer"
                                        src={
                                          tx.buyerId?.photos?.[0]?.url ||
                                          "https://via.placeholder.com/40"
                                        }
                                        alt="user"
                                        className="w-10 h-10 rounded-full object-cover border border-slate-700"
                                      />

                                      <div>
                                        <div className="text-sm font-semibold">
                                          {tx.buyerId?.name || "Unknown"}
                                        </div>
                                        <div className="text-xs text-slate-400">
                                          ID: {tx.buyerId?.userId}
                                        </div>
                                      </div>
                                    </div>

                                    {/* RIGHT */}
                                    <div className="text-right">
                                      <div className="text-green-400 font-bold">
                                        +{format(tx.coins)} 🪙
                                      </div>
                                      <div className="text-xs text-slate-400">
                                        {new Date(
                                          tx.createdAt,
                                        ).toLocaleTimeString()}
                                      </div>
                                    </div>
                                  </div>
                                ))
                              ) : (
                                <div className="text-center text-slate-500 text-sm">
                                  No transactions today
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
      {/* ================= SELLERS TABLE ================= */}
      {/* <div className="bg-[#11151f] border border-white/10 rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4">All Coin Sellers</h3>

        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[#9aa3b2] text-xs uppercase">
                <th className="p-2 text-left">Name</th>
                <th className="p-2 text-left">User ID</th>
                <th className="p-2 text-left">Phone</th>
                <th className="p-2 text-left">Coins</th>
                <th className="p-2 text-left">Offline Coins</th>
                <th className="p-2 text-left">Earning Coins</th>
                <th className="p-2 text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              {sellers.map((s) => (
                <tr
                  key={s._id}
                  className="hover:bg-white/5 border-t border-white/5"
                >
                  <td className="p-2">{s.name}</td>
                  <td className="p-2">{s.userId}</td>
                  <td className="p-2">{s.phone}</td>
                  <td className="p-2 font-semibold">{s.coins}</td>
                  <td className="p-2 text-orange-400 font-semibold">
                    {format(s.offlineCoins)}
                  </td>
                  <td className="p-2 text-green-400 font-semibold">
                    {format(s.earningCoins)}
                  </td>
                  <td className="p-2">
                    <button
                      onClick={() => setRemoveConfirmSeller(s)}
                      className="px-3 py-1 text-xs rounded-lg bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500 hover:text-white transition"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div> */}

      {/* ================= TOP SELLERS & BUYERS ================= */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Top Sellers */}
        <div className="bg-[#11151f] border border-white/10 rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4">🔥 Top Coin Sellers</h3>

          {topSellers.map((s, i) => (
            <div
              key={i}
              onClick={() => navigate(`/Coins-History/${s.sellerId}`)}
              className="flex justify-between border-b border-white/5 py-2 text-sm cursor-pointer"
            >
              <span>
                {s.sellerName} (ID: {s.sellerUserId})
              </span>
              <span className="text-indigo-400 font-semibold">
                {format(s.monthlyCoins)}
              </span>
            </div>
          ))}
        </div>

        {/* Top Buyers */}
        <div className="bg-[#11151f] border border-white/10 rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4">🛒 Top Coin Buyers</h3>

          {topBuyers.map((b, i) => (
            <div
              onClick={() => navigate(`/Coins-History/${b.buyerId}`)}
              key={i}
              className="flex justify-between border-b border-white/5 py-2 text-sm cursor-pointer"
            >
              <span>
                {b.buyerName} (ID: {b.buyerUserId})
              </span>
              <span className="text-green-400 font-semibold">
                {format(b.monthlyCoins)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {removeConfirmSeller && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-[#11151f] border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="text-center space-y-4">
              <div className="text-4xl">⚠️</div>

              <h3 className="text-lg font-semibold text-white">
                Remove Coin Seller
              </h3>

              <p className="text-sm text-[#9aa3b2]">
                Are you sure you want to remove
              </p>

              <p className="font-bold text-red-400">
                {removeConfirmSeller.name} (ID: {removeConfirmSeller.userId})
              </p>

              <p className="text-xs text-[#9aa3b2]">
                This will disable coin merchant privileges.
              </p>

              <div className="flex gap-4 justify-center pt-4">
                <button
                  onClick={() => setRemoveConfirmSeller(null)}
                  className="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white text-sm"
                >
                  Cancel
                </button>

                <button
                  onClick={async () => {
                    await handleRemoveSeller(removeConfirmSeller.userId);
                    setRemoveConfirmSeller(null);
                  }}
                  className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-semibold"
                >
                  Yes, Remove
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
const format = (num) => num?.toLocaleString("en-IN") || "0";
