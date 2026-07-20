import React, { useEffect, useState } from "react";
import axios from "axios";
import { BaseUrl } from "../BaseUrl"; // keep this if you have it, otherwise replace with your base
import NotificationCampaignManager from "./NotificationCampaignManager";

const PAGE_SIZES = [5, 10, 20];

const NotificationAndCampaign = () => {
  // NEW: title + summary
  const userDetails = JSON.parse(
    localStorage.getItem("LiveStreamAdminDetails")
  );
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");

  const [pushContent, setPushContent] = useState("");
  const [scheduleDate, setScheduleDate] = useState(""); // yyyy-mm-dd
  const [scheduleTime, setScheduleTime] = useState(""); // HH:MM

  // now using file upload
  const [imageFile, setImageFile] = useState(null); // File object
  const [previewUrl, setPreviewUrl] = useState(null); // local preview url

  const [sendGenderOnly, setSendGenderOnly] = useState("all");
  const [sending, setSending] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const [campaigns, setCampaigns] = useState([]); // items
  const [totalCampaigns, setTotalCampaigns] = useState(0);
  const [loadingCampaigns, setLoadingCampaigns] = useState(false);
  const [campaignsError, setCampaignsError] = useState("");

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZES[1]);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  // preview/load states
  const [imageLoadError, setImageLoadError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const computedHasMore = Boolean(hasMore);
  useEffect(() => {
    // cleanup preview URL when imageFile changes or component unmounts
    if (!imageFile) {
      setPreviewUrl(null);
      setImageLoaded(false);
      setImageLoadError(false);
      // also clear summary when image removed (optional)
      setSummary("");
      return;
    }
    const url = URL.createObjectURL(imageFile);
    setPreviewUrl(url);
    setImageLoadError(false);
    setImageLoaded(false);
    return () => {
      URL.revokeObjectURL(url);
      setPreviewUrl(null);
    };
  }, [imageFile]);

  const buildScheduledAt = () => {
    if (!scheduleDate) return null;

    // parse YYYY-MM-DD
    const [y, m, d] = scheduleDate.split("-").map(Number);
    if (!y || !m || !d) return null;

    // default time components
    let hours = 0,
      minutes = 0,
      seconds = 0,
      ms = 0;

    if (scheduleTime) {
      // accept "HH:MM" or "HH:MM:SS"
      const parts = scheduleTime.split(":").map(Number);
      hours = parts[0] ?? 0;
      minutes = parts[1] ?? 0;
      seconds = parts[2] ?? 0;
    }

    // create a Date in local timezone, then convert to ISO (UTC) string
    const dt = new Date(y, m - 1, d, hours, minutes, seconds, ms);
    return dt.toISOString(); // e.g. "2025-12-04T12:23:19.310Z"
  };

  // keep a small payload preview for debug (image becomes filename)
  // const payloadPreview = {
  //   title: title || null,
  //   content: pushContent,
  //   summary: imageFile ? summary || null : null,
  //   scheduled_at: buildScheduledAt(),
  //   image: imageFile ? imageFile.name : null,
  //   gender: sendGenderOnly,
  // };

  const validate = () => {
    setErrorMsg("");
    // require a title now
    if (!title || title.trim().length < 1) {
      setErrorMsg("Title is required.");
      return false;
    }
    if (!pushContent || pushContent.trim().length < 3) {
      setErrorMsg("Push content is required (min 3 characters).");
      return false;
    }
    // if image present, summary is required
    if (imageFile) {
      if (!summary || summary.trim().length < 3) {
        setErrorMsg(
          "Summary is required for image campaigns (min 3 characters)."
        );
        return false;
      }
    }
    // optional: ensure image is of acceptable type/size
    if (imageFile) {
      const allowed = [
        "image/png",
        "image/jpeg",
        "image/jpg",
        "image/webp",
        "image/gif",
      ];
      if (!allowed.includes(imageFile.type)) {
        setErrorMsg("Only PNG/JPG/WebP/GIF images are allowed.");
        return false;
      }
      const maxMB = 5;
      if (imageFile.size > maxMB * 1024 * 1024) {
        setErrorMsg(`Image must be smaller than ${maxMB} MB.`);
        return false;
      }
    }
    return true;
  };

  const handleFileChange = (e) => {
    const f = e.target.files?.[0] ?? null;
    setImageFile(f);
  };

  const handleSend = async () => {
    setSuccessMsg("");
    setErrorMsg("");
    if (!validate()) return;

    setSending(true);
    try {
      const url = `${BaseUrl.baseurl}/admin/send-schedule-notification`;

      // If there's an image file, send multipart/form-data
      if (imageFile) {
        console.log("jabbeshaaa", userDetails);
        const form = new FormData();
        form.append("title", title);
        form.append("body", pushContent);
        form.append("summaryText ", summary); // NEW
        form.append("sendAt", buildScheduledAt() ?? "");
        // append file field name expected by your backend; using 'image' here
        form.append("image", imageFile);
        form.append("type", "Image");
        form.append("createdBy", userDetails?.data?._id);
        // meta as JSON string or separate fields depending on backend
        form.append(
          "targetGender",
          sendGenderOnly === "all" ? "both" : sendGenderOnly
        );

        const res = await axios.post(url, form, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        if (res?.data?.success) {
          setSuccessMsg("Campaign scheduled/sent successfully.");
          // refresh campaigns list so the new campaign appears
          fetchCampaigns(1, pageSize);
          setPage(1);
        } else {
          setErrorMsg(res?.data?.message || "Failed to schedule campaign.");
        }
      } else {
        // no image -> send JSON body as before (summary omitted when no image)

        const body = {
          title,
          body: pushContent,
          summaryText: null,
          sendAt: buildScheduledAt(),
          image: null,
          targetGender: sendGenderOnly === "all" ? "both" : sendGenderOnly,
          type: "Simple",
          createdBy: userDetails?.data?._id,
        };
        const res = await axios.post(url, body, {
          headers: { "Content-Type": "application/json" },
        });
        if (res?.data?.success) {
          setSuccessMsg("Campaign scheduled/sent successfully.");
          fetchCampaigns(1, pageSize);
          setPage(1);
        } else {
          setErrorMsg(res?.data?.message || "Failed to schedule campaign.");
        }
      }
    } catch (err) {
      console.error("Send campaign error:", err);
      setErrorMsg(
        err?.response?.data?.message || "Network error while sending campaign."
      );
    } finally {
      setSending(false);
    }
  };

  // campaigns fetching (same as before)
  // modify fetchCampaigns: add { append = false } param

  const fetchCampaigns = async (
    pageToFetch = 1,
    size = pageSize,
    { append = false } = {}
  ) => {
    if (append) setLoadingMore(true);
    else setLoadingCampaigns(true);

    setCampaignsError("");
    try {
      const url = `${BaseUrl.baseurl}/admin/get-scheduled-notification`;

      // convert page -> skip (backend expects skip)
      const skip = (Math.max(1, pageToFetch) - 1) * size;
      const params = { skip, limit: size };

      const res = await axios.get(url, { params });
      const payload = res?.data ?? null;
      if (!payload) throw new Error("Empty response");

      // payload.data is the array (per your backend)
      const items = Array.isArray(payload.data) ? payload.data : [];

      // update campaigns list
      if (append) setCampaigns((prev) => [...prev, ...items]);
      else setCampaigns(items);

      // total is returned by backend
      const totalFromPayload = Number(payload.total ?? 0) || 0;
      setTotalCampaigns(totalFromPayload);

      // compute how many have been fetched after this update
      const currentlyFetched = append
        ? campaigns.length + items.length
        : items.length;

      // determine hasMore reliably: true if we've fetched fewer than total
      const more = currentlyFetched < totalFromPayload;
      setHasMore(more);

      return items.length;
    } catch (err) {
      console.error("Error fetching campaigns:", err);
      setCampaignsError("Failed to load campaigns.");
      if (!append) {
        setCampaigns([]);
        setTotalCampaigns(0);
        setHasMore(false);
      }
      return 0;
    } finally {
      if (append) setLoadingMore(false);
      else setLoadingCampaigns(false);
    }
  };

  const handleLoadMore = async () => {
    if (loadingMore || loadingCampaigns || !hasMore) return;

    const nextPage = page + 1;
    const fetchedCount = await fetchCampaigns(nextPage, pageSize, {
      append: true,
    });

    if (fetchedCount > 0) {
      // only advance page when items were returned
      setPage(nextPage);
    } else {
      // no items -> mark no more
      setHasMore(false);
    }
  };

  useEffect(() => {
    (async () => {
      setPage(1);
      await fetchCampaigns(1, pageSize, { append: false });
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageSize]);

  const formatDatetime = (iso) => {
    if (!iso) return "-";
    try {
      const d = new Date(iso);
      if (isNaN(d)) return iso;
      return d.toLocaleString();
    } catch {
      return iso;
    }
  };

  const totalPages = Math.max(1, Math.ceil(totalCampaigns / pageSize));
  const goToPage = async (p) => {
    if (p < 1) return;
    // if you have totalPages known and p > totalPages, bail
    if (totalPages && p > totalPages) return;

    // set page immediately for UI, then fetch (or fetch first and set page on success)
    setPage(p);
    await fetchCampaigns(p, pageSize, { append: false });
  };

  return (
    <>
     <NotificationCampaignManager />
    </>
    // <section className="block">
    //   <p className="mb-6 text-[#9aa3b2]">
    //     Create and manage in-app notifications and marketing campaigns. Design
    //     custom messages, target specific user segments, schedule delivery, and
    //     preview how your campaigns will appear to users.
    //   </p>

    //   <div className="bg-[radial-gradient(1200px_800px_at_10%_-10%,#1a1f33_0%,#0b0d12_60%)] border border-white/10 rounded-xl p-6 shadow">
    //     <h3 className="text-lg font-semibold mb-4 text-[#e7e9ee]">
    //       Campaign Builder
    //     </h3>

    //     <div className="space-y-6">
    //       {/* Title */}
    //       <div>
    //         <label
    //           htmlFor="push-title"
    //           className="block text-sm font-medium text-[#9aa3b2]"
    //         >
    //           Title
    //         </label>
    //         <input
    //           id="push-title"
    //           value={title}
    //           onChange={(e) => setTitle(e.target.value)}
    //           className="mt-1 block w-full rounded-lg bg-[#0f1117] border-solid border-white/10 p-2 text-[#e7e9ee]"
    //           placeholder="Enter notification title"
    //         />
    //         <p className="text-xs text-[#6b7380] mt-1">
    //           Short bold title shown in notifications.
    //         </p>
    //       </div>

    //       <div>
    //         <label
    //           htmlFor="push-content"
    //           className="block text-sm font-medium text-[#9aa3b2]"
    //         >
    //           Push Content
    //         </label>
    //         <textarea
    //           id="push-content"
    //           value={pushContent}
    //           onChange={(e) => setPushContent(e.target.value)}
    //           rows={5}
    //           className="mt-1 block w-full rounded-lg bg-[#0f1117] border-solid border-white/10 p-2 text-[#e7e9ee]"
    //           placeholder="Your exciting message here!"
    //         />
    //         <p className="text-xs text-[#6b7380] mt-1">
    //           This is the main text content of your push notification.
    //         </p>
    //       </div>

    //       <div className="flex items-center gap-4">
    //         <label className="block text-sm font-medium text-[#9aa3b2]">
    //           Send to
    //         </label>
    //         <div className="flex items-center gap-2">
    //           {["all", "male", "female"].map((g) => (
    //             <label key={g} className="text-sm text-[#e7e9ee]">
    //               <input
    //                 type="radio"
    //                 name="gender"
    //                 value={g}
    //                 checked={sendGenderOnly === g}
    //                 onChange={() => setSendGenderOnly(g)}
    //                 className="mr-2"
    //               />
    //               {g === "all" ? "All" : g.charAt(0).toUpperCase() + g.slice(1)}
    //             </label>
    //           ))}
    //         </div>
    //       </div>

    //       {/* schedule */}
    //       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    //         <div>
    //           <label
    //             htmlFor="schedule-date"
    //             className="block text-sm font-medium text-[#9aa3b2]"
    //           >
    //             Date to Schedule
    //           </label>
    //           <input
    //             type="date"
    //             id="schedule-date"
    //             value={scheduleDate}
    //             onChange={(e) => setScheduleDate(e.target.value)}
    //             className="mt-1 block w-full rounded-lg bg-[#0f1117] border border-white/10 p-2 text-[#e7e9ee]"
    //           />
    //         </div>
    //         <div>
    //           <label
    //             htmlFor="schedule-time"
    //             className="block text-sm font-medium text-[#9aa3b2]"
    //           >
    //             Time to Schedule
    //           </label>
    //           <input
    //             type="time"
    //             id="schedule-time"
    //             value={scheduleTime}
    //             onChange={(e) => setScheduleTime(e.target.value)}
    //             className="mt-1 block w-full rounded-lg bg-[#0f1117] border border-white/10 p-2 text-[#e7e9ee]"
    //           />
    //         </div>
    //       </div>

    //       {/* image upload */}
    //       <div>
    //         <label
    //           htmlFor="push-image"
    //           className="block text-sm font-medium text-[#9aa3b2]"
    //         >
    //           Push Image (optional)
    //         </label>
    //         <div className="mt-1 flex items-center gap-3">
    //           <input
    //             id="push-image"
    //             type="file"
    //             accept="image/*"
    //             onChange={handleFileChange}
    //             className="text-sm text-[#e7e9ee]"
    //           />
    //           <div className="text-xs text-[#6b7380]">
    //             PNG/JPG/WebP/GIF, max 5MB
    //           </div>
    //         </div>

    //         {/* NEW: Summary shown only when an image is selected */}
    //         {imageFile && (
    //           <div className="mt-3">
    //             <label
    //               htmlFor="push-summary"
    //               className="block text-sm font-medium text-[#9aa3b2]"
    //             >
    //               Summary (required for image campaigns)
    //             </label>
    //             <input
    //               id="push-summary"
    //               value={summary}
    //               onChange={(e) => setSummary(e.target.value)}
    //               className="mt-1 block w-full rounded-lg bg-[#0f1117] border-solid border-white/10 p-2 text-[#e7e9ee]"
    //               placeholder="Short summary or caption for the image"
    //             />
    //             <p className="text-xs text-[#6b7380] mt-1">
    //               This short summary will accompany the image in campaigns.
    //             </p>
    //           </div>
    //         )}
    //       </div>

    //       {/* preview */}
    //       <div>
    //         <h4 className="font-medium mb-2 text-[#e7e9ee]">Preview</h4>
    //         <div className="flex gap-4 flex-wrap">
    //           {["iOS Preview", "Android Preview"].map((label) => (
    //             <div
    //               key={label}
    //               className="bg-[#0f1117] p-3 rounded-lg border border-white/10 w-48 text-center"
    //             >
    //               <p className="text-sm font-semibold text-[#9aa3b2] mb-2">
    //                 {label}
    //               </p>
    //               <div className="flex flex-col items-center">
    //                 <div className="w-full h-28 bg-[#0b0d12] rounded-md overflow-hidden border border-white/10 flex items-center justify-center">
    //                   {previewUrl && !imageLoadError ? (
    //                     <img
    //                       src={previewUrl}
    //                       alt="preview"
    //                       onLoad={() => setImageLoaded(true)}
    //                       onError={() => setImageLoadError(true)}
    //                       className="max-h-full max-w-full object-contain"
    //                     />
    //                   ) : (
    //                     <div className="w-full h-full flex items-center justify-center text-[#6b7380] text-xs">
    //                       {imageFile ? "Unable to load image" : "No image"}
    //                     </div>
    //                   )}
    //                 </div>

    //                 <div className="mt-2 w-full text-left">
    //                   {/* Show title above content in preview */}
    //                   <div
    //                     className="text-sm font-semibold text-[#e7e9ee]"
    //                     title={title || ""}
    //                   >
    //                     {title || "Notification Title"}
    //                   </div>

    //                   {/* show summary when image selected */}
    //                   {imageFile && (
    //                     <div
    //                       className="text-xs text-[#9aa3b2] mt-1"
    //                       title={summary || ""}
    //                     >
    //                       {summary || "Image summary"}
    //                     </div>
    //                   )}

    //                   <div
    //                     className="text-xs text-[#e7e9ee] leading-snug mt-1"
    //                     title={pushContent || "Notification Mock"}
    //                     style={{
    //                       display: "-webkit-box",
    //                       WebkitLineClamp: 3,
    //                       WebkitBoxOrient: "vertical",
    //                       overflow: "hidden",
    //                       textOverflow: "ellipsis",
    //                     }}
    //                   >
    //                     {pushContent && pushContent.trim().length > 0
    //                       ? pushContent
    //                       : "Notification Mock"}
    //                   </div>

    //                   <div className="mt-1 text-[11px] text-[#9aa3b2] flex items-center justify-between">
    //                     <span>
    //                       {imageLoaded && !imageLoadError
    //                         ? "Image OK"
    //                         : imageLoadError
    //                         ? "Image error"
    //                         : "No image"}
    //                     </span>
    //                     <span>
    //                       {sendGenderOnly === "all"
    //                         ? "All users"
    //                         : sendGenderOnly}
    //                     </span>
    //                   </div>
    //                 </div>
    //               </div>
    //             </div>
    //           ))}

    //           {/* small JSON preview */}
    //           {/* <div className="bg-[#071028] p-3 rounded-lg border border-white/5 w-full text-xs text-[#9aa3b2]">
    //             <div className="font-medium text-[#e7e9ee] mb-2">
    //               Payload Preview
    //             </div>
    //             <pre className="whitespace-pre-wrap break-words text-[12px]">
    //               {JSON.stringify(payloadPreview, null, 2)}
    //             </pre>
    //           </div> */}
    //         </div>
    //       </div>

    //       {errorMsg && <div className="text-sm text-red-400">{errorMsg}</div>}
    //       {successMsg && (
    //         <div className="text-sm text-green-400">{successMsg}</div>
    //       )}

    //       <div className="flex items-center gap-3">
    //         <button
    //           onClick={handleSend}
    //           disabled={sending}
    //           className={`py-2 px-6 rounded-lg font-semibold ${
    //             sending
    //               ? "bg-slate-700 text-slate-400"
    //               : "bg-sky-600 hover:bg-sky-700 text-white"
    //           }`}
    //         >
    //           {sending ? "Sending..." : "Send Campaign"}
    //         </button>
    //         <div className="text-xs text-[#9aa3b2]">
    //           Tip: campaigns appear in the table below after being created.
    //         </div>
    //       </div>
    //     </div>

    //     <div className="mt-6 bg-[#0b0d12]/40 border border-white/10 rounded-xl p-4 shadow">
    //       <h3 className="text-sm text-[#9aa3b2] font-semibold mb-3">
    //         Campaigns
    //       </h3>

    //       <div className="flex items-center justify-between mb-3 gap-4">
    //         <div className="flex items-center gap-2">
    //           <label className="text-xs text-[#9aa3b2]">Page size</label>
    //           <select
    //             value={pageSize}
    //             onChange={(e) => {
    //               setPageSize(Number(e.target.value));
    //               setPage(1);
    //             }}
    //             className="bg-[#0f1117] border border-white/10 text-[#e7e9ee] rounded px-2 py-1 text-sm w-full"
    //           >
    //             {PAGE_SIZES.map((s) => (
    //               <option key={s} value={s}>
    //                 {s}
    //               </option>
    //             ))}
    //           </select>
    //         </div>

    //         <div className="text-xs text-[#9aa3b2]">
    //           Total: {totalCampaigns}
    //         </div>
    //       </div>

    //       <div className="overflow-auto">
    //         <table className="w-full text-sm border-collapse">
    //           <thead>
    //             <tr className="text-[#9aa3b2] text-xs uppercase">
    //               <th className="p-2 text-left">Title</th>
    //               <th className="p-2 text-left">Summary</th>
    //               <th className="p-2 text-left">Content</th>
    //               <th className="p-2 text-left">Scheduled At</th>
    //               <th className="p-2 text-left">Gender</th>
    //               <th className="p-2 text-left">Image</th>
    //               <th className="p-2 text-left">Status</th>
    //               <th className="p-2 text-left">Created</th>
    //               <th className="p-2 text-left">Created by</th>
    //               <th className="p-2 text-left">Delivered Count</th>
    //               <th className="p-2 text-left">Failed Count</th>
    //               <th className="p-2 text-left">Reciepent Count</th>
    //             </tr>
    //           </thead>
    //           <tbody>
    //             {loadingCampaigns ? (
    //               <tr>
    //                 <td colSpan={9} className="p-4 text-center text-[#9aa3b2]">
    //                   Loading...
    //                 </td>
    //               </tr>
    //             ) : campaigns.length === 0 ? (
    //               <tr>
    //                 <td colSpan={9} className="p-4 text-center text-[#9aa3b2]">
    //                   No campaigns
    //                 </td>
    //               </tr>
    //             ) : (
    //               campaigns.map((c, i) => {
    //                 const ctitle = c.title ?? "";
    //                 const csummary = c.summaryText ?? "";
    //                 const content = c.body ?? "";
    //                 const sched = c.createdAt ?? null;
    //                 const gender = c.targetGender;
    //                 const image = c.image ?? null;
    //                 const status =
    //                   c.status ??
    //                   (sched
    //                     ? new Date(sched) > new Date()
    //                       ? "Scheduled"
    //                       : "Sent"
    //                     : "Draft");
    //                 const created = c.createdAt ?? null;

    //                 return (
    //                   <tr key={i} className="hover:bg-white/5 text-[#e7e9ee]">
    //                     <td className="p-2 align-top max-w-xs">
    //                       <div className="text-sm" title={ctitle}>
    //                         {ctitle.length > 40
    //                           ? ctitle.slice(0, 40) + "…"
    //                           : ctitle}
    //                       </div>
    //                     </td>

    //                     <td className="p-2 align-top max-w-xs">
    //                       <div className="text-sm" title={csummary}>
    //                         {csummary.length > 40
    //                           ? csummary.slice(0, 40) + "…"
    //                           : csummary || "-"}
    //                       </div>
    //                     </td>

    //                     <td className="p-2 align-top max-w-xs">
    //                       <div className="text-sm" title={content}>
    //                         {content.length > 80
    //                           ? content.slice(0, 80) + "…"
    //                           : content}
    //                       </div>
    //                     </td>
    //                     <td className="p-2 align-top">
    //                       {formatDatetime(sched)}
    //                     </td>
    //                     <td className="p-2 align-top">
    //                       {gender === null ? "All" : String(gender)}
    //                     </td>
    //                     <td className="p-2 align-top">
    //                       {image ? (
    //                         <img
    //                           src={image}
    //                           alt="thumb"
    //                           className="max-h-12 rounded-md border border-white/5"
    //                         />
    //                       ) : (
    //                         "-"
    //                       )}
    //                     </td>
    //                     <td className="p-2 align-top">
    //                       <span
    //                         className={`px-2 py-1 rounded-full text-xs font-semibold ${
    //                           status?.toString().toLowerCase().includes("sent")
    //                             ? "bg-green-500/10 text-green-300 border border-green-500/30"
    //                             : status
    //                                 ?.toString()
    //                                 .toLowerCase()
    //                                 .includes("sched")
    //                             ? "bg-yellow-500/10 text-yellow-300 border border-yellow-500/30"
    //                             : "bg-slate-700/20 text-slate-200 border border-white/10"
    //                         }`}
    //                       >
    //                         {String(status)}
    //                       </span>
    //                     </td>
    //                     <td className="p-2 align-top">
    //                       {formatDatetime(created)}
    //                     </td>
    //                     <td className="p-2 align-top">
    //                       {c.createdBy ? c.createdBy.name : "System"}
    //                     </td>
    //                     <td className="p-2 align-top">
    //                       {c.deliveredCount ?? ""}
    //                     </td>
    //                     <td className="p-2 align-top">{c.failedCount ?? ""}</td>
    //                     <td className="p-2 align-top">
    //                       {c.recipientsCount ?? ""}
    //                     </td>
    //                   </tr>
    //                 );
    //               })
    //             )}
    //           </tbody>
    //         </table>
    //       </div>

    //       <div className="flex items-center justify-between mt-4 gap-4">
    //         {/* Left: Prev, numbered pages, Next */}
    //         <div className="flex items-center gap-2">
    //           <button
    //             onClick={() => goToPage(page - 1)}
    //             disabled={page <= 1 || loadingCampaigns}
    //             className="px-3 py-1 rounded bg-transparent border border-white/10 text-[#9aa3b2] disabled:opacity-40"
    //           >
    //             Prev
    //           </button>

    //           <div className="flex items-center gap-1">
    //             {(() => {
    //               const start = Math.max(1, page - 2);
    //               const end = Math.min(totalPages, page + 2);
    //               return Array.from(
    //                 { length: end - start + 1 },
    //                 (_, i) => start + i
    //               ).map((p) => (
    //                 <button
    //                   key={p}
    //                   onClick={() => goToPage(p)}
    //                   disabled={loadingCampaigns}
    //                   className={`px-2 py-1 rounded ${
    //                     p === page
    //                       ? "bg-white/10 text-white"
    //                       : "text-[#9aa3b2] hover:bg-white/5"
    //                   }`}
    //                 >
    //                   {p}
    //                 </button>
    //               ));
    //             })()}
    //           </div>

    //           <button
    //             onClick={() => goToPage(page + 1)}
    //             disabled={page >= totalPages || loadingCampaigns}
    //             className="px-3 py-1 rounded bg-transparent border border-white/10 text-[#9aa3b2] disabled:opacity-40"
    //           >
    //             Next
    //           </button>
    //         </div>

    //         {/* Center: small page info */}
    //         <div className="text-xs text-[#9aa3b2]">
    //           Page {page} of {totalPages}
    //         </div>

    //         {/* Right: Load more (append) */}
           
    //       </div>

    //       {campaignsError && (
    //         <div className="text-sm text-red-400 mt-2">{campaignsError}</div>
    //       )}
    //     </div>
    //   </div>
    // </section>
  );
};

export default NotificationAndCampaign;
