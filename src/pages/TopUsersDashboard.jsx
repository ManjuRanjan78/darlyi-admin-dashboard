import React, { useEffect, useState } from "react";
import axios from "axios";
import { BaseUrl } from "../BaseUrl";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
export default function TopUsersDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("host");

  const [searchId, setSearchId] = useState("");
  const [searchedUser, setSearchedUser] = useState(null);

  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);

  /* ================= TAB CONFIG ================= */

  const tabConfig = {
    host: {
      label: "Top Hosts",
      makeApi: "make-top-host",
      listApi: "admin/best-hosts",
      field: "topHost",
      color: "from-pink-500 to-purple-600",
    },
    user: {
      label: "Top Users",
      makeApi: "make-top-recharger",
      listApi: "admin/top-recharge",
      field: "topRecharge",
      color: "from-blue-500 to-indigo-600",
    },
    agent: {
      label: "Top Agents",
      makeApi: "make-best-agency",
      listApi: "admin/top-agent",
      field: "bestAgent",
      color: "from-green-500 to-emerald-600",
    },
  };

  const current = tabConfig[activeTab];

  /* ================= FETCH LIST ================= */

  const fetchList = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${BaseUrl.baseurl}/${current.listApi}`);
      if (res.data.status) {
        setList(res.data.data || []);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchList();
  }, [activeTab]);

  /* ================= SEARCH USER ================= */

  const handleSearch = async () => {
    try {
      const res = await axios.get(
        `${BaseUrl.baseurl}/admin/search-user?userId=${searchId}&gender=${activeTab === "host" ? "female" : activeTab === "user" ? "male" : ""}&agent=${activeTab === "agent" && true}`,
      );
      if (res?.data?.data.length !== 0) {
        setSearchedUser(res?.data?.data[0]);
      } else {
        toast.error("No user found");
      }
    } catch (err) {
      console.error(err);
    }
  };

  /* ================= TOGGLE ================= */

  const handleToggle = async (from, user) => {
    let ok = false;
    if (from === "list") {
      ok = window.confirm("Are you sure you want to remove");
      if (!ok) return;
    }
    try {
      await axios.put(
        `${BaseUrl.baseurl}/admin/${current.makeApi}/${from === "list" ? user._id : searchedUser._id}?status=${
          from === "list" ? !user[current.field] : !searchedUser[current.field]
        }`,
      );

      setSearchedUser(null);
      setSearchId("");
      fetchList();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0f1a] text-white p-6">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        {" "}
        <h1 className="text-2xl font-bold ">⭐ Top Users Management</h1>
        <button
          onClick={() => navigate(-1)}
          className="px-3 py-2 rounded-lg text-sm font-semibold bg-purple-600 hover:bg-purple-700"
        >
          Back
        </button>
      </div>

      {/* TABS */}
      <div className="flex gap-4 mb-6">
        {Object.keys(tabConfig).map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setSearchedUser(null);
              setActiveTab(tab);
            }}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition ${
              activeTab === tab
                ? "bg-white text-black"
                : "bg-slate-800 hover:bg-slate-700"
            }`}
          >
            {tabConfig[tab].label}
          </button>
        ))}
      </div>

      {/* SEARCH CARD */}
      <div className="bg-slate-900 border border-slate-700 p-5 rounded-xl shadow-lg mb-6">
        <h2 className="text-sm text-slate-400 mb-3">Search User by User ID</h2>

        <div className="flex gap-3">
          <input
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
            placeholder="Enter User ID"
            className="flex-1 px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 focus:outline-none"
          />

          <button
            onClick={handleSearch}
            className="px-5 py-2 bg-indigo-600 rounded-lg hover:bg-indigo-700"
          >
            Search
          </button>
        </div>

        {/* USER PREVIEW */}
        {searchedUser && (
          <div className="mt-5 p-4 bg-slate-800 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img
                src={searchedUser?.photos[0]?.url}
                className="w-12 h-12 rounded-full object-cover"
                alt=""
              />

              <div>
                <div className="font-semibold">{searchedUser.name}</div>
                <div className="text-xs text-slate-400">
                  ID: {searchedUser.userId}
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                handleToggle("search");
              }}
              className={`px-5 py-2 rounded-lg bg-gradient-to-r ${current.color} hover:opacity-90`}
            >
              {searchedUser[current.field]
                ? `Remove ${current.label}`
                : `Make ${current.label}`}
            </button>
          </div>
        )}
      </div>

      {/* TABLE */}
      <div className="bg-slate-900 border border-slate-700 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-800 text-slate-400">
            <tr>
              <th className="p-3 text-left">User</th>
              <th className="p-3 text-left">User ID</th>
              <th className="p-3 text-left">Coins</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Action</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="4" className="text-center p-5">
                  Loading...
                </td>
              </tr>
            ) : list.length === 0 ? (
              <tr>
                <td colSpan="4" className="text-center p-5 text-slate-500">
                  No data found
                </td>
              </tr>
            ) : (
              list.map((user, index) => (
                <tr
                  key={index}
                  className="border-b border-slate-800 hover:bg-slate-800/50"
                >
                  <td className="p-3 flex items-center gap-3">
                    <img
                      src={
                        user.photos?.find((p) => p.isProfile)?.url ||
                        "https://via.placeholder.com/40"
                      }
                      className="w-10 h-10 rounded-full"
                      alt=""
                    />

                    <span>{user.name}</span>
                  </td>

                  <td className="p-3">{user.userId}</td>

                  <td className="p-3">{format(user.coins)}</td>

                  <td className="p-3">{user.city}</td>
                  <td className="p-3">
                    <span
                      onClick={() => {
                        handleToggle("list", user);
                      }}
                      className="px-3 py-1 text-xs rounded-full bg-rose-600 cursor-pointer"
                    >
                      Remove
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
const format = (num) => num?.toLocaleString("en-IN") || "0";