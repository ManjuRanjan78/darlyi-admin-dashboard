/* eslint-disable react/prop-types */
import axios from "axios";
import { useEffect, useState } from "react";
import { BaseUrl } from "../BaseUrl";
import { useParams, useNavigate } from "react-router-dom";
import { CircularProgress } from "@mui/material";
import toast from "react-hot-toast";
import UserCallStats from "./UserCallStats";
import LanguageEditor from "../Components/LanguageEditor";
import { RefreshCcw } from "lucide-react";
import AttendanceReportDashboard from "./AttendanceReportDashboard";
const getStatusColor = (status) => {
  switch (status) {
    case "active":
      return "bg-green-100 text-green-800";
    case "suspended":
      return "bg-yellow-100 text-yellow-800";
    case "blocked":
      return "bg-red-100 text-red-800";
    default:
      return "bg-slate-100 text-slate-800";
  }
};
const getCallStatusBadge = (status) => {
  switch (status?.toLowerCase()) {
    case "online":
      return (
        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/15 text-green-400 border border-green-500/30 text-xs font-semibold">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
          Online
        </span>
      );

    case "offline":
      return (
        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-500/15 text-slate-300 border border-slate-500/30 text-xs font-semibold">
          <span className="w-2 h-2 rounded-full bg-slate-400"></span>
          Offline
        </span>
      );

    case "busy":
      return (
        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/15 text-red-400 border border-red-500/30 text-xs font-semibold">
          <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse"></span>
          Busy
        </span>
      );

    default:
      return (
        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/15 text-yellow-400 border border-yellow-500/30 text-xs font-semibold">
          <span className="w-2 h-2 rounded-full bg-yellow-400"></span>
          Unknown
        </span>
      );
  }
};
function formatDateTime(isoString) {
  const date = new Date(isoString);

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-indexed
  const year = date.getFullYear();

  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, "0");

  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'

  const formattedTime = `${day}-${month}-${year} ${hours}:${minutes} ${ampm}`;

  return formattedTime;
}

