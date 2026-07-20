import axios from "axios";
import { useEffect, useState } from "react";
import { BaseUrl } from "../BaseUrl";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import { CircularProgress } from "@mui/material";
import UserCallStats from "./UserCallStats";
import AttendanceReportDashboard from "./AttendanceReportDashboard";
import { BadgeCheck, ShieldMinus, ShieldPlus, ShieldX } from "lucide-react";
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
function calculateAge(isoString) {
  const birthDate = new Date(isoString);
  const today = new Date();

  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  const dayDiff = today.getDate() - birthDate.getDate();

  if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
    age--;
  }

  return age;
}

export default function AgentHostDetails() {
  const userDetails = JSON.parse(
    localStorage.getItem("LiveStreamAdminDetails"),
  );
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [genderFilter, setGenderFilter] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [savedScroll, setSavedScroll] = useState(null);
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 25;

  const filteredUsers = users;

  // Pagination calculations
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const openProfilePopup = (user) => {
    setSelectedUser(user);
  };

  const closeProfilePopup = () => {
    setSelectedUser(null);
  };
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const openPhotoPopup = (user) => {
    setSelectedPhoto(user);
  };

  const closePhotoPopup = () => {
    setSelectedPhoto(null);
  };
  function getData(count, from) {
    axios
      .get(`${BaseUrl.baseurl}/agent/get-hosts-agent/${id}?skip=${count}`)
      .then((res) => {
        if (res.data.status) {
          if (res.data.data.length !== 0) {
            if (from === "update") {
              setUsers(res.data.data);
            } else {
              setUsers([...users, ...res.data.data]);
            }
          } else {
            toast.error("No more data");
          }
        } else {
          console.log("error no more data");
          toast.error("No more data");
        }
        setLoading(false);
      })
      .catch((err) => {});
  }
  const savePageState = (user = null) => {
    sessionStorage.setItem(
      "agentHostDetailsState",
      JSON.stringify({
        users,
        currentPage,
        scrollY: window.scrollY,
        selectedUser: user || selectedUser,
      }),
    );
  };
  useEffect(() => {
    const savedState = sessionStorage.getItem("agentHostDetailsState");

    if (savedState) {
      const parsed = JSON.parse(savedState);

      setUsers(parsed.users || []);
      setCurrentPage(parsed.currentPage || 1);

      if (parsed.selectedUser) {
        setSelectedUser(parsed.selectedUser);
      }

      if (parsed.scrollY) {
        setSavedScroll(parsed.scrollY);
      }

      setLoading(false);

      sessionStorage.removeItem("agentHostDetailsState");

      return;
    }

    getData(0, "update");
  }, []);
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
              <button
                onClick={() => {
                  savePageState(user);
                  navigate(`/user-payout/${user._id}`);
                }}
                className="px-4 py-2 rounded-lg bg-fuchsia-600 hover:bg-fuchsia-700 text-white text-sm font-semibold"
              >
                Payout
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
              {/* <button
                onClick={() => navigate(`/Transaction-History/${user._id}`)}
                className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold"
              >
                Transactions
              </button> */}
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
              {user.bankDetails && (
                <div className="md:col-span-3 mt-4 border rounded-xl p-4 bg-slate-50">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-md font-semibold text-slate-800">
                      🏦 Bank Details
                    </h4>
                    <div className="flex gap-2">
                      <span
                        className={`px-3 py-1 text-xs font-semibold rounded-full ${
                          user.bankDetails.isVerified
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-600"
                        }`}
                      >
                        {user.bankDetails.isVerified
                          ? "Verified"
                          : "Not Verified"}
                      </span>
                      {user.adminVerified && !user.bankDetails.isVerified && (
                        <span
                          onClick={() => reInitiateBank(user._id)}
                          className={`cursor-pointer px-3 py-1 text-xs font-semibold rounded-full bg-violet-100 text-violet-700`}
                        >
                          Re-initiate
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <InfoRow label="Account Holder">
                      {user.bankDetails.accountHolderName || "-"}
                    </InfoRow>

                    <InfoRow label="Bank Name">
                      {user.bankDetails.bankName || "-"}
                    </InfoRow>

                    <InfoRow label="Account Number">
                      {user.bankDetails.accountNumber || "-"}
                    </InfoRow>

                    <InfoRow label="SWIFT Code">
                      {user.bankDetails.swiftCode || "-"}
                    </InfoRow>

                    <InfoRow label="Branch">
                      {user.bankDetails.branchName || "-"}
                    </InfoRow>

                    <InfoRow label="Country">
                      {user.bankDetails.country || "-"}
                    </InfoRow>

                    <InfoRow label="Currency">
                      {user.bankDetails.currency || "-"}
                    </InfoRow>
                    <InfoRow label="Cashfree Benificiary Id">
                      {user.bankDetails.beneficiaryId || "-"}
                    </InfoRow>
                    <InfoRow label="Rejected reason">
                      {user.bankDetails.rejectedReason || "-"}
                    </InfoRow>
                  </div>
                </div>
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
                    src={p.url?.startsWith("http") ? p.url : `https://${p.url}`}
                    onClick={() => openPhotoPopup(p.url)}
                    className="h-40 w-full object-cover rounded-lg cursor-pointer hover:scale-105 transition"
                  />
                ))}
              </div>
            </div>

            {/* ===== CALL STATS ===== */}
            <UserCallStats userId={user._id} />
            <AttendanceReportDashboard userId={user._id} />
            {/* ===== ACTIONS ===== */}
          </div>
        </div>
      </div>
    );
  };
  const InfoRow = ({ label, children }) => (
    <div>
      <p className="text-xs text-slate-500">{label}</p>
      <p className="font-medium text-slate-800">{children}</p>
    </div>
  );
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

  const ActionBtn = ({ label, onClick, color = "slate" }) => {
    const colors = {
      slate: "bg-slate-600 hover:bg-slate-700",
      amber: "bg-amber-500 hover:bg-amber-600",
      red: "bg-red-600 hover:bg-red-700",
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
                src={img?.startsWith("http") ? img : `https://${img}`}
                onClick={() =>
                  openPhotoPopup(
                    img?.startsWith("http") ? img : `https://${img}`,
                  )
                }
                className="h-28 w-28 object-cover rounded-lg cursor-pointer hover:scale-105 transition"
              />
            ),
        )}
      </div>
    </div>
  );
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
  return (
    <>
      <div className=" flex-1 bg-slate-800/20 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4 shadow-xl min-h-screen">
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
            <div className="flex flex-wrap items-center gap-4 mb-4">
              <button
                onClick={() => {
                  navigate(-1);
                }}
                className="px-3 py-2 rounded-lg text-sm font-semibold bg-purple-600 hover:bg-purple-700"
              >
                Back
              </button>
              <h3 className="text-lg font-semibold text-[#e7e9ee]">Hosts</h3>
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
                      Age
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Location
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Coins
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Status
                    </th>

                    <th scope="col" className="px-6 py-3">
                      Bank Account
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-[radial-gradient(1200px_800px_at_10%_-10%,#1a1f33_0%,#0b0d12_60%)] divide-y divide-slate-200">
                  {currentUsers.map((user) => {
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
                            <div className="w-10 h-10 ">
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
                            {/* <div className="w-10 h-10 rounded-full bg-sky-100 text-sky-800 flex items-center justify-center text-xl font-bold mr-4">
                              <span className="text-sky-600">
                                {firstInitial}
                              </span>
                              <span className="text-indigo-600">
                                {lastInitial}
                              </span>
                            </div> */}
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
                          {calculateAge(user.dateOfBirth)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-[#e7e9ee]">
                          {user.city}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-[#e7e9ee]">
                          {format(user.coins)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                              user.status,
                            )}`}
                          >
                            {user.status}
                          </span>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap text-[#e7e9ee] ">
                          <div className="flex gap-3">
                            <div>
                              {" "}
                              {user.bankDetails?.accountNumber ? (
                                <span className="inline-flex items-center gap-2 rounded-full border border-green-500/30 bg-green-500/10 px-4 py-2 text-sm font-bold text-green-400">
                                  <ShieldPlus size={16} />
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-bold text-red-400">
                                  <ShieldMinus size={16} />
                                </span>
                              )}
                            </div>
                            {user.bankDetails?.accountNumber && (
                              <div>
                                {user.bankDetails?.isVerified ? (
                                  <span className="inline-flex items-center gap-2 rounded-full border border-green-500/30 bg-green-500/10 px-4 py-2 text-sm font-bold text-green-400">
                                    <BadgeCheck size={16} />
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-bold text-red-400">
                                    <ShieldX size={16} />
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => openProfilePopup(user)}
                            className="text-sky-600 hover:text-sky-900 font-medium"
                          >
                            Details
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="mt-4 flex flex-col sm:flex-row sm:justify-between sm:items-center text-sm text-slate-600 space-y-3 sm:space-y-0 overflow-x-auto">
              {/* Showing count */}
              <div className="min-w-fit text-center sm:text-left">
                Showing {indexOfFirstUser + 1} to{" "}
                {Math.min(indexOfLastUser, filteredUsers.length)} of{" "}
                {filteredUsers.length} users
              </div>

              {/* Pagination buttons */}
              <div className="flex flex-wrap justify-center sm:justify-end items-center gap-2 text-black">
                <button
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-2 rounded-lg text-sm font-semibold bg-purple-600  hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>

                {pageNumbers.map((number) => (
                  <button
                    key={number}
                    onClick={() => paginate(number)}
                    className={`py-2 px-4 rounded-lg border border-slate-300 ${
                      currentPage === number
                        ? "text-sm font-semibold bg-purple-600  hover:bg-purple-700"
                        : "bg-slate-100 hover:bg-slate-200"
                    }`}
                  >
                    {number}
                  </button>
                ))}

                <button
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 rounded-lg text-sm font-semibold bg-purple-600  hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>

                <button
                  onClick={() => getData(users.length - 1, "next")}
                  className="px-3 py-2 rounded-lg text-sm font-semibold bg-purple-600  hover:bg-purple-700"
                >
                  More
                </button>
              </div>
            </div>
          </div>
        )}
        {/* User Profile Popup */}
      </div>
      <UserProfilePopup user={selectedUser} onClose={closeProfilePopup} />
      <UserPhotoPopup user={selectedPhoto} onClose={closePhotoPopup} />
    </>
  );
}
const format = (num) => num?.toLocaleString("en-IN") || "0";
