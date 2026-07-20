import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import { BaseUrl } from "../BaseUrl";
import toast from "react-hot-toast";
import io from "socket.io-client";
import { CircularProgress } from "@mui/material";
import { useNavigate } from "react-router-dom";
var socket = io.connect(BaseUrl.baseurl, {
  transports: ["websocket"],
});
const CommunicationAndSupport = () => {
  const navigate = useNavigate();
  const [announcements, setAnnouncements] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState("");
  const [annTitle, setAnnTitle] = useState("");
  const [annBody, setAnnBody] = useState("");
  const [loading, setLoading] = useState(true);
  const handleAddAnnouncement = (e) => {
    e.preventDefault();
    if (annTitle.trim() === "" || annBody.trim() === "") {
      return;
    }

    const newAnnouncement = {
      title: annTitle,
      body: annBody,
      date: new Date().toLocaleString("en-IN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }),
    };

    setAnnouncements((prevAnnouncements) => [
      newAnnouncement,
      ...prevAnnouncements,
    ]);
    setAnnTitle("");
    setAnnBody("");
    setIsModalOpen(false);
  };

  const getPriorityClasses = (priority) => {
    switch (priority) {
      case "Urgent":
        return "bg-red-500/10 border-red-500/30 text-red-300";
      case "High":
        return "bg-amber-500/10 border-amber-500/30 text-amber-300";
      default:
        return "bg-gray-700/50 border-white/10 text-white/80";
    }
  };
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 20;
  const [users, setUsers] = useState([]);
  const userDetails = JSON.parse(
    localStorage.getItem("LiveStreamAdminDetails"),
  );
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
  const [ticket, setTicket] = useState([]);
  function getUserData() {
    axios
      .get(
        userDetails?.data?.role?.name === "Support"
          ? `${BaseUrl.baseurl}/admin/get-staff-support-open-ticket/${userDetails?.data?._id}/0`
          : `${BaseUrl.baseurl}/admin/get-all-support-open-tickets/0`,
      )
      .then((res) => {
        console.log("response", res);
        if (res.data.status) {
          setTicket(res.data.data);
        } else {
          toast.error(res.data.message);
        }
        setLoading(false);
      })
      .catch((err) => {});
  }
  useEffect(() => {
    getUserData();
  }, []);

  // function searchUser(query) {
  //   axios
  //     .get(
  //       `${BaseUrl.baseurl}/admin/search-user?searchQuery=${query}&agent=false`
  //     )
  //     .then((res) => {
  //       if (res.data.status) {
  //         setUsers(res.data.data);
  //       } else {
  //         setUsers([]);
  //       }
  //     })
  //     .catch((err) => {});
  // }
  function getData(count, from) {
    axios
      .get(
        userDetails?.data?.role?.name === "Support"
          ? `${BaseUrl.baseurl}/admin/get-staff-support-close-ticket/${userDetails?.data?._id}/${count}`
          : `${BaseUrl.baseurl}/admin/get-all-support-close-tickets/${count}`,
      )
      .then((res) => {
        if (res.data.status) {
          if (from === "update") {
            setUsers(res.data.data);
          } else {
            setUsers([...users, ...res.data.data]);
          }
        } else {
          console.log("error no more data");
          toast.error("No more data");
        }
        setLoading(false);
      })
      .catch((err) => {});
  }
  useEffect(() => {
    getData(users.length, "next");
  }, []);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const msgData = {
      userId: activeChat.userId._id,
      staffId: activeChat.staffId?._id || "unassigned",
      ticketId: activeChat._id,
      message: newMessage,
      sentBy: "staff",
      createdAt: new Date().toISOString(),
    };
    console.log("jabbesh sent message", msgData);
    setMessages((prev) => [...prev, msgData]);
    setNewMessage("");
    socket.emit("send-support-message", msgData);
  };
  useEffect(() => {
    const handleReceiveMessage = (data) => {
      console.log("socketdta", data.supportTicket, activeChat?._id);
      if (data.supportTicket === activeChat?._id) {
        setMessages((prev) => [...prev, data]);
      }
    };

    socket.on("receive-chat-message", handleReceiveMessage);

    return () => {
      socket.off("receive-chat-message", handleReceiveMessage);
    };
  }, [activeChat]);
  const [skip, setSkip] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [chatLoader, setChatLoader] = useState(false);
  function startChat(ticketId, status, id, t, from) {
    setChatLoader(true);
    if (status === "progress" || from === "view") {
      setActiveChat(t);
      axios
        .get(
          `${BaseUrl.baseurl}/admin/get-staff-support-chat/${userDetails.data._id}/0/${id}`,
        )
        .then((response) => {
          if (response.data) {
            setMessages(response.data.data.reverse());
            if (from === "chat") {
              const data = {
                userId: t.userId?._id,
                staffId: userDetails.data._id,
              };
              socket.emit("join_support_room", data);
            }
          } else {
            toast.error("unable to fetch");
          }
          setChatLoader(false);
        })
        .catch((err) => {
          console.log("error coming");
          setMessages([]);
          setChatLoader(false);
        });
    } else {
      axios
        .put(`${BaseUrl.baseurl}/admin/staff-start-support-ticket/${ticketId}`)
        .then((res) => {
          if (res.data.status) {
            setActiveChat(t);
            axios
              .get(
                `${BaseUrl.baseurl}/admin/get-staff-support-chat/${userDetails.data._id}/0/${id}`,
              )
              .then((response) => {
                if (response.data) {
                  setMessages(response.data.data.reverse());
                  const data = {
                    userId: t.userId?._id,
                    staffId: userDetails.data._id,
                  };
                  socket.emit("join_support_room", data);
                } else {
                  toast.error("Unable to fetch");
                }
                setChatLoader(false);
              })
              .catch((err) => {
                setMessages([]);
                setChatLoader(false);
              });
          } else {
            toast.error(res.data.message);
          }
          setChatLoader(false);
        })
        .catch((err) => {});
    }
  }
  const chatContainerRef = useRef(null);
  useEffect(() => {
    if (chatContainerRef.current && !isLoading) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);
  const fetchMessages = async (newSkip = 0, appendTop = false) => {
    try {
      setIsLoading(true);
      const res = await axios.get(
        userDetails?.data?.role?.name === "Support"
          ? `${BaseUrl.baseurl}/admin/get-staff-support-chat/${userDetails.data._id}/${newSkip}/${activeChat._id}`
          : `${BaseUrl.baseurl}/admin/get-admin-support-chat/${activeChat._id}/${newSkip}`,
      );

      const data = res.data?.data || [];

      if (data.length === 0) {
        setHasMore(false);
        return;
      }

      if (appendTop) {
        data.reverse();
        setMessages((prev) => [...data, ...prev]);
      } else {
        console.log("jabbesh first getting", data);
        // first load
        setMessages(data.reverse());
      }

      setSkip(newSkip);
    } catch (err) {
      setMessages([]);
      setChatLoader(false);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const div = chatContainerRef.current;
    if (!div) return;

    const handleScroll = () => {
      if (div.scrollTop === 0 && hasMore && !isLoading) {
        const newSkip = skip + messages.length;
        const oldScrollHeight = div.scrollHeight;

        fetchMessages(newSkip, true).then(() => {
          // Maintain scroll position after prepend
          requestAnimationFrame(() => {
            div.scrollTop = div.scrollHeight - oldScrollHeight;
          });
        });
      }
    };

    div.addEventListener("scroll", handleScroll);
    return () => div.removeEventListener("scroll", handleScroll);
  }, [skip, hasMore, isLoading, messages]);
  const formatTime = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };
  function resolveTicket() {
    axios
      .put(
        `${BaseUrl.baseurl}/admin/staff-close-support-ticket/${activeChat.ticketId}`,
      )
      .then((res) => {
        if (res.data.status) {
          toast.success("Ticket Resolved Successfully");
          setActiveChat(null);
          getData(0, "update");
          getUserData();
        } else {
          toast.error(res.data.message);
        }
      })
      .catch((err) => {});
  }
  function getAdminChat(id) {
    setChatLoader(true);
    axios
      .get(`${BaseUrl.baseurl}/admin/get-admin-support-chat/${id}/0`)
      .then((response) => {
        if (response.data) {
          setMessages(response.data.data.reverse());
        } else {
          toast.error("unable to fetch");
        }
        setChatLoader(false);
      })
      .catch((err) => {});
  }
  return (
    <>
      <div className="p-5 min-h-screen bg-slate-800/20 backdrop-blur-sm">
        <section id="support" className="flex flex-col gap-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className=" border border-slate-700/50 rounded-xl p-4 shadow-xl overflow-x-auto h-96">
              <h3 className="text-sm text-[#9aa3b2] font-semibold mb-2">
                Tickets
              </h3>
              <table className="min-w-full text-left text-sm">
                <thead>
                  <tr>
                    <th className="py-2 px-3 text-[#9aa3b2] font-semibold uppercase text-xs tracking-wider">
                      ID
                    </th>
                    <th className="py-2 px-3 text-[#9aa3b2] font-semibold uppercase text-xs tracking-wider">
                      User
                    </th>
                    <th className="py-2 px-3 text-[#9aa3b2] font-semibold uppercase text-xs tracking-wider">
                      Category
                    </th>
                    <th className="py-2 px-3 text-[#9aa3b2] font-semibold uppercase text-xs tracking-wider">
                      Priority
                    </th>
                    <th className="py-2 px-3 text-[#9aa3b2] font-semibold uppercase text-xs tracking-wider">
                      Status
                    </th>
                    <th className="py-2 px-3 text-[#9aa3b2] font-semibold uppercase text-xs tracking-wider">
                      Type
                    </th>
                    <th className="py-2 px-3 text-[#9aa3b2] font-semibold uppercase text-xs tracking-wider">
                      Agent
                    </th>
                    <th className="py-2 px-3 text-[#9aa3b2] font-semibold uppercase text-xs tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {ticket.length !== 0 &&
                    ticket.map((t) => (
                      <tr
                        key={t.ticketId}
                        className="hover:bg-white/5 transition-colors text-[#e7e9ee]"
                      >
                        <td className="py-2 px-3 border-b border-white/10">
                          {t.ticketId}{" "}
                          <span className="text-xs text-emerald-500">
                            (
                            {new Date(t.createdAt).toLocaleString("en-IN", {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: true,
                            })}
                            )
                          </span>
                        </td>
                        <td className="py-2 px-3 border-b border-white/10">
                          {t.userId?.name} ({t.userId?.userId})
                        </td>
                        <td className="py-2 px-3 border-b border-white/10">
                          {t.title}
                        </td>
                        <td className="py-2 px-3 border-b border-white/10">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityClasses(
                              t.title === "Help"
                                ? "Urgent"
                                : t.title === "Bugs"
                                  ? "High"
                                  : "Medium",
                            )}`}
                          >
                            {t.title === "Help"
                              ? "Urgent"
                              : t.title === "Bugs"
                                ? "High"
                                : "Medium"}
                          </span>
                        </td>
                        <td className="py-2 px-3 border-b border-white/10">
                          {t.status}
                        </td>
                        <td className="py-2 px-3 border-b border-white/10">
                          {t.userId?.agent
                            ? "Agency"
                            : t.userId?.host
                              ? "Host"
                              : "User"}
                        </td>
                        <td className="py-2 px-3 border-b border-white/10">
                          {t.staffId ? t.staffId?.name : "Un-Assigned"}
                        </td>
                        <td
                          className={`py-2 px-3 border-b border-white/10 ${
                            userDetails?.data?.role?.name === "Support" &&
                            "flex flex-col gap-2"
                          }  `}
                        >
                          <button
                            onClick={() => {
                              setIsModalOpen(true);
                              setSelectedTicket(t);
                            }}
                            className="bg-purple-600 hover:bg-purple-700 text-black py-1 px-3 rounded-xl  transition-colors text-xs font-medium"
                          >
                            View
                          </button>
                          {userDetails?.data?.role?.name === "Support" && (
                            <button
                              onClick={() => {
                                startChat(
                                  t.ticketId,
                                  t.status,
                                  t._id,
                                  t,
                                  "chat",
                                );
                              }}
                              className="bg-purple-600 hover:bg-purple-700 text-black py-1 px-3 rounded-xl  transition-colors text-xs font-medium"
                            >
                              Chat
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
            <div className="bg-slate-800/20 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4 shadow-xl flex flex-col">
              {!activeChat ? (
                <div className="flex flex-1 items-center justify-center text-[#9aa3b2] text-sm">
                  Select a ticket to start chatting 💬
                </div>
              ) : (
                <>
                  <div className="border-b border-slate-700/50 pb-2 mb-2 flex justify-between items-center">
                    <h3 className="text-sm font-semibold text-[#e7e9ee]">
                      Chat with {activeChat.userId?.name}
                    </h3>
                    {activeChat.status !== "closed" && (
                      <button
                        onClick={() => {
                          resolveTicket();
                        }}
                        className="bg-purple-600 hover:bg-purple-700 text-black py-1 px-3 rounded-xl  transition-colors text-xs font-medium"
                      >
                        Resolved
                      </button>
                    )}
                    <button
                      onClick={() => setActiveChat(null)}
                      className="text-xs text-[#9aa3b2] hover:text-red-400"
                    >
                      Close
                    </button>
                  </div>

                  {/* Messages */}
                  {chatLoader ? (
                    <div className="flex items-center justify-center py-44">
                      <CircularProgress
                        size={35}
                        style={{
                          color: "white",
                        }}
                      />
                    </div>
                  ) : (
                    <div
                      ref={chatContainerRef}
                      className="flex-1 max-h-[340px] overflow-y-auto space-y-3 p-2"
                    >
                      {isLoading && (
                        <div className="text-center text-xs text-gray-400">
                          Loading...
                        </div>
                      )}
                      {messages.length === 0 ? (
                        <div className="text-[#9aa3b2] text-sm text-center mt-10">
                          No messages yet.
                        </div>
                      ) : (
                        messages.map((msg, index) => (
                          <div
                            key={index}
                            className={`flex ${
                              msg.sentBy === "staff"
                                ? "justify-end"
                                : "justify-start"
                            }`}
                          >
                            <div
                              className={`max-w-xs p-2 rounded-xl text-sm ${
                                msg.sentBy === "staff"
                                  ? "bg-purple-600 text-white rounded-tr-none"
                                  : "bg-slate-700 text-[#e7e9ee] rounded-tl-none"
                              }`}
                            >
                              <div>{msg.message}</div>
                              {msg.createdAt && (
                                <div className="text-[10px] text-gray-300 text-right mt-1">
                                  {formatTime(msg.createdAt)}
                                </div>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {/* Input */}
                  {activeChat.status !== "closed" && (
                    <form
                      onSubmit={handleSendMessage}
                      className="mt-3 flex gap-2 border-t border-slate-700/50 pt-3"
                    >
                      <input
                        type="text"
                        className="flex-1 bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-600"
                        placeholder="Type a message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                      />
                      <button
                        type="submit"
                        className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-lg text-sm"
                      >
                        Send
                      </button>
                    </form>
                  )}
                </>
              )}
            </div>
          </div>
          <div className="h-screen flex-1 bg-slate-800/20 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4 shadow-xl">
            <div className=" rounded-xl">
              <div className="flex flex-wrap items-center gap-4 mb-4">
                <h3 className="text-lg font-semibold text-[#e7e9ee]">
                  Resolved Tickets
                </h3>
                {/* <input
                  id="user-search"
                  type="text"
                  placeholder="Search ticket"
                  // value={searchTerm}
                  onChange={(e) => {
                    searchUser(e.target.value);
                  }}
                  className="flex-1 min-w-[200px] bg-[#0f1320] text-white border border-[#2d3748] rounded-lg py-2 px-4  focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  // className=" bg-slate-50 border border-slate-300 rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-sky-500"
                /> */}
              </div>
              <div className=" rounded-xl ">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left text-slate-500">
                    <thead className="text-xs text-[#9aa3b2] uppercase bg-[radial-gradient(1200px_800px_at_10%_-10%,#1a1f33_0%,#0b0d12_60%)]">
                      <tr>
                        <th scope="col" className="px-6 py-3">
                          Id
                        </th>
                        <th scope="col" className="px-6 py-3">
                          User
                        </th>
                        <th scope="col" className="px-6 py-3">
                          Category
                        </th>
                        <th scope="col" className="px-6 py-3">
                          Priority
                        </th>
                        <th scope="col" className="px-6 py-3">
                          Status
                        </th>
                        <th className="py-2 px-3 text-[#9aa3b2] font-semibold uppercase text-xs tracking-wider">
                          Type
                        </th>
                        <th scope="col" className="px-6 py-3">
                          Agent
                        </th>

                        <th scope="col" className="px-6 py-3">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-[radial-gradient(1200px_800px_at_10%_-10%,#1a1f33_0%,#0b0d12_60%)] divide-y divide-slate-200">
                      {currentUsers.map((user) => {
                        return (
                          <tr
                            key={user.ticketId}
                            className="hover:bg-slate-600"
                          >
                            <td className="px-6 py-4 whitespace-nowrap text-[#e7e9ee]">
                              <span className="font-bold">
                                {user.ticketId}{" "}
                              </span>
                              <span className="text-emerald-500">
                                (
                                {new Date(user.createdAt).toLocaleString(
                                  "en-IN",
                                  {
                                    day: "2-digit",
                                    month: "2-digit",
                                    year: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    hour12: true,
                                  },
                                )}
                                )
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-[#e7e9ee]">
                              {user.userId?.name} ({user.userId?.userId})
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-[#e7e9ee]">
                              {user.title}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-[#e7e9ee]">
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityClasses(
                                  user.title === "Help"
                                    ? "Urgent"
                                    : user.title === "Bugs"
                                      ? "High"
                                      : "Medium",
                                )}`}
                              >
                                {user.title === "Help"
                                  ? "Urgent"
                                  : user.title === "Bugs"
                                    ? "High"
                                    : "Medium"}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-[#e7e9ee]">
                              {user.status}
                            </td>
                            <td className="py-2 px-3  text-[#e7e9ee]">
                              {user.userId?.agent
                                ? "Agency"
                                : user.userId?.host
                                  ? "Host"
                                  : "User"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-[#e7e9ee]">
                              {user.staffId
                                ? user.staffId?.name
                                : "Un-Assigned"}
                            </td>
                            <td className="py-2 px-3 border-b border-white/10 flex flex-col gap-2">
                              <button
                                onClick={() => {
                                  setIsModalOpen(true);
                                  setSelectedTicket(user);
                                }}
                                className="bg-purple-600 hover:bg-purple-700 text-black py-1 px-3 rounded-xl  transition-colors text-xs font-medium"
                              >
                                View
                              </button>
                              <button
                                onClick={() => {
                                  window.scrollTo({
                                    top: 0,
                                    behavior: "smooth",
                                  });
                                  if (
                                    userDetails?.data?.role?.name === "Support"
                                  ) {
                                    startChat(
                                      user.ticketId,
                                      user.status,
                                      user._id,
                                      user,
                                      "view",
                                    );
                                  } else {
                                    setActiveChat(user);
                                    getAdminChat(user._id);
                                  }
                                }}
                                className="bg-purple-600 hover:bg-purple-700 text-black py-1 px-3 rounded-xl  transition-colors text-xs font-medium"
                              >
                                View Chat
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Pagination Controls */}
                <div className="mt-4 flex justify-between items-center text-sm text-slate-600 overflow-x-auto">
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
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 z-50">
          <div
            className="bg-[#121623]  rounded-xl p-6 border border-[#2d3748] w-full max-w-2xl overflow-y-auto max-h-[100%]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center   mb-4">
              <div className="text-lg font-semibold text-white text-center">
                Ticket Details
              </div>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => navigate(`/User-Calls/${user.gender}/${user._id}`)}
                  className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold"
                >
                  Calls
                </button>
                <button
                  onClick={() =>
                    navigate(`/user-payout/${selectedTicket.userId?._id}`)
                  }
                  className="px-4 py-2 rounded-lg bg-fuchsia-600 hover:bg-fuchsia-700 text-white text-sm font-semibold"
                >
                  Payout
                </button>
                {(userDetails?.data?.role?.name === "Super Admin" ||
                  userDetails?.data?.role?.name === "Special Manager") && (
                  <button
                    onClick={() => navigate(`/user-chat/${user._id}`)}
                    className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold"
                  >
                    Messages
                  </button>
                )}
                <button
                  onClick={() =>
                    navigate(`/Coins-History/${selectedTicket.userId?._id}`)
                  }
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold"
                >
                  Coins
                </button>

                <button
                  onClick={() =>
                    navigate(
                      `/Transaction-History/${selectedTicket.userId?._id}`,
                    )
                  }
                  className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold"
                >
                  Transactions
                </button>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <div className="text-sm text-white">
                {selectedTicket.description}
              </div>
              <div className="flex gap-2 ">
                {selectedTicket.images.map((val, i) => {
                  return (
                    <img
                      className="h-1/2 w-1/2"
                      alt={i}
                      key={i}
                      src={val.image_url}
                    />
                  );
                })}
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                className="bg-transparent border border-white/20 text-white px-4 py-2 rounded-lg hover:bg-white/10 transition-colors"
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CommunicationAndSupport;
