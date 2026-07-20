import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  Users,
  UserCheck,
  Shield,
  TrendingUp,
  Activity,
  Calendar,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler,
} from "chart.js";

import { Line } from "react-chartjs-2";
import { BaseUrl } from "../BaseUrl";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler,
);

export default function CompanyStatsCard() {
  const [loading, setLoading] = useState(true);
  const getTodayDate = () => {
    return new Date().toISOString().split("T")[0];
  };

  const [selectedDate, setSelectedDate] = useState(getTodayDate());
  const [statsData, setStatsData] = useState(null);

  const fetchStats = async () => {
    try {
      setLoading(true);

      const res = await axios.get(
        `${BaseUrl.baseurl}/admin/user-online-stats?date=${selectedDate}`,
      );

      setStatsData(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [selectedDate]);

  const peakHour = useMemo(() => {
    if (!statsData?.length) return null;

    return [...statsData].sort(
      (a, b) => b.activeUsers - a.activeUsers,
    )[0];
  }, [statsData]);
  const formatISTHour = (utcHour) => {
    const date = new Date();

    date.setUTCHours(utcHour, 0, 0, 0);

    return date.toLocaleTimeString("en-IN", {
      timeZone: "Asia/Kolkata",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };
  const chartData = {
    labels: statsData?.map((item) => formatISTHour(item.hour)) || [],

    datasets: [
      {
        label: "Active Users",
        data: statsData?.map((item) => item.activeUsers) || [],

        borderColor: "#8b5cf6",
        backgroundColor: (ctx) => {
          const gradient = ctx.chart.ctx.createLinearGradient(0, 0, 0, 400);

          gradient.addColorStop(0, "rgba(139,92,246,.45)");

          gradient.addColorStop(1, "rgba(139,92,246,0)");

          return gradient;
        },

        fill: true,
        borderWidth: 4,
        tension: 0.45,
        pointRadius: 5,
        pointHoverRadius: 8,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,

    plugins: {
      legend: {
        display: false,
      },
    },

    scales: {
      x: {
        ticks: {
          color: "#94a3b8",
        },
        grid: {
          color: "rgba(255,255,255,.04)",
        },
      },

      y: {
        beginAtZero: true,

        ticks: {
          color: "#94a3b8",
        },

        grid: {
          color: "rgba(255,255,255,.04)",
        },
      },
    },
  };

  return (
    <div className="w-full mt-4 p-6 rounded-[32px] border border-white/10 bg-gradient-to-br from-[#070b1c] via-[#0f172a] to-black shadow-[0_0_80px_rgba(99,102,241,.15)]">
      {/* HEADER */}

      <div className="flex flex-col lg:flex-row justify-between gap-4 mb-8">
        <div>
         
 <StatCard
          title="Peak Active Users"
          value={peakHour?.activeUsers || 0}
          subtitle={peakHour ? formatISTHour(peakHour.hour) : "-"}
          icon={<TrendingUp size={22} />}
          color="from-violet-500 to-indigo-500"
        />
         
        </div>

        <div className="relative">
          <Calendar
            className="absolute left-4 top-3.5 text-slate-400"
            size={18}
          />

          <input
            type="date"
            value={selectedDate}
            max={new Date().toISOString().split("T")[0]}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="pl-11 h-12 rounded-2xl bg-white/5 border border-white/10 text-white px-4 outline-none"
          />
        </div>
      </div>

      {/* STAT CARDS */}

      {/* CHART */}

      <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-6">
        <div className="flex items-center gap-3 mb-6">
          <Activity className="text-violet-400" size={24} />

          <h2 className="text-2xl font-bold text-white">Hourly Active Users</h2>
        </div>

        <div className="h-[420px]">
          {loading ? (
            <div className="h-full flex items-center justify-center">
              <div className="w-16 h-16 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <Line data={chartData} options={chartOptions} />
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, subtitle, icon, color }) {
      const navigate = useNavigate();
  return (
    <div
    
      className="relative cursor-pointer overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] p-5 w-full"
    >
      <div
        className={`absolute inset-0 opacity-10 bg-gradient-to-br ${color}`}
      />

      <div className="relative flex justify-between">
        <div>
          <p className="text-slate-400 text-sm">{title}</p>

          <h2 className="text-white text-4xl font-black mt-2">{value}</h2>

          {subtitle && (
            <p className="text-violet-400 mt-2 text-sm">
              Peak Time: {subtitle}
            </p>
          )}
        </div>

        <div
          className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center text-white`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}