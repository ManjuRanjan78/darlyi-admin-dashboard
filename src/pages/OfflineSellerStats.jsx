import React, { useEffect, useState } from "react";
import axios from "axios";
import { BaseUrl } from "../BaseUrl";

export default function OfflineSellerStats({setRemoveConfirmSeller}) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openRow, setOpenRow] = useState(null);

  const fetchData = async () => {
    try {
      const res = await axios.get(
        `${BaseUrl.baseurl}/admin/get-offline-sellers-stats`,
      );
      if (res.data.status) {
        setData(res.data.data);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const totalCoins = data.reduce((acc, u) => acc + u.offlineCoins, 0);
  const topSeller = data.sort((a, b) => b.monthlyCoins - a.monthlyCoins)[0];

  return (
    <div className=" bg-[#070b14] text-white ">
      {/* HEADER */}
      {/* <div className="mb-6">
        <h1 className="text-2xl font-bold">💰 Offline Sellers Dashboard</h1>
        <p className="text-sm text-slate-400">
          Track offline coin sellers performance
        </p>
      </div> */}

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card
          title="Total Offline Coins"
          value={format(totalCoins)}
          glow="from-yellow-500 to-orange-500"
        />

        <Card
          title="Top Seller"
          value={topSeller?.name || "--"}
          sub={`Coins: ${format(topSeller?.monthlyCoins || 0)}`}
          glow="from-purple-500 to-pink-500"
        />

        <Card
          title="Total Sellers"
          value={data.length}
          glow="from-blue-500 to-indigo-500"
        />
      </div>

      {/* TABLE */}
      <div className="bg-slate-900 border border-slate-700 rounded-xl overflow-hidden shadow-2xl">
        <div className="p-4 border-b border-slate-800 text-sm text-slate-400">
          Seller Performance
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-800 text-slate-400">
              <tr>
                <th className="p-3 text-left">Seller</th>
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
                data.map((seller, i) => {
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
    </div>
  );
}

/* ================= UI CARD ================= */
const Card = ({ title, value, sub, glow }) => (
  <div
    className={`relative p-5 rounded-xl bg-slate-900 border border-slate-700 overflow-hidden`}
  >
    <div className={`absolute inset-0 opacity-20 bg-gradient-to-r ${glow}`} />

    <div className="relative z-10">
      <div className="text-xs text-slate-400 mb-1">{title}</div>
      <div className="text-xl font-bold">{value}</div>
      {sub && <div className="text-xs text-slate-400 mt-1">{sub}</div>}
    </div>
  </div>
);

/* ================= FORMAT ================= */
const format = (num) => num?.toLocaleString("en-IN") || "0";
