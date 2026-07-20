import React, { useEffect, useState } from "react";
import axios from "axios";
import { BaseUrl } from "../BaseUrl";
import toast from "react-hot-toast";

const CreateHost = () => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [dob, setDob] = useState("");
  const [agentId, setAgentId] = useState("");
  const [agents, setAgents] = useState([]);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);

  /* ================= FETCH AGENTS ================= */
  useEffect(() => {
    axios
      .get(`${BaseUrl.baseurl}/agent/get-all-agents-no-skip`)
      .then((res) => {
        if (res.data.status) {
          setAgents(res.data.data);
        }
      })
      .catch(() => {});
  }, []);

  /* ================= AGE VALIDATION ================= */
  const isAbove18 = (date) => {
    const today = new Date();
    const birthDate = new Date(date);
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      age > 18 ||
      (age === 18 && monthDiff > 0) ||
      (age === 18 && monthDiff === 0 && today.getDate() >= birthDate.getDate())
    ) {
      return true;
    }
    return false;
  };

  /* ================= FILE CHANGE ================= */
  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files);

    const filesWithPreview = selected.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));

    setFiles(filesWithPreview);
  };
  const removeImage = (index) => {
    const updated = [...files];
    URL.revokeObjectURL(updated[index].preview);
    updated.splice(index, 1);
    setFiles(updated);
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = async () => {
    if (!name || !phone || !email || !dob) {
      return toast.error("All fields are required");
    }

    if (!isAbove18(dob)) {
      return toast.error("Host must be at least 18 years old");
    }

    if (files.length === 0) {
      return toast.error("Profile image is required");
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("phone", phone);
      formData.append("email", email);
      formData.append("dob", dob);
      formData.append("agentId", agentId);

      files.forEach((item) => {
        formData.append("images", item.file);
      });

      const res = await axios.post(
        `${BaseUrl.baseurl}/admin/create-host`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );

      if (res.data.status) {
        toast.success("Host created successfully");
        setName("");
        setPhone("");
        setEmail("");
        setDob("");
        setAgentId("");
        setFiles([]);
      } else {
        toast.error(res.data.message);
      }
    } catch (err) {
      toast.error("Failed to create host");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0d12] p-6 text-white">
      <div className="max-w-4xl mx-auto">
        <div className="bg-[radial-gradient(1200px_800px_at_10%_-10%,#1a1f33_0%,#0b0d12_60%)] border border-white/10 rounded-xl p-6 shadow-lg space-y-6">
          <h2 className="text-2xl font-bold">👩‍🎤 Create Host</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-[#0f1320] border border-white/10 rounded-lg p-3"
            />

            <input
              type="number"
              placeholder="Phone Number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="bg-[#0f1320] border border-white/10 rounded-lg p-3"
            />

            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-[#0f1320] border border-white/10 rounded-lg p-3"
            />

            <input
              type="date"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              className="bg-[#0f1320] border border-white/10 rounded-lg p-3"
            />

            <select
              value={agentId}
              onChange={(e) => setAgentId(e.target.value)}
              className="bg-[#0f1320] border border-white/10 rounded-lg p-3 md:col-span-2"
            >
              <option value="">Select Agent (Optional)</option>
              {agents.map((agent) => (
                <option key={agent._id} value={agent._id}>
                  {agent.name} (ID: {agent.userId})
                </option>
              ))}
            </select>

            <div className="md:col-span-2">
              <label className="block mb-2 text-sm text-[#9aa3b2]">
                Upload Profile Images
              </label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileChange}
                className="bg-[#0f1320] border border-white/10 rounded-lg p-2 w-full"
              />
              <p className="text-xs text-slate-400 mt-1">
                First image will be profile picture
              </p>
            </div>
            {files.length > 0 && (
              <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                {files.map((item, index) => (
                  <div
                    key={index}
                    className="relative group rounded-lg overflow-hidden border border-white/10"
                  >
                    <img
                      src={item.preview}
                      alt="preview"
                      className="h-32 w-full object-cover"
                    />

                    {/* Profile Badge */}
                    {index === 0 && (
                      <span className="absolute top-2 left-2 bg-indigo-600 text-xs px-2 py-1 rounded text-white">
                        Profile
                      </span>
                    )}

                    {/* Remove Button */}
                    <button
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 bg-red-600 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className={`w-full py-3 rounded-lg font-semibold transition ${
              loading ? "bg-slate-700" : "bg-indigo-600 hover:bg-indigo-700"
            }`}
          >
            {loading ? "Creating..." : "Create Host"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateHost;
