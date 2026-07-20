// src/pages/AdminChatDashboard.jsx

import { useEffect, useRef, useState } from "react";
import axios from "axios";
import io from "socket.io-client";
import {
  Search,
  Send,
  Phone,
  Video,
  MoreVertical,
  Loader2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { BaseUrl } from "../BaseUrl";

export default function AdminChatDashboard() {
  const navigate = useNavigate();
  const socketRef = useRef(null);

  const ADMIN_ID = "6915aba226a2f34bb2b91796"; // your admin _id

  const [rooms, setRooms] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);

  const [searchId, setSearchId] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);

  const [msg, setMsg] = useState("");

  const [loadingRooms, setLoadingRooms] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);

  /* ---------------- SOCKET ---------------- */
  useEffect(() => {
    fetchRooms();

    socketRef.current = io(BaseUrl.baseurl, {
      transports: ["websocket"],
      query: { userId: ADMIN_ID },
    });

    socketRef.current.on("connect", () => {
      socketRef.current.emit("register_user", {
        userId: ADMIN_ID,
      });
    });

    socketRef.current.on("new_message_notification", fetchRooms);

    socketRef.current.on("new_message", (data) => {
      if (
        selectedUser &&
        (data.sender === selectedUser.userId ||
          data.receiver === selectedUser.userId)
      ) {
        setMessages((prev) => [...prev, data]);
      }

      fetchRooms();
    });
    socketRef.current.on("messages_all_read", (data) => {
      const partnerId = data.reader;

      setRooms((prev) =>
        prev.map((r) =>
          r.userId === partnerId ? { ...r, unreadCount: 0 } : r,
        ),
      );
    });
    return () => socketRef.current?.disconnect();
  }, []);

  /* ---------------- CHAT ROOMS ---------------- */
  const fetchRooms = async () => {
    try {
      setLoadingRooms(true);

      const res = await axios.get(
        `${BaseUrl.baseurl}/chat/chat-room-skip/${ADMIN_ID}?skip=0&limit=50`,
      );

      setRooms(res.data?.data || []);
    } catch (error) {
      console.log(error);
    } finally {
      setLoadingRooms(false);
    }
  };

  /* ---------------- SEARCH USER ---------------- */
  const searchUser = async () => {
    if (!searchId.trim()) return;

    try {
      setSearchLoading(true);

      const res = await axios.get(
        `${BaseUrl.baseurl}/admin/search-user?userId=${searchId}`,
      );

      const user = res.data?.data[0];

      if (!user) {
        alert("User not found");
        return;
      }

      const newUser = {
        userId: user._id,
        uId: user.userId,
        username: user.name,
        avatarUrl:
          user.photos[0].url ||
          "https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg",
      };

      setSelectedUser(newUser);
      fetchMessages(newUser);
      setRooms((prev) => {
        const exists = prev.find((r) => r.userId === newUser.userId);

        if (exists) {
          // move existing room to top
          const filtered = prev.filter((r) => r.userId !== newUser.userId);

          return [exists, ...filtered];
        }

        // add new room top
        return [
          {
            ...newUser,
            latestMessage: "",
            unreadCount: 0,
            latestMessageTime: new Date(),
          },
          ...prev,
        ];
      });
    } catch (error) {
      console.log(error);
      alert("User not found");
    } finally {
      setSearchLoading(false);
    }
  };

  /* ---------------- FETCH MSG ---------------- */
  const fetchMessages = async (user) => {
    try {
      setLoadingMessages(true);

      const res = await axios.get(
        `${BaseUrl.baseurl}/chat/get-message/${ADMIN_ID}?senderId=${ADMIN_ID}&receiverId=${user.userId}&page=0&limit=100`,
      );

      setMessages(res.data?.message || []);
    } catch (error) {
      console.log(error);
      setMessages([]);
    } finally {
      setLoadingMessages(false);
    }
  };

  /* ---------------- SEND ---------------- */
  const sendMessage = () => {
    if (!msg.trim() || !selectedUser) return;

    const payload = {
      messageId: Date.now().toString(),
      sender: ADMIN_ID,
      receiver: selectedUser.userId,
      message: msg,
    };

    socketRef.current.emit("send_message", payload);

    setMessages((prev) => [...prev, payload]);
    setMsg("");
  };

  return (
    <div className="h-[86vh]  text-white">
      <div className="h-full grid grid-cols-12 rounded-3xl overflow-hidden border border-white/10 bg-gradient-to-br from-slate-900 via-[#0b1120] to-black shadow-2xl">
        {/* LEFT PANEL */}
        <div className="col-span-4 xl:col-span-3 border-r border-white/10 flex flex-col min-h-0">
          {/* Search */}
          <div className="p-5 border-b border-white/10 shrink-0">
            <h1 className="text-2xl font-black">Admin Chat</h1>
            <p className="text-slate-400 text-sm mt-1">
              Search any user and start chat
            </p>

            <div className="mt-4 flex gap-2">
              <div className="relative flex-1">
                <Search
                  size={16}
                  className="absolute left-3 top-3 text-slate-500"
                />

                <input
                  value={searchId}
                  onChange={(e) => setSearchId(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && searchUser()}
                  placeholder="Enter User ID"
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 outline-none"
                />
              </div>

              <button
                onClick={searchUser}
                className="px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-semibold"
              >
                {searchLoading ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  "Find"
                )}
              </button>
            </div>
          </div>

          {/* Rooms */}
          <div className="flex-1 min-h-0 overflow-y-auto">
            {loadingRooms ? (
              <p className="p-5 text-slate-400">Loading chats...</p>
            ) : (
              rooms.map((room, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setSelectedUser(room);
                    fetchMessages(room);
                    socketRef.current?.emit("mark_messages_read", {
                      userId: ADMIN_ID,
                      partnerId: room.userId,
                    });

                    // remove unread badge instantly in UI
                    setRooms((prev) =>
                      prev.map((r) =>
                        r.userId === room.userId ? { ...r, unreadCount: 0 } : r,
                      ),
                    );
                  }}
                  className={`w-full text-left px-4 py-4 border-b border-white/5 hover:bg-white/5 ${
                    selectedUser?.userId === room.userId
                      ? "bg-indigo-500/10"
                      : ""
                  }`}
                >
                  <div className="flex gap-3 items-center">
                    <img
                      src={room.avatarUrl}
                      className="w-12 h-12 rounded-full object-cover"
                    />

                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate">
                        {room.username}
                      </h3>

                      <p className="truncate text-sm text-slate-400">
                        {room.latestMessage}
                      </p>
                    </div>

                    {room.unreadCount > 0 && (
                      <div className="w-6 h-6 rounded-full bg-green-500 text-xs flex items-center justify-center font-bold">
                        {room.unreadCount}
                      </div>
                    )}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="col-span-8 xl:col-span-9 flex flex-col min-h-0">
          {/* Header */}
          <div className="px-6 py-4 border-b border-white/10 shrink-0">
            {selectedUser ? (
              <div className="flex items-center justify-between">
                <div className="flex gap-3 items-center">
                  <img
                    src={selectedUser.avatarUrl}
                    className="w-11 h-11 rounded-full object-cover"
                    referrerPolicy="no-referrer"
                  />

                  <div>
                    <h2 className="font-bold">{selectedUser.username}</h2>

                    <p className="text-sm text-slate-400">
                      UID: {selectedUser.uId}
                    </p>
                  </div>
                </div>
                <div>
                  <span
                    onClick={() => navigate(-1)}
                    className={`px-4 py-3 rounded-full text-sm font-semibold bg-rose-500/20 text-rose-300 cursor-pointer`}
                  >
                    Back
                  </span>
                </div>
                {/* <div className="flex gap-2">
                  <button className="p-2 rounded-xl bg-white/5">
                    <Phone size={18} />
                  </button>
                  <button className="p-2 rounded-xl bg-white/5">
                    <Video size={18} />
                  </button>
                  <button className="p-2 rounded-xl bg-white/5">
                    <MoreVertical size={18} />
                  </button>
                </div> */}
              </div>
            ) : (
              <p className="text-slate-400">Select user to chat</p>
            )}
          </div>

          {/* Messages */}
          <div className="flex-1 min-h-0 overflow-y-auto p-6 space-y-4 bg-[radial-gradient(circle_at_top_right,_rgba(99,102,241,0.08),transparent_35%),radial-gradient(circle_at_bottom_left,_rgba(16,185,129,0.08),transparent_35%)]">
            {loadingMessages ? (
              <p className="text-slate-400">Loading messages...</p>
            ) : (
              messages.map((m, i) => {
                const isMe = m.sender === ADMIN_ID;

                return (
                  <div
                    key={i}
                    className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[70%] px-4 py-3 rounded-2xl ${
                        isMe
                          ? "bg-indigo-600 rounded-br-md"
                          : "bg-white/5 border border-white/10 rounded-bl-md"
                      }`}
                    >
                      <p>{m.message}</p>
                      <div className="text-[10px] mt-1 text-right text-white/100">
                      {new Date(m.createdAt).toLocaleString("en-IN", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true,
                      })}
                    </div>
                    </div>
                     
                  </div>
                );
              })
            )}
          </div>

          {/* Input */}
          {selectedUser && (
            <div className="p-4 border-t border-white/10 shrink-0">
              <div className="flex gap-3 bg-white/5 border border-white/10 rounded-2xl px-3 py-2">
                <input
                  value={msg}
                  onChange={(e) => setMsg(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                  placeholder="Type reply..."
                  className="flex-1 bg-transparent outline-none"
                />

                <button
                  onClick={sendMessage}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 flex items-center gap-2 font-semibold"
                >
                  <Send size={16} />
                  Send
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
