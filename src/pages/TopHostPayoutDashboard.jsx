import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import {
  Trophy,
  Coins,
  IndianRupee,
  BadgeCheck,
  ShieldX,
  User,
  Eye,
  RefreshCw,
  Search,
  Mail,
  CreditCard,
} from "lucide-react";
import { BaseUrl } from "../BaseUrl";

export default function TopHostPayoutDashboard() {
  const [hosts, setHosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState(new Date().getFullYear());
  const [search, setSearch] = useState("");

  const fetchHosts = async () => {
    try {
      setLoading(true);

      const res = await axios.get(
        `${BaseUrl.baseurl}/payout/host-above-20k?year=${year}`,
      );

      if (res.data.status) {
        setHosts(res.data.data || []);
      } else {
        toast.error("Unable to fetch host details");
      }
    } catch (e) {
      toast.error("Failed to load host details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHosts();
  }, [year]);

  const filteredHosts = useMemo(() => {
    return hosts.filter(
      (host) =>
        host.name?.toLowerCase().includes(search.toLowerCase()) ||
        host.email?.toLowerCase().includes(search.toLowerCase()) ||
        String(host.userId).includes(search),
    );
  }, [hosts, search]);

  const stats = useMemo(() => {
    return {
      totalRedeemed: filteredHosts.reduce(
        (a, b) => a + (b.totalRedeemed || 0),
        0,
      ),
      totalCoins: filteredHosts.reduce((a, b) => a + (b.totalCoins || 0), 0),
      panVerified: filteredHosts.filter((x) => x.panDetails?.panCardUrl).length,
    };
  }, [filteredHosts]);
  const currentYear = new Date().getFullYear();
  const years = [];

  for (let year = 2025; year <= currentYear; year++) {
    years.push(year);
  }
  return (
    <div className="min-h-screen bg-[#070B14] text-white p-4 md:p-8 w-full">
      <div className=" w-full">
        {/* HEADER */}
        <div className="rounded-3xl overflow-hidden border border-white/10 bg-gradient-to-br from-slate-900 via-[#0f172a] to-[#020617] p-8 mb-8 relative">
          <div className="absolute top-0 right-0 w-72 h-72 bg-purple-500/10 blur-[120px]" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-cyan-500/10 blur-[120px]" />

          <div className="relative z-10 flex flex-col lg:flex-row justify-between gap-5">
            <div>
              <h1 className="text-4xl font-black flex items-center gap-3">
                <Trophy className="text-yellow-400" size={38} />
                Top Host Earnings Dashboard
              </h1>

              <p className="text-slate-400 mt-2">
                Hosts with withdrawals above ₹20,000
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 ">
              <div className="relative">
                <Search
                  size={18}
                  className="absolute left-3 top-4 text-slate-500"
                />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search Host..."
                  className="bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-3 outline-none "
                />
              </div>

              <div>
                <select
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-indigo-500 "
                >
                  {years.map((yearOption) => (
                    <option key={yearOption} value={yearOption}>
                      {yearOption}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <button
                  onClick={fetchHosts}
                  className="bg-indigo-600 hover:bg-indigo-700 rounded-xl px-5 py-3 flex items-center gap-2"
                >
                  <RefreshCw size={18} />
                  Refresh
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-5 mb-8">
          <StatCard
            icon={<User />}
            title="Hosts"
            value={filteredHosts.length}
            color="from-blue-500 to-cyan-500"
          />

          <StatCard
            icon={<BadgeCheck />}
            title="PAN Verified"
            value={stats.panVerified}
            color="from-green-500 to-emerald-500"
          />

          <StatCard
            icon={<Coins />}
            title="Coins Earned"
            value={format(stats.totalCoins)}
            color="from-orange-500 to-yellow-500"
          />

          <StatCard
            icon={<IndianRupee />}
            title="Redeemed"
            value={`₹${stats.totalRedeemed.toLocaleString("en-IN")}`}
            color="from-purple-500 to-pink-500"
          />
        </div>

        {/* HOST CARDS */}
        {loading ? (
          <div className="text-center py-20 text-slate-400">
            Loading Host Details...
          </div>
        ) : (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredHosts.map((host, index) => (
              <div
                key={host.id}
                className="group relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900 via-slate-950 to-black p-6 hover:border-indigo-500/40 transition duration-500 hover:-translate-y-2"
              >
                <div className="absolute -right-20 -top-20 h-52 w-52 bg-indigo-500/10 blur-[120px]" />

                {/* Rank */}
                <div className="absolute top-5 right-5">
                  <div className="bg-yellow-500/15 border border-yellow-500/30 text-yellow-400 rounded-xl px-3 py-2 text-sm font-bold">
                    #{index + 1}
                  </div>
                </div>

                {/* Avatar */}
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center text-4xl font-black mb-5">
                  {host.name?.charAt(0).toUpperCase()}
                </div>

                <h2 className="text-2xl font-bold">{host.name}</h2>

                <div className="mt-2 text-slate-400 flex items-center gap-2">
                  <User size={15} />
                  User ID: {host.userId}
                </div>

                <div className="mt-2 text-slate-400 flex items-center gap-2 break-all">
                  <Mail size={15} />
                  {host.email}
                </div>

                {/* PAN STATUS */}
                <div className="mt-5">
                  {host.panDetails?.panCardUrl ? (
                    <span className="inline-flex items-center gap-2 rounded-full border border-green-500/30 bg-green-500/10 px-4 py-2 text-sm font-bold text-green-400">
                      <BadgeCheck size={16} />
                      PAN VERIFIED
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-bold text-red-400">
                      <ShieldX size={16} />
                      PAN NOT ADDED
                    </span>
                  )}
                </div>

                {/* STATS */}
                <div className="grid grid-cols-2 gap-4 mt-6">
                  <MiniCard
                    title="Coins"
                    value={format(host.totalCoins)}
                    color="text-cyan-400"
                  />

                  <MiniCard
                    title="Redeemed"
                    value={`₹${host.totalRedeemed?.toLocaleString("en-IN")}`}
                    color="text-green-400"
                  />

                  <MiniCard
                    title="Redeems"
                    value={host.redeemCount}
                    color="text-orange-400"
                  />

                  <MiniCard
                    title="PAN"
                    value={host.panDetails?.panNumber || "N/A"}
                    color="text-purple-400"
                  />
                </div>

                {/* VIEW PAN */}
                {host.panDetails?.panCardUrl && (
                  <button
                    onClick={() =>
                      window.open(
                        host.panDetails.panCardUrl?.startsWith("http")
                          ? host.panDetails.panCardUrl
                          : `https://${host.panDetails.panCardUrl}`,
                        "_blank",
                      )
                    }
                    className="w-full mt-6 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 py-3 font-bold flex items-center justify-center gap-2 hover:scale-[1.02] transition"
                  >
                    <Eye size={18} />
                    View PAN Card
                  </button>
                )}

                {!host.panDetails?.panCardUrl && (
                  <div className="mt-6 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-center text-red-400 text-sm">
                    No PAN card uploaded
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {!loading && filteredHosts.length === 0 && (
          <div className="text-center py-20 text-slate-500">No Hosts Found</div>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon, title, value, color }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-slate-900 p-5">
      <div
        className={`w-14 h-14 rounded-2xl bg-gradient-to-r ${color} flex items-center justify-center mb-4`}
      >
        {icon}
      </div>

      <div className="text-slate-400 text-sm">{title}</div>

      <div className="text-2xl font-black mt-2">{value}</div>
    </div>
  );
}

function MiniCard({ title, value, color }) {
  return (
    <div className="rounded-2xl bg-slate-800/50 border border-white/5 p-4">
      <div className="text-slate-500 text-xs">{title}</div>

      <div className={`font-bold text-lg mt-2 ${color}`}>{value}</div>
    </div>
  );
}
const format = (num) => num?.toLocaleString("en-IN") || "0";
