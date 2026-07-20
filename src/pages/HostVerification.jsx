/* eslint-disable react/prop-types */
import axios from "axios";
import { useEffect, useState } from "react";
import { BaseUrl } from "../BaseUrl";
import toast from "react-hot-toast";
import { CircularProgress } from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import UserCallStats from "./UserCallStats";
import AttendanceReportDashboard from "./AttendanceReportDashboard";
import SaturdayUserEarnings from "./SaturdayUserEarnings";
import AdminChatViewer from "./AdminChatViewer";
import BankDetailsEditor from "../Components/BankDetailsEditor";
import LanguageEditor from "../Components/LanguageEditor";
import { read, utils } from "xlsx";
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

export default function HostVerification() {
  const userDetails = JSON.parse(
    localStorage.getItem("LiveStreamAdminDetails"),
  );
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [genderFilter, setGenderFilter] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const savedState = sessionStorage.getItem("hostVerificationState");
  const parsedState = savedState ? JSON.parse(savedState) : null;

  const [hostType, setHostType] = useState(
    parsedState?.hostType || "unverified",
  );
  const [startDate, setStartDate] = useState("");
  // Pagination state
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const languages = [
    "English",
    "Malayalam",
    "Tamil",
    "Hindi",
    "Kannada",
    "Telugu",
    "Gujarati",
    "Bengali",
    "Marathi",
    "Punjabi",
    "Odia",
    "Urdu",
  ];

  const [selectedLanguage, setSelectedLanguage] = useState("");
  const [languageCounts, setLanguageCounts] = useState(0);
  // const [currentPage, setCurrentPage] = useState(1);
  // const usersPerPage = 25;

  // const filteredUsers = users;

  // // Pagination calculations
  // const indexOfLastUser = currentPage * usersPerPage;
  // const indexOfFirstUser = indexOfLastUser - usersPerPage;
  // const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

  // const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
  // const pageNumbers = [];
  // for (let i = 1; i <= totalPages; i++) {
  //   pageNumbers.push(i);
  // }

  // const paginate = (pageNumber) => setCurrentPage(pageNumber);

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
  function getData(count, from, lang) {
    const url = lang
      ? `${BaseUrl.baseurl}/admin/get-host-list-language?skip=${count}&language=${lang}`
      : hostType === "verified"
        ? `${BaseUrl.baseurl}/admin/get-verified-host?skip=${count}`
        : hostType === "unverified"
          ? `${BaseUrl.baseurl}/admin/get-all-unverified-users-list/${count}`
          : hostType === "suspended"
            ? `${BaseUrl.baseurl}/admin/get-suspended-host?skip=${count}`
            : `${BaseUrl.baseurl}/admin/get-all-enquired-users-list/${count}`;

    if (from === "next") setLoadingMore(true);
    else setLoading(true);

    axios
      .get(url)
      .then((res) => {
        if (res.data.status && res.data.data.length > 0) {
          if (lang) {
            setLanguageCounts(res.data?.totalUsers);
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
          if (selectedLanguage) {
            getData(users.length, "next", selectedLanguage);
          } else {
            getData(users.length, "next");
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, [users, hasMore, loadingMore]);
  const [savedScroll, setSavedScroll] = useState(null);
  useEffect(() => {
    const savedState = sessionStorage.getItem("hostVerificationState");

    if (savedState) {
      const parsed = JSON.parse(savedState);

      // restore only matching tab
      if (parsed.hostType === hostType) {
        setUsers(parsed.users || []);
        setHasMore(parsed.hasMore ?? true);

        if (parsed.selectedUser) {
          setSelectedUser(parsed.selectedUser);
        }

        if (parsed.scrollY) {
          setSavedScroll(parsed.scrollY);
        }

        setLoading(false);

        sessionStorage.removeItem("hostVerificationState");

        return;
      }
    }

    // normal api load
    setLoading(true);
    setUsers([]);
    setHasMore(true);

    getData(0, "update");
  }, [hostType]);
  useEffect(() => {
    if (savedScroll !== null && users.length > 0) {
      requestAnimationFrame(() => {
        window.scrollTo({
          top: savedScroll,
          behavior: "instant",
        });
      });
    }
  }, [users, savedScroll]);
  // useEffect(() => {
  //   setLoading(true);
  //   setUsers([]);
  //   setHasMore(true);
  //   getData(0, "update");
  // }, [hostType]);

  // useEffect(() => {
  //   getData(users.length, "next");
  // }, []);
  const savePageState = (user = null) => {
    sessionStorage.setItem(
      "hostVerificationState",
      JSON.stringify({
        users,
        hostType,
        hasMore,
        scrollY: window.scrollY,
        selectedUser: user || selectedUser,
      }),
    );
  };
  function searchUser(query, status, gender) {
    if (query === "" && status === "" && gender === "") {
      getData(0, "next");
    } else {
      axios
        .get(
          `${BaseUrl.baseurl}/admin/search-user?status=&gender=female&userId=${query}`,
        )
        .then((res) => {
          setUsers(res?.data?.data);
        })
        .catch((err) => {});
    }
  }
  function rejectHost(userId, onClose) {
    axios
      .put(`${BaseUrl.baseurl}/admin/suspend-user/${userId}`)
      .then((res) => {
        if (res.data.status) {
          toast.success(res.data.message);
          onClose();
          getData(users.length, "update");
        } else {
          toast.error(res.data.message);
        }
      })
      .catch((err) => {});
  }
  function unVerifyHost(userId, onClose) {
    axios
      .put(`${BaseUrl.baseurl}/admin/unverify-user/${userId}`)
      .then((res) => {
        if (res.data.status) {
          toast.success(res.data.message);
          onClose();
          getData(users.length, "update");
        } else {
          toast.error(res.data.message);
        }
      })
      .catch((err) => {});
  }
  function changeGender(userId, onClose) {
    axios
      .put(`${BaseUrl.baseurl}/admin/update-user-gender/${userId}`, {
        gender: "male",
      })
      .then((res) => {
        if (res.data.status) {
          toast.success(res.data.message);
          onClose();
          setConfirmGenderUser(null);
          getData(0, "update");
        } else {
          toast.error(res.data.message);
        }
      })
      .catch((err) => {});
  }
  function changeTopHost(userId, onClose) {
    axios
      .put(
        `${BaseUrl.baseurl}/admin/make-top-host/${userId._id}?status=${!userId.topHost}`,
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
  function acceptHost(userId, onClose) {
    axios
      .put(`${BaseUrl.baseurl}/admin/verify-user/${userId}`)
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
  const [confirmGenderUser, setConfirmGenderUser] = useState(null);
  const [confirmTopUser, setConfirmTopUser] = useState(null);

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
  const formatWhatsAppNumber = (phone) => {
    if (!phone) return null;

    // remove spaces, +, -, etc
    let clean = phone.replace(/\D/g, "");

    // if Indian number without country code
    if (clean.length === 10) {
      clean = "91" + clean;
    }

    return clean;
  };

  const openWhatsAppChat = (phone) => {
    const formatted = formatWhatsAppNumber(phone);
    if (!formatted) return;

    const url = `https://wa.me/${formatted}`;
    window.open(url, "_blank");
  };
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

  const openMail = (email) => {
    if (!email) return;

    const subject = encodeURIComponent("Support from Togilo");
    const body = encodeURIComponent(
      "Hello,\n\nWe are contacting you regarding your account.",
    );

    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

    if (isMobile) {
      window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
    } else {
      window.open(
        `https://mail.google.com/mail/?view=cm&fs=1&to=${email}&su=${subject}&body=${body}`,
        "_blank",
      );
    }
  };
  const [agents, setAgents] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState("");
  const [changingAgent, setChangingAgent] = useState(false);
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
  const handleChangeAgent = async (user) => {
    if (!selectedAgent) return alert("Select an agent");

    setChangingAgent(true);
    try {
      const data = await axios.post(
        `${BaseUrl.baseurl}/agent/change-agent?hostId=${user._id}&agentId=${selectedAgent}`,
      );

      toast.success("Agent updated successfully");
      setSelectedUser(data.data.data);
    } catch (err) {
      toast.error("Failed to change agent");
    } finally {
      setChangingAgent(false);
    }
  };
  const AdminImageUpload = ({
    imageKey,
    label,
    userId,
    apiUrl,
    multiple = false,
    existingImages = [],
    onSuccess,
    type,
  }) => {
    const [files, setFiles] = useState([]);
    const [previewUrls, setPreviewUrls] = useState([]);
    const [loading, setLoading] = useState(false);
    const [aadhaarNumber, setAadhaarNumber] = useState("");
    const [panNumber, setPanNumber] = useState("");
    const handleChange = (e) => {
      const selected = Array.from(e.target.files);
      if (selected.length > 2) {
        toast.error("Only 2 images allowed");
        return;
      }

      if (type === "aadhaar") {
        setFiles((prev) => [...prev, ...selected]);

        const previews = selected.map((file) => URL.createObjectURL(file));

        setPreviewUrls((prev) => [...prev, ...previews]);
      } else {
        setFiles(selected);

        const previews = selected.map((file) => URL.createObjectURL(file));

        setPreviewUrls(previews);
      }
    };

    const handleUpload = async () => {
      if (files.length === 0) {
        toast.error("Please select image");
        return;
      }
      if (type === "aadhaar") {
        if (!/^\d{12}$/.test(aadhaarNumber)) {
          toast.error("Aadhaar must be 12 digits");
          return;
        }
      }

      if (type === "pan") {
        if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(panNumber)) {
          toast.error("Invalid PAN format (ABCDE1234F)");
          return;
        }
      }

      const formData = new FormData();
      files.forEach((file) => {
        formData.append(imageKey, file);
      });
      if (type === "aadhaar") {
        formData.append("aadhaarNumber", aadhaarNumber);
      }

      if (type === "pan") {
        formData.append("panNumber", panNumber);
      }
      setLoading(true);
      try {
        const data = await axios.post(
          `${BaseUrl.baseurl}${apiUrl}/${userId}`,
          formData,
          { headers: { "Content-Type": "multipart/form-data" } },
        );

        toast.success(`${label} updated successfully`);
        setFiles([]);
        setPreviewUrls([]);
        setSelectedUser(data.data.data);
        // onSuccess?.();
      } catch {
        toast.error("Upload failed");
      } finally {
        setLoading(false);
      }
    };

    return (
      <div className="mt-4 border-t pt-4">
        {/* Existing Images */}
        {/* {existingImages?.length > 0 && (
        <div className="grid grid-cols-2 gap-3 mb-3">
          {existingImages.map(
            (img, idx) =>
              img && (
                <img
                  key={idx}
                  src={img}
                  className="h-28 w-full object-cover rounded-lg border"
                />
              )
          )}
        </div>
      )} */}

        {/* Preview Selected Images */}
        {previewUrls.length > 0 && (
          <div className="grid grid-cols-4 gap-3 mb-3">
            {previewUrls.map((url, idx) => (
              <img
                key={idx}
                src={url}
                className="h-48 w-full object-cover rounded-lg border border-indigo-500"
              />
            ))}
          </div>
        )}
        {type === "aadhaar" && (
          <input
            type="text"
            maxLength={12}
            value={aadhaarNumber}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, "");
              if (val.length <= 12) setAadhaarNumber(val);
            }}
            placeholder="Enter 12 digit Aadhaar"
            className="w-full mb-5 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500"
          />
        )}
        {type === "pan" && (
          <input
            type="text"
            maxLength={10}
            value={panNumber}
            onChange={(e) => {
              const val = e.target.value
                .toUpperCase()
                .replace(/[^A-Z0-9]/g, "");
              if (val.length <= 10) setPanNumber(val);
            }}
            placeholder="ABCDE1234F"
            className="w-full mb-5 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500"
          />
        )}
        <div className="flex items-center gap-3">
          <input
            type="file"
            multiple={multiple}
            accept="image/*"
            onChange={handleChange}
            className="text-xs"
          />

          <button
            onClick={handleUpload}
            disabled={loading}
            className={`px-3 py-1 text-xs rounded text-white ${
              loading ? "bg-slate-400" : "bg-indigo-600 hover:bg-indigo-700"
            }`}
          >
            {loading ? "Uploading..." : "Upload"}
          </button>
        </div>
      </div>
    );
  };
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
  function refreshUser() {
    closeProfilePopup();
    getData(0, "update");
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
  const [removeConfirmSeller, setRemoveConfirmSeller] = useState(null);
  const [makeEnquiry, setMakeEnquiry] = useState(null);

  function handleFIleChange(e) {
    const reader = new FileReader();
    reader.addEventListener("load", (e) => {
      const fileContent = e.target.result;
      const workbook = read(fileContent, { type: "binary" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const jsonData = utils.sheet_to_json(sheet, { header: 1 });
      const filteredArray = jsonData.filter((arr) => arr.length > 0);

      let vikki = [];
      const testsArrayCsv = filteredArray.slice(1);
      console.log("jabbesha", testsArrayCsv);
      for (let i = 0; i < testsArrayCsv.length; i++) {
        vikki.push({
          name: testsArrayCsv[i][0],
          description:
            testsArrayCsv[i][1] === undefined ? "" : testsArrayCsv[i][1],

          price: testsArrayCsv[i][2] || 0,
          offerPrice: testsArrayCsv[i][3] || 0,
          // image: testsArrayCsv[i][4] || "",
          // imageKey: testsArrayCsv[i][4] || "",
          type: testsArrayCsv[i][5] || "",
          tubeType: testsArrayCsv[i][6]
            ? testsArrayCsv[i][6].includes(",")
              ? testsArrayCsv[i][6].split(",")
              : [testsArrayCsv[i][6]]
            : [],
          subTest: testsArrayCsv[i][7]
            ? testsArrayCsv[i][7].includes(",")
              ? testsArrayCsv[i][7].split(",")
              : [testsArrayCsv[i][7]]
            : [],
          reportDelivery: testsArrayCsv[i][8] || "",
          labTest: testsArrayCsv[i][9],
          fasting: testsArrayCsv[i][10],
          popular: testsArrayCsv[i][11],
          featured: testsArrayCsv[i][12],
          isNew: testsArrayCsv[i][13],
          rating: 5,
          ratingCount: 20,
        });
      }
      console.log("jabbeshaa", vikki);
      axios
        .post(`https://api.khealth.in/health/create-bulk-health-test`, {
          tests: vikki,
        })
        .then((res) => {
          if (res.data.status) {
            toast.success(res.data.message);
          } else {
            toast.error(res.data.message);
          }
        })
        .catch((err) => {});
    });
    reader.readAsBinaryString(e.target.files[0]);
  }

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
            <div className="md:col-span-3 border rounded-xl px-4 py-2 bg-white shadow-sm">
              {(userDetails?.data?.role?.name === "Super Admin" ||
                userDetails?.data?.role?.name === "Special Manager") && (
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-slate-500">
                      Assign / Change Agent
                    </p>
                  </div>

                  <div className="flex gap-2 w-full md:w-auto">
                    <select
                      value={selectedAgent}
                      onChange={(e) => setSelectedAgent(e.target.value)}
                      className="flex-1 md:w-64 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="">Select Agent</option>
                      {agents.map((agent) => (
                        <option key={agent._id} value={agent._id}>
                          {agent.name} (ID: {agent.userId})
                        </option>
                      ))}
                    </select>

                    <button
                      onClick={() => {
                        handleChangeAgent(user);
                      }}
                      disabled={changingAgent}
                      className={`px-4 py-2 rounded-lg text-sm font-semibold text-white transition ${
                        changingAgent
                          ? "bg-slate-400"
                          : "bg-orange-600 hover:bg-orange-700"
                      }`}
                    >
                      {changingAgent ? "Updating..." : "Submit"}
                    </button>
                  </div>
                </div>
              )}
            </div>
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
                <div>
                  <p className="text-xs font-medium text-slate-500">Email</p>

                  <div className="flex items-center gap-3 flex-wrap">
                    <p className="text-sm text-slate-700">
                      {user.email || "Not provided"}
                    </p>

                    {user.email && (
                      <button
                        onClick={() => openMail(user.email)}
                        className="px-3 py-1.5 text-xs font-semibold rounded-lg 
                   bg-indigo-600 hover:bg-indigo-700 
                   text-white transition-all duration-200"
                      >
                        📧 Mail
                      </button>
                    )}
                  </div>
                </div>

                <div>
                  <p className="text-xs text-slate-500">Mobile Number</p>

                  <div className="flex items-center gap-3">
                    <p className="text-sm text-slate-700">
                      {user.phone || "Not provided"}
                    </p>

                    {user.phone && (
                      <button
                        onClick={() => openWhatsAppChat(user.phone)}
                        className="px-3 py-1.5 text-xs font-semibold rounded-lg 
                   bg-green-500 hover:bg-green-600 
                   text-white transition-all duration-200"
                      >
                        💬 Chat
                      </button>
                    )}
                  </div>
                </div>

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
                <div>
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
                <Detail label="Agent Name" value={user.agentId?.name || "-"} />
                <Detail label="Agent Id" value={user.agentId?.userId || "-"} />

                {user.bankDetails && (
                  <BankDetailsEditor user={user} onUpdated={refreshUser} />
                )}
              </div>
              <LanguageEditor user={user} onUpdated={refreshUser} />
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
                <AdminImageUpload
                  imageKey="aadhaarImages"
                  label="Aadhaar Images"
                  userId={user._id}
                  apiUrl="/user/upload-aadhaar"
                  multiple={true}
                  existingImages={[
                    user?.aadhaarDetails?.aadharFrontUrl,
                    user?.aadhaarDetails?.aadharBackUrl,
                  ]}
                  onSuccess={() => {
                    getData(0, "update");
                    closeProfilePopup();
                  }}
                  type="aadhaar"
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
                <AdminImageUpload
                  imageKey="panImages"
                  label="PAN Image"
                  userId={user._id}
                  apiUrl="/user/upload-pan"
                  multiple={false}
                  existingImages={[user?.panDetails?.panCardUrl]}
                  onSuccess={() => {
                    getData(0, "update");
                    closeProfilePopup();
                  }}
                  type="pan"
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
              <AdminImageUpload
                imageKey="photos"
                label="Profile Image"
                userId={user._id}
                apiUrl="/user/update-user-single-photos"
                multiple={false}
                existingImages={user.photos?.length ? user.photos : []}
                onSuccess={() => {
                  getData(0, "update");
                  closeProfilePopup();
                }}
                type="normal"
              />
            </div>

            {/* ===== CALL STATS ===== */}
            <UserCallStats userId={user._id} />
            <AttendanceReportDashboard userId={user._id} />
            <SaturdayUserEarnings userId={user.userId} />

            {/* ===== ACTIONS ===== */}
            <div className="flex flex-wrap gap-3 border-t pt-6">
              {!user.adminVerified ? (
                <ActionBtn
                  color="amber"
                  label="Accept Host"
                  onClick={() => {
                    acceptHost(user._id, onClose);
                  }}
                />
              ) : (
                <ActionBtn
                  color="amber"
                  label="Unverify Host"
                  onClick={() => {
                    unVerifyHost(user._id, onClose);
                  }}
                />
              )}

              <ActionBtn
                color="red"
                label="Suspend Host"
                onClick={() => {
                  rejectHost(user._id, onClose);
                }}
              />
              <ActionBtn
                color="red"
                label={
                  user.status === "blocked" ? "Unblock Host" : "Block Host"
                }
                onClick={() =>
                  user.status === "blocked"
                    ? unblockUser(user._id, onClose)
                    : blockUser(user._id, onClose)
                }
              />
              <ActionBtn
                color="orange"
                label="Change Gender"
                onClick={() => setConfirmGenderUser(user)}
              />
              {user.adminVerified && (
                <ActionBtn
                  color="purple"
                  label={`${user.topHost ? "Remove Top Host" : "Make Top Host"}`}
                  onClick={() => setConfirmTopUser(user)}
                />
              )}
              <button
                onClick={() => setRemoveConfirmSeller(user)}
                className="px-3 py-1 text-xs rounded-lg bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500 hover:text-white transition"
              >
                Make Online
              </button>
              {!user.enquiry && (
                <button
                  onClick={() => setMakeEnquiry(user)}
                  className="px-3 py-1 text-xs rounded-lg bg-blue-500/20 text-blue-400 border border-blue-500/30 hover:bg-blue-500 hover:text-white transition"
                >
                  Enquired
                </button>
              )}
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

  const handleRemoveSeller = async (userId) => {
    try {
      setLoading(true);

      const res = await axios.put(
        `${BaseUrl.baseurl}/admin/make-host-online/${userId}`,
      );

      if (res.data.status) {
        toast.success(res.data.message);
      } else {
        toast.error(res.data.message);
      }
    } catch {
      toast.error("Network error");
    } finally {
      setLoading(false);
    }
  };
  const handleMakeEnquired = async (userId) => {
    try {
      setLoading(true);

      const res = await axios.put(
        `${BaseUrl.baseurl}/admin/make-host-enquiry/${userId}`,
      );

      if (res.data.status) {
        setSelectedUser(null);
        toast.success(res.data.message);
      } else {
        toast.error(res.data.message);
      }
    } catch {
      toast.error("Network error");
    } finally {
      setLoading(false);
    }
  };
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
            <div className="flex flex-wrap items-center gap-4 mb-4 ">
              <input
                id="user-search"
                type="number"
                onWheel={(e) => e.currentTarget.blur()}
                placeholder="Search by userId"
                // value={searchTerm}
                onChange={(e) => {
                  searchUser(e.target.value, statusFilter, genderFilter);
                  setHostType("");
                  setSearchTerm(e.target.value);
                }}
                className="flex-1 min-w-[200px] bg-[#0f1320] text-white border border-[#2d3748] rounded-lg py-2 px-4  focus:outline-none focus:ring-2 focus:ring-indigo-600"
                // className=" bg-slate-50 border border-slate-300 rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />

              <div className=" items-center gap-3 grid lg:grid-cols-4 sm:grid-cols-4">
                <button
                  onClick={() => {
                    setSelectedLanguage("");
                    setHostType("unverified");
                  }}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                    hostType === "unverified"
                      ? "bg-indigo-600 text-white"
                      : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                  }`}
                >
                  Unverified
                </button>

                <button
                  onClick={() => {
                    setSelectedLanguage("");
                    setHostType("verified");
                  }}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                    hostType === "verified"
                      ? "bg-indigo-600 text-white"
                      : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                  }`}
                >
                  Verified
                </button>
                <button
                  onClick={() => {
                    setSelectedLanguage("");
                    setHostType("suspended");
                  }}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                    hostType === "suspended"
                      ? "bg-indigo-600 text-white"
                      : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                  }`}
                >
                  Suspended
                </button>
                <button
                  onClick={() => {
                    setSelectedLanguage("");
                    setHostType("enquired");
                  }}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                    hostType === "enquired"
                      ? "bg-indigo-600 text-white"
                      : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                  }`}
                >
                  Enquired
                </button>
              </div>

              <button
                onClick={() => {
                  navigate("/view-rejected-calls");
                }}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition bg-purple-500 text-white`}
              >
                Rejected Calls
              </button>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-12 gap-3 my-5 ">
              {languages.map((lang) => (
                <div
                  key={lang}
                  onClick={() => {
                    getData(0, "update", lang);
                    setHostType("");
                    setSelectedLanguage(lang);
                  }}
                  className={`
        cursor-pointer rounded-2xl px-4 py-3 border transition-all
        ${
          selectedLanguage === lang
            ? "border-indigo-500 bg-indigo-500/20"
            : "border-slate-700 bg-slate-800/50 hover:border-slate-500"
        }
      `}
                >
                  <div className="text-sm font-semibold text-white">{lang}</div>

                  <div className="text-xs text-slate-400 mt-1">
                    {selectedLanguage === lang ? languageCounts || 0 : "--"}{" "}
                    Hosts
                  </div>
                </div>
              ))}
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
                    {hostType === "unverified" || hostType === "enquired" ? (
                      <>
                        <th scope="col" className="px-6 py-3">
                          Photo Selfie
                        </th>
                        <th scope="col" className="px-6 py-3">
                          Adhar
                        </th>
                        <th scope="col" className="px-6 py-3">
                          PAN
                        </th>
                        <th scope="col" className="px-6 py-3">
                          Video
                        </th>
                      </>
                    ) : (
                      <>
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
                      </>
                    )}
                    <th scope="col" className="px-6 py-3">
                      Bank Account
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Agent
                    </th>

                    <th scope="col" className="px-6 py-3">
                      Actions
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
                        {hostType === "unverified" ||
                        hostType === "enquired" ? (
                          <>
                            <td className="px-6 py-4 whitespace-nowrap text-[#e7e9ee]">
                              {user.photoSelfie?.url ? (
                                <span className="inline-flex items-center gap-2 rounded-full border border-green-500/30 bg-green-500/10 px-4 py-2 text-sm font-bold text-green-400">
                                  <BadgeCheck size={16} />
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-bold text-red-400">
                                  <ShieldX size={16} />
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-[#e7e9ee]">
                              {user.aadhaarDetails?.aadharFrontUrl ? (
                                <span className="inline-flex items-center gap-2 rounded-full border border-green-500/30 bg-green-500/10 px-4 py-2 text-sm font-bold text-green-400">
                                  <BadgeCheck size={16} />
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-bold text-red-400">
                                  <ShieldX size={16} />
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-[#e7e9ee]">
                              {user.panDetails?.panCardUrl ? (
                                <span className="inline-flex items-center gap-2 rounded-full border border-green-500/30 bg-green-500/10 px-4 py-2 text-sm font-bold text-green-400">
                                  <BadgeCheck size={16} />
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-bold text-red-400">
                                  <ShieldX size={16} />
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {user.videoSelfie?.url ? (
                                <span className="inline-flex items-center gap-2 rounded-full border border-green-500/30 bg-green-500/10 px-4 py-2 text-sm font-bold text-green-400">
                                  <BadgeCheck size={16} />
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-bold text-red-400">
                                  <ShieldX size={16} />
                                </span>
                              )}
                            </td>
                          </>
                        ) : (
                          <>
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
                          </>
                        )}
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
                        <td className="px-6 py-4 whitespace-nowrap text-[#e7e9ee]">
                          {user.agentId ? user.agentId.name : "---"}
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap">
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

            {/* Pagination Controls */}
            {/* <div className="mt-4 flex justify-between items-center text-sm text-slate-600 overflow-x-auto">
              <div className="min-w-fit">
                Showing {indexOfFirstUser + 1} to{" "}
                {Math.min(indexOfLastUser, filteredUsers.length)} of{" "}
                {filteredUsers.length} users
              </div>
              <div className="flex space-x-2 text-black">
                <button
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-2 rounded-lg text-sm font-semibold bg-purple-600 hover:bg-purple-700"
                >
                  Previous
                </button>
                {pageNumbers.map((number) => (
                  <button
                    key={number}
                    onClick={() => paginate(number)}
                    className={`py-2 px-4 rounded-lg ${
                      currentPage === number
                        ? "text-sm font-semibold bg-purple-600 hover:bg-purple-700 text "
                        : "bg-slate-100 hover:bg-slate-200"
                    } border border-slate-300`}
                  >
                    {number}
                  </button>
                ))}
                <button
                  onClick={() => {
                    paginate(currentPage + 1);
                  }}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 rounded-lg text-sm font-semibold bg-purple-600 hover:bg-purple-700"
                >
                  Next
                </button>
                <button
                  onClick={() => {
                    getData(users.length, "next");
                  }}
                  className="px-3 py-2 rounded-lg text-sm font-semibold bg-purple-600 hover:bg-purple-700"
                >
                  More
                </button>
              </div>
            </div> */}
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

        {/* User Profile Popup */}
      </div>
      <UserProfilePopup user={selectedUser} onClose={closeProfilePopup} />
      <UserPhotoPopup user={selectedPhoto} onClose={closePhotoPopup} />
      <ConfirmModal
        open={!!confirmGenderUser}
        title="Change Gender?"
        description="Are you sure you want to change this user's gender? This action may affect profile visibility and analytics."
        confirmText="Yes, Change"
        cancelText="No"
        onCancel={() => setConfirmGenderUser(null)}
        onConfirm={() => {
          changeGender(confirmGenderUser._id, closeProfilePopup);
          setConfirmGenderUser(null);
        }}
      />
      <ConfirmModal
        open={!!confirmTopUser}
        title={`${confirmTopUser?.topHost ? "Remove Top Host" : "Make Top Host"}?`}
        description={`Are you sure you want to change this user to ${confirmTopUser?.topHost ? "Remove Top Host" : "Make Top Host"}? This action may affect profile visibility and analytics.`}
        confirmText={`Yes, ${confirmTopUser?.topHost ? "Remove" : "Make"}`}
        cancelText="No"
        onCancel={() => setConfirmTopUser(null)}
        onConfirm={() => {
          changeTopHost(confirmTopUser, closeProfilePopup);
          setConfirmTopUser(null);
        }}
      />
      {removeConfirmSeller && (
        <div className="fixed  h-[100vh] inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-[#11151f] border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="text-center space-y-4">
              <div className="text-4xl">⚠️</div>

              <h3 className="text-lg font-semibold text-white">
                Make host Online
              </h3>

              <p className="text-sm text-[#9aa3b2]">
                Are you sure you want to make host online
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
                    await handleRemoveSeller(removeConfirmSeller._id);
                    setRemoveConfirmSeller(null);
                  }}
                  className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-semibold"
                >
                  Yes, Make online
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {makeEnquiry && (
        <div className="fixed  h-[100vh] inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-[#11151f] border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="text-center space-y-4">
              <div className="text-4xl">⚠️</div>

              <h3 className="text-lg font-semibold text-white">
                Make host Enquiry
              </h3>

              <p className="text-sm text-[#9aa3b2]">
                Are you sure you want to make host Enquiried
              </p>

              <p className="font-bold text-red-400">
                {makeEnquiry.name} (ID: {makeEnquiry.userId})
              </p>

              <p className="text-xs text-[#9aa3b2]">
                This will cannot be undone.
              </p>

              <div className="flex gap-4 justify-center pt-4">
                <button
                  onClick={() => setMakeEnquiry(null)}
                  className="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white text-sm"
                >
                  Cancel
                </button>

                <button
                  onClick={async () => {
                    await handleMakeEnquired(makeEnquiry._id);
                    setMakeEnquiry(null);
                  }}
                  className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-semibold"
                >
                  Yes, Make Enquired
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
const format = (num) => num?.toLocaleString("en-IN") || "0";
