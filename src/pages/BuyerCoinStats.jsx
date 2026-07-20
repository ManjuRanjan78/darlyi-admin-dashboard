import React, { useEffect, useState } from "react";
import axios from "axios";
import { BaseUrl } from "../BaseUrl";
import toast from "react-hot-toast";

export default function BuyerCoinStats({ userId }) {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchStats = async () => {
    if (!userId) return;

    try {
      setLoading(true);
      const res = await axios.get(
        `${BaseUrl.baseurl}/admin/get-buyer-coin-stats/${userId}`
      );

      if (res.data.status) {
        setStats(res.data.data || []);
      } else {
        toast.error("Failed to load buyer stats");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [userId]);

  return (
    <div className="bg-[#11151f] border border-white/10 rounded-xl p-6 shadow space-y-4">
      <h3 className="text-lg font-semibold flex items-center gap-2 text-white">
        🛒 Offline Coin Stats
      </h3>

      {loading ? (
        <p className="text-sm text-[#9aa3b2]">Loading...</p>
      ) : stats.length === 0 ? (
        <p className="text-sm text-[#9aa3b2]">
          No purchase data available
        </p>
      ) : (
        <div className="space-y-4">
          {stats.map((item, index) => (
            <div
              key={index}
              className="border border-white/5 rounded-lg p-4 bg-[#0f1117]"
            >
              {/* Seller Info */}
              <div className="flex justify-between items-center mb-3">
                <div>
                  <p className="text-sm font-semibold text-white">
                    {item.sellerName}
                  </p>
                  <p className="text-xs text-[#9aa3b2]">
                    Seller ID: {item.sellerUserId}
                  </p>
                </div>

                <div className="text-xs px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Seller
                </div>
              </div>

              {/* Coin Breakdown */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <Stat label="Today" value={item.todayCoins} />
                <Stat label="Yesterday" value={item.yesterdayCoins} />
                <Stat label="Weekly" value={item.weeklyCoins} />
                <Stat label="Monthly" value={item.monthlyCoins} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ========= Small Stat Component ========= */

const Stat = ({ label, value }) => (
  <div className="bg-[#151a24] border border-white/5 rounded-lg p-3 text-center">
    <p className="text-xs text-[#9aa3b2]">{label}</p>
    <p className="text-lg font-bold text-white mt-1">{value}</p>
  </div>
);