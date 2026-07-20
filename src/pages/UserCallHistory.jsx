// src/pages/UserCallHistory.jsx

import { useEffect, useState } from "react";
import axios from "axios";
import {
  Phone,
  Video,
  Clock3,
  ChevronLeft,
  ChevronRight,
  PhoneIncoming,
  PhoneOutgoing,
  PhoneOff,
  XCircle,
  Gift,
  Loader2,
} from "lucide-react";
import toast from "react-hot-toast";

import { useParams, useNavigate } from "react-router-dom";
import { BaseUrl } from "../BaseUrl";

export default function UserCallHistory() {
  const userDetails = JSON.parse(
    localStorage.getItem("LiveStreamAdminDetails"),
  );
  const navigate = useNavigate();
  const { id, type } = useParams();
  const [addingCoins, setAddingCoins] = useState(null);
  const [calls, setCalls] = useState([]);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const limit = 20;

  const fetchCallHistory = async (pageNo = 1) => {
    try {
      setLoading(true);

      const res = await axios.get(
        `${BaseUrl.baseurl}/user/get-user-call-history/${id}?page=${pageNo}&limit=${limit}`,
      );

      setCalls(res.data?.data || []);
      setHasMore(res.data?.pagination?.hasMore || false);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCallHistory(page);
  }, [page]);

  const formatDuration = (sec) => {
    if (!sec) return "0s";

    const mins = Math.floor(sec / 60);
    const seconds = sec % 60;

    if (mins === 0) return `${seconds}s`;

    return `${mins}m ${seconds}s`;
  };

  const getOtherUser = (call) => {
    if (call.callerId?._id === id) {
      return call.receiverId;
    }

    return call.callerId;
  };

  const getCallDirection = (call) => {
    return call.callerId?._id === id ? "Outgoing" : "Incoming";
  };
  const [selectedCall, setSelectedCall] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const handleAddCoins = async (call) => {
    try {
      setAddingCoins(call._id);

      const hostUser =
        call.callerId?._id === id ? call.callerId : call.receiverId;

      const guestUser =
        call.callerId?._id === id ? call.receiverId : call.callerId;

      const payload = {
        fromUserId: hostUser.userId,
        toUserId: guestUser.userId,
        count: 1,
        callId: call._id,
        video: call.callType === "video" ? true : false,
      };

      const res = await axios.put(
        `${BaseUrl.baseurl}/admin/add-earnings-coins`,
        payload,
      );

      if (res.data?.status) {
        toast.success("Coins added successfully");

        setCalls((prev) =>
          prev.map((item) =>
            item._id === call._id
              ? {
                  ...item,
                  coinsEarned:
                    (item.coinsEarned || 0) +
                    (item.callType === "video" ? 60 : 25),
                }
              : item,
          ),
        );
      } else {
        toast.error(res.data?.message || "Failed to add coins");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to add coins");
    } finally {
      setAddingCoins(null);
    }
  };
  const confirmAddCoins = async () => {
    if (!selectedCall) return;

    setShowConfirmModal(false);

    await handleAddCoins(selectedCall);

    setSelectedCall(null);
  };
  return (
    <>
      <div className="min-h-screen bg-[#050816] text-white p-6">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <span
              onClick={() => navigate(-1)}
              className={`px-8 py-4 rounded-full text-md font-semibold bg-fuchsia-500/20 text-fuchsia-300 cursor-pointer`}
            >
              Back
            </span>
          </div>
          <div>
            <h1 className="text-4xl font-black tracking-tight">
              User Call History
            </h1>

            <p className="text-slate-400 mt-2">
              Complete call activity and interaction logs
            </p>
          </div>

          {/* PAGE INFO */}
          <div className="flex items-center gap-3">
            <button
              disabled={page === 1}
              onClick={() => setPage((prev) => prev - 1)}
              className="w-11 h-11 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 disabled:opacity-40"
            >
              <ChevronLeft size={18} />
            </button>

            <div className="px-5 h-11 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 flex items-center justify-center font-bold">
              Page {page}
            </div>

            <button
              disabled={!hasMore}
              onClick={() => setPage((prev) => prev + 1)}
              className="w-11 h-11 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 disabled:opacity-40"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* LOADING */}
        {loading ? (
          <div className="flex justify-center items-center h-[500px]">
            <div className="w-14 h-14 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : calls.length === 0 ? (
          <div className="h-[400px] flex items-center justify-center text-slate-500 text-xl">
            No call history found
          </div>
        ) : (
          <div className="space-y-5">
            {calls.map((call) => {
              const otherUser = getOtherUser(call);

              const incoming = getCallDirection(call) === "Incoming";

              const isVideo = call.callType === "video";
              if (
                call.callerId.userId === 56 ||
                call.receiverId.userId === 56
              ) {
                return null;
              }
              return (
                <div
                  key={call._id}
                  className="group rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900 via-[#0f172a] to-black p-5 hover:border-indigo-500/40 transition-all duration-300 shadow-2xl"
                >
                  <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-5">
                    {/* LEFT */}
                    <div className="flex items-center gap-4">
                      {/* PROFILE */}
                      <div className="relative">
                        <img
                          referrerPolicy="no-referrer"
                          src={
                            otherUser?.photos?.[0]?.url ||
                            "https://ui-avatars.com/api/?name=User"
                          }
                          alt=""
                          className="w-20 h-20 rounded-3xl object-cover border border-white/10"
                        />

                        <div
                          className={`absolute -bottom-1 -right-1 w-8 h-8 rounded-xl flex items-center justify-center shadow-lg ${
                            isVideo ? "bg-violet-600" : "bg-green-600"
                          }`}
                        >
                          {isVideo ? <Video size={15} /> : <Phone size={15} />}
                        </div>
                      </div>

                      {/* USER DETAILS */}
                      <div>
                        <h2 className="text-2xl font-bold">
                          {otherUser?.name || "Unknown User"}
                        </h2>

                        <div className="flex flex-wrap gap-2 mt-2">
                          <span className="px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs">
                            ID: {otherUser?.userId || "-"}
                          </span>

                          <span
                            className={`px-3 py-1 rounded-full bg-emerald-500/10 border ${call.callType === "video" ? "border-orange-500/20 text-orange-300" : "border-rose-500/20 text-rose-300"}  text-xs capitalize`}
                          >
                            {call.callType || "audio"}
                          </span>

                          <span
                            className={`px-3 py-1 rounded-full text-xs border ${
                              call.status === "ended"
                                ? "bg-green-500/10 border-green-500/20 text-green-300"
                                : call.status === "rejected"
                                  ? "bg-red-500/10 border-red-500/20 text-red-300"
                                  : "bg-fuchsia-500/10 border-fuchsia-500/20 text-fuchsia-300"
                            }`}
                          >
                            {call.status || "unknown"}
                          </span>
                        </div>

                        {/* DIRECTION */}
                        <div className="flex items-center gap-2 mt-4">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                              incoming
                                ? "bg-blue-500/20 text-blue-400"
                                : "bg-orange-500/20 text-orange-400"
                            }`}
                          >
                            {incoming ? (
                              <PhoneIncoming size={18} />
                            ) : (
                              <PhoneOutgoing size={18} />
                            )}
                          </div>

                          <div>
                            <p className="text-sm font-semibold">
                              {incoming ? "Incoming Call" : "Outgoing Call"}
                            </p>

                            <p className="text-xs text-slate-400">
                              {new Date(call.createdAt).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* RIGHT */}
                    <div className="flex flex-wrap gap-4">
                      {/* DURATION */}
                      <div className="min-w-[170px] rounded-2xl bg-white/5 border border-white/10 p-4">
                        <div className="flex items-center gap-2 text-slate-400 text-sm mb-2">
                          <Clock3 size={15} />
                          Duration
                        </div>

                        <h3 className="text-2xl font-black">
                          {formatDuration(call.duration || 0)}
                        </h3>
                      </div>

                      {/* COINS */}
                      <div className="min-w-[170px] rounded-2xl bg-white/5 border border-white/10 p-4">
                        <div className="flex items-center gap-2 text-slate-400 text-sm mb-2">
                          💰 Coins Spent
                        </div>

                        <h3 className="text-2xl font-black text-rose-400">
                          {call.coinsSpent || 0}
                        </h3>
                      </div>
                      <div className="min-w-[220px] rounded-2xl bg-gradient-to-br from-yellow-500/10 via-amber-500/10 to-orange-500/10 border border-yellow-500/20 p-4">
                        <div className="flex items-center justify-between mb-2 gap-2">
                          <span className="text-slate-400 text-sm">
                            💰 Coins Earned
                          </span>

                          {userDetails?.data?.role?.name === "Super Admin" &&
                            type === "female" && (
                              <button
                                onClick={() => {
                                  setSelectedCall(call);
                                  setShowConfirmModal(true);
                                }}
                                disabled={addingCoins === call._id}
                                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 hover:scale-105 transition-all text-white text-xs font-bold shadow-lg disabled:opacity-50"
                              >
                                {addingCoins === call._id ? (
                                  <>
                                    <Loader2
                                      size={14}
                                      className="animate-spin"
                                    />
                                    Adding...
                                  </>
                                ) : (
                                  <>
                                    <Gift size={14} />
                                    Add Coins
                                  </>
                                )}
                              </button>
                            )}
                        </div>

                        <h3 className="text-3xl font-black text-yellow-400">
                          {call.coinsEarned || 0}
                        </h3>

                        <p className="text-xs text-slate-500 mt-1">
                          Manual earnings credit
                        </p>
                      </div>

                      {/* STATUS */}
                      <div className="min-w-[170px] rounded-2xl bg-white/5 border border-white/10 p-4">
                        <div className="flex items-center gap-2 text-slate-400 text-sm mb-2">
                          <XCircle size={15} />
                          Result
                        </div>

                        <h3
                          className={`text-xl font-black capitalize ${
                            call.status === "ended"
                              ? "text-green-400"
                              : call.status === "rejected"
                                ? "text-red-400"
                                : "text-fuchsia-400"
                          }`}
                        >
                          {call.status || "unknown"}
                        </h3>
                        {call.status !== "connected" && (
                          <h4 className="flex gap-2 items-center text-rose-800 font-bold">
                            <PhoneOff size={18} />
                            {call?.endId?.name.slice(0, 12)}
                            {call?.endId?.name?.length > 12 && "..."}
                          </h4>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* PAGINATION */}
            <div className="flex justify-center items-center gap-4 pt-8">
              <button
                disabled={page === 1}
                onClick={() => setPage((prev) => prev - 1)}
                className="h-12 px-5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 disabled:opacity-40 flex items-center gap-2"
              >
                <ChevronLeft size={18} />
                Previous
              </button>

              <div className="h-12 px-6 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 flex items-center justify-center font-bold shadow-lg shadow-indigo-500/20">
                {page}
              </div>

              <button
                disabled={!hasMore}
                onClick={() => setPage((prev) => prev + 1)}
                className="h-12 px-5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 disabled:opacity-40 flex items-center gap-2"
              >
                Next
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#0f172a] p-6 shadow-2xl">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-yellow-500/20 flex items-center justify-center">
                💰
              </div>
            </div>

            <h2 className="text-2xl font-bold text-center text-white">
              Add Coins?
            </h2>

            <p className="text-center text-slate-400 mt-3">
              Are you sure you want to add earnings coins for this call?
            </p>

            <div className="mt-6 rounded-2xl bg-white/5 p-4 border border-white/10">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Call ID</span>
                <span className="text-white font-semibold">
                  {selectedCall?._id?.slice(-8)}
                </span>
              </div>

              <div className="flex justify-between text-sm mt-2">
                <span className="text-slate-400">Current Earned</span>
                <span className="text-yellow-400 font-bold">
                  {selectedCall?.coinsEarned || 0}
                </span>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowConfirmModal(false);
                  setSelectedCall(null);
                }}
                className="flex-1 h-12 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition"
              >
                No
              </button>

              <button
                onClick={confirmAddCoins}
                className="flex-1 h-12 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 font-bold hover:scale-105 transition"
              >
                Yes, Add Coins
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
