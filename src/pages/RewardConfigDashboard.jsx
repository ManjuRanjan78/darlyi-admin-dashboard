import React, { useEffect, useState } from "react";
import axios from "axios";
import { BaseUrl } from "../BaseUrl";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
const RewardConfigDashboard = () => {
   const navigate = useNavigate();
  const [role, setRole] = useState("");
  const [rewardType, setRewardType] = useState("");
  const [coins, setCoins] = useState("");
  const [rewardCoins, setRewardCoins] = useState("");
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(false);

  const roles = [
    { label: "Male User", value: "male_user" },
    { label: "Female Host", value: "female_host" },
    { label: "Agent", value: "agent" },
  ];

  const rewardTypes = [
    { label: "Daily", value: "daily" },
    { label: "Weekly", value: "weekly" },
    { label: "Monthly", value: "monthly" },
  ];

  /* ================= FETCH ================= */
  const fetchRewards = async () => {
    try {
      const res = await axios.get(`${BaseUrl.baseurl}/admin/get-all-reward`);
      if (res.data) {
        setRewards(res.data.data || []);
      }
    } catch {
      toast.error("Failed to fetch rewards");
    }
  };

  useEffect(() => {
    fetchRewards();
  }, []);

  /* ================= CREATE ================= */
  const handleCreate = async () => {
    if (!role || !rewardType || !coins || !rewardCoins) {
      return toast.error("All fields are required");
    }

    setLoading(true);
    try {
      await axios.post(`${BaseUrl.baseurl}/admin/create-reward`, {
        role,
        rewardType,
        coins,
        rewardCoins,
      });

      toast.success("Reward created successfully");
      setRole("");
      setRewardType("");
      setCoins("");
      setRewardCoins("");
      fetchRewards();
    } catch {
      toast.error("Failed to create reward");
    } finally {
      setLoading(false);
    }
  };

  /* ================= TOGGLE ================= */
  const toggleReward = async (id,status) => {
    try {
      await axios.put(`${BaseUrl.baseurl}/admin/${status ?"deactivate-reward":"activate-reward"}/${id}`);
      fetchRewards();
    } catch {
      toast.error("Failed to update reward");
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0d12] p-6 text-white">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* ================= CREATE CARD ================= */}
        <div className="bg-[radial-gradient(1200px_800px_at_10%_-10%,#1a1f33_0%,#0b0d12_60%)] border border-white/10 rounded-xl p-6 shadow-lg">
          <div className="flex justify-between items-center mb-4">
           <div>
             <h2 className="text-xl font-bold  text-center">🪙 Reward Configuration</h2>
           </div>
             <button
            onClick={() => navigate(`/top-user-dashboard`)}
            className="px-3 py-2 rounded-lg text-sm font-semibold bg-purple-600 hover:bg-purple-700"
          >
            Top Users
          </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Role */}
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="bg-[#0f1320] border border-white/10 rounded-lg p-2"
            >
              <option value="">Select Role</option>
              {roles.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>

            {/* Reward Type */}
            <select
              value={rewardType}
              onChange={(e) => setRewardType(e.target.value)}
              className="bg-[#0f1320] border border-white/10 rounded-lg p-2"
            >
              <option value="">Reward Type</option>
              {rewardTypes.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>

            {/* Required Coins */}
            <input
              type="number"
              placeholder="Required Coins"
              value={coins}
              onChange={(e) => setCoins(e.target.value)}
              className="bg-[#0f1320] border border-white/10 rounded-lg p-2"
            />

            {/* Reward Coins */}
            <input
              type="number"
              placeholder="Reward Coins"
              value={rewardCoins}
              onChange={(e) => setRewardCoins(e.target.value)}
              className="bg-[#0f1320] border border-white/10 rounded-lg p-2"
            />
          </div>

          <div className="mt-4">
            <button
              onClick={handleCreate}
              disabled={loading}
              className={`px-6 py-2 rounded-lg font-semibold ${
                loading ? "bg-slate-700" : "bg-indigo-600 hover:bg-indigo-700"
              }`}
            >
              {loading ? "Creating..." : "Create Reward"}
            </button>
          </div>
        </div>

        {/* ================= TABLE ================= */}
        <div className="bg-[radial-gradient(1200px_800px_at_10%_-10%,#1a1f33_0%,#0b0d12_60%)] border border-white/10 rounded-xl p-6 shadow-lg overflow-x-auto">
          <h2 className="text-xl font-bold mb-4">📋 Reward Rules</h2>

          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-[#9aa3b2]">
                <th className="p-2">Role</th>
                <th className="p-2">Type</th>
                <th className="p-2">Required Coins</th>
                <th className="p-2">Reward Coins</th>
                <th className="p-2">Status</th>
                <th className="p-2">Action</th>
              </tr>
            </thead>

            <tbody className="text-center">
              {rewards.map((reward) => (
                <tr
                  key={reward._id}
                  className="border-b border-white/5 hover:bg-white/5"
                >
                  <td className="p-2 capitalize">
                    {reward.role.replace("_", " ")}
                  </td>

                  <td className="p-2 capitalize">{reward.rewardType}</td>

                  <td className="p-2 text-yellow-400 font-semibold">
                    {format(reward.coins)}
                  </td>

                  <td className="p-2 font-bold text-green-400">
                    {format(reward.rewardCoins)}
                  </td>

                  <td className="p-2">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        reward.isActive
                          ? "bg-green-500/20 text-green-300"
                          : "bg-red-500/20 text-red-300"
                      }`}
                    >
                      {reward.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>

                  <td className="p-2">
                    <button
                      onClick={() => toggleReward(reward._id,reward.isActive)}
                      className="px-3 py-1 rounded bg-purple-600 hover:bg-purple-700 text-white text-xs"
                    >
                      Toggle
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {rewards.length === 0 && (
            <div className="text-center py-6 text-slate-400">
              No reward configs found
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RewardConfigDashboard;
const format = (num) => num?.toLocaleString("en-IN") || "0";