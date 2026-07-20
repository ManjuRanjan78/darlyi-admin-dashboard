import React, { useEffect, useState, useMemo } from "react";
import { Chart as ReactChart } from "react-chartjs-2";
import { Chart, registerables } from "chart.js";
import toast from "react-hot-toast";
import api from "../services/axiosClient";
import axios from "axios";
import { CircularProgress } from "@mui/material";
import TransactionStatsDashboard from "./TransactionStatsDashboard";
import BulkInvoiceDownload from "./BulkInvoiceDownload";

// Register all chart.js components to avoid errors
Chart.register(...registerables);

const revenueChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      labels: {
        color: "#e7e9ee",
      },
    },
  },
  scales: {
    x: {
      ticks: {
        color: "#9aa3b2",
      },
    },
    y: {
      ticks: {
        color: "#9aa3b2",
      },
    },
  },
};

const arpuChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      labels: {
        color: "#e7e9ee",
      },
    },
  },
  scales: {
    x: {
      ticks: {
        color: "#9aa3b2",
      },
    },
    y: {
      ticks: {
        color: "#9aa3b2",
      },
    },
  },
};

// Auto-retry helper for transient failures (retry once)
const fetchWithRetry = async (url, options = {}, retries = 1) => {
  try {
    return await api.get(url, options);
  } catch (err) {
    if (axios.isCancel(err)) {
      throw err;
    }

    const isNetworkError = !err.response;
    const status = err.response?.status;
    const isTransientStatus =
      status === 408 || status === 429 || (status >= 500 && status <= 599);

    if (retries > 0 && (isNetworkError || isTransientStatus)) {
      console.warn(
        `[MONITOR] Transient failure (status: ${status || "network"}). Retrying... (${retries} left)`
      );
      return await fetchWithRetry(url, options, retries - 1);
    }
    throw err;
  }
};

