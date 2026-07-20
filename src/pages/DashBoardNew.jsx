import React, { useEffect, useMemo, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { Line, Doughnut, Bar } from "react-chartjs-2";
import axios from "axios";
import { BaseUrl } from "../BaseUrl";
import { CircularProgress } from "@mui/material";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import io from "socket.io-client";
import CountUp from "react-countup";
import CompanyStatsCard from "./CompanyStatsCard";
import togilo from "../assets/signupImage.png";
import flirtyVoice from "../assets/flirtyvoices.png";
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
);
var socket = io.connect(BaseUrl.baseurl, {
  transports: ["websocket"],
});

export default function DashboardNew() {
  const [calls, setCalls] = useState([]);
  const [signups, setSignups] = useState([]);
  const [activeModal, setActiveModal] = useState(null);
  const [activeToday, setActiveToday] = useState(0);
  const [activeTodayFlirty, setActiveTodayFlirty] = useState(0);
  const [onlineUser, setOnlineUser] = useState(0);
  const [onlineUserFlirty, setOnlineUserFlirty] = useState(0);
  const [onlineHost, setOnlineHost] = useState(0);
  const [onlineAgent, setOnlineAgent] = useState(0);
  const [ongoingCall, setOngoingCall] = useState(0);
  const [ongoingAudioCall, setOngoingAudioCall] = useState(0);
  const [revenueToday, setRevenueToday] = useState(0);
  const [revenueTodayDollar, setRevenueTodayDollar] = useState(0);
  const [revenueTodayFlirtyVoice, setRevenueTodayFlirtyVoice] = useState(0);
  const [revenueTodayDollarFlirtyVoice, setRevenueTodayDollarFlirtyVoice] =
    useState(0);
  // Render random calls
  const [signupData, setSignUpData] = useState("");
  const [genderData, setGenderData] = useState("");
  const [newSignUp, setNewSignUp] = useState([]);
  const [callSample, setCallSample] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState(null);
  const [chartLoad, setChartLoad] = useState(true);
  const [earningChartData, setEarningChartData] = useState(null);
  const [earningLoading, setEarningLoading] = useState(true);
  const [startDate, setStartDate] = useState("");
  const [endCallUser, setEndCallUser] = useState(null);
  const navigate = useNavigate();
  useEffect(() => {
    const handleReceiveCall = (data) => {
      console.log("data from socket", data);
    };

    socket.on("connected_calls", handleReceiveCall);

    return () => {
      socket.off("connected_calls", handleReceiveCall);
    };
  }, []);
  useEffect(() => {
    const fetchEarning = async () => {
      try {
        const res = await axios.get(`${BaseUrl.baseurl}/admin/stats-earnings`);
        const data = res.data;

        if (data.success && data.data) {
          const timeLabels = ["today", "yesterday", "week", "month", "year"];

          const totalAmount = timeLabels.map(
            (t) => data.data[t]?.[0]?.totalAmount || 0,
          );
          const companyEarning = timeLabels.map(
            (t) => data.data[t]?.[0]?.companyEarning || 0,
          );
          const companyCommission = timeLabels.map(
            (t) => data.data[t]?.[0]?.companyCommission || 0,
          );
          const agentShare = timeLabels.map(
            (t) => data.data[t]?.[0]?.agentShare || 0,
          );
          const agentCommission = timeLabels.map(
            (t) => data.data[t]?.[0]?.agentCommission || 0,
          );

          setEarningChartData({
            labels: timeLabels.map(
              (label) => label.charAt(0).toUpperCase() + label.slice(1),
            ),
            datasets: [
              {
                label: "Total Coins",
                data: totalAmount,
                backgroundColor: "#0ea5e9", // Cyan blue
                borderRadius: 6,
              },
              {
                label: "Company Earning",
                data: companyEarning,
                backgroundColor: "#a855f7", // Violet
                borderRadius: 6,
              },
              {
                label: "Company Commission",
                data: companyCommission,
                backgroundColor: "#f43f5e", // Coral red
                borderRadius: 6,
              },
              {
                label: "Agent Share",
                data: agentShare,
                backgroundColor: "#22c55e", // Emerald green
                borderRadius: 6,
              },
              {
                label: "Agent Commission",
                data: agentCommission,
                backgroundColor: "#eab308", // Amber yellow
                borderRadius: 6,
              },
            ],
          });
        }
      } catch (err) {
        console.error("Error fetching earnings stats:", err);
      } finally {
        setEarningLoading(false);
      }
    };

    fetchEarning();
  }, []);
  const earningChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        labels: { color: "#cbd5e1" },
      },
      tooltip: {
        mode: "index",
        intersect: false,
      },
    },
    scales: {
      x: {
        ticks: { color: "#94a3b8" },
      },
      y: {
        ticks: { color: "#94a3b8" },
      },
    },
  };
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get(`${BaseUrl.baseurl}/admin/stats-users`);
        const data = res.data;

        if (data.success && data.data) {
          const timeLabels = ["today", "yesterday", "week", "month", "year"];

          // Extract values safely
          const male = timeLabels.map((t) => data.data[t]?.male || 0);
          const female = timeLabels.map((t) => data.data[t]?.female || 0);
          const agents = timeLabels.map((t) => data.data[t]?.agents || 0);
          const total = timeLabels.map((t) => data.data[t]?.total || 0);

          setChartData({
            labels: timeLabels.map(
              (label) => label.charAt(0).toUpperCase() + label.slice(1),
            ),
            datasets: [
              {
                label: "Male",
                data: male,
                backgroundColor: "#14b8a6",
                borderRadius: 6,
              },
              {
                label: "Female",
                data: female,
                backgroundColor: "rgba(239, 68, 68, 0.8)",
                borderRadius: 6,
              },
              {
                label: "Agents",
                data: agents,
                backgroundColor: "#f97316",
                borderRadius: 6,
              },
              {
                label: "Total",
                data: total,
                backgroundColor: "#8b5cf6",

                borderRadius: 6,
              },
            ],
          });
        }
      } catch (err) {
        console.error("Error fetching user stats:", err);
      } finally {
        setChartLoad(false);
      }
    };

    fetchStats();
  }, []);
  const barChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        labels: { color: "#cbd5e1" },
      },
      tooltip: {
        mode: "index",
        intersect: false,
      },
    },
    scales: {
      x: {
        ticks: { color: "#94a3b8" },
      },
      y: {
        ticks: { color: "#94a3b8" },
      },
    },
  };

  function getUserData() {
    axios
      .get(`${BaseUrl.baseurl}/admin/live-dashboard`)
      .then((res) => {
        if (res.data) {
          setActiveToday(res.data.ActiveUserToday);
          setActiveTodayFlirty(res.data.ActiveFlirtyVoiceUserToday);
          setOnlineUser(res.data.OnlineTogiloUsersRealTime);
          setOnlineUserFlirty(res.data.OnlineFlirtyVoiceUsersRealTime);
          setOnlineHost(res.data.OnlineHostsRealTime);
          setOnlineAgent(res.data.OnlineAgentsRealTime);
          setOngoingCall(res.data.OngoingCalls);
          setOngoingAudioCall(res.data.OngoingCallsAudio);
          setRevenueToday(res.data.RevenueToday);
          setRevenueTodayDollar(res.data.RevenueTodayUSD);
          setRevenueTodayFlirtyVoice(res.data.RevenueTodayFV);
          setRevenueTodayDollarFlirtyVoice(res.data.RevenueTodayUSDFV);

          let signLabel = [],
            signUp = [],
            churn = [];
          res.data?.SignupVsChurnGraphData?.map((val) => {
            signLabel.push(val.day);
            signUp.push(val.signup);
            churn.push(val.churn);
          });
          setSignUpData({
            labels: signLabel,
            datasets: [
              {
                label: "Signups",
                data: signUp,
                borderWidth: 2,
                tension: 0.35,
              },
              {
                label: "Churn",
                data: churn,
                borderWidth: 2,
                tension: 0.35,
              },
            ],
          });
          setGenderData({
            labels: ["Male", "Female", "Agent"],
            datasets: [
              {
                data: [
                  res.data.GenderDistribution.male,
                  res.data.GenderDistribution.female,
                  res.data.GenderDistribution.agent,
                ],
                backgroundColor: ["#3b82f6", "#ec4899", "#f59e0b"],
              },
            ],
          });
          setNewSignUp(res.data.NewSignUps);
          setCallSample(res.data.OngoingCallsSample);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch live-dashboard stats:", err);
        setLoading(false);
      });
  }

  useEffect(() => {
    getUserData();

    const intervalId = setInterval(() => {
      getUserData();
    }, 20000);

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    const newCalls = [];
    for (let i = 0; i < 5; i++) {
      const dur = Math.floor(Math.random() * 28) + 2;
      newCalls.push({
        id: `C-${800 + i}`,
        userA: `#${1000 + i}`,
        userB: `#${1100 + i}`,
        duration: `${dur}m`,
        status: "Live",
      });
    }
    setCalls(newCalls);
  }, []);

  // Render random signups
  useEffect(() => {
    const locations = ["India", "USA", "UAE", "UK"];
    const devices = ["Android", "iOS", "Web"];
    const newSignups = [];
    for (let i = 0; i < 6; i++) {
      const verified = Math.random() > 0.5;
      newSignups.push({
        user: `User #${1200 + i}`,
        location: locations[i % 4],
        device: devices[i % 3],
        status: verified ? "Verified" : "Pending",
        tag: verified ? "success" : "warn",
      });
    }
    setSignups(newSignups);
  }, []);

  // Chart configs

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        labels: { color: "#cbd5e1" },
      },
    },
    scales: {
      x: { ticks: { color: "#94a3b8" } },
      y: { ticks: { color: "#94a3b8" } },
    },
  };
  const [ageDistribution, setAgeDistribution] = useState(null); // object: below-18, 18-20 ... total
  const [ageByCity, setAgeByCity] = useState([]); // array of {city, counts, total}
  const [locationTransactions, setLocationTransactions] = useState(null); // response.data
  const [ageLoading, setAgeLoading] = useState(true);
  const synonyms = {
    // Bengaluru
    bangalore: "bengaluru",
    bengalooru: "bengaluru",
    bengalore: "bengaluru",
    bengaluru: "bengaluru",
    bengaluruurban: "bengaluru",
    "bangalore city": "bengaluru",
    "bangalore urban": "bengaluru",

    // Mumbai
    mumbai: "mumbai",
    bombay: "mumbai",
    "navi mumbai": "navi mumbai",
    navimumbai: "navi mumbai",
    "new mumbai": "navi mumbai",

    // Delhi
    delhi: "delhi",
    "new delhi": "delhi",
    newdelhi: "delhi",
    "ncr delhi": "delhi",
    "delhi ncr": "delhi",
    "new-delhi": "delhi",
    "delhi city": "delhi",

    // Hyderabad
    hyderabad: "hyderabad",
    hydrabad: "hyderabad",
    hyderbad: "hyderabad",

    // Chennai
    chennai: "chennai",
    madras: "chennai",

    // Kolkata
    kolkata: "kolkata",
    calcutta: "kolkata",

    // Ahmedabad
    ahmedabad: "ahmedabad",
    amdavad: "ahmedabad",

    // Pune
    pune: "pune",
    poona: "pune",

    // Jaipur
    jaipur: "jaipur",
    jaypur: "jaipur",

    // Lucknow
    lucknow: "lucknow",
    lakhnau: "lucknow",

    // Surat
    surat: "surat",
    soorat: "surat",

    // Indore
    indore: "indore",
    indur: "indore",

    // Coimbatore
    coimbatore: "coimbatore",
    kovai: "coimbatore",

    // Kanpur
    kanpur: "kanpur",
    cawnpore: "kanpur",

    // Nagpur
    nagpur: "nagpur",
    nagpore: "nagpur",

    // Patna
    patna: "patna",
    patnna: "patna",

    // Bhopal
    bhopal: "bhopal",
    bhopaal: "bhopal",

    // Thane
    thane: "thane",
    thana: "thane",

    // Kochi
    kochi: "kochi",
    cochin: "kochi",

    // Visakhapatnam
    visakhapatnam: "visakhapatnam",
    vizag: "visakhapatnam",
    visag: "visakhapatnam",

    // Noida
    noida: "noida",
    noide: "noida",

    // Gurgaon / Gurugram
    gurgaon: "gurugram",
    gurugram: "gurugram",
    "guru gram": "gurugram",
    gurgoan: "gurugram",

    // Varanasi
    varanasi: "varanasi",
    banaras: "varanasi",
    benares: "varanasi",

    // Chandigarh
    chandigarh: "chandigarh",
    chandigadh: "chandigarh",
    sorat: "surat",
    "soorat ": "surat",

    // Srinagar
    srinagar: "srinagar",
    shrinagar: "srinagar",

    // Faridabad
    faridabad: "faridabad",
    faridbad: "faridabad",
  };

  // fetch age endpoints + reuse AbortController
  useEffect(() => {
    const controller = new AbortController();
    const fetchAll = async () => {
      try {
        // parallel requests
        const [ageRes, cityRes, txRes] = await Promise.all([
          axios.get(`${BaseUrl.baseurl}/admin/get-users-ages`, {
            signal: controller.signal,
          }),
          axios.get(`${BaseUrl.baseurl}/admin/get-users-age-counts-by-city`, {
            signal: controller.signal,
          }),
          axios.get(
            `${BaseUrl.baseurl}/admin/location-wise-user-transactions`,
            { signal: controller.signal },
          ),
        ]);

        // ages
        if (ageRes?.data?.success && ageRes.data.data) {
          setAgeDistribution(ageRes.data.data);
        }

        // age by city
        if (cityRes?.data?.success && Array.isArray(cityRes.data.data)) {
          // sort descending by total and keep top 12 for UI

          const sorted = cityRes.data.data
            .map((c) => ({
              city: (c.city || "Unknown").trim(),
              counts: c.counts || {},
              total: Number(c.total || 0),
            }))
            .sort((a, b) => b.total - a.total);
          setAgeByCity(sorted);
        }

        // location-wise transactions
        console.log("jabbeesha", txRes.data.data);
        if (txRes?.data?.success && txRes.data.data) {
          setLocationTransactions(txRes.data.data);
        } else {
          setLocationTransactions({ perCity: [], topPerBucket: {} });
        }
      } catch (err) {
        if (!axios.isCancel(err))
          console.error("Error fetching age metrics:", err);
      } finally {
        setAgeLoading(false);
      }
    };

    fetchAll();
    return () => controller.abort();
  }, []);
  const ageChartData = useMemo(() => {
    if (!ageDistribution) return null;
    const labels = ["below-18", "18-20", "20-25", "25-30", "30-35", "above-35"];
    return {
      labels: labels.map((l) => l.replace("-", " ")),
      datasets: [
        {
          label: "Users",
          data: labels.map((k) => Number(ageDistribution[k] || 0)),
          borderRadius: 6,
          borderColor: "#60a5fa",
          backgroundColor: "rgba(96,165,250,0.18)",
        },
      ],
    };
  }, [ageDistribution]);
  const mergedAgeByCityGrap = useMemo(() => {
    if (!Array.isArray(ageByCity) || ageByCity.length === 0) return [];
    // synonyms to collapse common variants -> canonical name (lowercase)

    const normalize = (city) => {
      if (!city || typeof city !== "string") return "unknown";
      let c = city.trim().toLowerCase();
      c = c.replace(/\s+/g, " ").replace(/[.]/g, "");
      return synonyms[c] ?? c;
    };

    const buckets = [
      "below-18",
      "18-20",
      "20-25",
      "25-30",
      "30-35",
      "above-35",
    ];
    const map = new Map();

    ageByCity.forEach((item) => {
      const raw = (item.city || "").trim();
      const key = normalize(raw);

      if (!map.has(key)) {
        const countsInit = {};
        buckets.forEach((b) => (countsInit[b] = 0));
        map.set(key, {
          cityKey: key,
          displayNames: new Set(),
          counts: countsInit,
          total: 0,
        });
      }

      const entry = map.get(key);
      if (raw) entry.displayNames.add(raw);
      const src = item.counts || {};
      buckets.forEach((b) => {
        entry.counts[b] += Number(src[b] || 0);
      });
      entry.total += Number(item.total || 0);
    });

    // to array: prefer canonical display name (capitalized) but keep track of originals if needed
    const result = Array.from(map.values()).map((e) => {
      // pick the most common original name if present, else use capitalized key
      const pretty =
        e.displayNames.size > 0
          ? Array.from(e.displayNames)[0]
          : e.cityKey === "unknown"
            ? "Unknown"
            : e.cityKey
                .split(" ")
                .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
                .join(" ");
      return { city: pretty, counts: e.counts, total: e.total };
    });

    // sort descending by total
    result.sort((a, b) => b.total - a.total);
    return result;
  }, [ageByCity]);
  const topCitiesStackedData = useMemo(() => {
    if (!mergedAgeByCityGrap || mergedAgeByCityGrap.length === 0) return null;
    const top = mergedAgeByCityGrap.slice(0, 8);
    const labels = top.map((t) => (t.city === "" ? "Unknown" : t.city));
    const buckets = [
      "below-18",
      "18-20",
      "20-25",
      "25-30",
      "30-35",
      "above-35",
    ];
    const datasets = buckets.map((b, idx) => ({
      label: b.replace("-", " "),
      data: top.map((c) => Number(c.counts[b] || 0)),
      borderRadius: 4,
      borderColor: undefined,
      backgroundColor: [
        "#ef4444",
        "#f97316",
        "#f59e0b",
        "#10b981",
        "#06b6d4",
        "#7c3aed",
      ][idx % 6],
    }));

    return { labels, datasets };
  }, [mergedAgeByCityGrap]);
  const mergedAgeByCity = useMemo(() => {
    if (!Array.isArray(ageByCity) || ageByCity.length === 0) return [];

    // add any synonyms you want to collapse here

    const normalize = (city) => {
      if (!city || typeof city !== "string") return "unknown";
      let c = city.trim().toLowerCase();
      // collapse multiple spaces, remove punctuation you don't care about
      c = c.replace(/\s+/g, " ").replace(/[.]/g, "");
      // map synonyms (falls back to normalized value)
      return synonyms[c] ?? c;
    };

    const buckets = [
      "below-18",
      "18-20",
      "20-25",
      "25-30",
      "30-35",
      "above-35",
    ];

    const map = new Map();

    for (const item of ageByCity) {
      const rawCity = (item.city || "").trim();
      const cityKey = normalize(rawCity);

      if (!map.has(cityKey)) {
        // initialize counts with zeros
        const counts = {};
        for (const b of buckets) counts[b] = 0;
        map.set(cityKey, {
          city: cityKey === "unknown" ? rawCity || "Unknown" : cityKey,
          counts,
          total: 0,
        });
      }

      const entry = map.get(cityKey);
      const srcCounts = item.counts || {};
      for (const b of buckets) {
        entry.counts[b] = (entry.counts[b] || 0) + Number(srcCounts[b] || 0);
      }
      entry.total = (entry.total || 0) + Number(item.total || 0);
    }

    // convert map -> array and restore nicer display name (capitalize)
    const result = Array.from(map.values()).map((r) => {
      const pretty =
        r.city === "unknown"
          ? "Unknown"
          : r.city
              .split(" ")
              .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
              .join(" ");
      return { ...r, city: pretty };
    });

    // sort by total descending
    result.sort((a, b) => b.total - a.total);

    return result;
  }, [ageByCity]);
  // small helper to render per-bucket top users from locationTransactions
  const renderTopPerBucket = () => {
    if (!locationTransactions || !locationTransactions.topPerBucket)
      return <div className="text-sm text-[#9aa3b2]">No data</div>;
    const buckets = Object.keys(locationTransactions.topPerBucket);

    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        {buckets.map((bucket, i) => (
          <div
            key={i}
            className="bg-[#081027] p-3 rounded-lg border border-white/5"
          >
            <div className="text-xs text-[#9aa3b2] font-semibold mb-2">
              {bucket.replace("-", " ")}
            </div>
            {Array.isArray(locationTransactions.topPerBucket[bucket]) &&
            locationTransactions.topPerBucket[bucket].length > 0 ? (
              <ol className="text-sm text-[#e7e9ee] list-decimal ml-4">
                {locationTransactions.topPerBucket[bucket]
                  .slice(0, 5)
                  .map((u, i) => {
                    const value =
                      typeof u === "string" || typeof u === "number"
                        ? u
                        : u.userId || u.id || u.city || JSON.stringify(u);

                    return <li key={i}>{value}</li>;
                  })}
              </ol>
            ) : (
              <div className="text-sm text-[#9aa3b2]">None</div>
            )}
          </div>
        ))}
      </div>
    );
  };
  const [dailyData, setDailyData] = useState("");
  function getDateWiseUser(val) {
    axios
      .get(`${BaseUrl.baseurl}/admin/get-day-user-stats?date=${val}`)
      .then((res) => {
        if (res.data.status) {
          setDailyData(res.data);
        }
      })
      .catch((err) => {});
  }
  useEffect(() => {
    getDateWiseUser(new Date().toISOString().split("T")[0]);
  }, []);
  const getLiveDuration = (startedAt) => {
    if (!startedAt) return 0;

    const start = new Date(startedAt).getTime();
    const now = Date.now();

    const seconds = Math.floor((now - start) / 1000); // duration in seconds
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    return `${hrs !== 0 ? hrs + "h" : ""} ${mins}m ${secs}s`;
  };
  const ConfirmModal = ({
    open,
    title = "Are you sure?",
    description,
    confirmText = "Confirm",
    cancelText = "Cancel",
    onConfirm,
    onCancel,
  }) => {
    if (!open) return null;

    return (
      <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
        <div className="bg-[#0b0d12] w-full max-w-md rounded-xl border border-white/10 shadow-xl p-6">
          <h3 className="text-lg font-semibold text-[#e7e9ee] mb-2">{title}</h3>
          {description && (
            <p className="text-sm text-[#9aa3b2] mb-6">{description}</p>
          )}

          <div className="flex justify-end gap-3">
            <button
              onClick={onCancel}
              className="px-4 py-2 rounded-lg border border-white/10 text-[#e7e9ee] hover:bg-white/5"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-semibold"
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    );
  };
  function endCall(userId) {
    axios
      .put(`${BaseUrl.baseurl}/user/end-call/${userId?.callerId}`)
      .then((res) => {
        if (res.data.status) {
          toast.success(res.data.message);
          setEndCallUser(null);
          getUserData();
        } else {
          toast.error(res.data.message);
          setEndCallUser(null);
        }
      })
      .catch((err) => {});
  }
  return (
    <>
      <section className="block" id="home">
        {loading ? (
          <div className="flex items-center justify-center py-44 h-screen">
            <CircularProgress
              size={45}
              style={{
                color: "white",
              }}
            />
          </div>
        ) : (
          <>
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-8 gap-4 mt-3">
              {/* Repeat 4 stats cards */}
              {[
                [`Online Users`, onlineUser, "+0", "green"],
                ["Online Users", onlineUserFlirty, "+0", "green"],
                ["Online Host ", onlineHost, "+0", "green"],
                ["Online Agent ", onlineAgent, "+0", "green"],
                ["Ongoing 121 Calls", ongoingCall, "0", "red"],
                ["Ongoing Audio Calls", ongoingAudioCall, "0", "red"],
                ["Active Users", activeToday, "+0%", "green"],
                ["Active Users", activeTodayFlirty, "+0%", "green"],
              ]?.map(([title, val, delta, color], i) => (
                <div
                  onClick={() => {
                    if (i === 0||i === 1) {
                      navigate(`view-online-user/user`);
                    } else if (i === 2) {
                      navigate(`view-online-user/host`);
                    } else if (i === 3) {
                      navigate(`view-online-user/agent`);
                    } else if (i === 6||i === 7) {
                      navigate(`Analytics`);
                    }
                  }}
                  key={i}
                  className="cursor-pointer bg-[radial-gradient(1200px_800px_at_10%_-10%,#1a1f33_0%,#0b0d12_60%)] border border-white/10 rounded-xl p-4 shadow"
                >
                  <h3 className="text-sm text-[#9aa3b2] font-semibold flex gap-2 items-center">
                    {title} {(i===0||i===6)?<img src={togilo} alt="" className="h-5 w-5" />:(i===1||i===7)&&<img src={flirtyVoice} className="h-5 w-5" alt="" />}
                  </h3>
                  <div className="flex items-end justify-between">
                    <div className="font-extrabold text-2xl text-[#e7e9ee]">
                      {i === 3 ? (
                        callSample.some(
                          (c) =>
                            c.userA === "ivar ( 56 )" ||
                            c.userB === "ivar ( 56 )",
                        ) ? (
                          0
                        ) : (
                          <CountUp end={val} duration={1.8} separator="," />
                        )
                      ) : (
                        <CountUp end={val} duration={1.8} separator="," />
                      )}
                    </div>
                    <div
                      className={`text-xs font-bold px-2 py-1 rounded-full border ${
                        color === "green"
                          ? "bg-green-500/10 text-green-300 border-green-500/30"
                          : "bg-red-500/10 text-red-300 border-red-500/30"
                      }`}
                    >
                      {delta}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-4 mt-3">
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 w-full">
                <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 ">
                  {/* Repeat 4 stats cards */}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                [
                  "Revenue Today Togilo (INR)",
                  revenueToday,
                  "+0%",
                  "green",
                  "₹",
                ],
                [
                  "Revenue Today Togilo (USD)",
                  revenueTodayDollar,
                  "+0%",
                  "green",
                  "$",
                ],
                [
                  "Revenue Today Flirty Voices (INR)",
                  revenueTodayFlirtyVoice,
                  "+0%",
                  "green",
                  "₹",
                ],
                [
                  "Revenue Today Flirty Voices (USD)",
                  revenueTodayDollarFlirtyVoice,
                  "+0%",
                  "green",
                  "$",
                ],
              ]?.map(([title, val, delta, color, symbol], i) => (
                <div className="md:col-span-1" key={i}>
                  <div className="bg-[radial-gradient(1200px_800px_at_10%_-10%,#1a1f33_0%,#0b0d12_60%)] border border-white/10 rounded-xl p-4 shadow">
                    <h3 className="text-sm text-[#9aa3b2] font-semibold">
                      {title}
                    </h3>
                    <div className="flex items-end justify-between">
                      <div className="font-extrabold text-2xl text-[#e7e9ee]">
                        {symbol}
                        <CountUp end={val} duration={1.8} separator="," />
                      </div>
                      <div
                        className={`text-xs font-bold px-2 py-1 rounded-full border ${
                          color === "green"
                            ? "bg-green-500/10 text-green-300 border-green-500/30"
                            : "bg-red-500/10 text-red-300 border-red-500/30"
                        }`}
                      >
                        {delta}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* <div
                onClick={() => {
                  navigate("/New-User-Location-Analytic");
                }}
                className=" cursor-pointer md:col-span-4 bg-[radial-gradient(1200px_800px_at_10%_-10%,#1a1f33_0%,#0b0d12_60%)] border border-white/10 rounded-xl p-4 shadow"
              >
                {dailyData?.status ? (
                  <div className=" grid grid-cols-1 lg:grid-cols-12 gap-2 text-xs mt-2">
                    <div>
                      <p className="text-[#9aa3b2] font-semibold">
                        New Reg Usr Togilo
                      </p>
                      <p className="font-bold text-[#e7e9ee] text-sm">
                        <CountUp
                          end={dailyData?.togilo?.totalUsersCreated}
                          duration={1.8}
                          separator=","
                        />
                      </p>
                    </div>

                    <div>
                      <p className="text-[#9aa3b2] font-semibold">Total Txns Togilo</p>
                      <p className="font-bold text-[#e7e9ee] text-sm">
                        <CountUp
                          end={dailyData?.togilo?.totalTransactions}
                          duration={1.8}
                          separator=","
                        />
                      </p>
                    </div>

                    <div>
                      <p className="text-[#9aa3b2] font-semibold">
                        Total Amount Togilo
                      </p>
                      <p className="font-bold text-green-400 text-sm">
                        ₹{" "}
                        <CountUp
                          end={dailyData?.togilo?.totalTransactionAmount}
                          duration={1.8}
                          separator=","
                        />
                      </p>
                    </div>

                    <div>
                      <p className="text-[#9aa3b2] font-semibold">
                        TotalPaid Usr Togilo
                      </p>
                      <p className="font-bold text-indigo-400 text-sm">
                        <CountUp
                          end={dailyData?.togilo?.totalUsersWhoTransacted}
                          duration={1.8}
                          separator=","
                        />
                      </p>
                    </div>
                    <div>
                      <p className="text-[#9aa3b2] font-semibold">NewUsr Amt Togilo</p>

                      <p className="font-bold text-green-400 text-sm">
                        ₹{" "}
                        <CountUp
                          end={dailyData?.togilo?.totalAmountFromNewUsers}
                          duration={1.8}
                          separator=","
                        />
                      </p>
                    </div>
                    <div>
                      <p className="text-[#9aa3b2] font-semibold">
                        Paid New Usr Togilo
                      </p>
                      <p className="font-bold text-indigo-400 text-sm">
                        <CountUp
                          end={dailyData?.togilo?.totalNewUsersWhoTransacted}
                          duration={1.8}
                          separator=","
                        />
                      </p>
                    </div>
                    <div>
                      <p className="text-[#9aa3b2] font-semibold">
                        New Reg Usr Flirty Voices
                      </p>
                      <p className="font-bold text-[#e7e9ee] text-sm">
                        <CountUp
                          end={dailyData?.flirtyVoice?.totalUsersCreated}
                          duration={1.8}
                          separator=","
                        />
                      </p>
                    </div>

                    <div>
                      <p className="text-[#9aa3b2] font-semibold">Total Txns Flirty Voices</p>
                      <p className="font-bold text-[#e7e9ee] text-sm">
                        <CountUp
                          end={dailyData?.flirtyVoice?.totalTransactions}
                          duration={1.8}
                          separator=","
                        />
                      </p>
                    </div>

                    <div>
                      <p className="text-[#9aa3b2] font-semibold">
                        Total Amount Flirty Voices
                      </p>
                      <p className="font-bold text-green-400 text-sm">
                        ₹{" "}
                        <CountUp
                          end={dailyData?.flirtyVoice?.totalTransactionAmount}
                          duration={1.8}
                          separator=","
                        />
                      </p>
                    </div>

                    <div>
                      <p className="text-[#9aa3b2] font-semibold">
                        TotalPaid Usr Flirty Voices
                      </p>
                      <p className="font-bold text-indigo-400 text-sm">
                        <CountUp
                          end={dailyData?.flirtyVoice?.totalUsersWhoTransacted}
                          duration={1.8}
                          separator=","
                        />
                      </p>
                    </div>
                    <div>
                      <p className="text-[#9aa3b2] font-semibold">NewUsr Amt Flirty Voices</p>

                      <p className="font-bold text-green-400 text-sm">
                        ₹{" "}
                        <CountUp
                          end={dailyData?.flirtyVoice?.totalAmountFromNewUsers}
                          duration={1.8}
                          separator=","
                        />
                      </p>
                    </div>
                    <div>
                      <p className="text-[#9aa3b2] font-semibold">
                        Paid New Usr Flirty Voices
                      </p>
                      <p className="font-bold text-indigo-400 text-sm">
                        <CountUp
                          end={dailyData?.flirtyVoice?.totalNewUsersWhoTransacted}
                          duration={1.8}
                          separator=","
                        />
                      </p>
                    </div>
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                    >
                      <input
                        type="date"
                        max={new Date().toISOString().split("T")[0]}
                        value={startDate}
                        onChange={(e) => {
                          getDateWiseUser(e.target.value);
                          setStartDate(e.target.value);
                        }}
                        className="bg-[#0f1320] text-white border border-[#2d3748] rounded-md text-xs px-2 py-1 h-11"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-[#6b7280] mt-3">
                    Select a date
                  </div>
                )}
              </div> */}
            </div>

            {/* Charts */}

            <div className="gap-4 mt-4 lg:grid grid-cols-6 flex flex-col">
              <div className="w-full lg:col-span-2 bg-[#0b0d12]/40 border border-white/10 rounded-xl p-4 shadow">
                <h3 className="text-sm text-[#9aa3b2] font-semibold mb-2">
                  Age Distribution (male only)
                </h3>
                <div className="h-48 flex items-center">
                  {ageChartData ? (
                    <Bar
                      data={ageChartData}
                      options={{
                        indexAxis: "y",
                        plugins: { legend: { display: false } },
                        scales: {
                          x: { ticks: { color: "#94a3b8" } },
                          y: { ticks: { color: "#94a3b8" } },
                        },
                        maintainAspectRatio: false,
                      }}
                    />
                  ) : (
                    <div className="text-sm text-[#9aa3b2]">No data</div>
                  )}
                </div>

                <div className="mt-3 text-sm text-[#9aa3b2]">
                  Total users:{" "}
                  <span className="text-[#e7e9ee] font-semibold">
                    {ageDistribution?.total ?? "-"}
                  </span>
                </div>
              </div>

              <div className="col-span-4 bg-[#0b0d12]/40 border border-white/10 rounded-xl p-4 shadow h-[20rem] overflow-y-auto">
                <h3 className="text-sm text-[#9aa3b2] font-semibold mb-2">
                  Ongoing Calls (Sample)
                </h3>
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="text-[#9aa3b2] text-xs uppercase">
                      <th className="p-2 text-left">User A (from)</th>
                      <th className="p-2 text-left">User B (to)</th>
                      <th className="p-2 text-left">Duration</th>
                      <th className="p-2 text-left">Call Type</th>
                      <th className="p-2 text-left">Status</th>
                      <th className="p-2 text-left">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {callSample.length !== 0 &&
                      callSample.map((c, i) => {
                        if (
                          c.userA.includes("ivar ( 56 )") ||
                          c.userB.includes("ivar ( 56 )")
                        ) {
                          return null;
                        }
                        return (
                          <tr
                            key={i}
                            className="hover:bg-white/5 text-[#e7e9ee]"
                          >
                            <td className="p-2">{c.userA}</td>
                            <td className="p-2">{c.userB}</td>
                            <td className="p-2">
                              {getLiveDuration(c.startedAt)}
                            </td>

                            <td className="p-2">
                              <span className="px-2 py-1 rounded-full text-xs bg-green-500/10 text-green-300 border border-green-500/30">
                                {c.callType}
                              </span>
                            </td>
                            <td>
                              <span
                                className={`px-2 py-1 rounded-full text-xs border ${
                                  c.status === "connected"
                                    ? "bg-purple-500/10 text-purple-300 border-purple-500/30"
                                    : c.status === "initiated"
                                      ? "bg-sky-500/10 text-sky-300 border-sky-500/30"
                                      : c.status === "ended"
                                        ? "bg-yellow-500/10 text-yellow-300 border-yellow-500/30"
                                        : "bg-teal-500/10 text-teal-300 border-teal-500/30"
                                }`}
                              >
                                {c.status === "connected"
                                  ? "On-Call"
                                  : c.status}
                              </span>
                            </td>
                            <td className="p-2">
                              <span
                                onClick={() => {
                                  setEndCallUser(c);
                                }}
                                className="px-2 py-1 rounded-full text-xs bg-rose-500/10 text-rose-300 border border-rose-500/30 cursor-pointer"
                              >
                                End Call
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
            <div
              onClick={() => navigate("/New-User-Location-Analytic")}
              className="mt-4 cursor-pointer rounded-2xl border border-white/10 bg-[#0d111b] p-5 shadow-xl"
            >
              {/* Header */}
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-5">
                <div>
                  <h2 className="text-lg md:text-xl font-bold text-white">
                    📊 Daily New User Analytics
                  </h2>

                  <p className="text-xs md:text-sm text-gray-400">
                    Togilo vs Flirty Voices
                  </p>
                </div>

                <div
                  onClick={(e) => e.stopPropagation()}
                  className="flex flex-col sm:flex-row sm:items-center gap-2"
                >
                  <span className="text-xs text-gray-400">Date</span>

                  <input
                    type="date"
                    max={new Date().toISOString().split("T")[0]}
                    value={startDate}
                    onChange={(e) => {
                      getDateWiseUser(e.target.value);
                      setStartDate(e.target.value);
                    }}
                    className="w-full sm:w-auto bg-[#161b26] border border-gray-700 rounded-lg px-3 py-2 text-white text-sm"
                  />
                </div>
              </div>

              {/* Togilo */}
              <div className="mb-5">
                <div className="mb-2 flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-green-500"></div>
                  <span className="font-semibold text-white">Togilo</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                  <StatCard
                    title="New Users"
                    value={dailyData?.togilo?.totalUsersCreated}
                  />

                  <StatCard
                    title="Total Transactions"
                    value={dailyData?.togilo?.totalTransactions}
                  />

                  <StatCard
                    title="Total Revenue"
                    value={dailyData?.togilo?.totalTransactionAmount}
                    symbol="₹"
                    green
                  />

                  <StatCard
                    title="Total Paid Users"
                    value={dailyData?.togilo?.totalUsersWhoTransacted}
                  />

                  <StatCard
                    title="New User Revenue"
                    value={dailyData?.togilo?.totalAmountFromNewUsers}
                    symbol="₹"
                    green
                  />

                  <StatCard
                    title="Paid New Users"
                    value={dailyData?.togilo?.totalNewUsersWhoTransacted}
                  />
                </div>
              </div>

              {/* Flirty Voices */}
              <div>
                <div className="mb-2 flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-pink-500"></div>
                  <span className="font-semibold text-white">
                    Flirty Voices
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                  <StatCard
                    title="New Users"
                    value={dailyData?.flirtyVoice?.totalUsersCreated}
                  />

                  <StatCard
                    title="Total Transactions"
                    value={dailyData?.flirtyVoice?.totalTransactions}
                  />

                  <StatCard
                    title="Total Revenue"
                    value={dailyData?.flirtyVoice?.totalTransactionAmount}
                    symbol="₹"
                    green
                  />

                  <StatCard
                    title="Total Paid Users"
                    value={dailyData?.flirtyVoice?.totalUsersWhoTransacted}
                  />

                  <StatCard
                    title="New User Revenue"
                    value={dailyData?.flirtyVoice?.totalAmountFromNewUsers}
                    symbol="₹"
                    green
                  />

                  <StatCard
                    title="Paid New Users"
                    value={dailyData?.flirtyVoice?.totalNewUsersWhoTransacted}
                  />
                </div>
              </div>
            </div>
            <CompanyStatsCard />

            {/* Tables & Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
              <div className="flex-1 bg-[#0b0d12]/40 border border-white/10 rounded-xl p-4 shadow">
                <h3 className="text-sm text-[#9aa3b2] font-semibold mb-2">
                  New User Engagement
                </h3>

                {chartLoad ? (
                  <div className="text-[#9aa3b2] text-sm mt-8 text-center">
                    Loading chart...
                  </div>
                ) : chartData ? (
                  <Bar
                    data={chartData}
                    options={barChartOptions}
                    height={140}
                  />
                ) : (
                  <div className="text-red-400 text-sm mt-8 text-center">
                    Failed to load data.
                  </div>
                )}
              </div>
              {/* Transactions by location */}
              <div className="col-span-1 lg:col-span-1 bg-[#0b0d12]/40 border border-white/10 rounded-xl p-4 shadow">
                <h3 className="text-sm text-[#9aa3b2] font-semibold mb-2">
                  Location-wise Transactions
                </h3>
                <div className="text-sm text-[#9aa3b2] mb-3">
                  Gender filter:{" "}
                  <span className="text-[#e7e9ee] font-semibold">
                    {locationTransactions?.meta?.gender ?? "N/A"}
                  </span>
                </div>
                {locationTransactions &&
                Array.isArray(locationTransactions.perCity) &&
                locationTransactions.perCity.length > 0 ? (
                  <div className="h-40 overflow-auto">
                    <table className="w-full text-sm border-collapse">
                      <thead>
                        <tr className="text-[#9aa3b2] text-xs uppercase">
                          <th className="p-2 text-left">City</th>
                          <th className="p-2 text-left">Transactions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {locationTransactions.perCity.map((c, idx) => (
                          <tr
                            key={idx}
                            className="hover:bg-white/5 text-[#e7e9ee]"
                          >
                            <td className="p-2">{c.city || "Unknown"}</td>
                            <td className="p-2">{c.total}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-sm text-[#9aa3b2]">
                    No transaction data available for selected filters.
                  </div>
                )}

                <div className="mt-4">
                  <div className="text-sm text-[#9aa3b2] font-semibold mb-2">
                    Top Per Bucket (sample)
                  </div>
                  {renderTopPerBucket()}
                </div>
              </div>
              <div className="flex-1 bg-[#0b0d12]/40 border border-white/10 rounded-xl p-4 shadow">
                <h3 className="text-sm text-[#9aa3b2] font-semibold mb-2">
                  Signups vs Churn
                </h3>
                {signupData && (
                  <Line data={signupData} options={chartOptions} height={120} />
                )}
              </div>

              {/* Calls Table */}

              {/* Age distribution (big) */}
              <div className="flex-1  bg-[#0b0d12]/40 border border-white/10 rounded-xl p-4 shadow">
                <h3 className="text-sm text-[#9aa3b2] font-semibold mb-2">
                  Gender Distribution (Active)
                </h3>
                <div className=" flex items-center justify-center h-96">
                  {genderData && (
                    <Doughnut
                      data={genderData}
                      options={{
                        maintainAspectRatio: false,
                      }}
                    />
                  )}
                </div>
              </div>
              {/* Top cities stacked */}
              <div className="col-span-1 lg:col-span-1 bg-[#0b0d12]/40 border border-white/10 rounded-xl p-4 shadow">
                <h3 className="text-sm text-[#9aa3b2] font-semibold mb-2">
                  Top Cities (age split) (male only)
                </h3>
                <div className="h-48">
                  {topCitiesStackedData ? (
                    <Bar
                      data={topCitiesStackedData}
                      options={{
                        plugins: { legend: { position: "bottom" } },
                        scales: {
                          x: { ticks: { color: "#94a3b8" } },
                          y: { stacked: true, ticks: { color: "#94a3b8" } },
                        },
                        maintainAspectRatio: false,
                        responsive: true,
                      }}
                    />
                  ) : (
                    <div className="text-sm text-[#9aa3b2]">No city data</div>
                  )}
                </div>
                <div className="mt-3 text-xs text-[#9aa3b2]">
                  Showing top 8 cities by user count. Expand table below for
                  full list.
                </div>
              </div>

              {/* full city table */}
              <div className=" bg-[#0b0d12]/40 border border-white/10 rounded-xl p-4 shadow">
                <h3 className="text-sm text-[#9aa3b2] font-semibold mb-3">
                  All Cities — Age counts (male only)
                </h3>
                <div className="overflow-auto max-h-96">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="text-[#9aa3b2] text-xs uppercase">
                        <th className="p-2 text-left">City</th>
                        <th className="p-2 text-left">Total</th>
                        <th className="p-2 text-left">below-18</th>
                        <th className="p-2 text-left">18-20</th>
                        <th className="p-2 text-left">20-25</th>
                        <th className="p-2 text-left">25-30</th>
                        <th className="p-2 text-left">30-35</th>
                        <th className="p-2 text-left">above-35</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mergedAgeByCity.length > 0 ? (
                        mergedAgeByCity.map((c, i) => (
                          <tr
                            key={i}
                            className="hover:bg-white/5 text-[#e7e9ee]"
                          >
                            <td className="p-2">{c.city || "Unknown"}</td>
                            <td className="p-2">{c.total}</td>
                            <td className="p-2">{c.counts["below-18"] ?? 0}</td>
                            <td className="p-2">{c.counts["18-20"] ?? 0}</td>
                            <td className="p-2">{c.counts["20-25"] ?? 0}</td>
                            <td className="p-2">{c.counts["25-30"] ?? 0}</td>
                            <td className="p-2">{c.counts["30-35"] ?? 0}</td>
                            <td className="p-2">{c.counts["above-35"] ?? 0}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            className="p-2 text-center text-[#9aa3b2]"
                            colSpan={8}
                          >
                            No city data
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex-1 bg-[#0b0d12]/40 border border-white/10 rounded-xl p-4 shadow">
                <h3 className="text-sm text-[#9aa3b2] font-semibold mb-2">
                  Earnings & Commission Overview
                </h3>

                {earningLoading ? (
                  <div className="text-[#9aa3b2] text-sm mt-8 text-center">
                    Loading chart...
                  </div>
                ) : earningChartData ? (
                  <Bar
                    data={earningChartData}
                    options={earningChartOptions}
                    height={160}
                  />
                ) : (
                  <div className="text-red-400 text-sm mt-8 text-center">
                    {/* Failed to load data. */}
                  </div>
                )}
              </div>
              {/* Signups Table */}
              <div className="bg-[#0b0d12]/40 border border-white/10 rounded-xl p-4 shadow">
                <h3 className="text-sm text-[#9aa3b2] font-semibold mb-2">
                  New Signups
                </h3>
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="text-[#9aa3b2] text-xs uppercase">
                      <th className="p-2 text-left">User Id</th>
                      <th className="p-2 text-left">Location</th>
                      <th className="p-2 text-left">Device</th>
                      <th className="p-2 text-left">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {newSignUp.length !== 0 &&
                      newSignUp.map((s, i) => (
                        <tr key={i} className="hover:bg-white/5 text-[#e7e9ee]">
                          <td className="p-2">{s.userId}</td>
                          <td className="p-2">{s.location}</td>
                          <td className="p-2">{s.device}</td>
                          <td className="p-2">
                            <span
                              className={`px-2 py-1 rounded-full text-xs border ${
                                s.status === true
                                  ? "bg-green-500/10 text-green-300 border-green-500/30"
                                  : "bg-yellow-500/10 text-yellow-300 border-yellow-500/30"
                              }`}
                            >
                              {s.status ? "Active" : "Pending"}
                            </span>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Modals */}
            {activeModal && (
              <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
                <div className="bg-[#0b0d12] rounded-xl p-6 w-full max-w-md border border-white/10">
                  {/* Modal Content */}
                  {activeModal === "ban" && (
                    <>
                      <h3 className="text-lg font-semibold mb-3 text-[#e7e9ee]">
                        Suspend / Ban User
                      </h3>
                      <input
                        className="w-full bg-gray-800 border border-white/20 rounded-lg p-2 mb-2"
                        placeholder="User ID"
                      />
                      <select className="w-full bg-gray-800 border border-white/20 rounded-lg p-2 mb-2 text-[#e7e9ee]">
                        <option>Temporary (7 days)</option>
                        <option>30 days</option>
                        <option>Permanent</option>
                      </select>
                      <textarea
                        rows={4}
                        className="w-full bg-gray-800 border border-white/20 rounded-lg p-2 mb-2"
                        placeholder="Reason"
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setActiveModal(null)}
                          className="px-3 text-[#e7e9ee] py-2 rounded-lg text-sm font-semibold bg-transparent border border-white/20"
                        >
                          Cancel
                        </button>
                        <button className="px-3 py-2 rounded-lg text-sm font-semibold bg-purple-600 hover:bg-purple-700">
                          Confirm
                        </button>
                      </div>
                    </>
                  )}

                  {activeModal === "ticket" && (
                    <>
                      <h3 className="text-lg font-semibold mb-3 text-[#e7e9ee]">
                        Resolve Support Ticket
                      </h3>
                      <input
                        className="w-full bg-gray-800 border border-white/20 rounded-lg p-2 mb-2"
                        placeholder="Ticket ID"
                      />
                      <select className="w-full bg-gray-800 border border-white/20 rounded-lg p-2 mb-2 text-[#e7e9ee]">
                        <option>Resolved</option>
                        <option>Refunded</option>
                        <option>Escalated</option>
                      </select>
                      <textarea
                        rows={4}
                        className="w-full bg-gray-800 border border-white/20 rounded-lg p-2 mb-2"
                        placeholder="Resolution notes..."
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setActiveModal(null)}
                          className="px-3 py-2 rounded-lg text-sm font-semibold bg-transparent border border-white/20 text-[#e7e9ee]"
                        >
                          Cancel
                        </button>
                        <button className="px-3 py-2 rounded-lg text-sm font-semibold bg-purple-600 hover:bg-purple-700">
                          Update
                        </button>
                      </div>
                    </>
                  )}

                  {activeModal === "kyc" && (
                    <>
                      <h3 className="text-lg font-semibold mb-3 text-[#e7e9ee]">
                        Approve KYC
                      </h3>
                      <input
                        className="w-full bg-gray-800 border border-white/20 rounded-lg p-2 mb-2"
                        placeholder="User ID"
                      />
                      <select className="w-full bg-gray-800 border border-white/20 rounded-lg p-2 mb-2 text-[#e7e9ee]">
                        <option>Approve</option>
                        <option>Reject</option>
                      </select>
                      <textarea
                        rows={3}
                        className="w-full bg-gray-800 border border-white/20 rounded-lg p-2 mb-2"
                        placeholder="Notes (optional)"
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setActiveModal(null)}
                          className="px-3 py-2 rounded-lg text-sm font-semibold bg-transparent border border-white/20 text-[#e7e9ee]"
                        >
                          Cancel
                        </button>
                        <button className="px-3 py-2 rounded-lg text-sm font-semibold bg-purple-600 hover:bg-purple-700">
                          Submit
                        </button>
                      </div>
                    </>
                  )}

                  {activeModal === "wallet" && (
                    <>
                      <h3 className="text-lg font-semibold mb-3 text-[#e7e9ee]">
                        Credit / Debit Wallet
                      </h3>
                      <input
                        className="w-full bg-gray-800 border border-white/20 rounded-lg p-2 mb-2"
                        placeholder="User ID"
                      />
                      <select className="w-full bg-gray-800 border border-white/20 rounded-lg p-2 mb-2 text-[#e7e9ee]">
                        <option>Credit</option>
                        <option>Debit</option>
                      </select>
                      <input
                        className="w-full bg-gray-800 border border-white/20 rounded-lg p-2 mb-2"
                        placeholder="Amount (USD)"
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setActiveModal(null)}
                          className="px-3 py-2 rounded-lg text-sm font-semibold bg-transparent border border-white/20 text-[#e7e9ee]"
                        >
                          Cancel
                        </button>
                        <button className="px-3 py-2 rounded-lg text-sm font-semibold bg-purple-600 hover:bg-purple-700">
                          Apply
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </section>
      <ConfirmModal
        open={!!endCallUser}
        title={"End Call ?"}
        description={`Are you sure you want to end this call ? This action may not be irreversable.`}
        confirmText={`Yes, End`}
        cancelText="No"
        onCancel={() => setEndCallUser(null)}
        onConfirm={() => {
          endCall(endCallUser);
        }}
      />
    </>
  );
}
const StatCard = ({ title, value, symbol = "", green = false }) => (
  <div
    onClick={(e) => e.stopPropagation()}
    className="cursor-default rounded-xl border border-white/10 bg-[#161b26] p-3 hover:border-cyan-500 transition-all"
  >
    <p className="text-[10px] sm:text-xs text-gray-400 leading-4">{title}</p>

    <p
      className={`mt-2 text-base sm:text-lg lg:text-xl font-bold ${
        green ? "text-green-400" : "text-white"
      }`}
    >
      {symbol}

      <CountUp end={value || 0} duration={1.5} separator="," />
    </p>
  </div>
);
const format = (num) => num?.toLocaleString("en-IN") || "0";
