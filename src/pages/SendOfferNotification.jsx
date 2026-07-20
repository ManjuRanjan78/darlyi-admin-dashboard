// src/pages/SendOfferNotification.jsx

import { useState } from "react";
import axios from "axios";
import {
  Image as ImageIcon,
  Send,
  Loader2,
  BellRing,
  Type,
  FileText,
} from "lucide-react";

import { BaseUrl } from "../BaseUrl";

export default function SendOfferNotification() {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [summaryText, setSummaryText] = useState("");
  const [image, setImage] = useState(null);

  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);

  const handleImage = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const sendNotification = async () => {
    try {
      if (!title || !message) {
        return alert("Title and Message required");
      }

      setLoading(true);

      const formData = new FormData();

      formData.append("title", title);
      formData.append("message", message);
      formData.append("summaryText", summaryText);

      // optional image
      if (image) {
        formData.append("image", image);
      }

      await axios.post(
        `${BaseUrl.baseurl}/admin/send-offer-notification`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      alert("Offer notification sent successfully");

      // reset
      setTitle("");
      setMessage("");
      setSummaryText("");
      setImage(null);
      setPreview("");
    } catch (err) {
      console.error(err);
      alert("Failed to send notification");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050816] text-white p-6">
      {/* TOP */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-sm">
          <BellRing size={16} />
          Push Offer Notification
        </div>

        <h1 className="text-4xl font-black mt-4 tracking-tight">
          Send Offer Notification
        </h1>

        <p className="text-slate-400 mt-2">
          Send title, message and optional image push notifications
        </p>
      </div>

      {/* MAIN CARD */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* LEFT FORM */}
        <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900 via-[#0f172a] to-black p-6 shadow-2xl">
          {/* TITLE */}
          <div className="mb-5">
            <label className="text-sm text-slate-300 flex items-center gap-2 mb-2">
              <Type size={16} />
              Notification Title
            </label>

            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter notification title..."
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 outline-none focus:border-indigo-500 transition"
            />
          </div>

          {/* MESSAGE */}
          <div className="mb-5">
            <label className="text-sm text-slate-300 flex items-center gap-2 mb-2">
              <FileText size={16} />
              Notification Message
            </label>

            <textarea
              rows={5}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write notification message..."
              className="w-full resize-none bg-white/5 border border-white/10 rounded-2xl px-4 py-3 outline-none focus:border-indigo-500 transition"
            />
          </div>

          {/* SUMMARY */}
          <div className="mb-5">
            <label className="text-sm text-slate-300 mb-2 block">
              Summary Text
            </label>

            <input
              value={summaryText}
              onChange={(e) => setSummaryText(e.target.value)}
              placeholder="Optional summary text..."
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 outline-none focus:border-indigo-500 transition"
            />
          </div>

          {/* IMAGE */}
          <div className="mb-6">
            <label className="text-sm text-slate-300 flex items-center gap-2 mb-3">
              <ImageIcon size={16} />
              Upload Banner Image (Optional)
            </label>

            <label className="flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-3xl h-[220px] cursor-pointer hover:border-indigo-500 transition overflow-hidden bg-white/5">
              {preview ? (
                <img
                  src={preview}
                  className="w-full h-full object-cover"
                  alt=""
                />
              ) : (
                <div className="flex flex-col items-center">
                  <ImageIcon size={42} className="text-slate-500" />

                  <p className="text-slate-400 mt-3 text-sm">
                    Click to upload image
                  </p>
                </div>
              )}

              <input
                type="file"
                accept="image/*"
                hidden
                onChange={handleImage}
              />
            </label>
          </div>

          {/* SEND BUTTON */}
          <button
            onClick={sendNotification}
            disabled={loading}
            className="w-full h-14 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:opacity-90 transition font-bold text-lg flex items-center justify-center gap-3 shadow-lg shadow-indigo-500/20"
          >
            {loading ? (
              <>
                <Loader2 size={22} className="animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send size={20} />
                Send Notification
              </>
            )}
          </button>
        </div>

        {/* RIGHT PREVIEW */}
        <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-[#0f172a] to-black p-6 shadow-2xl">
          <h2 className="text-xl font-bold mb-5">Live Notification Preview</h2>

          {/* PHONE MOCKUP */}
          <div className="max-w-sm mx-auto bg-black rounded-[40px] border-[10px] border-slate-800 shadow-2xl overflow-hidden">
            {/* STATUS */}
            <div className="h-7 bg-black" />

            {/* NOTIFICATION */}
            <div className="bg-[#1a1d27] p-4 border-b border-white/10">
              <div className="flex gap-3">
                {/* APP ICON */}
                <div className="w-11 h-11 rounded-2xl bg-indigo-600 flex items-center justify-center shrink-0">
                  <BellRing size={20} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold truncate">Togilo</h3>

                    <span className="text-[10px] text-slate-400">now</span>
                  </div>

                  <p className="font-semibold mt-1 line-clamp-1">
                    {title || "Your notification title"}
                  </p>

                  <p className="text-sm text-slate-300 mt-1 line-clamp-2">
                    {message ||
                      "Your notification message preview will appear here"}
                  </p>

                  {summaryText && (
                    <p className="text-xs text-indigo-300 mt-2">
                      {summaryText}
                    </p>
                  )}
                </div>
              </div>

              {/* IMAGE PREVIEW */}
              {preview && (
                <div className="mt-4 rounded-2xl overflow-hidden border border-white/10">
                  <img
                    src={preview}
                    className="w-full h-48 object-cover"
                    alt=""
                  />
                </div>
              )}
            </div>
          </div>

          {/* INFO */}
          <div className="mt-6 p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20">
            <p className="text-sm text-indigo-200 leading-6">
              • If image uploaded → image notification will be sent
              <br />
              • Without image → simple text notification
              <br />• Supports Android & iOS push preview
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