export default function OnlineUserComponant() {
  const userDetails = JSON.parse(
    localStorage.getItem("LiveStreamAdminDetails"),
  );
  const [savedScroll, setSavedScroll] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const { type } = useParams();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [removeConfirmSeller, setRemoveConfirmSeller] = useState(null);
  // Pagination state
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [confirmDeviceBan, setConfirmDeviceBan] = useState(null);
  function getData(count, from) {
    const url =
      type === "host"
        ? `${BaseUrl.baseurl}/admin/get-live-host-list?skip=${count}`
        : type === "user"
          ? `${BaseUrl.baseurl}/admin/get-live-user-list?skip=${count}`
          : `${BaseUrl.baseurl}/admin/get-live-agent-list?skip=${count}`;

    if (from === "next") setLoadingMore(true);
    else setLoading(true);

    axios
      .get(url)
      .then((res) => {
        if (res.data.status && res.data.data.length > 0) {
          if (res.data.data.length < 10) {
            setHasMore(false);
          }
          if (from === "update") {
            setUsers(res.data.data);
          } else {
            setUsers((prev) => {
              const merged = [...prev, ...res.data.data];

              return Array.from(
                new Map(merged.map((item) => [item._id, item])).values(),
              );
            });
          }
        } else {
          setHasMore(false); // 🚀 stop future scroll calls
        }
      })
      .catch(() => {})
      .finally(() => {
        setLoading(false);
        setLoadingMore(false);
      });
  }
  useEffect(() => {
    const handleScroll = () => {
      if (!hasMore || loadingMore) return;

      const scrollTop = window.scrollY;
      const windowHeight = window.innerHeight;
      const fullHeight = document.documentElement.scrollHeight;

      // when user is near bottom (100px before end)
      if (scrollTop + windowHeight >= fullHeight - 100) {
        if (!loading) {
          getData(users.length, "next");
        }
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, [users, hasMore, loadingMore]);
  useEffect(() => {
    const savedState = sessionStorage.getItem("onlineUserState");

    if (savedState) {
      const parsed = JSON.parse(savedState);

      setUsers(parsed.users || []);
      setHasMore(parsed.hasMore ?? true);

      if (parsed.selectedUser) {
        setSelectedUser(parsed.selectedUser);
      }

      if (parsed.scrollY) {
        setSavedScroll(parsed.scrollY);
      }

      setLoading(false);

      sessionStorage.removeItem("onlineUserState");
    } else {
      setLoading(true);
      setUsers([]);
      setHasMore(true);
      getData(0, "update");
    }
  }, [type]);
  useEffect(() => {
    if (savedScroll !== null && users.length > 0) {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          window.scrollTo({
            top: savedScroll,
            behavior: "instant",
          });
        });
      });
    }
  }, [users, savedScroll]);
  const savePageState = (user = null) => {
    sessionStorage.setItem(
      "onlineUserState",
      JSON.stringify({
        users,
        hasMore,
        scrollY: window.scrollY,
        selectedUser: user || selectedUser,
      }),
    );
  };
  function calculateAge(birthDate) {
    const birthDateObj = new Date(birthDate);
    const today = new Date();

    let years = today.getFullYear() - birthDateObj.getFullYear();
    let months = today.getMonth() - birthDateObj.getMonth();
    let days = today.getDate() - birthDateObj.getDate();

    // Adjust age if the birth month or day has not yet occurred this year
    if (months < 0 || (months === 0 && days < 0)) {
      years--;
    }

    return years;
  }
  const handleRemoveSeller = async (userId) => {
    try {
      setLoading(true);

      const res = await axios.put(
        `${BaseUrl.baseurl}/admin/make-host-offline/${userId}`,
      );

      if (res.data.status) {
        toast.success("Host offline successfully");
        getData(0, "update");
      } else {
        toast.error("Failed to make offline");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setLoading(false);
    }
  };
  const openProfilePopup = (user) => {
    setSelectedUser(user);
  };
  function searchUser(query) {
    axios
      .get(`${BaseUrl.baseurl}/admin/search-online-host?userId=${query}`)
      .then((res) => {
        setUsers(res?.data?.data);
      })
      .catch((err) => {});
  }
  function refreshUser() {
    closeProfilePopup();
    getData(0, "update");
  }
  const [selectedUser, setSelectedUser] = useState(null);

  const UserProfilePopup = ({ user, onClose }) => {
    if (!user) return null;

    return (
      <div
        className="fixed inset-0 z-50 bg-slate-900/70 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-xl shadow-2xl w-full max-w-6xl h-[95vh] overflow-y-auto"
        >
          {/* ================= HEADER ================= */}
          <div className="sticky top-0 bg-white z-10 border-b px-6 py-4 flex flex-wrap gap-3 items-center justify-between">
            {user.userId !== 56 && (
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => {
                    savePageState(user);
                    navigate(`/User-Calls/${user.gender}/${user._id}`);
                  }}
                  className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold"
                >
                  Calls
                </button>
                {(userDetails?.data?.role?.name === "Super Admin" ||
                  userDetails?.data?.role?.name === "Special Manager") && (
                  <button
                    onClick={() => {
                      savePageState(user);
                      navigate(`/user-chat/${user._id}`);
                    }}
                    className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold"
                  >
                    Messages
                  </button>
                )}
                <button
                  onClick={() => {
                    savePageState(user);
                    navigate(`/Coins-History/${user._id}`);
                  }}
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold"
                >
                  Coins
                </button>
                {user.gender !== "female" && (
                  <button
                    onClick={() => {
                      savePageState(user);
                      navigate(`/Transaction-History/${user._id}`);
                    }}
                    className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold"
                  >
                    Transactions
                  </button>
                )}
                <button
                  onClick={() => {
                    savePageState(user);
                    navigate(`/Reward-List/${user._id}`);
                  }}
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold"
                >
                  Rewards
                </button>
              </div>
            )}
            <div>
              <button
                onClick={onClose}
                className="text-3xl leading-none text-slate-400 hover:text-slate-700"
              >
                &times;
              </button>
            </div>
          </div>

          {/* ================= CONTENT ================= */}
          <div className="p-6 space-y-8">
            {/* ===== SUMMARY CARDS ===== */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Status", value: user.status },
                { label: "Gender", value: user.gender || "-" },
                { label: "Followers", value: user.followers?.length || 0 },
                { label: "Following", value: user.following?.length || 0 },
              ].map((item, i) => (
                <div key={i} className="border rounded-lg p-4 bg-slate-50">
                  <p className="text-xs text-slate-500">{item.label}</p>
                  <p className="text-lg font-semibold text-slate-900">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>

            {/* ===== BASIC DETAILS ===== */}
            <div className="bg-slate-50 rounded-xl p-6">
              <h4 className="text-lg font-semibold mb-4 text-slate-900">
                Basic Information
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Detail label="Name" value={user.name} />
                <Detail label="Email" value={user.email} />
                <Detail label="Phone" value={user.phone || "Not provided"} />
                <Detail label="User ID" value={user.userId} />
                <Detail
                  label="Registered On"
                  value={formatDateTime(user.createdAt)}
                />
                <Detail
                  label="Last Active"
                  value={formatDateTime(user.lastActive)}
                />
                <Detail
                  label="Age"
                  value={
                    user.dateOfBirth
                      ? calculateAge(user.dateOfBirth)
                      : "Not specified"
                  }
                />
                <Detail
                  label="Location"
                  value={`${user.area || "-"} ${user.city || ""}`}
                />
                <Detail label="UPI ID" value={user.upiDetails?.upiId || "-"} />
              </div>
              {user.gender === "female" && (
                <LanguageEditor user={user} onUpdated={refreshUser} />
              )}
            </div>

            {/* ===== STATS ===== */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Stat label="Likes Received" value={user.likesReceived} />
              <Stat label="Gifts Received" value={user.giftsReceived} />
              <Stat label="Watch Time" value={user.totalWatchTime} />
              <Stat label="Interests" value={user.interests?.length || 0} />
            </div>

            {/* ===== INTEREST TAGS ===== */}
            <div>
              <h4 className="text-sm font-semibold text-slate-500 mb-2">
                Interests
              </h4>
              <div className="flex flex-wrap gap-2">
                {user.interests?.map((i, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 text-xs rounded-full bg-sky-100 text-sky-700 font-medium"
                  >
                    {i.label}
                  </span>
                ))}
              </div>
            </div>

            {/* ===== MEDIA / VERIFICATION ===== */}
            {user.gender === "female" && (
              <div className="bg-slate-50 rounded-xl p-6 space-y-6">
                <h4 className="text-lg font-semibold text-slate-900">
                  Verification
                </h4>

                <VerificationBlock
                  title="Photo Selfie Verification"
                  verified={user?.photoSelfie?.isVerified}
                  images={user?.photoSelfie?.url ? [user.photoSelfie.url] : []}
                  emptyText="No selfie uploaded"
                />

                <VerificationBlock
                  title="Aadhaar Verification"
                  verified={user?.aadhaarDetails?.isVerified}
                  extraInfo={[
                    {
                      label: "Aadhaar Number",
                      value: user?.aadhaarDetails?.aadharNumber || "—",
                    },
                  ]}
                  images={[
                    user?.aadhaarDetails?.aadharFrontUrl,
                    user?.aadhaarDetails?.aadharBackUrl,
                  ]}
                />

                <VerificationBlock
                  title="PAN Verification"
                  verified={user?.panDetails?.isVerified}
                  extraInfo={[
                    {
                      label: "PAN Number",
                      value: user?.panDetails?.panNumber || "—",
                    },
                  ]}
                  images={[user?.panDetails?.panCardUrl]}
                />
                <div className="bg-white border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-slate-700">
                      Video Selfie Verification
                    </p>
                    <span
                      className={`text-xs font-semibold px-2 py-1 rounded-full ${
                        user?.videoSelfie?.isVerified
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-600"
                      }`}
                    >
                      {user?.videoSelfie?.isVerified
                        ? "Verified"
                        : "Unverified"}
                    </span>
                  </div>

                  {user?.videoSelfie?.url ? (
                    <video
                      src={
                        user.videoSelfie.url?.startsWith("http")
                          ? user.videoSelfie.url
                          : `https://${user.videoSelfie.url}`
                      }
                      controls
                      muted
                      playsInline
                      className="w-1/4 h-48 object-cover rounded-lg border"
                    />
                  ) : (
                    <p className="text-xs text-slate-400">No video uploaded</p>
                  )}
                </div>
              </div>
            )}

            {/* ===== PROFILE IMAGES ===== */}
            <div>
              <h4 className="text-lg font-semibold mb-3">Profile Images</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {user.photos?.map((p, idx) => (
                  <img
                    key={idx}
                    onClick={() => openPhotoPopup(p.url)}
                    src={p.url?.startsWith("http") ? p.url : `https://${p.url}`}
                    className="h-40 w-full object-cover rounded-lg cursor-pointer hover:scale-105 transition"
                  />
                ))}
              </div>
            </div>
            <UserCallStats userId={user._id} />
            {user.gender === "female" && (
              <AttendanceReportDashboard userId={user._id} />
            )}

            <div className="flex flex-wrap gap-3 border-t pt-6">
              <ActionBtn
                color="fuchsia"
                label={`${user.deviceBanned ? "Remove Device Ban" : "Device Ban"}`}
                onClick={() => setConfirmDeviceBan(user)}
              />
            </div>
          </div>
        </div>
      </div>
    );
  };
  const ActionBtn = ({ label, onClick, color = "slate" }) => {
    const colors = {
      fuchsia: "bg-fuchsia-600 hover:bg-fuchsia-700",
    };
    return (
      <button
        onClick={onClick}
        className={`${colors[color]} text-white px-4 py-2 rounded-lg text-sm font-semibold`}
      >
        {label}
      </button>
    );
  };
  const VerificationBlock = ({
    title,
    verified,
    images = [],
    extraInfo = [],
  }) => (
    <div className="bg-white border rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-800">{title}</p>
        <span
          className={`text-xs font-semibold px-2 py-1 rounded-full ${
            verified ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"
          }`}
        >
          {verified ? "Verified" : "Unverified"}
        </span>
      </div>

      {/* Extra text info (Aadhaar / PAN numbers) */}
      {extraInfo.map((info, idx) => (
        <div key={idx} className="text-sm text-slate-600">
          <span className="font-medium">{info.label}:</span>{" "}
          <span className="tracking-wide">{info.value}</span>
        </div>
      ))}

      {/* Images */}
      <div className="flex gap-3 flex-wrap">
        {images.map(
          (img, i) =>
            img && (
              <img
                key={i}
                onClick={() =>
                  openPhotoPopup(
                    img?.startsWith("http") ? img : `https://${img}`,
                  )
                }
                src={img?.startsWith("http") ? img : `https://${img}`}
                className="h-28 w-28 object-cover rounded-lg cursor-pointer hover:scale-105 transition"
              />
            ),
        )}
      </div>
    </div>
  );
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const openPhotoPopup = (user) => {
    setSelectedPhoto(user);
  };

  const closePhotoPopup = () => {
    setSelectedPhoto(null);
  };
  const UserPhotoPopup = ({ photo, onClose }) => {
    if (!selectedPhoto) return null;

    return (
      <div
        className="fixed inset-0 z-[60]  bg-slate-900 bg-opacity-70 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <div
          className="bg-white rounded-lg p-8 shadow-2xl max-w-4xl w-full transform transition-all duration-300 scale-100  overflow-y-auto h-full"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center border-b pb-3 mb-3">
            <div>
              <h3 className="text-2xl font-bold text-slate-900  ">Photo</h3>
            </div>
            <button
              onClick={onClose}
              className="text-slate-500 hover:text-slate-800 text-3xl leading-none"
            >
              &times;
            </button>
          </div>

          <div className="">
            <img
              src={selectedPhoto}
              alt=""
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </div>
    );
  };
  const Detail = ({ label, value }) => (
    <div>
      <p className="text-xs text-slate-500">{label}</p>
      <p className="text-sm font-medium text-slate-900 break-all">{value}</p>
    </div>
  );

  const Stat = ({ label, value }) => (
    <div className="bg-white border rounded-lg p-4">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="text-xl font-bold text-slate-900">{value}</p>
    </div>
  );

  const closeProfilePopup = () => {
    setSelectedUser(null);
  };

  const timeAgo = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

  function getTimeAgo(dateString) {
    const date = new Date(dateString);
    const now = new Date();

    const seconds = Math.floor((now - date) / 1000); // correct direction

    const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

    const intervals = {
      year: 31536000,
      month: 2592000,
      day: 86400,
      hour: 3600,
      minute: 60,
      second: 1,
    };

    for (let unit in intervals) {
      const value = Math.floor(seconds / intervals[unit]);

      if (value >= 1) {
        return rtf.format(-value, unit);
      }
    }

    return "just now";
  }
  const ConfirmModal = ({
    open,
    title = "Are you sure?",
    description,
    confirmText = "Confirm",
    cancelText = "Cancel",
    onConfirm,
    onCancel,
    showMinutesInput = false,
  }) => {
    const [minutes, setMinutes] = useState("");
    useEffect(() => {
      if (open) setMinutes("");
    }, [open]);
    if (!open) return null;

    return (
      <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
        <div className="bg-[#0b0d12] w-full max-w-md rounded-xl border border-white/10 shadow-xl p-6">
          <h3 className="text-lg font-semibold text-[#e7e9ee] mb-2">{title}</h3>
          {description && (
            <p className="text-sm text-[#9aa3b2] mb-6">{description}</p>
          )}
          {showMinutesInput && (
            <div className="mb-6">
              <label className="block text-sm text-[#e7e9ee] mb-2">
                Ban Duration (Hours)
              </label>

              <input
                type="number"
                value={minutes}
                onChange={(e) => setMinutes(e.target.value)}
                placeholder="Enter hours"
                className="w-full px-3 py-2 rounded-lg bg-[#11141a] border border-white/10 text-white outline-none"
              />
            </div>
          )}

          <div className="flex justify-end gap-3">
            <button
              onClick={onCancel}
              className="px-4 py-2 rounded-lg border border-white/10 text-[#e7e9ee] hover:bg-white/5"
            >
              {cancelText}
            </button>
            <button
              onClick={() => onConfirm(minutes)}
              className="px-4 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-semibold"
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    );
  };
  function changeDeviceBan(userId, onClose, minutes) {
    axios
      .put(
        `${BaseUrl.baseurl}/admin/${userId.deviceBanned ? `unban-user/${userId.userId}` : `device-ban-user?userId=${userId.userId}&minutes=${minutes * 60}`}`,
      )
      .then((res) => {
        if (res.data.status) {
          toast.success(res.data.message);
          onClose();
          setConfirmDeviceBan(null);
          getData(0, "update");
        } else {
          toast.error(res.data.message);
        }
      })
      .catch((err) => {});
  }
  return (
    <>
      <div className="relative flex-1 bg-slate-800/20 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4 shadow-xl min-h-screen">
        {loading ? (
          <div className="flex items-center justify-center py-44">
            <CircularProgress
              size={45}
              style={{
                color: "white",
              }}
            />
          </div>
        ) : (
          <div className=" p-4 rounded-xl shadow-md">
            <div className="pb-4 flex items-center justify-between">
              <button
                onClick={() => navigate(-1)}
                className="px-3 py-2 rounded-lg text-sm font-semibold bg-purple-600 hover:bg-purple-700"
              >
                Back
              </button>
              <button
                onClick={() => getData(0, "update")}
                className="px-3 py-2 rounded-lg text-sm font-semibold bg-purple-600 hover:bg-purple-700"
              >
                <RefreshCcw size={18} />
              </button>
              <div>
                {type === "host" && (
                  <input
                    id="user-search"
                    type="number"
                    onWheel={(e) => e.currentTarget.blur()}
                    placeholder="Search by userId"
                    // value={searchTerm}
                    onChange={(e) => {
                      searchUser(e.target.value);
                      setSearchTerm(e.target.value);
                    }}
                    className="flex-1 lg:min-w-[200px] w-[150px] bg-[#0f1320] text-white border border-[#2d3748] rounded-lg py-2 px-4  focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  />
                )}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-slate-500">
                <thead className="text-xs text-[#9aa3b2] uppercase bg-[radial-gradient(1200px_800px_at_10%_-10%,#1a1f33_0%,#0b0d12_60%)]">
                  <tr>
                    <th scope="col" className="px-6 py-3">
                      User
                    </th>
                    <th scope="col" className="px-6 py-3">
                      User Id
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Gender
                    </th>
                    <th scope="col" className="px-6 py-3">
                      App
                    </th>

                    <th scope="col" className="px-6 py-3">
                      Call Status
                    </th>

                    <th scope="col" className="px-6 py-3">
                      Coins
                    </th>

                    {type === "host" && (
                      <th scope="col" className="px-6 py-3">
                        Agent
                      </th>
                    )}
                    <th scope="col" className="px-6 py-3">
                      last Active
                    </th>
                    <th scope="col" className="px-6 py-3 text-center">
                      Action
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Language
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-[radial-gradient(1200px_800px_at_10%_-10%,#1a1f33_0%,#0b0d12_60%)] divide-y divide-slate-200">
                  {users.map((user) => {
                    const names = user?.name?.split(" ");
                    const firstInitial = names
                      ? names[0][0]?.toUpperCase()
                      : "";
                    const lastInitial = names
                      ? names?.length > 1
                        ? names?.slice(-1)[0][0]?.toUpperCase()
                        : ""
                      : "";
                    return (
                      <tr key={user._id} className="hover:bg-slate-600">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div className="w-10 h-10">
                              <img
                                referrerPolicy="no-referrer"
                                className="w-10 h-10 rounded-full flex items-center justify-center text-xl font-bold mr-4 object-cover"
                                src={
                                  user.photos[0]?.url?.startsWith("http")
                                    ? user.photos[0]?.url
                                    : `https://${user.photos[0]?.url}`
                                }
                              />
                            </div>

                            <div>
                              <div className="font-medium text-[#e7e9ee]">
                                {user.name}
                              </div>
                              <div className="text-slate-500">{user.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-[#e7e9ee]">
                          {user.userId}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-[#e7e9ee]">
                          {user.gender}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-[#e7e9ee]">
                          {user.currentApp}
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap text-[#e7e9ee]">
                          {getCallStatusBadge(user.callStatus)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-[#e7e9ee]">
                          {format(user.coins)}
                        </td>

                        {type === "host" && (
                          <td className="px-6 py-4 whitespace-nowrap text-[#e7e9ee]">
                            {user.agentId?.name}
                          </td>
                        )}
                        <td className="px-6 py-4 whitespace-nowrap text-white">
                          {getTimeAgo(user.lastSeen)}
                        </td>
                        <td className="p-2 flex gap-2 justify-center items-center  mt-4 ">
                          <button
                            onClick={() => setRemoveConfirmSeller(user)}
                            className="px-3 py-1 text-xs rounded-lg bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500 hover:text-white transition"
                          >
                            Make Offline
                          </button>
                          <button
                            onClick={() => openProfilePopup(user)}
                            className="text-sky-600 hover:text-sky-900 font-medium"
                          >
                            Details
                          </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-[#e7e9ee] ">
                          <div className="flex gap-1 items-center">
                            {user.language?.map((i, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-[1px] text-[11px] rounded-lg bg-sky-100 text-sky-700 font-medium"
                              >
                                {i.slice(0, 2)}
                              </span>
                            ))}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {loadingMore && (
              <div className="text-center py-6 text-purple-600 font-semibold">
                Loading more...
              </div>
            )}

            {!hasMore && (
              <div className="text-center py-6 text-slate-400 text-sm">
                No more users
              </div>
            )}
          </div>
        )}
      </div>
      {removeConfirmSeller && (
        <div className="fixed  h-[100vh] inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-[#11151f] border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="text-center space-y-4">
              <div className="text-4xl">⚠️</div>

              <h3 className="text-lg font-semibold text-white">
                Make host Offline
              </h3>

              <p className="text-sm text-[#9aa3b2]">
                Are you sure you want to make host offline
              </p>

              <p className="font-bold text-red-400">
                {removeConfirmSeller.name} (ID: {removeConfirmSeller.userId})
              </p>

              <p className="text-xs text-[#9aa3b2]">
                This will cannot be undone.
              </p>

              <div className="flex gap-4 justify-center pt-4">
                <button
                  onClick={() => setRemoveConfirmSeller(null)}
                  className="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white text-sm"
                >
                  Cancel
                </button>

                <button
                  onClick={async () => {
                    await handleRemoveSeller(removeConfirmSeller.userId);
                    setRemoveConfirmSeller(null);
                  }}
                  className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-semibold"
                >
                  Yes, Make offline
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      <UserProfilePopup user={selectedUser} onClose={closeProfilePopup} />
      <UserPhotoPopup user={selectedPhoto} onClose={closePhotoPopup} />
      <ConfirmModal
        open={!!confirmDeviceBan}
        title={`${confirmDeviceBan?.deviceBanned ? "Remove Device Ban" : "Make Device Ban"}?`}
        description={`Are you sure you want this user to ${confirmDeviceBan?.deviceBanned ? "Remove Device Ban" : "Make Device Ban"}? This action may affect profile visibility and analytics.`}
        confirmText={`Yes, ${confirmDeviceBan?.deviceBanned ? "Remove" : "Make"}`}
        cancelText="No"
        onCancel={() => setConfirmDeviceBan(null)}
        showMinutesInput={!confirmDeviceBan?.deviceBanned}
        onConfirm={(minutes) => {
          changeDeviceBan(confirmDeviceBan, closeProfilePopup, minutes);
          setConfirmDeviceBan(null);
        }}
      />
    </>
  );
}
const format = (num) => num?.toLocaleString("en-IN") || "0";
