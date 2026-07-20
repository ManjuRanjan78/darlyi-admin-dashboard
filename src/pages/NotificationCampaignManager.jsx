// src/pages/NotificationCampaignManager.jsx

import { useEffect, useRef, useState } from "react";
import axios from "axios";
import * as XLSX from "xlsx";

import {
  UploadCloud,
  BellRing,
  Search,
  Trash2,
  Pencil,
  Users,
  Image as ImageIcon,
  Loader2,
  RefreshCcw,
  CheckCircle2,
  XCircle,
  Plus,
} from "lucide-react";

import { BaseUrl } from "../BaseUrl";
import toast from "react-hot-toast";

export default function NotificationCampaignManager() {
  const [campaigns, setCampaigns] = useState([]);

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [search, setSearch] = useState("");
  const [gender, setGender] = useState("");
  const [active, setActive] = useState(true);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fileRef = useRef();

  // =========================================
  // FETCH CAMPAIGNS
  // =========================================

  const fetchCampaigns = async () => {
    try {
      setLoading(true);

      const res = await axios.get(
        `${BaseUrl.baseurl}/admin/list-notification-campaigns`,
        {
          params: {
            page,
            limit: 10,
            search,
            targetGender: gender,
            active,
          },
        },
      );

      setCampaigns(res.data?.campaigns || []);
      setTotalPages(res.data?.totalPages || 1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, [page, search, gender, active]);

  // =========================================
  // EXCEL UPLOAD
  // =========================================

  const handleExcelUpload = async (e) => {
    try {
      const file = e.target.files[0];

      if (!file) return;

      setUploading(true);

      const reader = new FileReader();

      reader.onload = async (event) => {
        try {
          const binaryStr = event.target.result;

          const workbook = XLSX.read(binaryStr, {
            type: "binary",
          });

          const sheetName = workbook.SheetNames[0];

          const sheet = workbook.Sheets[sheetName];

          const jsonData = XLSX.utils.sheet_to_json(sheet);

          // FORMAT DATA
          console.log("jabba json data", jsonData);
          const formatted = jsonData.map((item) => ({
            title: item.title || "Togilo Notification",
            body: item.body || "",
            image: item.image || null,
            targetGender: item.targetGender || "all",
            active:
              String(item.active).toLowerCase() === "false" ? false : true,
            sendEveryHours: Number(item.sendEveryHours) || 1,
          }));

          await axios.post(
            `${BaseUrl.baseurl}/admin/create-notification-campaign`,
            {
              data: formatted,
            },
          );

          toast.success(`${formatted.length} campaigns uploaded successfully`);

          fetchCampaigns();
        } catch (err) {
          console.error(err);
          toast.error("Excel processing failed");
        } finally {
          setUploading(false);
        }
      };

      reader.readAsBinaryString(file);
    } catch (err) {
      console.error(err);
      setUploading(false);
    }
  };

  // =========================================
  // DELETE
  // =========================================

  const deleteCampaign = async (id) => {
    try {
      const ok = window.confirm("Delete this campaign?");

      if (!ok) return;

      await axios.delete(
        `${BaseUrl.baseurl}/admin/delete-notification-campaign/${id}`,
      );

      fetchCampaigns();
    } catch (err) {
      console.error(err);
    }
  };

  // =========================================
  // TOGGLE ACTIVE
  // =========================================

  const toggleActive = async (item) => {
    try {
      await axios.put(
        `${BaseUrl.baseurl}/admin/update-notification-campaign/${item._id}`,
        {
          active: !item.active,
        },
      );

      fetchCampaigns();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-[#050816] text-white p-6">
      {/* HEADER */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-5 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-sm">
            <BellRing size={15} />
            Campaign Management
          </div>

          {/* <h1 className="text-4xl font-black mt-4">Notification Campaigns</h1> */}

          <p className="text-slate-400 mt-2">
            Create, manage and automate push notification campaigns
          </p>
        </div>

        {/* UPLOAD */}
        <div className="flex gap-3 flex-wrap">
          <button
            onClick={() => fileRef.current.click()}
            className="h-14 px-6 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:opacity-90 transition flex items-center gap-3 font-bold shadow-lg shadow-indigo-500/20"
          >
            {uploading ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <UploadCloud size={20} />
                Upload Excel
              </>
            )}
          </button>

          <input
            hidden
            type="file"
            accept=".xlsx,.xls"
            ref={fileRef}
            onChange={handleExcelUpload}
          />
        </div>
      </div>

      {/* FILTERS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {/* SEARCH */}
        <div className="relative">
          <Search size={18} className="absolute left-4 top-4 text-slate-500" />

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search campaign..."
            className="w-full h-14 rounded-2xl bg-white/5 border border-white/10 pl-12 pr-4 outline-none focus:border-indigo-500"
          />
        </div>

        {/* GENDER */}
        <select
          value={gender}
          onChange={(e) => setGender(e.target.value)}
          className="h-14 rounded-2xl bg-[#0f172a] text-white border border-white/10 px-4 outline-none focus:border-indigo-500"
        >
          <option value="" className="bg-[#0f172a] text-white">
            All Gender
          </option>

          <option value="male" className="bg-[#0f172a] text-white">
            Male
          </option>

          <option value="female" className="bg-[#0f172a] text-white">
            Female
          </option>

          <option value="all" className="bg-[#0f172a] text-white">
            All
          </option>
        </select>

        {/* ACTIVE */}
        <select
          value={active}
          onChange={(e) => setActive(e.target.value)}
          className="h-14 rounded-2xl bg-[#0f172a] text-white border border-white/10 px-4 outline-none focus:border-indigo-500"
        >
          

          <option value="true" className="bg-[#0f172a] text-white">
            Active
          </option>

          <option value="false" className="bg-[#0f172a] text-white">
            Inactive
          </option>
        </select>

        {/* REFRESH */}
        <button
          onClick={fetchCampaigns}
          className="h-14 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition flex items-center justify-center gap-2"
        >
          <RefreshCcw size={18} />
          Refresh
        </button>
      </div>

      {/* SAMPLE FORMAT */}
      <div className="mb-8 rounded-3xl border border-indigo-500/20 bg-indigo-500/10 p-5">
        <h2 className="font-bold text-lg mb-3">Excel Format</h2>

        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-indigo-300">
                <th className="pb-2">title</th>
                <th className="pb-2">body</th>
                <th className="pb-2">image</th>
                <th className="pb-2">targetGender</th>
                <th className="pb-2">sendEveryHours</th>
                <th className="pb-2">active</th>
              </tr>
            </thead>

            <tbody className="text-slate-300">
              <tr>
                <td>Big Offer</td>
                <td>Get 50% coins</td>
                <td>https://...</td>
                <td>female</td>
                <td>2</td>
                <td>true</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* CAMPAIGNS */}
      {loading ? (
        <div className="flex justify-center items-center h-[400px]">
          <div className="w-14 h-14 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : campaigns.length === 0 ? (
        <div className="h-[300px] flex items-center justify-center text-slate-500 text-xl">
          No campaigns found
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {campaigns.map((item) => (
            <div
              key={item._id}
              className="group rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900 via-[#0f172a] to-black p-5 hover:border-indigo-500/40 transition-all duration-300 shadow-2xl"
            >
              {/* TOP */}
              <div className="flex justify-between gap-4">
                <div className="flex gap-4">
                  {/* IMAGE */}
                  <div className="w-24 h-24 rounded-2xl overflow-hidden bg-white/5 border border-white/10 shrink-0">
                    {item.image ? (
                      <img
                        src={item.image}
                        className="w-full h-full object-cover"
                        alt=""
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon size={30} className="text-slate-500" />
                      </div>
                    )}
                  </div>

                  {/* CONTENT */}
                  <div>
                    <h2 className="text-2xl font-bold line-clamp-1">
                      {item.title}
                    </h2>

                    <p className="text-slate-400 mt-2 line-clamp-3">
                      {item.body}
                    </p>

                    <div className="flex flex-wrap gap-2 mt-4">
                      {/* GENDER */}
                      <span className="px-3 py-1 rounded-full text-xs bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 flex items-center gap-1">
                        <Users size={12} />
                        {item.targetGender}
                      </span>

                      {/* HOURS */}
                      <span className="px-3 py-1 rounded-full text-xs bg-yellow-500/10 border border-yellow-500/20 text-yellow-300">
                        Every {item.sendEveryHours}h
                      </span>

                      {/* STATUS */}
                      <span
                        className={`px-3 py-1 rounded-full text-xs flex items-center gap-1 ${
                          item.active
                            ? "bg-green-500/10 border border-green-500/20 text-green-300"
                            : "bg-red-500/10 border border-red-500/20 text-red-300"
                        }`}
                      >
                        {item.active ? (
                          <CheckCircle2 size={12} />
                        ) : (
                          <XCircle size={12} />
                        )}

                        {item.active ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* ACTIONS */}
                <div className="flex flex-col gap-3">
                  {/* TOGGLE */}
                  <button
                    onClick={() => toggleActive(item)}
                    className={`w-11 h-11 rounded-2xl flex items-center justify-center transition ${
                      item.active
                        ? "bg-green-500/20 text-green-400 hover:bg-green-500/30"
                        : "bg-red-500/20 text-red-400 hover:bg-red-500/30"
                    }`}
                  >
                    {item.active ? (
                      <CheckCircle2 size={18} />
                    ) : (
                      <XCircle size={18} />
                    )}
                  </button>

                  {/* EDIT */}
                  {/* <button className="w-11 h-11 rounded-2xl bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/30 flex items-center justify-center">
                    <Pencil size={18} />
                  </button> */}

                  {/* DELETE */}
                  <button
                    onClick={() => deleteCampaign(item._id)}
                    className="w-11 h-11 rounded-2xl bg-red-500/20 text-red-400 hover:bg-red-500/30 flex items-center justify-center"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              {/* FOOTER */}
              <div className="mt-5 pt-5 border-t border-white/10 flex justify-between items-center text-sm text-slate-400">
                <div>
                  Created: {new Date(item.createdAt).toLocaleDateString()}
                </div>

                <div>
                  Last Sent:{" "}
                  {item.lastSentAt
                    ? new Date(item.lastSentAt).toLocaleString()
                    : "Never"}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* PAGINATION */}
      <div className="flex justify-center items-center gap-4 mt-10">
        <button
          disabled={page === 1}
          onClick={() => setPage((prev) => prev - 1)}
          className="h-12 px-5 rounded-2xl bg-white/5 border border-white/10 disabled:opacity-40"
        >
          Previous
        </button>

        <div className="h-12 px-6 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 flex items-center justify-center font-bold">
          {page} / {totalPages}
        </div>

        <button
          disabled={page >= totalPages}
          onClick={() => setPage((prev) => prev + 1)}
          className="h-12 px-5 rounded-2xl bg-white/5 border border-white/10 disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  );
}
