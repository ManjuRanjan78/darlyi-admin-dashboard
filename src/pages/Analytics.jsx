import React, { useEffect, useState } from "react";
import { Chart as ReactChart } from "react-chartjs-2";
import { Chart, registerables } from "chart.js";
import axios from "axios";
import { BaseUrl } from "../BaseUrl";
import toast from "react-hot-toast";
import { CircularProgress } from "@mui/material";
// Register all chart.js components to avoid errors
Chart.register(...registerables);

// Hardcoded data for the charts and metrics

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      labels: {
        color: "#e7e9ee", // Changed to var(--text)
      },
    },
  },
  scales: {
    x: {
      ticks: {
        color: "#9aa3b2", // Changed to var(--muted)
      },
    },
    y: {
      ticks: {
        color: "#9aa3b2", // Changed to var(--muted)
      },
    },
  },
};

const funnelOptions = {
  indexAxis: "y",
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      labels: {
        color: "#e7e9ee", // Changed to var(--text)
      },
    },
  },
  scales: {
    x: {
      ticks: {
        color: "#9aa3b2", // Changed to var(--muted)
      },
    },
    y: {
      ticks: {
        color: "#9aa3b2", // Changed to var(--muted)
      },
    },
  },
};

const Analytics = () => {
  const [dauMauData, setDauMauData] = useState([]);
  const [funnelData, setFunnelData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getData = axios.get(
      `${BaseUrl.baseurl}/admin/get-users-active-state`
    );
    const getUserData = axios.get(`${BaseUrl.baseurl}/admin/overall-stats`);

    Promise.all([getData, getUserData])
      .then(([res1, res2]) => {
        // ---- Handle first API (DAU/MAU) ----
        if (res1.data.success) {
          let dau = [],
            mau = [],
            dauLabel = [],
            mauLabel = [];
          res1.data.dailyTrends?.forEach((val) => {
            dau.push(val.count);
            dauLabel.push(val.date);
          });
          res1.data.monthlyTrends?.forEach((val) => {
            mau.push(val.count);
            mauLabel.push(val.month);
          });

          setDauMauData({
            labels: dauLabel,
            datasets: [
              {
                label: "DAU (k)",
                data: dau,
                backgroundColor: "#245B84",
                borderColor: "#255c85",
                borderRadius: 4,
              },
              {
                label: "MAU (k)",
                data: mau,
                backgroundColor: "#883B4F",
                borderColor: "#883b4f",
                borderRadius: 4,
              },
            ],
          });
        } else toast.error("No more data");

        // ---- Handle second API (Funnel data) ----
        if (res2.data.success) {
          setFunnelData({
            labels: [
              "Registered",
              "Verified Hosts",
              "First Call",
              "Coin Purchase",
            ],
            datasets: [
              {
                label: "Users",
                data: [
                  res2.data.summary.totalUsers,
                  res2.data.summary.verifiedFemales,
                  res2.data.summary.totalVideoCallUsers,
                  res2.data.summary.totalCoinPurchasers,
                ],
                backgroundColor: "#235A81",
                borderColor: "#ef4444",
                borderRadius: 4,
              },
            ],
          });
        } else toast.error("No more data");
      })
      .catch((err) => {
        console.error(err);
        toast.error("Something went wrong");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);
  return (
    <section className="p-5 min-h-screen">
      {loading ? (
        <div className="flex items-center justify-center py-44">
          <CircularProgress
            size={45}
            style={{
              color: "white",
            }}
          />
        </div>
      ) : (
        <>
          <h2 className="text-xl font-semibold mb-4 text-[#e7e9ee]">
            Analytics & Insights
          </h2>
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            {/* DAU vs MAU Chart Card */}
            <div className="flex-1 bg-slate-800/20 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4 shadow-xl">
              <h3 className="text-sm text-[#9aa3b2] font-semibold mb-2">
                DAU vs MAU
              </h3>
              <div className="h-52 md:h-64">
                {dauMauData.length !== 0 && (
                  <ReactChart
                    type="bar"
                    data={dauMauData}
                    options={chartOptions}
                  />
                )}
              </div>
            </div>

            {/* Conversion Funnel Chart Card */}
            <div className="flex-1 bg-slate-800/20 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4 shadow-xl">
              <h3 className="text-sm text-[#9aa3b2] font-semibold mb-2">
                Conversion Funnel
              </h3>
              <div className="h-52 md:h-64">
                {funnelData.length !== 0 && (
                  <ReactChart
                    type="bar"
                    data={funnelData}
                    options={funnelOptions}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Metric Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Avg Call Duration Card */}
            <div className="bg-slate-800/20 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4 shadow-xl">
              <h3 className="text-sm text-[#9aa3b2] font-semibold mb-2">
                Avg Call Duration
              </h3>
              <div className="flex items-end justify-between">
                <div className="text-3xl font-extrabold text-[#e7e9ee]">
                  4.2m
                </div>
                <span className="px-2 py-1 rounded-full text-xs font-medium border border-white/10 text-[#e7e9ee]/90">
                  last 7d
                </span>
              </div>
            </div>

            {/* Gift Frequency Card */}
            <div className="bg-slate-800/20 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4 shadow-xl">
              <h3 className="text-sm text-[#9aa3b2] font-semibold mb-2">
                Gift Frequency
              </h3>
              <div className="flex items-end justify-between">
                <div className="text-3xl font-extrabold text-[#e7e9ee]">
                  0.8
                </div>
                <span className="px-2 py-1 rounded-full text-xs font-medium border border-white/10 text-[#e7e9ee]/90">
                  per user
                </span>
              </div>
            </div>

            {/* Host Performance Index Card */}
            <div className="bg-slate-800/20 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4 shadow-xl">
              <h3 className="text-sm text-[#9aa3b2] font-semibold mb-2">
                Host Performance Index
              </h3>
              <div className="flex items-end justify-between">
                <div className="text-3xl font-extrabold text-[#e7e9ee]">85</div>
                <span className="px-2 py-1 rounded-full text-xs font-medium border border-white/10 text-[#e7e9ee]/90">
                  composite
                </span>
              </div>
            </div>
          </div>
        </>
      )}
    </section>
  );
};

export default Analytics;
