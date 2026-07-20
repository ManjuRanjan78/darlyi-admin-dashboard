import axios from "axios";
import { useEffect, useState } from "react";
import { BaseUrl } from "../BaseUrl";
import toast from "react-hot-toast";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";
import { CircularProgress } from "@mui/material";
import { useNavigate } from "react-router-dom";
import UserCallStats from "./UserCallStats";
import SaturdayUserEarnings from "./SaturdayUserEarnings";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);
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

export default function AgencyOnboard() {
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const navigate = useNavigate();
  const userDetails = JSON.parse(
    localStorage.getItem("LiveStreamAdminDetails"),
  );
  const [confirmTopUser, setConfirmTopUser] = useState(null);
  const [confirmCompany, setConfirmCompany] = useState(null);
  const [users, setUsers] = useState([]);
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
  const savePageState = (user = null) => {
    sessionStorage.setItem(
      "agencyOnboardState",
      JSON.stringify({
        users,
        hasMore,
        currentPage,
        scrollY: window.scrollY,
        selectedUser: user || selectedUser,
      }),
    );
  };
  function getData(count, from) {
    if (!hasMore && from === "next") return;

    if (from === "next") setLoadingMore(true);
    else setLoading(true);

    const url = `${BaseUrl.baseurl}/admin/agencies?skip=${count}`;

    axios
      .get(url)
      .then((res) => {
        if (res.data.status && res.data.data.length > 0) {
          if (from === "update") {
            setUsers(res.data.data);
          } else {
            console.log("ressss settedddd", res.data.data);
            setUsers((prev) => [...prev, ...res.data.data]); // ✅ correct way
          }
        } else {
          setHasMore(false); // 🚀 stop future calls
        }
      })
      .catch(() => {})
      .finally(() => {
        setLoading(false);
        setLoadingMore(false);
      });
  }

  useEffect(() => {
    const savedState = sessionStorage.getItem("agencyOnboardState");

    if (savedState) {
      const parsed = JSON.parse(savedState);

      setUsers(parsed.users || []);
      setHasMore(parsed.hasMore ?? true);
      setCurrentPage(parsed.currentPage || 1);

      if (parsed.selectedUser) {
        setSelectedUser(parsed.selectedUser);
      }

      if (parsed.scrollY) {
        setSavedScroll(parsed.scrollY);
      }

      setLoading(false);

      sessionStorage.removeItem("agencyOnboardState");

      return;
    }

    setUsers([]);
    setHasMore(true);

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
  useEffect(() => {
    const handleScroll = () => {
      if (!hasMore || loadingMore) return;

      const scrollTop = window.scrollY;
      const windowHeight = window.innerHeight;
      const fullHeight = document.documentElement.scrollHeight;

      if (scrollTop + windowHeight >= fullHeight - 150) {
        if (!loading) {
          getData(users.length, "next");
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [users, hasMore, loadingMore]);

  function getAgentRevenue(agency) {
    setSelectedAgencydetails(agency);
    axios
      .get(`${BaseUrl.baseurl}/admin/search-user?userId=${agency.ownerId}`)
      .then((userRes) => {
        if (userRes.data.status && userRes.data.data.length > 0) {
          const ownerUser = userRes.data.data[0];
          axios
            .get(`${BaseUrl.baseurl}/admin/agent-revenue/${agency.ownerId}`)
            .then((res) => {
              if (res.data.success) {
                setSelectedAgency(res.data.earningsByWeek);
                openProfilePopup(ownerUser);
              } else {
                toast.error("something wrong");
              }
            })
            .catch(() => {});
        } else {
          toast.error("Failed to fetch owner details");
        }
      })
      .catch(() => {});
  }

  const [agencies, setAgencies] = useState([
    {
      id: "AG001",
      name: "GrowthX Media",
      owner: "Rahul Sharma",
      revenue: 120000,
    },
    { id: "AG002", name: "Pixel Boost", owner: "Aisha Khan", revenue: 80000 },
    {
      id: "AG003",
      name: "SkyReach Ads",
      owner: "Rohan Patel",
      revenue: 150000,
    },
  ]);
  const [selectedAgency, setSelectedAgency] = useState(agencies[0]);
  const [selectedAgencyDetails, setSelectedAgencydetails] = useState("");
  const chartData = selectedAgency
    ? {
        labels: ["W1", "W2", "W3", "W4"],
        datasets: [
          {
            label: "Revenue",
            data: [
              selectedAgency["week0"]?.totalCoins,
              selectedAgency["week1"]?.totalCoins,
              selectedAgency["week2"]?.totalCoins,
              selectedAgency["week3"]?.totalCoins,
            ],
            backgroundColor: "#6ee7b7",
          },
        ],
      }
    : null;

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
    },
    scales: {
      y: { beginAtZero: true },
    },
  };

  function suspendUser(userId, onClose) {
    axios
      .put(`${BaseUrl.baseurl}/admin/suspend-user/${userId}`)
      .then((res) => {
        if (res.data.status) {
          toast.success(res.data.message);
          onClose();
          getData(0, "update");
        } else {
          toast.error(res.data.message);
        }
      })
      .catch((err) => {});
  }
  function unSuspendUser(userId, onClose) {
    axios
      .put(`${BaseUrl.baseurl}/admin/activate-user/${userId}`)
      .then((res) => {
        if (res.data.status) {
          toast.success(res.data.message);

          onClose();
          getData(0, "update");
        } else {
          toast.error(res.data.message);
        }
      })
      .catch((err) => {});
  }
  function blockUser(userId, onClose) {
    axios
      .put(`${BaseUrl.baseurl}/admin/block-user/${userId}`)
      .then((res) => {
        if (res.data.status) {
          toast.success(res.data.message);

          onClose();
          getData(0, "update");
        } else {
          toast.error(res.data.message);
        }
      })
      .catch((err) => {});
  }
  function unblockUser(userId, onClose) {
    axios
      .put(`${BaseUrl.baseurl}/admin/unblock-user/${userId}`)
      .then((res) => {
        if (res.data.status) {
          toast.success(res.data.message);

          onClose();
          getData(0, "update");
        } else {
          toast.error(res.data.message);
        }
      })
      .catch((err) => {});
  }
  const reInitiateupi = async (userId) => {
    const ok = window.confirm("Are you sure you want to re initiate");
    if (!ok) return;
    try {
      const data = await axios.post(
        `${BaseUrl.baseurl}/user/reinitiate-upi-id/${userId}`,
      );

      toast.success(data.data.message);
    } catch (err) {
      toast.error("Failed to re initiate");
    } finally {
      closeProfilePopup();
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
      closeProfilePopup();
    }
  };
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
              <button
                onClick={() => {
                  savePageState(user);
                  navigate(`/Transaction-History/${user._id}`);
                }}
                className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold"
              >
                Transactions
              </button>
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
                {/* <Detail label="UPI ID" value={user.upiDetails?.upiId || "-"} /> */}
                <div className="">
                  <p className="text-xs text-slate-500">UPI ID</p>

                  <div className="flex items-center gap-3">
                    <p className="text-sm text-slate-700">
                      {user.upiDetails?.upiId || "-"}
                    </p>
                    {user.upiDetails?.upiId && (
                      <span
                        className={`px-3 py-1 text-xs font-semibold rounded-full ${
                          user.upiDetails.isVerified
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-600"
                        }`}
                      >
                        {user.upiDetails.isVerified
                          ? "Verified"
                          : "Not Verified"}
                      </span>
                    )}

                    {user.upiDetails?.upiId && user.adminVerified && (
                      <button
                        onClick={() => reInitiateupi(user._id)}
                        className="px-3 py-1.5 text-xs font-semibold rounded-lg 
                   bg-sky-500 hover:bg-sky-600 
                   text-white transition-all duration-200"
                      >
                        Re-initiate
                      </button>
                    )}
                  </div>
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
                        {user.adminVerified && (
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
            <SaturdayUserEarnings userId={user.userId} />
            <div className="bg-[#0b1220] w-full max-w-xl p-6 rounded-lg shadow-lg">
              <div className="mb-4">
                {console.log("printinhggg")}
                <Bar data={chartData} options={chartOptions} height={80} />
              </div>
            </div>

            {/* ===== ACTIONS ===== */}
            <div className="flex flex-wrap gap-3 border-t pt-6">
              {user.status === "active" && (
                <ActionBtn
                  color="amber"
                  label="Suspend User"
                  onClick={() => suspendUser(user._id, onClose)}
                />
              )}
              {user.status === "suspended" && (
                <ActionBtn
                  color="amber"
                  label="Un-Suspend User"
                  onClick={() => unSuspendUser(user._id, onClose)}
                />
              )}
              <ActionBtn
                color="red"
                label={
                  user.status === "blocked" ? "Unblock User" : "Block User"
                }
                onClick={() =>
                  user.status === "blocked"
                    ? unblockUser(user._id, onClose)
                    : blockUser(user._id, onClose)
                }
              />
              <ActionBtn
                color="orange"
                label="Remove Agency"
                onClick={() => setConfirmAgent(user)}
              />
              <ActionBtn
                color="purple"
                label={`${user.bestAgent ? "Remove Top Agent" : "Make Top Agent"}`}
                onClick={() => setConfirmTopUser(user)}
              />
              <ActionBtn
                color="yellow"
                label={`${user.company ? "Remove Company User" : "Make Company User"}`}
                onClick={() => setConfirmCompany(user)}
              />
            </div>
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
      orange: "bg-orange-600 hover:bg-orange-700",
      purple: "bg-purple-600 hover:bg-purple-700",
      yellow: "bg-yellow-600 hover:bg-yellow-700",
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
  const [form, setForm] = useState({
    name: "",
    owner: "",
    phone: "",
    id: "",
    plan: "Standard",
  });
  const [userData, setUserData] = useState("");
  const [formData, setFormData] = useState({
    agencyPhone: "",
  });
  const [showAgencyModal, setShowAgencyModal] = useState(false);
  const [agencyModalMode, setAgencyModalMode] = useState("create"); // "create" or "edit"
  const [agencyNameInput, setAgencyNameInput] = useState("");
  const [agencyCodeInput, setAgencyCodeInput] = useState("");

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!userData) {
      toast.error("Please Get the user");
      return;
    }

    if (userData.agent) {
      setAgencyModalMode("edit");
      setAgencyNameInput(userData.agency?.agencyName || "");
      setAgencyCodeInput(userData.agency?.agencyCode || "");
      setShowAgencyModal(true);
    } else {
      setAgencyModalMode("create");
      setAgencyNameInput("");
      setAgencyCodeInput("");
      setShowAgencyModal(true);
    }
  };

  const handleReset = () => {
    axios
      .get(
        `${BaseUrl.baseurl}/admin/search-user?userId=${formData.agencyPhone}`,
      )
      .then((res) => {
        if (res.data.data && res.data.data.length !== 0) {
          setUserData(res.data.data[0]);
        } else {
          toast.error("User not found");
        }
      })
      .catch((err) => {});
  };

  const handleAgencyModalSubmit = (e) => {
    e.preventDefault();
    if (agencyModalMode === "create") {
      axios
        .post(`${BaseUrl.baseurl}/admin/create-agency`, {
          ownerId: userData.id,
          agencyName: agencyNameInput,
          agencyCode: agencyCodeInput,
        })
        .then((res) => {
          if (res.data.success) {
            toast.success(res.data.message);
            setShowAgencyModal(false);
            handleReset();
            getData(0, "update");
          } else {
            toast.error(res.data.message || "Failed to create agency");
          }
        })
        .catch((err) => {
          toast.error(err.response?.data?.message || "Failed to create agency");
        });
    } else {
      axios
        .put(`${BaseUrl.baseurl}/admin/update-agency/${userData.agency?.id}`, {
          agencyName: agencyNameInput,
          agencyCode: agencyCodeInput,
        })
        .then((res) => {
          if (res.data.status) {
            toast.success(res.data.message);
            setShowAgencyModal(false);
            handleReset();
            getData(0, "update");
          } else {
            toast.error(res.data.message || "Failed to update agency");
          }
        })
        .catch((err) => {
          toast.error(err.response?.data?.message || "Failed to update agency");
        });
    }
  };
  const [confirmAgent, setConfirmAgent] = useState(null);
  const ConfirmModal = ({
    open,
    title = "Are you sure?",
    description,
    confirmText = "Confirm",
    cancelText = "Cancel",
    onConfirm,
    onCancel,
  }) => {
    if (!open) return null;

    return (
      <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
        <div className="bg-[#0b0d12] w-full max-w-md rounded-xl border border-white/10 shadow-xl p-6">
          <h3 className="text-lg font-semibold text-[#e7e9ee] mb-2">{title}</h3>
          {description && (
            <p className="text-sm text-[#9aa3b2] mb-6">{description}</p>
          )}

          <div className="flex justify-end gap-3">
            <button
              onClick={onCancel}
              className="px-4 py-2 rounded-lg border border-white/10 text-[#e7e9ee] hover:bg-white/5"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-semibold"
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    );
  };
  function removeAgency(agencyId, onClose) {
    axios
      .delete(`${BaseUrl.baseurl}/admin/agency/${agencyId}`)
      .then((res) => {
        if (res.data.status) {
          toast.success(res.data.message);
          onClose();
          setConfirmAgent(null);
          getData(0, "update");
        } else {
          toast.error(res.data.message);
        }
      })
      .catch((err) => {
        toast.error(err.response?.data?.message || "Failed to delete agency");
      });
  }
  function searchUser(query) {
    console.log("querrr", query);
    if (!query) {
      getData(0, "update");
    } else {
      axios
        .get(`${BaseUrl.baseurl}/admin/agencies?search=${query}`)
        .then((res) => {
          setUsers(res?.data?.data || []);
        })
        .catch((err) => {});
    }
  }

  function changebestAgent(userId, onClose) {
    axios
      .put(
        `${BaseUrl.baseurl}/admin/make-best-agency/${userId._id}?status=${!userId.bestAgent}`,
      )
      .then((res) => {
        if (res.data.status) {
          toast.success(res.data.message);
          onClose();
          setConfirmTopUser(null);
          getData(0, "update");
        } else {
          toast.error(res.data.message);
        }
      })
      .catch((err) => {});
  }
  function changeCompany(userId, onClose) {
    axios
      .put(
        `${BaseUrl.baseurl}/admin/make-company-user/${userId._id}?status=${!userId.company}`,
      )
      .then((res) => {
        if (res.data.status) {
          toast.success(res.data.message);
          onClose();
          setConfirmCompany(null);
          getData(0, "update");
        } else {
          toast.error(res.data.message);
        }
      })
      .catch((err) => {});
  }
  return (
    <>
      <div
        className={` flex-1 bg-slate-800/20 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4 shadow-xl min-h-screen`}
      >
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
            <div className="  mb-4 text-[#e6eef6]">
              <div className="  rounded-lg">
                <h2 className="font-bold text-lg mb-3">Agency Onboarding</h2>

                <form
                  onSubmit={handleSubmit}
                  onReset={handleReset}
                  className="space-y-4"
                >
                  {/* Input + Preview */}
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    {/* Input */}
                    <div className="flex-1">
                      <label className="block text-xs text-slate-400 mb-1">
                        Enter User ID
                      </label>
                      <input
                        id="agencyPhone"
                        placeholder="User Id"
                        required
                        value={formData.agencyPhone}
                        onChange={handleChange}
                        className="w-full p-2.5 rounded-lg border border-white/10 bg-[#0f1320] text-white placeholder-gray-400
              focus:outline-none focus:ring-2 focus:ring-emerald-400/70 focus:border-emerald-400/70 transition"
                      />
                    </div>

                    {/* User Preview Card */}
                    {userData && (
                      <div className="md:w-72">
                        <div className="flex items-center gap-3 bg-[#0f1320] border border-purple-500/30 rounded-lg p-3 shadow-md">
                          {/* Avatar */}
                          <div className="w-10 h-10 rounded-full bg-purple-600/20 text-purple-400 flex items-center justify-center font-bold text-lg">
                            {userData?.name?.[0]?.toUpperCase()}
                          </div>

                          {/* Info */}
                          <div className="flex-1">
                            <div className="text-sm font-semibold text-purple-300">
                              {userData.name}
                            </div>
                            <div className="text-xs text-slate-400">
                              {userData.city}
                            </div>
                            <div
                              className={`mt-1 inline-block text-[10px] px-2 py-0.5 rounded-full
                    ${
                      userData.agent
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-400/30"
                        : "bg-red-500/10 text-red-400 border border-red-400/30"
                    }`}
                            >
                              {userData.agent ? "Agent" : "Not an Agent"}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-4">
                    <button
                      type="submit"
                      className="px-6 py-2.5 rounded-xl text-emerald-400 font-semibold
      border border-emerald-400/40
      hover:bg-emerald-400/10 hover:shadow-[0_0_12px_rgba(52,211,153,0.5)]
      transition-all duration-200"
                    >
                      {userData && userData.agent ? "Edit Agency" : "Create Agency"}
                    </button>

                    <button
                      type="reset"
                      className="px-6 py-2.5 rounded-xl text-white/90 font-medium
      border border-white/20
      hover:bg-white/10 hover:shadow-[0_0_10px_rgba(255,255,255,0.3)]
      transition-all duration-200"
                    >
                      Get User
                    </button>
                  </div>
                </form>
              </div>
            </div>
            <div className="py-2">
              <input
                id="user-search"
                type="text"
                placeholder="Search by Agency Name or Code"
                onChange={(e) => {
                  searchUser(e.target.value);
                }}
                className="flex-1 min-w-[200px] bg-[#0f1320] text-white border border-[#2d3748] rounded-lg py-2 px-4  focus:outline-none focus:ring-2 focus:ring-indigo-600"
              />
            </div>
            <div className="flex flex-wrap items-center gap-4 mb-4">
              <h3 className="text-lg font-semibold text-[#e7e9ee]">
                All Agency
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-slate-500">
                <thead className="text-xs text-[#9aa3b2] uppercase bg-[radial-gradient(1200px_800px_at_10%_-10%,#1a1f33_0%,#0b0d12_60%)]">
                  <tr>
                    <th scope="col" className="px-6 py-3">
                      Agency Name / Code
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Owner Name
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Hosts (Total/Active/Online)
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Today's Revenue
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Total Revenue
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Wallet Balance
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Created At
                    </th>
                    <th scope="col" className="px-6 py-3 text-center">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-[radial-gradient(1200px_800px_at_10%_-10%,#1a1f33_0%,#0b0d12_60%)] divide-y divide-slate-200">
                  {users.map((user) => {
                    return (
                      <tr key={user._id} className="hover:bg-slate-600">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div>
                              <div className="font-medium text-[#e7e9ee]">
                                <span>{user.agencyName}</span>
                              </div>
                              <div className="text-slate-500">{user.agencyCode}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-[#e7e9ee]">
                          {user.owner}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-[#e7e9ee]">
                          {user.totalHosts} / {user.activeHosts} / {user.onlineHosts}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-[#e7e9ee]">
                          {format(user.todayRevenue)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-[#e7e9ee]">
                          {format(user.totalRevenue)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-[#e7e9ee]">
                          {format(user.walletBalance)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              user.status ? getStatusColor(user.status) : ""
                            }`}
                          >
                            {user.status ? user.status : "--"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-[#e7e9ee]">
                          {formatDateTime(user.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap ">
                          <div className="flex gap-2 items-center justify-center">
                            <button
                              onClick={() => {
                                getAgentRevenue(user);
                              }}
                              className="text-sky-600 hover:text-sky-900 font-medium"
                            >
                              Details
                            </button>
                            <button
                              onClick={() => {
                                savePageState(user);
                                navigate(`/Agent-Host-Details/${user._id}`);
                              }}
                              className="text-sky-600 hover:text-sky-900 font-medium"
                            >
                              Hosts
                            </button>
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
                No more agents
              </div>
            )}
          </div>
        )}
        {/* User Profile Popup */}
      </div>
      <UserProfilePopup user={selectedUser} onClose={closeProfilePopup} />
      <UserPhotoPopup user={selectedPhoto} onClose={closePhotoPopup} />
      <ConfirmModal
        open={!!confirmAgent}
        title="Remove Agency?"
        description="Are you sure you want to remove this agency? This action may affect profile visibility and analytics."
        confirmText="Yes, Change"
        cancelText="No"
        onCancel={() => setConfirmAgent(null)}
        onConfirm={() => {
          removeAgency(confirmAgent._id, closeProfilePopup);
          setConfirmAgent(null);
        }}
      />
      <ConfirmModal
        open={!!confirmTopUser}
        title={`${confirmTopUser?.bestAgent ? "Remove Top Agent" : "Make Top Agent"}?`}
        description={`Are you sure you want to change this user to ${confirmTopUser?.bestAgent ? "Remove Top Agent" : "Make Top Agent"}? This action may affect profile visibility and analytics.`}
        confirmText={`Yes, ${confirmTopUser?.bestAgent ? "Remove" : "Make"}`}
        cancelText="No"
        onCancel={() => setConfirmTopUser(null)}
        onConfirm={() => {
          changebestAgent(confirmTopUser, closeProfilePopup);
          setConfirmTopUser(null);
        }}
      />
      <ConfirmModal
        open={!!confirmCompany}
        title={`${confirmCompany?.company ? "Remove Company User" : "Make Company User"}?`}
        description={`Are you sure you want this user to ${confirmCompany?.company ? "Remove Company user" : "Make Company user"}? This action may affect profile visibility and analytics.`}
        confirmText={`Yes, ${confirmCompany?.company ? "Remove" : "Make"}`}
        cancelText="No"
        onCancel={() => setConfirmCompany(null)}
        onConfirm={() => {
          changeCompany(confirmCompany, closeProfilePopup);
          setConfirmCompany(null);
        }}
      />
      {showAgencyModal && (
        <div className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0b0d12] w-full max-w-md rounded-2xl border border-emerald-500/20 shadow-[0_0_25px_rgba(16,185,129,0.15)] p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-white">
                {agencyModalMode === "create" ? "Create New Agency" : "Edit Agency"}
              </h3>
              <button
                onClick={() => setShowAgencyModal(false)}
                className="text-slate-400 hover:text-white transition text-2xl font-bold font-sans"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleAgencyModalSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Owner User
                </label>
                <div className="p-2.5 rounded-lg bg-[#11131c] border border-white/5 text-slate-300 text-sm">
                  {userData.name} (ID: {userData.id})
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Agency Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Red Agency"
                  value={agencyNameInput}
                  onChange={(e) => setAgencyNameInput(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-white/10 bg-[#0f1320] text-white placeholder-gray-400
                    focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400/50 transition text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Agency Code
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. RED001 (Uppercase, no spaces)"
                  value={agencyCodeInput}
                  onChange={(e) => setAgencyCodeInput(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-white/10 bg-[#0f1320] text-white placeholder-gray-400
                    focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400/50 transition text-sm uppercase"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAgencyModal(false)}
                  className="px-4 py-2 rounded-lg border border-white/10 text-slate-300 hover:bg-white/5 transition text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-semibold shadow-md transition text-sm"
                >
                  {agencyModalMode === "create" ? "Create Agency" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
const format = (num) => num?.toLocaleString("en-IN") || "0";
