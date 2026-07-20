import React, { useEffect, useState } from "react";
import axios from "axios";
import { BaseUrl } from "../BaseUrl";
import { useParams } from "react-router-dom";

export default function SaturdayUserEarnings(props) {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetchEarnings();
  }, [props.userId]);

  const fetchEarnings = async () => {
    const res = await axios.get(
      `${BaseUrl.baseurl}/admin/get-earnings-saturday/${props.userId}`,
    );

    if (res.data.status) {
      setData(res.data);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  if (!data) return null;

  const eligible = data.totalCoins >= 5000;

  return (
    <div className=" rounded-3xl bg-[#0b0d12] p-6 text-white flex justify-center">
      <div className="w-full max-w-4xl space-y-6">
        {/* ================= HEADER ================= */}
        <div className="bg-[#11151f] border border-white/10 rounded-2xl p-6 shadow-xl">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div>
              <h2 className="text-2xl font-bold">
                🏦 Saturday Earnings Report
              </h2>
              <p className="text-sm text-[#9aa3b2] mt-1">
                {formatDate(data.date)}
              </p>
            </div>

            <div
              className={`px-4 py-2 rounded-full text-sm font-semibold ${
                eligible
                  ? "bg-green-500/20 text-green-400 border border-green-500/40"
                  : "bg-red-500/20 text-red-400 border border-red-500/40"
              }`}
            >
              {eligible ? "Eligible for Payout" : "Not Eligible"}
            </div>
          </div>
        </div>

        {/* ================= USER CARD ================= */}
        <div className="bg-[#11151f] border border-white/10 rounded-2xl p-6 shadow-lg">
          <div className="flex flex-col md:flex-row md:justify-between gap-6">
            <div>
              <p className="text-sm text-[#9aa3b2]">Host Name</p>
              <p className="text-xl font-semibold mt-1">{data.user.name}</p>

              <p className="text-sm text-[#9aa3b2] mt-4">User ID</p>
              <p className="text-lg font-medium">{data.user.userId}</p>
            </div>

            <div className="grid grid-cols-2 gap-6 text-center">
              <div className="bg-[#151a24] rounded-xl p-4">
                <p className="text-xs text-[#9aa3b2]">Saturday Earnings</p>
                <p className="text-2xl font-bold text-green-400 mt-2">
                  +{format(data.totalCoins)}
                </p>
              </div>

              <div className="bg-[#151a24] rounded-xl p-4">
                <p className="text-xs text-[#9aa3b2]">Current Wallet Coins</p>
                <p className="text-2xl font-bold text-indigo-400 mt-2">
                  {format(data.user.coins)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ================= SUMMARY CARD ================= */}
        <div className="bg-gradient-to-r from-indigo-600/20 to-purple-600/20 border border-indigo-500/30 rounded-2xl p-6 shadow-lg">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <p className="text-sm text-[#9aa3b2]">
                Total Coins Earned This Saturday
              </p>
              <p className="text-3xl font-extrabold text-white mt-2">
                {data.totalCoins}
              </p>
            </div>

            <div className="text-sm text-[#9aa3b2] max-w-sm text-center md:text-right">
              Coins above <span className="text-white font-semibold">5000</span>{" "}
              are eligible for payout release. Admin can process payout if
              threshold is met.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
const format = (num) => num?.toLocaleString("en-IN") || "0";
