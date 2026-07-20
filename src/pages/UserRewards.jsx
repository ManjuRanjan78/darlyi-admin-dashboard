// src/pages/UserRewards.jsx

import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { Coins, Calendar, Loader2 } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { BaseUrl } from "../BaseUrl";

export default function UserRewards() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  const loaderRef = useRef();

  const fetchRewards = async (pageNo) => {
    try {
      setLoading(true);

      const res = await axios.get(
        `${BaseUrl.baseurl}/user/user-rewards/${id}?page=${pageNo}&limit=10`,
      );

      const newData = res.data?.data || [];

      setData((prev) => [...prev, ...newData]);

      // ✅ Better condition
      if (newData.length === 0) {
        setHasMore(false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setData([]); // ✅ reset on id change
    setPage(1);
    setHasMore(true);
    fetchRewards(1);
  }, [id]);

  useEffect(() => {
    const current = loaderRef.current;
    if (!current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          console.log("hsmore", hasMore, loading);
          if (hasMore && !loading) {
            console.log("🔥 NEXT PAGE TRIGGERED:", page + 1);
            setPage((prev) => prev + 1);
          }
        }
      },
      {
        threshold: 0,
        rootMargin: "300px", // 🔥 very important
      },
    );

    observer.observe(current);

    return () => {
      if (current) observer.unobserve(current);
    };
  }, [hasMore, loading]);
  // ✅ FETCH ON PAGE CHANGE
  useEffect(() => {
    if (page === 1) return;
    fetchRewards(page);
  }, [page]);
  // useEffect(() => {
  //   if (data.length < 10 && hasMore && !loading) {
  //     setPage((prev) => prev + 1);
  //   }
  // }, [data]);
  return (
    <div className="min-h-[120vh]  bg-[#050816] text-white p-6 rounded-xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-black">User Rewards</h1>
        <div>
          <span
            onClick={() => navigate(-1)}
            className={`px-6 py-4 rounded-full text-sm font-semibold bg-rose-500/20 text-rose-300 cursor-pointer`}
          >
            Back
          </span>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {data.map((item) => (
          <div
            key={item._id}
            className="rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900 to-slate-950 p-5 shadow-xl hover:scale-[1.02] transition"
          >
            {/* Header */}
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs px-3 py-1 rounded-full bg-indigo-600/20 text-indigo-400 capitalize">
                {item.rewardType}
              </span>

              <span className="text-xs text-green-400 font-semibold">
                {item.status}
              </span>
            </div>

            {/* Coins */}
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-yellow-500/10">
                <Coins size={22} className="text-yellow-400" />
              </div>

              <div>
                <h2 className="text-xl font-bold">
                  {format(item.rewardCoins)}
                </h2>
                <p className="text-xs text-slate-400">Reward Coins</p>
              </div>
            </div>

            {/* Amount */}
            <div className="mt-4">
              <p className="text-slate-400 text-xs">Total Coins</p>
              <h3 className="text-lg font-semibold text-green-400">
                {format(item.totalAmount)}
              </h3>
            </div>

            {/* Date */}
            <div className="mt-4 flex items-center gap-2 text-xs text-slate-400">
              <Calendar size={14} />
              {new Date(item.periodStart).toDateString()}
            </div>
          </div>
        ))}
      </div>

      {/* Loader */}
      <div ref={loaderRef} className="flex justify-center mt-8">
        {loading && (
          <Loader2 className="animate-spin text-indigo-400" size={26} />
        )}

        {!hasMore && <p className="text-slate-500 text-sm">No more rewards</p>}
      </div>
      <div style={{ height: "80px" }} />
    </div>
  );
}
const format = (num) => num?.toLocaleString("en-IN") || "0";
