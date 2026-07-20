import axios from "axios";
import React, { useState, useEffect } from "react";
import { BaseUrl } from "../BaseUrl";
import toast from "react-hot-toast";
export default function ContentModeration() {
  const [filter, setFilter] = useState("all-pending");
  const [filteredItems, setFilteredItems] = useState([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [currentItem, setCurrentItem] = useState(null);
  const [content, setContent] = useState([]);
  const [profileData, setProfileData] = useState([]);
  const [reportData, setReportData] = useState([]);
 
  function getProfileData() {
    axios
      .get(`${BaseUrl.baseurl}/admin/get-verify-users-profile/0`)
      .then((res) => {
        if (res.data.status) {
          res.data.details.forEach((item) => {
            item.type = "ProfileUpdate";
          });
          setProfileData(res.data.details);
        } else {
          console.log("no");
        }
      })
      .catch((err) => {});
  }
  function getReportedData() {
    axios
      .get(`${BaseUrl.baseurl}/admin/get-all-reported-post/0`)
      .then((res) => {
        if (res.data.status) {
          res.data.details.forEach((item) => {
            item.type = "reported";
          });
          setReportData(res.data.details);
        } else {
          console.log("no");
        }
      })
      .catch((err) => {});
  }
  function callAllDatas() {
   
    getProfileData();
    getReportedData();
  }
  useEffect(() => {
    callAllDatas();
  }, []);
  useEffect(() => {
    let items = [];
    if (filter === "all-pending") {
      items = [...content, ...profileData, ...reportData];
    } else if (filter === "new-submissions") {
      items = content;
    } else if (filter === "profile-updates") {
      items = profileData;
    } else if (filter === "reported-content") {
      items = reportData;
    }

    setFilteredItems(items);
    setPendingCount([...content, ...profileData, ...reportData].length);
  }, [filter, content, profileData, reportData]);

  const approveItem = (photoId) => {
    console.log(`Approved:`, currentItem);
    if (currentItem.type === "new-submissions") {
      axios
        .post(`${BaseUrl.baseurl}/admin/verify-post/${currentItem._id}`)
        .then((res) => {
          if (res.data.status) {
            setCurrentItem(null);
           
            toast.success(res.data.message);
          } else {
            toast.error(res.data.message);
          }
        })
        .catch((err) => {});
    } else if (currentItem.type === "reported") {
      let data = { deletePost: false };
      axios
        .post(
          `${BaseUrl.baseurl}/admin/verify-post-report/${currentItem._id}/${photoId}`,
          data
        )
        .then((res) => {
          if (res.data.status) {
            setCurrentItem(null);
            getReportedData();
            toast.success(res.data.message);
          } else {
            toast.error(res.data.message);
          }
        })
        .catch((err) => {});
    } else if (currentItem.type === "ProfileUpdate") {
      axios
        .post(
          `${BaseUrl.baseurl}/admin/verify-user-profile-photo/${currentItem._id}/${photoId}`
        )
        .then((res) => {
          if (res.data.status) {
            setCurrentItem(null);
            getProfileData();
            toast.success(res.data.message);
          } else {
            toast.error(res.data.message);
          }
        })
        .catch((err) => {});
    }
  };
  const [open, setOpen] = useState(false);
  const [adminNotes, setAdminNotes] = useState("");
  const [photoId, setPhotoId] = useState("");
  const rejectItem = () => {
    setOpen(true);

    // console.log(`Rejected:`, currentItem);
  };
  const rejectContentPost = () => {
    if (currentItem.type === "new-submissions") {
      let data = {
        reason: adminNotes,
      };
      axios
        .post(`${BaseUrl.baseurl}/admin/reject-post/${currentItem._id}`, data)
        .then((res) => {
          if (res.data.status) {
            setCurrentItem(null);
            setOpen(false);
            setAdminNotes("");
           
            toast.success(res.data.message);
          } else {
            toast.error(res.data.message);
          }
        })
        .catch((err) => {});
    } else if (currentItem.type === "reported") {
      let data = {
        reason: adminNotes,
        deletePost: true,
      };
      axios
        .post(
          `${BaseUrl.baseurl}/admin/verify-post-report/${currentItem._id}/${photoId}`,
          data
        )
        .then((res) => {
          if (res.data.status) {
            setCurrentItem(null);
            setOpen(false);
            setAdminNotes("");
            getProfileData();
            toast.success(res.data.message);
          } else {
            toast.error(res.data.message);
          }
        })
        .catch((err) => {});
    } else if (currentItem.type === "ProfileUpdate") {
      let data = {
        reason: adminNotes,
      };
      axios
        .post(
          `${BaseUrl.baseurl}/admin/verify-user-profile-photo/${currentItem._id}/${photoId}`,
          data
        )
        .then((res) => {
          if (res.data.status) {
            setCurrentItem(null);
            setOpen(false);
            setAdminNotes("");
            getProfileData();
            toast.success(res.data.message);
          } else {
            toast.error(res.data.message);
          }
        })
        .catch((err) => {});
    }
  };

  return (
    <section id="content" className="page-section flex-1 bg-slate-800/20 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4 shadow-xl min-h-screen">
      <p className="mb-6 text-[#e7e9ee] max-w-4xl">
        Review user-submitted content and profile updates to ensure they meet
        community guidelines. Click a card to view details and moderate.
      </p>

      <div className="flex flex-wrap items-center gap-4 mb-4">
        <h3 className="text-lg font-semibold text-[#9aa3b2]">
          Content Queue{" "}
          <span className="text-amber-500 ml-2 ">({pendingCount} items)</span>
        </h3>

        <div className="flex gap-2 ml-auto">
          {[
            { id: "all-pending", label: "All Pending" },
          
            { id: "profile-updates", label: "Profile Updates" },
            { id: "reported-content", label: "Reported Content" },
          ].map((btn) => (
            <button
              key={btn.id}
              onClick={() => setFilter(btn.id)}
              className={`font-medium py-2 px-4 rounded-lg text-sm ${
                filter === btn.id
                  ? "bg-[#7c3aed] text-black font-semibold"
                  : "bg-slate-200 text-slate-700"
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredItems.length === 0 && (
          <p className="text-slate-500 text-center col-span-full py-8">
            No items in this queue.
          </p>
        )}
        {console.log("jabbesh", filteredItems)}
        {filteredItems.map((item) => {
          let badge = "";
          let badgeColor = "";
          let content = "";

          if (item.type === "ProfileUpdate") {
            badge = "Profile Update";
            badgeColor = "bg-purple-500";
            content = (
              <div className="p-4 ">
                <p className="text-sm font-medium mb-2">
                  Changes for: {item.name}
                </p>
                <p className="text-xs">Name: {item.name}</p>
                <p className="text-xs  break-words">Bio: {item.bio}</p>
                <p className="text-xs">profile pic : New Image</p>
              </div>
            );
          } else {
            if (item.type === "new-submissions") {
              badge = "New Submission";
              badgeColor = "bg-sky-500";
            } else if (item.type === "reported") {
              badge = `Reported (${item.reports.length})`;
              badgeColor = "bg-red-500";
            }

            if (item?.images?.length > 0) {
              content = (
                <>
                  <img
                    src={item.images[0].image_url}
                    className="w-full h-48 object-cover"
                    alt=""
                  />
                  <div className="p-4">
                    <p className="text-xs text-slate-900">
                      User: {item.userId.name || "N/A"}
                    </p>
                    <p className="text-xs text-slate-600">
                      Description: {item.description || "N/A"}
                    </p>
                  </div>
                </>
              );
            } else {
              content = (
                <div className="p-4">
                  <p className="text-xs text-slate-600">
                    {item.text || "No text content"}
                  </p>
                  <p className="text-xs mt-2 text-slate-600">
                    User: {item.user || "N/A"}
                  </p>
                </div>
              );
            }
          }

          return (
            <div
              key={item.id}
              onClick={() => setCurrentItem(item)}
              className="bg-white rounded-xl shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow duration-200"
            >
              <div className="relative">
                <span
                  className={`text-white text-xs px-2 py-0.5 rounded-full absolute top-2 left-2 ${badgeColor}`}
                >
                  {badge}
                </span>
                {content}
              </div>
            </div>
          );
        })}
      </div>

      {currentItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-md w-full max-w-3xl overflow-y-auto max-h-[90vh]">
            {currentItem.type === "ProfileUpdate" && (
              <>
                <h2 className="text-xl font-semibold mb-4">
                  Review Profile Update for {currentItem.name}
                </h2>

                <div className="">
                  <div>
                    <h4 className="font-semibold text-lg mb-2">
                      Current Live Profile
                    </h4>
                    <p className="text-sm text-slate-500">
                      Name:{" "}
                      <span className="font-medium text-slate-700">
                        {currentItem.name || "N/A"}
                      </span>
                    </p>
                    <p className="text-sm text-slate-500">
                      Bio:{" "}
                      <span className="font-medium text-slate-700">
                        {currentItem.bio || "N/A"}
                      </span>
                    </p>
                    <p className="text-sm text-slate-500">Profile Pic:</p>
                    <div className="grid grid-cols-4 md:grid-cols-4 gap-4">
                      {currentItem.photos.map((val, k) => {
                        if (val.isVerified) {
                          return null;
                        }
                        return (
                          <div key={k}>
                            <img
                              src={val.url}
                              className="w-full h-36 object-cover rounded-md mt-2"
                              alt=""
                            />
                            <div className="flex gap-2 mt-2 items-center justify-center">
                              <div>
                                <button
                                  onClick={() => {
                                    approveItem(val._id);
                                  }}
                                  className="bg-green-500 text-white px-2 py-1 rounded text-xs"
                                >
                                  Approve
                                </button>
                              </div>
                              <div>
                                <button
                                  onClick={() => {
                                    setPhotoId(val._id);
                                    rejectItem();
                                  }}
                                  className="bg-red-500 text-white px-2 py-1 text-xs rounded"
                                >
                                  Reject
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </>
            )}

            {currentItem.type !== "ProfileUpdate" && (
              <>
                <h2 className="text-xl font-semibold mb-4">
                  {currentItem.status === "reported"
                    ? `Review Reported ${currentItem.type}`
                    : `Review New Post from ${currentItem.userId.name} for Submission`}
                </h2>
                {currentItem.images.length > 0 ? (
                  <>
                  <div className={`grid ${currentItem.images.length===1?"grid-cols-1":"grid-cols-2"}  gap-3`}>
                  {currentItem.images.map((val,k)=>{
                    return(
                    <img
                     key={k}
                      src={val.image_url}
                      className="w-full h-96 rounded-md mb-4 object-cover"
                      alt=""
                    />
                    )
                  })}
</div>
                    <p className="bg-slate-50 p-4 rounded mb-4 border">
                      {currentItem.description || "No text content"}
                    </p>
                  </>
                ) : (
                  <p className="bg-slate-50 p-4 rounded mb-4 border">
                    {currentItem.text || "No text content"}
                  </p>
                )}
                {(currentItem.reports?.length &&
                  currentItem.type === "reported") > 0 && (
                  <div className="mt-4">
                    <h4 className="font-semibold mb-2">Reports:</h4>
                    <ul className="list-disc pl-5">
                      {currentItem.reports.map((r, i) => {
                        if(r.isVerified){
                          return null;
                        }
                        return (
                          <div className="flex  justify-between" key={i}>
                            <li>
                              Reason:{" "}
                              <label className="text-slate-500 font-semibold">
                                {r.reason}
                              </label>
                              , Reporter:{" "}
                              <label className="text-slate-500 font-semibold">
                                {r.userId.name}
                              </label>
                            </li>
                            <div className="flex gap-2 mt-2 items-center justify-center">
                              <div>
                                <button
                                  onClick={() => {
                                    approveItem(r._id);
                                  }}
                                  className=" bg-red-500 text-white px-2 py-1 rounded text-xs"
                                >
                                  Reject
                                </button>
                              </div>
                              <div>
                                <button
                                  onClick={() => {
                                    setPhotoId(r._id);
                                    rejectItem();
                                  }}
                                  className=" bg-green-500 text-white px-2 py-1 text-xs rounded"
                                >
                                  Approve
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </ul>
                  </div>
                )}
              </>
            )}

            <div className="flex justify-end gap-2 mt-6">
              {currentItem.type === "new-submissions" && (
                <>
                  <button
                    onClick={approveItem}
                    className="bg-green-500 text-white px-4 py-2 rounded"
                  >
                    Approve
                  </button>
                  <button
                    onClick={rejectItem}
                    className="bg-red-500 text-white px-4 py-2 rounded"
                  >
                    Reject
                  </button>
                </>
              )}
              <button
                onClick={() => setCurrentItem(null)}
                className="bg-slate-200 px-4 py-2 rounded"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      {open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-md w-full max-w-3xl overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-semibold ">Reject Reason</h4>
              <button
                className="  text-slate-500 text-2xl font-bold hover:text-slate-700"
                onClick={() => {
                  setOpen(false);
                }}
              >
                &times;
              </button>
            </div>
            <textarea
              id="admin-notes"
              rows="4"
              className="w-full rounded-md border-solid border-slate-300 shadow-sm mb-6"
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={rejectContentPost}
                className="bg-red-500 text-white px-4 py-2 rounded"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
