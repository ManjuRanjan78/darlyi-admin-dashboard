// src/components/BankDetailsEditor.jsx

import { useState } from "react";
import axios from "axios";
import { BaseUrl } from "../BaseUrl";
import toast from "react-hot-toast";

export default function BankDetailsEditor({ user, onUpdated }) {
  const existing = user.bankDetails || {};

  const [editing, setEditing] = useState(!user.bankDetails);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    accountHolderName: existing.accountHolderName || "",
    bankName: existing.bankName || "",
    accountNumber: existing.accountNumber || "",
    swiftCode: existing.swiftCode || "",
    branchName: existing.branchName || "",
    country: existing.country || "",
    currency: existing.currency || "",
  });

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const updateBank = async () => {
    try {
      setLoading(true);
      const payload = {
        ...form,
        swiftCode: form.swiftCode.toUpperCase(),
        bankName: form.bankName.toUpperCase(),
        currency: "INR",
        country: "INDIA",
      };
      const res = await axios.post(
        `${BaseUrl.baseurl}/user/update-bank-details/${user._id}`,
        { bankDetails: payload },
      );
      toast.success(res.data.message);
      setEditing(false);
      onUpdated && onUpdated();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update bank details");
    } finally {
      setLoading(false);
    }
  };
  const reInitiateBank = async (userId) => {
    const ok = window.confirm("Are you sure you want to re initiate");
    if (!ok) return;
    try {
      const data = await axios.post(
        `${BaseUrl.baseurl}/user/reinitiate-bank-details/${userId}`,
      );

      toast.success(data.data.message);
    } catch (err) {
      toast.error("Failed to re initiate");
    } finally {
      onUpdated && onUpdated();
    }
  };
  return (
    <div className="md:col-span-3 mt-4 rounded-2xl p-6 bg-white border border-gray-200 shadow-sm">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-5">
        <h4 className="font-bold text-lg text-gray-800">🏦 Bank Details</h4>

        <div className="flex gap-2 items-center">
          <span
            className={`px-3 py-1 text-xs rounded-full font-semibold ${
              existing.isVerified
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-600"
            }`}
          >
            {existing.isVerified ? "Verified" : "Not Verified"}
          </span>
          {existing && !existing.isVerified && (
            <button
              onClick={() => {
                reInitiateBank(user.userId);
              }}
              className="px-3 py-1 text-xs rounded bg-violet-100 text-violet-700 hover:bg-violet-200"
            >
              Re-initiate
            </button>
          )}
          {!editing && (
            <button
              onClick={() => setEditing(true)}
              className="px-3 py-1 text-xs rounded bg-indigo-600 text-white hover:bg-indigo-500"
            >
              Edit
            </button>
          )}
        </div>
      </div>

      {/* FORM */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-sm">
        {[
          ["Account Holder", "accountHolderName"],
          ["Bank Name", "bankName"],
          ["Account Number", "accountNumber"],
          ["SWIFT Code", "swiftCode"],
          ["Branch", "branchName"],
          // ["Country", "country"],
          // ["Currency", "currency"],
        ].map(([label, key]) => (
          <div key={key}>
            <label className="text-gray-500 text-xs font-medium">{label}</label>

            {editing ? (
              <input
                value={form[key]}
                onChange={(e) => handleChange(key, e.target.value)}
                className="w-full mt-1 px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            ) : (
              <div className="mt-1 text-gray-800 font-medium">
                {form[key] || "-"}
              </div>
            )}
          </div>
        ))}

        {/* EXTRA */}
        {!editing && (
          <>
            <div>
              <label className="text-gray-500 text-xs font-medium">
                Beneficiary Id
              </label>
              <div className="mt-1 text-gray-800">
                {existing.beneficiaryId || "-"}
              </div>
            </div>

            <div>
              <label className="text-gray-500 text-xs font-medium">
                Rejected Reason
              </label>
              <div className="mt-1 text-gray-800">
                {existing.rejectedReason || "-"}
              </div>
            </div>
          </>
        )}
      </div>

      {/* ACTIONS */}
      {editing && (
        <div className="flex gap-3 mt-6">
          <button
            onClick={updateBank}
            disabled={loading}
            className="px-5 py-2 rounded-xl bg-green-600 text-white hover:bg-green-500 font-semibold"
          >
            {loading ? "Saving..." : "Save"}
          </button>

          <button
            onClick={() => setEditing(false)}
            className="px-5 py-2 rounded-xl bg-gray-200 text-gray-700 hover:bg-gray-300"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}
