import React, { useEffect, useState } from "react";
import axios from "axios";
import { BaseUrl } from "../BaseUrl";
import toast from "react-hot-toast";

const PAGE_SIZES = [5, 10, 20];

export default function GiftsDashboard() {
  /* -------------------- form state -------------------- */
  const [name, setName] = useState("");
  const [category, setCategory] = useState("silver");
  const [coins, setCoins] = useState("");
  const [coinsError, setCoinsError] = useState("");
  const [startMonth, setStartMonth] = useState("");
  const [startDay, setStartDay] = useState("");
  const [endMonth, setEndMonth] = useState("");
  const [endDay, setEndDay] = useState("");
  const [active, setActive] = useState(true);

  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const [sending, setSending] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  /* -------------------- table state -------------------- */
  const [gifts, setGifts] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZES[1]);
  const [loading, setLoading] = useState(false);

  /* -------------------- edit modal -------------------- */

  /* -------------------- image preview -------------------- */
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;

  const paginatedGifts = gifts.slice(startIndex, endIndex);
  useEffect(() => {
    if (!imageFile) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(imageFile);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [imageFile]);

  /* -------------------- image validation -------------------- */
  const validateImage300 = (file) =>
    new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);

      img.onload = () => {
        if (img.width === 120 && img.height === 120) resolve(true);
        else reject(new Error("Image must be exactly 120×120 px"));
        URL.revokeObjectURL(url);
      };
      img.onerror = () => {
        reject(new Error("Invalid image file"));
        URL.revokeObjectURL(url);
      };
      img.src = url;
    });

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      await validateImage300(file);
      setImageFile(file);
      setErrorMsg("");
    } catch (err) {
      setImageFile(null);
      setErrorMsg(err.message);
    }
  };

  /* -------------------- create gift -------------------- */
  const handleCreate = async () => {
    setErrorMsg("");
    setSuccessMsg("");

    if (!name || !coins || !imageFile) {
      setErrorMsg("Name, coins and image are required.");
      return;
    }

    setSending(true);
    try {
      const form = new FormData();
      form.append("name", name);
      form.append("category", category);
      form.append("coins", coins);
      form.append("active", active);
      form.append("startMonth", parseInt(startMonth));
      form.append("startDay", parseInt(startDay));
      form.append("endMonth", parseInt(endMonth));
      form.append("endDay", parseInt(endDay));
      form.append("image", imageFile);

      const res = await axios.post(
        `${BaseUrl.baseurl}/gift/create-gift`,
        form,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      if (res.data?.status) {
        toast.success("Gift created successfully!");
        resetForm();
        fetchGifts();
        setPage(1);
      } else {
        setErrorMsg(res.data?.message || "Failed to create gift");
      }
    } catch (err) {
      setErrorMsg(err?.response?.data?.message || "Create failed");
    } finally {
      setSending(false);
    }
  };

  const resetForm = () => {
    setName("");
    setCoins("");
    setImageFile(null);
    setPreviewUrl(null);
    setStartMonth("");
    setStartDay("");
    setEndMonth("");
    setEndDay("");
    setActive(true);
  };

  /* -------------------- fetch gifts -------------------- */
  const fetchGifts = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${BaseUrl.baseurl}/gift/get-all-gifts`);

      const all = res.data?.data || [];
      setGifts(all);
      setTotal(all.length);
    } catch (err) {
      console.error("Fetch gifts error", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGifts();
  }, []);

  /* -------------------- delete -------------------- */

  /* -------------------- update -------------------- */

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  /* ===================================================== */
  const toggleGiftStatus = async (gift) => {
    const willActivate = !gift.active;

    const confirmMsg = willActivate
      ? `Activate "${gift.name}"?`
      : `Deactivate "${gift.name}"?`;

    if (!window.confirm(confirmMsg)) return;

    try {
      const url = willActivate
        ? `${BaseUrl.baseurl}/gift/activate-gift/${gift._id}`
        : `${BaseUrl.baseurl}/gift/deactivate-gift/${gift._id}`;

      const res = await axios.put(url);

      if (res.data?.success || res.data?.status) {
        toast.success(willActivate ? "Gift activated" : "Gift deactivated");

        // update UI locally (no refetch needed)
        setGifts((prev) =>
          prev.map((g) =>
            g._id === gift._id ? { ...g, active: willActivate } : g
          )
        );
      } else {
        toast.error("Failed to update status");
      }
    } catch (err) {
      console.error("Toggle gift error:", err);
      toast.error("Status change failed");
    }
  };

  return (
    <section className="block">
      <h2 className="text-xl font-bold text-[#e7e9ee] mb-4">
        🎁 Gifts Manager
      </h2>

      {/* ---------------- CREATE FORM ---------------- */}
      <div className="bg-[radial-gradient(1200px_800px_at_10%_-10%,#1a1f33_0%,#0b0d12_60%)] border border-white/10 rounded-xl p-6 shadow mb-6">
        <h3 className="text-lg font-semibold text-[#e7e9ee] mb-4">
          Create New Gift
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Gift Name"
            className="bg-[#0f1117] border border-white/10 p-2 rounded text-[#e7e9ee]"
          />

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="bg-[#0f1117] border border-white/10 p-2 rounded text-[#e7e9ee]"
          >
            <option value="silver">Silver</option>
            <option value="gold">Gold</option>
            <option value="platinum">Platinum</option>
            <option value="diamond">Diamond</option>
          </select>

          <input
            type="number"
            onWheel={(e) => e.currentTarget.blur()}
            value={coins}
            onChange={(e) => setCoins(e.target.value)}
            placeholder="Coins"
            className="bg-[#0f1117] border border-white/10 p-2 rounded text-[#e7e9ee]"
          />

          <div className="flex items-center gap-2 text-[#e7e9ee] text-sm">
            <input
              type="checkbox"
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
            />
            Active
          </div>

          <input
            type="number"
            onWheel={(e) => e.currentTarget.blur()}
            placeholder="Start Month"
            value={startMonth}
            onChange={(e) => setStartMonth(e.target.value)}
            className="bg-[#0f1117] border border-white/10 p-2 rounded text-[#e7e9ee]"
          />
          <input
            type="number"
            onWheel={(e) => e.currentTarget.blur()}
            placeholder="Start Day"
            value={startDay}
            onChange={(e) => setStartDay(e.target.value)}
            className="bg-[#0f1117] border border-white/10 p-2 rounded text-[#e7e9ee]"
          />
          <input
            type="number"
            onWheel={(e) => e.currentTarget.blur()}
            placeholder="End Month"
            value={endMonth}
            onChange={(e) => setEndMonth(e.target.value)}
            className="bg-[#0f1117] border border-white/10 p-2 rounded text-[#e7e9ee]"
          />
          <input
            type="number"
            onWheel={(e) => e.currentTarget.blur()}
            placeholder="End Day"
            value={endDay}
            onChange={(e) => setEndDay(e.target.value)}
            className="bg-[#0f1117] border border-white/10 p-2 rounded text-[#e7e9ee]"
          />

          <div>
            <input type="file" accept="image/*" onChange={handleFileChange} />
            <p className="text-xs text-[#9aa3b2]">
              Image must be exactly 120×120 px
            </p>
          </div>

          {previewUrl && (
            <img
              src={previewUrl}
              alt="preview"
              className="h-24 w-24 rounded border border-white/10"
            />
          )}
        </div>

        {errorMsg && <div className="text-red-400 mt-3">{errorMsg}</div>}
        {successMsg && <div className="text-green-400 mt-3">{successMsg}</div>}

        <button
          onClick={handleCreate}
          disabled={sending}
          className={`mt-4 px-6 py-2 rounded-lg font-semibold ${
            sending
              ? "bg-slate-700 text-slate-400"
              : "bg-sky-600 hover:bg-sky-700 text-white"
          }`}
        >
          {sending ? "Creating..." : "Create Gift"}
        </button>
      </div>

      {/* ---------------- TABLE ---------------- */}
      <div className="bg-[#0b0d12]/40 border border-white/10 rounded-xl p-4 shadow">
        <h3 className="text-sm text-[#9aa3b2] font-semibold mb-3">
          Gifts List
        </h3>

        <div className="overflow-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="text-[#9aa3b2] text-xs uppercase">
                <th className="p-2 text-left">Image</th>
                <th className="p-2 text-left">Name</th>
                <th className="p-2 text-left">Category</th>
                <th className="p-2 text-left">Coins</th>
                <th className="p-2 text-left">Active</th>
                <th className="p-2 text-left">Range (DD/MM)</th>
                <th className="p-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-4 text-center text-[#9aa3b2]">
                    Loading...
                  </td>
                </tr>
              ) : gifts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-4 text-center text-[#9aa3b2]">
                    No gifts
                  </td>
                </tr>
              ) : (
                paginatedGifts.map((g) => (
                  <tr key={g._id} className="hover:bg-white/5 text-[#e7e9ee]">
                    <td className="p-2">
                      <img
                        src={g.imageUrl}
                        alt={g.name}
                        className="h-10 w-10 rounded border border-white/10"
                      />
                    </td>
                    <td className="p-2">{g.name}</td>
                    <td className="p-2 capitalize">{g.category}</td>
                    <td className="p-2">{g.coins}</td>
                    <td className="p-2">{g.active ? "Active" : "Inactive"}</td>
                    <td className="p-2 text-xs">
                      {g.startDay}/{g.startMonth} → {g.endDay}/{g.endMonth}
                    </td> 
                    <td className="p-2">
                      <div className="flex items-center gap-3">
                        {/* status text */}
                        <span
                          className={`text-xs font-semibold ${
                            g.active ? "text-green-400" : "text-red-400"
                          }`}
                        >
                          {g.active ? "Active" : "Inactive"}
                        </span> 

                        {/* toggle switch */}
                        <button
                          onClick={() => toggleGiftStatus(g)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                            g.active ? "bg-green-600" : "bg-slate-600"
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                              g.active ? "translate-x-6" : "translate-x-1"
                            }`}
                          />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* pagination */}
        <div className="flex items-center justify-between mt-4">
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="px-3 py-1 border border-white/10 rounded text-[#9aa3b2]"
            >
              Prev
            </button>
            <span className="text-xs text-[#9aa3b2] mt-2">
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
            className="bg-[#0f1117] border border-white/10 text-[#e7e9ee] rounded px-2 py-1 text-sm w-1/12"
          >
            {PAGE_SIZES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>
    </section>
  );
}