const RevenueAndMonetization = () => {
  const [status, setStatus] = useState("loading"); // "loading" | "success" | "error"
  const [errorMsg, setErrorMsg] = useState("");
  const [summaryData, setSummaryData] = useState(null);
  const [currency, setCurrency] = useState("INR");

  const userDetails = useMemo(() => {
    const raw = localStorage.getItem("LiveStreamAdminDetails");
    return raw ? JSON.parse(raw) : null;
  }, []);

  const fetchRevenueData = async (signal) => {
    setStatus("loading");
    setErrorMsg("");
    try {
      const startTime = performance.now();
      const res = await fetchWithRetry(
        `admin/revenue-summary?accountType=${currency}`,
        { signal }
      );
      const endTime = performance.now();
      console.log(
        `[MONITOR] Revenue summary API took ${(endTime - startTime).toFixed(1)}ms`
      );

      if (res.data) {
        setSummaryData(res.data);
        setStatus("success");
      } else {
        throw new Error("Empty response from server");
      }
    } catch (err) {
      if (axios.isCancel(err)) {
        console.log("[MONITOR] Request cancelled successfully");
        return;
      }
      console.error("[MONITOR] Revenue summary failed", err);
      const errorMsg =
        err.response?.data?.message || "Unable to load revenue dashboard";
      setErrorMsg(errorMsg);
      setStatus("error");
      toast.error(errorMsg);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    fetchRevenueData(controller.signal);

    return () => {
      controller.abort();
    };
  }, [currency]);

  // Derived Values
  const totalRevenue = summaryData?.togilo?.TotalRevenue || 0;
  const totalRevenueFlirty = summaryData?.flirtyVoice?.TotalRevenue || 0;

  const totalRegionalRevenue = useMemo(() => {
    const regional = summaryData?.togilo?.regionalRevenue || {};
    let count = 0;
    Object.values(regional).forEach((data) => {
      count += data?.totalRevenue || 0;
    });
    return count === 0 ? 1 : count;
  }, [summaryData]);

  const totalRegionalRevenueFlirty = useMemo(() => {
    const regional = summaryData?.flirtyVoice?.regionalRevenue || {};
    let count = 0;
    Object.values(regional).forEach((data) => {
      count += data?.totalRevenue || 0;
    });
    return count === 0 ? 1 : count;
  }, [summaryData]);

  const revenueChartData = useMemo(() => {
    const togiloRevenue = summaryData?.togilo?.revenueData;
    if (!togiloRevenue) return null;

    return {
      labels: ["Coins", "Subs", "Ads", "Commission"],
      datasets: [
        {
          label: `Revenue ${currency === "USD" ? "$" : "₹"}`,
          data: [
            togiloRevenue.Coins || 0,
            togiloRevenue.subs || 0,
            togiloRevenue.Ads || 0,
            togiloRevenue.commission || 0,
          ],
          backgroundColor: [
            "rgba(245, 158, 11, 0.8)",
            "rgba(34, 197, 94, 0.8)",
            "rgba(239, 68, 68, 0.8)",
            "rgba(124, 58, 237, 0.8)",
          ],
          borderColor: ["#f59e0b", "#22c55e", "#ef4444", "#7c3aed"],
          borderRadius: 4,
        },
      ],
    };
  }, [summaryData, currency]);

  const arpuChartData = useMemo(() => {
    const arpu = summaryData?.togilo?.AverageRevenuePerUser;
    if (!arpu) return null;

    return {
      labels: ["W1", "W2", "W3", "W4"],
      datasets: [
        {
          label: "ARPU",
          data: [arpu.w1 || 0, arpu.w2 || 0, arpu.w3 || 0, arpu.w4 || 0],
          tension: 0.35,
          borderWidth: 2,
          borderColor: "#22c55e",
          backgroundColor: "transparent",
        },
      ],
    };
  }, [summaryData]);

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center py-44 h-screen bg-[#0b0d12]/20">
        <CircularProgress
          size={45}
          style={{
            color: "white",
          }}
        />
      </div>
    );
  }

  if (status === "error") {
    return <ErrorState message={errorMsg} onRetry={() => fetchRevenueData()} />;
  }

  return (
    <section className="p-5">
      {userDetails?.data?.role?.name === "Super Admin" && (
        <RevenueSummaryCards
          currency={currency}
          totalRevenue={totalRevenue}
          totalRevenueFlirty={totalRevenueFlirty}
        />
      )}

      <TransactionStatsDashboard
        currency={currency}
        setCurrency={setCurrency}
      />

      {userDetails?.data?.role?.name === "Super Admin" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 mt-4">
          <RegionalRevenueTable
            title="Regional Revenue Togilo"
            regionData={summaryData?.togilo?.regionalRevenue}
            totalRegionalRevenue={totalRegionalRevenue}
          />
          <RegionalRevenueTable
            title="Regional Revenue Flirty Voices"
            regionData={summaryData?.flirtyVoice?.regionalRevenue}
            totalRegionalRevenue={totalRegionalRevenueFlirty}
          />
        </div>
      )}

      <div className="mt-4">
        <RevenueCharts
          revenueData={revenueChartData}
          arpuData={arpuChartData}
        />
      </div>
    </section>
  );
};

// UI Components
const RevenueSummaryCards = ({ currency, totalRevenue, totalRevenueFlirty }) => {
  const totalGrowth = 25; // Assuming hardcoded for now

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 items-center justify-center mb-4">
      {/* Togilo Revenue */}
      <div className="bg-slate-800/20 backdrop-blur-sm border border-slate-700/50 rounded-xl p-5 shadow-xl h-fit">
        <h3 className="text-sm text-[#9aa3b2] font-semibold mb-3">
          Total Revenue Togilo (MTD)
        </h3>
        <div className="flex items-end justify-between gap-3">
          <div className="text-2xl sm:text-3xl font-extrabold text-[#e7e9ee] break-all">
            {currency === "USD" ? "$" : "₹"}
            {format(totalRevenue)}
          </div>
          <div className="shrink-0 text-xs font-bold px-2 py-1 rounded-full bg-green-500/10 text-green-300 border border-green-500/30">
            +{totalGrowth}%
          </div>
        </div>
      </div>

      {/* Flirty Voice Revenue */}
      <div className="bg-slate-800/20 backdrop-blur-sm border border-slate-700/50 rounded-xl p-5 shadow-xl h-fit">
        <h3 className="text-sm text-[#9aa3b2] font-semibold mb-3">
          Total Revenue Flirty Voice (MTD)
        </h3>
        <div className="flex items-end justify-between gap-3">
          <div className="text-2xl sm:text-3xl font-extrabold text-[#e7e9ee] break-all">
            {currency === "USD" ? "$" : "₹"}
            {format(totalRevenueFlirty)}
          </div>
          <div className="shrink-0 text-xs font-bold px-2 py-1 rounded-full bg-green-500/10 text-green-300 border border-green-500/30">
            +{totalGrowth}%
          </div>
        </div>
      </div>

      {/* Bulk Invoice */}
      <div className="flex">
        <div className="w-full">
          <BulkInvoiceDownload />
        </div>
      </div>
    </div>
  );
};

