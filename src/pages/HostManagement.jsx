// src/components/HostManagement.jsx

import React, { useEffect, useRef, useState } from "react";
import Chart from "chart.js/auto";
import { Chart as ReactChart } from "react-chartjs-2";
import axios from "axios";
import { BaseUrl } from "../BaseUrl";
import toast from "react-hot-toast";
import FinanceRewardsDashboard from "./FinanceRewardsDashboard";
import RedeemDashboard from "./RedeemDashboard";
import AdminMonthlyStats from "./AdminMonthlyStats";
import TopHostPayoutDashboard from "./TopHostPayoutDashboard";

const hosts = [
  {
    rank: 1,
    name: "Alex Johnson",
    commission: 20,
    earnings: 15000,
    rating: 4.8,
  },
  {
    rank: 2,
    name: "Maria Rodriguez",
    commission: 22,
    earnings: 14500,
    rating: 4.7,
  },
  { rank: 3, name: "David Lee", commission: 18, earnings: 12000, rating: 4.6 },
  { rank: 4, name: "Sarah Chen", commission: 25, earnings: 11800, rating: 4.9 },
  {
    rank: 5,
    name: "Chris Miller",
    commission: 21,
    earnings: 10500,
    rating: 4.5,
  },
];

const chartData = {
  labels: ["Duration", "Gifts", "Reviews", "Ratings", "Sessions"],
  datasets: [
    {
      label: "Top 5 Avg",
      data: [78, 82, 65, 88, 74],
      backgroundColor: "rgba(124, 58, 237, 0.2)",
      borderColor: "#7c3aed",
      pointBackgroundColor: "#7c3aed",
      pointBorderColor: "#fff",
      pointHoverBackgroundColor: "#fff",
      pointHoverBorderColor: "#7c3aed",
    },
  ],
};

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      labels: {
        color: "#cbd5e1",
      },
    },
  },
  scales: {
    r: {
      grid: {
        color: "rgba(255, 255, 255, 0.1)",
      },
      pointLabels: {
        color: "#cbd5e1",
      },
      ticks: {
        display: false,
      },
    },
  },
};

const HostManagement = () => {
  const userDetails = JSON.parse(
    localStorage.getItem("LiveStreamAdminDetails"),
  );
  const [user, setUsers] = useState([]);
  function getData() {
    axios
      .get(`${BaseUrl.baseurl}/admin/get-top-hosted-users`)
      .then((res) => {
        if (res.data.status) {
          console.log("host setted here");
          setUsers(res.data.data);
        } else {
          console.log("error no more data");
          toast.error("No more data");
        }
      })
      .catch((err) => {});
  }
  useEffect(() => {
    getData();
  }, []);
  const [activeView, setActiveView] = useState("overview");
  return (
    <section className="" id="hosts">
      <div className="flex gap-3 px-5 mb-4">
        <button
          onClick={() => setActiveView("overview")}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
            activeView === "overview"
              ? "bg-indigo-600 text-white"
              : "bg-slate-800/40 text-slate-300 hover:bg-slate-700"
          }`}
        >
          Payout History
        </button>
        {userDetails?.data?.role?.name === "Super Admin" && (
          <button
            onClick={() => setActiveView("redeem")}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
              activeView === "redeem"
                ? "bg-indigo-600 text-white"
                : "bg-slate-800/40 text-slate-300 hover:bg-slate-700"
            }`}
          >
            Payout Control
          </button>
        )}
         <button
          onClick={() => setActiveView("pan")}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
            activeView === "pan"
              ? "bg-indigo-600 text-white"
              : "bg-slate-800/40 text-slate-300 hover:bg-slate-700"
          }`}
        >
          PAN Details
        </button>
      </div>
      {activeView === "overview" && (
        <div className="px-5">
          <RedeemDashboard />
        </div>
      )}
      {activeView === "pan" && (
        <div className="">
          <TopHostPayoutDashboard />
        </div>
      )}
      {activeView === "redeem" && (
        <>
         <AdminMonthlyStats />
         <div className="mx-8">
          <div className="border-[0.1px] border-gray-500 w-full"></div>
         </div>
          <FinanceRewardsDashboard />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-5 ">
            {/* Top Hosts Card */}
            <div className="bg-slate-800/20 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4 shadow-xl">
              <h3 className="text-sm text-slate-400 font-semibold mb-2">
                Top Hosts (Leaderboard)
              </h3>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="border-b border-dashed border-slate-700/50">
                    <tr>
                      <th className="px-3 py-3 text-left text-xs font-semibold uppercase text-slate-400">
                        Rank
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-semibold uppercase text-slate-400">
                        Host
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-semibold uppercase text-slate-400">
                        Commission%
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-semibold uppercase text-slate-400">
                        Earning Coins
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {user &&
                      user.map((h, index) => (
                        <tr
                          key={index}
                          className="hover:bg-slate-700/20 transition-colors text-[#e7e9ee]"
                        >
                          <td className="px-3 py-3 border-b border-dashed border-slate-700/50">
                            {index + 1}
                          </td>
                          <td className="px-3 py-3 border-b border-dashed border-slate-700/50">
                            {h.name}
                          </td>
                          <td className="px-3 py-3 border-b border-dashed border-slate-700/50">
                            -- %
                          </td>
                          <td className="px-3 py-3 border-b border-dashed border-slate-700/50">
                            {h.earningCoins}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Performance Metrics Card */}
            <div className="bg-slate-800/20 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4 shadow-xl">
              <h3 className="text-sm text-slate-400 font-semibold mb-2">
                Performance Metrics
              </h3>
              <div className="w-full h-96 ">
                <ReactChart
                  type="radar"
                  data={chartData}
                  options={chartOptions}
                />
              </div>
            </div>
          </div>
        </>
      )}
    </section>
  );
};

export default HostManagement;
