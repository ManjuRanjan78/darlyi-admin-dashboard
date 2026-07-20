import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { BaseUrl } from "../BaseUrl";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
const PAGE_SIZE = 20;

export default function RedeemDashboard() {
  const userDetails = JSON.parse(
    localStorage.getItem("LiveStreamAdminDetails"),
  );
  const navigate = useNavigate();
  const [type, setType] = useState("daily");
  const [redeems, setRedeems] = useState([]);
  const [summary, setSummary] = useState(null);
  const [wallet, setWallet] = useState(null);

  const [skip, setSkip] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  const [customDate, setCustomDate] = useState("");

  const loaderRef = useRef();
  const fetchingRef = useRef(false);
  useEffect(() => {
    resetAndFetch();
  }, [type]);

  const resetAndFetch = () => {
    setRedeems([]);
    setSkip(0);
    setHasMore(true);

    setTimeout(() => {
      fetchRedeems(0);
    }, 0);
  };

  const fetchRedeems = async (skipVal, dateOverride = null) => {
    if (fetchingRef.current) return;

    fetchingRef.current = true;
    setLoading(true);

    try {
      const params = {
        type,
        skip: skipVal,
      };

      if (type === "custom") {
        // const dateToUse = dateOverride || customDate;
        // if (!dateToUse) {
        //   fetchingRef.current = false;
        //   setLoading(false);
        //   return;
        // }

        params.fromDate = dateOverride;
        params.toDate = dateOverride;
      }

      const res = await axios.get(`${BaseUrl.baseurl}/admin/redeem-dashboard`, {
        params,
      });

      if (res.data.status) {
        if (skipVal === 0) setSummary(res.data.summary);

        const newData = res.data.data;

        setRedeems((prev) => [...prev, ...newData]);

        setSkip(skipVal + PAGE_SIZE);

        if (newData.length < PAGE_SIZE) setHasMore(false);
      }
    } catch (e) {
      console.log(e);
    }

    setLoading(false);
    fetchingRef.current = false;
  };
  const fetchWallet = async () => {
    const res = await axios.get(`${BaseUrl.baseurl}/admin/cahfree-balance`);
    if (res.data.status) {
      setWallet(res.data.wallet.data);
    }
  };

  useEffect(() => {
    fetchWallet();
  }, []);

  /* infinite scroll */
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          hasMore &&
          !loading &&
          !(type === "custom" && !customDate)
        ) {
          fetchRedeems(skip);
        }
      },
      { threshold: 1 },
    );

    const current = loaderRef.current;

    if (current) observer.observe(current);

    return () => {
      if (current) observer.unobserve(current);
    };
  }, [skip, hasMore, loading, type, customDate]);

  const statusBadge = (status) => {
    const styles = {
      pending: "bg-yellow-500/20 text-yellow-300",
      processing: "bg-blue-500/20 text-blue-300",
      paid: "bg-green-500/20 text-green-300",
      failed: "bg-red-500/20 text-red-300",
    };

    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-semibold ${styles[status]}`}
      >
        {status.toUpperCase()}
      </span>
    );
  };
  const [confirmPayout, setConfirmPayout] = useState(null);
  const [stopStatus, setStopStatus] = useState(false);
  const closeProfilePopup = () => {
    setConfirmPayout(null);
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
  function reInitiatePayout(userId, onClose) {
    axios
      .post(`${BaseUrl.baseurl}/payout/do-payout/${userId}`)
      .then((res) => {
        if (res.data.status) {
          toast.success(res.data.message);
          onClose();
          setConfirmPayout(null);
          window.location.reload();
        } else {
          toast.error(res.data.message);
        }
      })
      .catch((err) => {});
  }
  function stopPayout(userId, onClose) {
    axios
      .post(`${BaseUrl.baseurl}/payout/cancel-payout/${userId}`)
      .then((res) => {
        if (res.data.status) {
          toast.success(res.data.message);
          onClose();
          setConfirmPayout(null);
          window.location.reload();
        } else {
          toast.error(res.data.message);
        }
      })
      .catch((err) => {});
  }
  return (
    <>
      <div className="min-h-screen  text-white">
        {/* HEADER */}

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">💳 Redeem Dashboard</h2>
        </div>

        {/* WALLET */}

        {wallet && (
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div className="bg-[#11151f] p-6 rounded-xl border border-white/10">
              <p className="text-sm text-gray-400">Cashfree Wallet Balance</p>
              <p className="text-3xl font-bold mt-2">
                ₹ {format(parseFloat(wallet.balance))}
              </p>
            </div>

            <div className="bg-[#11151f] p-6 rounded-xl border border-white/10">
              <p className="text-sm text-gray-400">Available Balance</p>
              <p className="text-3xl font-bold mt-2">
                ₹ {format(parseFloat(wallet.availableBalance))}
              </p>
            </div>
          </div>
        )}

        {/* FILTERS */}

        <div className="flex gap-3 mb-6 flex-wrap">
          {["daily", "yesterday", "weekly", "monthly", "custom"].map((t) => (
            <button
              key={t}
              onClick={() => setType(t)}
              className={`px-4 py-2 rounded-lg text-sm capitalize ${
                type === t
                  ? "bg-indigo-600"
                  : "bg-[#11151f] border border-white/10"
              }`}
            >
              {t}
            </button>
          ))}

          {type === "custom" && (
            <input
              type="date"
              value={customDate}
              onChange={(e) => {
                const val = e.target.value;
                setCustomDate(val);

                if (val) {
                  setRedeems([]);
                  setSkip(0);
                  setHasMore(true);
                  fetchRedeems(0, val);
                }
              }}
              className="bg-[#11151f] border border-white/10 rounded-lg px-3"
            />
          )}
        </div>

        {/* SUMMARY */}

        {summary && (
          <div className="grid md:grid-cols-4 gap-4 mb-6">
            {Object.entries(summary).map(([key, val]) => (
              <div
                key={key}
                className="bg-[#11151f] border border-white/10 rounded-xl p-4"
              >
                <p className="text-sm text-gray-400 capitalize">{key}</p>
                <p className="text-xl ">
                  ₹ {format(parseFloat(val.amount.toFixed(2)))}
                </p>
                <p className="text-sm font-bold text-gray-400">{val.count}</p>
              </div>
            ))}
          </div>
        )}

        {/* TRANSACTIONS */}

        <div className="space-y-4">
          {redeems.map((item) => (
            <div
              key={item._id}
              className="bg-[#11151f] border border-white/10 rounded-xl p-4 hover:bg-[#1a1f33]"
            >
              <div className="flex justify-between items-center">
                <div
                  onClick={() => navigate(`/user-payout/${item?.userId?._id}`)}
                  className="cursor-pointer"
                >
                  <p className="font-semibold hover:text-rose-400">
                    {item.userId?.name}
                  </p>
                  <p className="text-xs text-gray-400">
                    ID: {item.userId?.userId} • {item.userId?.phone}
                  </p>
                </div>
                {(userDetails?.data?.role?.name === "Super Admin"||userDetails?.data?.role?.name === "Special Manager") && (
                  <>
                    {item.status === "failed" && (
                      // ||item.status === "pending"
                      <div>
                        <span
                          onClick={() => {
                            setConfirmPayout(item);
                            setStopStatus(false);
                          }}
                          className={`px-3 py-1 rounded-full text-xs font-semibold bg-violet-500/20 text-violet-300 cursor-pointer`}
                        >
                          Re-Initiate
                        </span>
                      </div>
                    )}
                    {item.status === "pending" && (
                      <div>
                        <span
                          onClick={() => {
                            setConfirmPayout(item);
                            setStopStatus(true);
                          }}
                          className={`px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/20 text-rose-300 cursor-pointer`}
                        >
                          Stop Payout
                        </span>
                      </div>
                    )}
                  </>
                )}
                {statusBadge(item.status)}
              </div>

              <div className="grid md:grid-cols-5 gap-4 mt-4 text-sm">
                <div>
                  <p className="text-gray-400">Coins</p>
                  <p>{format(item.coins)}</p>
                </div>

                <div>
                  <p className="text-gray-400">Amount</p>
                  <p>₹ {format(item.finalAmount)}</p>
                </div>

                <div>
                  <p className="text-gray-400">Payment</p>
                  <p>{item.paymentMethod}</p>
                </div>

                <div>
                  <p className="text-gray-400">Tax Amount</p>
                  <p className="truncate">₹ {item.taxAmount}</p>
                </div>
                <div>
                  <p className="text-gray-400">Transaction</p>
                  <p className="truncate">{item.transactionId}</p>
                </div>
              </div>

              <p className="text-xs text-gray-500 mt-3">
                {new Date(item.createdAt).toLocaleString("en-IN", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
                })}
              </p>
            </div>
          ))}

          {/* infinite loader */}

          {hasMore && (
            <div ref={loaderRef} className="text-center py-6">
              {loading && (
                <div className="animate-spin h-6 w-6 border-2 border-white border-t-transparent rounded-full mx-auto"></div>
              )}
            </div>
          )}
        </div>
      </div>
      <ConfirmModal
        open={!!confirmPayout}
        title={stopStatus ? "Stop Payout ?" : "Re Initiate Payout?"}
        description={`Are you sure you want to ${stopStatus ? "stop" : "re-initiate"} this payout? This action may not irreversible once money gone u cant get back.`}
        confirmText={stopStatus ? "Yes, Stop" : "Yes, Re-initiate"}
        cancelText="No"
        onCancel={() => setConfirmPayout(null)}
        onConfirm={() => {
          if (stopStatus) {
            stopPayout(confirmPayout._id, closeProfilePopup);
          } else {
            // reInitiatePayout(confirmPayout._id, closeProfilePopup);
          }
          setConfirmPayout(null);
        }}
      />
    </>
  );
}
const format = (num) => num?.toLocaleString("en-IN") || "0";