const RegionalRevenueTable = ({ title, regionData, totalRegionalRevenue }) => {
  const sortedRegions = useMemo(() => {
    if (!regionData) return [];
    return Object.entries(regionData)
      .map(([region, data]) => ({
        region,
        ...data,
      }))
      .sort((a, b) => (b.totalRevenue || 0) - (a.totalRevenue || 0))
      .slice(0, 10);
  }, [regionData]);

  return (
    <div className="bg-slate-800/20 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4 shadow-xl overflow-x-auto">
      <h3 className="text-sm text-[#9aa3b2] font-semibold mb-2">{title}</h3>
      <table className="min-w-full">
        <thead className="border-b border-dashed border-slate-700/50">
          <tr>
            <th className="px-3 py-3 text-left text-xs font-semibold uppercase text-slate-400">
              Region
            </th>
            <th className="px-3 py-3 text-left text-xs font-semibold uppercase text-slate-400">
              Users
            </th>
            <th className="px-3 py-3 text-left text-xs font-semibold uppercase text-slate-400">
              Revenue
            </th>
            <th className="px-3 py-3 text-left text-xs font-semibold uppercase text-slate-400">
              Share
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedRegions.map((item, index) => (
            <tr
              key={index}
              className="hover:bg-slate-700/20 transition-colors text-[#e7e9ee]"
            >
              <td className="px-3 py-3 border-b border-dashed border-slate-700/50">
                {item.region}
              </td>
              <td className="px-3 py-3 border-b border-dashed border-slate-700/50">
                {item.userCount || 0}
              </td>
              <td className="px-3 py-3 border-b border-dashed border-slate-700/50">
                ₹{format((item.totalRevenue || 0) * 0.2)}
              </td>
              <td className="px-3 py-3 border-b border-dashed border-slate-700/50">
                {(((item.totalRevenue || 0) / totalRegionalRevenue) * 100).toFixed(1)}%
              </td>
            </tr>
          ))}
          {sortedRegions.length === 0 && (
            <tr>
              <td colSpan={4} className="text-center py-4 text-slate-500 text-sm">
                No regional data available
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

const RevenueCharts = ({ revenueData, arpuData }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Revenue by Source Chart */}
      <div className="bg-slate-800/20 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4 shadow-xl">
        <h3 className="text-sm text-[#9aa3b2] font-semibold mb-2">
          Revenue by Source
        </h3>
        <div className="h-52 md:h-64">
          {revenueData ? (
            <ReactChart
              type="bar"
              data={revenueData}
              options={revenueChartOptions}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-slate-500 text-sm">
              No chart data available
            </div>
          )}
        </div>
      </div>

      {/* ARPU Chart */}
      <div className="bg-slate-800/20 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4 shadow-xl">
        <h3 className="text-sm text-[#9aa3b2] font-semibold mb-2">
          ARPU Trend
        </h3>
        <div className="h-52 md:h-64">
          {arpuData ? (
            <ReactChart
              type="line"
              data={arpuData}
              options={arpuChartOptions}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-slate-500 text-sm">
              No chart data available
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ErrorState = ({ message, onRetry }) => {
  return (
    <div className="flex flex-col items-center justify-center py-32 px-4 text-center h-screen bg-[#0b0d12]/20">
      <div className="w-16 h-16 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mb-4 border border-red-500/20 shadow-md">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-8 w-8"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      </div>
      <h3 className="text-lg font-bold text-white mb-2">
        Failed to Load Dashboard
      </h3>
      <p className="text-sm text-slate-400 max-w-md mb-6">{message}</p>
      <button
        onClick={onRetry}
        className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold shadow-md transition-all duration-200"
      >
        Retry Loading
      </button>
    </div>
  );
};

export default RevenueAndMonetization;
const format = (num) => num?.toLocaleString("en-IN") || "0";
