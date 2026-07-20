import React, { useEffect, useState } from "react";
import axios from "axios";
import { BaseUrl } from "../BaseUrl";
import toast from "react-hot-toast";

const PAGE_SIZES = [5, 10, 20];

export default function PricingDashboard() {
  /* ---------------- form state ---------------- */
  const [playStoreId, setPlayStoreId] = useState("");
  const [appStoreId, setAppStoreId] = useState("");
  const [price, setPrice] = useState("");
  const [offerPrice, setOfferPrice] = useState("");
  const [coins, setCoins] = useState("");
  const [currencyType, setCurrencyType] = useState("INR");

  const [sending, setSending] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  /* ---------------- table state ---------------- */
  const [pricing, setPricing] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZES[1]);
  const [loading, setLoading] = useState(false);
  const [editPricing, setEditPricing] = useState(null);
  const [isOffline, setIsOffline] = useState(false);
  /* ---------------- helpers ---------------- */
  const resetForm = () => {
    setPlayStoreId("");
    setAppStoreId("");
    setPrice("");
    setOfferPrice("");
    setCoins("");
    setCurrencyType("INR");
    setIsOffline(false);
  };

  const validate = () => {
    setErrorMsg("");
    if (!playStoreId || !appStoreId)
      return setErrorMsg("Store IDs are required.");
    if (!price || !offerPrice || !coins)
      return setErrorMsg("Price, Offer Price and Coins are required.");
    if (Number(offerPrice) > Number(price))
      return setErrorMsg("Offer price must be less than or equal to price.");
    return true;
  };

  /* ---------------- create pricing ---------------- */
  const handleCreate = async () => {
    if (!validate()) return;

    setSending(true);
    try {
      const body = {
        playStoreId,
        appStoreId,
        price: Number(price),
        offerPrice: Number(offerPrice),
        coins: Number(coins),
        currencyType,
        isOffline,
      };

      const res = await axios.post(
        `${BaseUrl.baseurl}/pricing/create-pricing`,
        body,
      );

      if (res.data.status) {
        toast.success("Pricing created successfully");
        resetForm();
        fetchPricing(1, pageSize);
        setPage(1);
      } else {
        setErrorMsg(res.data?.message || "Create failed");
      }
    } catch (err) {
      setErrorMsg(err?.response?.data?.message || "Network error");
    } finally {
      setSending(false);
    }
  };

  /* ---------------- fetch pricing ---------------- */
  const fetchPricing = async (p = page, size = pageSize) => {
    setLoading(true);
    try {
      const res = await axios.get(`${BaseUrl.baseurl}/pricing/get-all-pricing`);
      const list = res.data || [];

      setTotal(list.length);

      // frontend pagination
      const start = (p - 1) * size;
      const end = start + size;
      setPricing(list.slice(start, end));
    } catch (err) {
      console.error("Fetch pricing error", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPricing(page, pageSize);
  }, [page, pageSize]);

  /* ---------------- toggle active ---------------- */
  const toggleStatus = async (item) => {
    const nextStatus = !item.active;
    const ok = window.confirm(
      nextStatus ? "Activate this pricing?" : "Deactivate this pricing?",
    );
    if (!ok) return;

    try {
      const url = `${BaseUrl.baseurl}/pricing/active-deactive-pricing/${item._id}?status=${nextStatus}`;
      const res = await axios.put(url);

      if (res.data?.status) {
        toast.success(
          nextStatus ? "Activated successfully" : "Deactivated successfully",
        );

        setPricing((prev) =>
          prev.map((p) =>
            p._id === item._id ? { ...p, active: nextStatus } : p,
          ),
        );
      } else {
        toast.error("Status change failed");
      }
    } catch (err) {
      toast.error("Network error");
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  /* ================================================= */
  const handleUpdatePricing = async () => {
    if (!editPricing) return;

    if (Number(editPricing.offerPrice) > Number(editPricing.price)) {
      toast.error("Offer price cannot be greater than price");
      return;
    }

    try {
      const res = await axios.put(
        `${BaseUrl.baseurl}/pricing/update-pricing/${editPricing._id}`,
        {
          price: Number(editPricing.price),
          offerPrice: Number(editPricing.offerPrice),
          weekend: editPricing.weekend,
        },
      );

      if (res.data) {
        toast.success("Pricing updated");

        // update UI instantly
        setPricing((prev) =>
          prev.map((p) =>
            p._id === editPricing._id
              ? {
                  ...p,
                  price: editPricing.price,
                  offerPrice: editPricing.offerPrice,
                  weekend: editPricing.weekend,
                }
              : p,
          ),
        );

        setEditPricing(null);
      } else {
        toast.error("Update failed");
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Update error");
    }
  };

  return (
    <section className="block">
      <h2 className="text-xl font-bold text-[#e7e9ee] mb-4">
        💳 Pricing Manager
      </h2>

      {/* ---------------- CREATE FORM ---------------- */}
      <div className="bg-[radial-gradient(1200px_800px_at_10%_-10%,#1a1f33_0%,#0b0d12_60%)] border border-white/10 rounded-xl p-6 shadow mb-6">
        <h3 className="text-lg font-semibold text-[#e7e9ee] mb-4">
          Create Pricing
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <input
            value={playStoreId}
            onChange={(e) => setPlayStoreId(e.target.value)}
            placeholder="Play Store ID"
            className="bg-[#0f1117] border border-white/10 p-2 rounded text-[#e7e9ee]"
          />

          <input
            value={appStoreId}
            onChange={(e) => setAppStoreId(e.target.value)}
            placeholder="App Store ID"
            className="bg-[#0f1117] border border-white/10 p-2 rounded text-[#e7e9ee]"
          />

          <select
            value={currencyType}
            onChange={(e) => setCurrencyType(e.target.value)}
            className="bg-[#0f1117] border border-white/10 p-2 rounded text-[#e7e9ee]"
          >
            <option value="INR">INR</option>
            <option value="USD">USD</option>
          </select>

          <input
            type="number"
            onWheel={(e) => e.currentTarget.blur()}
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="Price"
            className="bg-[#0f1117] border border-white/10 p-2 rounded text-[#e7e9ee]"
          />

          <input
            type="number"
            onWheel={(e) => e.currentTarget.blur()}
            value={offerPrice}
            onChange={(e) => setOfferPrice(e.target.value)}
            placeholder="Offer Price"
            className="bg-[#0f1117] border border-white/10 p-2 rounded text-[#e7e9ee]"
          />

          <input
            type="number"
            onWheel={(e) => e.currentTarget.blur()}
            value={coins}
            onChange={(e) => setCoins(e.target.value)}
            placeholder="Coins"
            className="bg-[#0f1117] border border-white/10 p-2 rounded text-[#e7e9ee]"
          />
          <div className="flex items-center justify-between bg-[#0f1117] border border-white/10 rounded-lg px-4 py-3">
            <div>
              <p className="text-sm font-medium text-white">Trade Account</p>
              <p className="text-xs text-[#9aa3b2]">
                Enable if this pricing is for offline/manual payment
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsOffline((prev) => !prev)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                isOffline ? "bg-green-500" : "bg-slate-600"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                  isOffline ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </div>

        {errorMsg && <div className="text-red-400 mt-3">{errorMsg}</div>}

        <button
          onClick={handleCreate}
          disabled={sending}
          className={`mt-5 px-6 py-2 rounded-lg font-semibold ${
            sending
              ? "bg-slate-700 text-slate-400"
              : "bg-emerald-600 hover:bg-emerald-700 text-white"
          }`}
        >
          {sending ? "Creating..." : "Create Pricing"}
        </button>
      </div>

      {/* ---------------- TABLE ---------------- */}
      <div className="bg-[#0b0d12]/40 border border-white/10 rounded-xl p-4 shadow">
        <h3 className="text-sm text-[#9aa3b2] font-semibold mb-3">
          Pricing List
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="text-[#9aa3b2] text-xs uppercase">
                <th className="p-2 text-left">PlayStore ID</th>
                <th className="p-2 text-left">AppStore ID</th>
                <th className="p-2 text-left">Currency</th>
                <th className="p-2 text-left">Price</th>
                <th className="p-2 text-left">Offer</th>
                <th className="p-2 text-left">Coins</th>
                <th className="p-2 text-left">Mode </th>
                <th className="p-2 text-left">Weekend Offer </th>
                <th className="p-2 text-left">Status</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-4 text-center text-[#9aa3b2]">
                    Loading...
                  </td>
                </tr>
              ) : pricing.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-4 text-center text-[#9aa3b2]">
                    No pricing found
                  </td>
                </tr>
              ) : (
                pricing.map((p) => (
                  <tr key={p._id} className="hover:bg-white/5 text-[#e7e9ee]">
                    <td className="p-2">{p.playStoreId}</td>
                    <td className="p-2">{p.appStoreId}</td>
                    <td className="p-2">{p.currencyType}</td>
                    <td className="p-2">
                      {p.currencyType === "USD" ? "$" : "₹"}
                      {format(p.price)}
                    </td>
                    <td className="p-2">
                      {p.currencyType === "USD" ? "$" : "₹"}
                      {format(p.offerPrice)}
                    </td>
                    <td className="p-2">{format(p.coins)}</td>
                    <td className="p-3">
                      {p.isOffline ? (
                        <span className="px-3 py-1 text-xs font-semibold rounded-full bg-orange-500/20 text-orange-300 border border-orange-500/30">
                          Offline
                        </span>
                      ) : (
                        <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-500/20 text-green-300 border border-green-500/30">
                          Online
                        </span>
                      )}
                    </td>
                    <td className="p-3">
                      {!p.weekend ? (
                        <span className="px-3 py-1 text-xs font-semibold rounded-full bg-red-500/20 text-red-300 border border-red-500/30">
                          Inactive
                        </span>
                      ) : (
                        <span className="px-3 py-1 text-xs font-semibold rounded-full bg-lime-500/20 text-lime-300 border border-lime-500/30">
                          Active
                        </span>
                      )}
                    </td>
                    <td className="p-2">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-3">
                          <span
                            className={`text-xs font-semibold ${
                              p.active ? "text-green-400" : "text-red-400"
                            }`}
                          >
                            {p.active ? "Active" : "Inactive"}
                          </span>

                          <button
                            onClick={() => toggleStatus(p)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                              p.active ? "bg-green-600" : "bg-slate-600"
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                                p.active ? "translate-x-6" : "translate-x-1"
                              }`}
                            />
                          </button>
                        </div>
                        <button
                          onClick={() =>
                            setEditPricing({
                              _id: p._id,
                              price: p.price,
                              offerPrice: p.offerPrice,
                              weekend: p.weekend,
                            })
                          }
                          className="px-3 py-1 text-xs rounded bg-indigo-600 hover:bg-indigo-700 text-white"
                        >
                          Update
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ---------------- PAGINATION ---------------- */}
        <div className="flex flex-col sm:flex-row items-center justify-between mt-4 gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="px-3 py-1 border border-white/10 rounded text-[#9aa3b2]"
            >
              Prev
            </button>

            <span className="text-xs text-[#9aa3b2]">
              Page {page} of {totalPages}
            </span>

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="px-3 py-1 border border-white/10 rounded text-[#9aa3b2]"
            >
              Next
            </button>
          </div>

          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPage(1);
            }}
            className="bg-[#0f1117] border border-white/10 text-[#e7e9ee] rounded px-2 py-1 text-sm"
          >
            {PAGE_SIZES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>
      {editPricing && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-[#0b0d12] p-6 rounded-xl border border-white/10 w-full max-w-sm">
            <h3 className="text-lg text-[#e7e9ee] mb-4">Update Pricing</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-[#9aa3b2] mb-1">
                  Price
                </label>
                <input
                  type="number"
                  value={editPricing.price}
                  onChange={(e) =>
                    setEditPricing({
                      ...editPricing,
                      price: e.target.value,
                    })
                  }
                  className="w-full bg-[#0f1117] border border-white/10 p-2 rounded text-[#e7e9ee]"
                />
              </div>

              <div>
                <label className="block text-sm text-[#9aa3b2] mb-1">
                  Offer Price
                </label>
                <input
                  type="number"
                  value={editPricing.offerPrice}
                  onChange={(e) =>
                    setEditPricing({
                      ...editPricing,
                      offerPrice: e.target.value,
                    })
                  }
                  className="w-full bg-[#0f1117] border border-white/10 p-2 rounded text-[#e7e9ee]"
                />
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`text-xs font-semibold ${
                    editPricing.weekend ? "text-green-400" : "text-red-400"
                  }`}
                >
                  Weekend {editPricing.weekend ? "Active" : "Inactive"}
                </span>

                <button
                  onClick={(e) => {
                    setEditPricing({
                      ...editPricing,
                      weekend: !editPricing.weekend,
                    });
                  }}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                    editPricing.weekend ? "bg-green-600" : "bg-slate-600"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                      editPricing.weekend ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setEditPricing(null)}
                className="px-4 py-2 border border-white/10 rounded text-[#e7e9ee]"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdatePricing}
                className="px-4 py-2 rounded bg-sky-600 hover:bg-sky-700 text-white"
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
const format = (num) => num?.toLocaleString("en-IN") || "0";
