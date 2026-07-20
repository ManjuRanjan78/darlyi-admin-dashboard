import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { BaseUrl } from "../BaseUrl";
import { useParams, useNavigate } from "react-router-dom";
import { Trash } from "lucide-react";
import toast from "react-hot-toast";
export default function AdminChatViewer() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [chatList, setChatList] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [page, setPage] = useState(0);
  const messageEndRef = useRef();
  const containerRef = useRef();
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const activeChatRef = useRef(null);
  const handleScroll = async () => {
    const el = containerRef.current;

    if (!el || loadingMore) return;

    // if scrolled near top
    console.log("jabbeshaaa", el.scrollTop, hasMore);
    if (el.scrollTop < 50 && hasMore) {
      setLoadingMore(true);

      const oldHeight = el.scrollHeight;

      const nextPage = page + 1;

      const res = await axios.get(
        `${BaseUrl.baseurl}/chat/get-message/${id}?senderId=${selectedChat.userId}&receiverId=${id}&page=${messages.length}&limit=20`,
      );

      const newMessages = res.data.message;
      if (newMessages.length === 0) {
        setHasMore(false);
      }
      setMessages((prev) => {
  const merged = [...res.data.message, ...prev];

  return merged.filter(
    (item, index, self) =>
      index === self.findIndex((m) => m._id === item._id)
  );
});
      setPage(nextPage);

      setTimeout(() => {
        const newHeight = el.scrollHeight;
        el.scrollTop = newHeight - oldHeight; // 🔥 maintain position
      }, 0);

      setLoadingMore(false);
    }
  };
  /* ================= FETCH CHAT LIST ================= */
  const fetchChats = async () => {
    const res = await axios.get(`${BaseUrl.baseurl}/chat/chat-room/${id}`);
    setChatList(res.data);
  };

  /* ================= FETCH MESSAGES ================= */
  const fetchMessages = async (chatUserId, pageNum, scrollBottom = false) => {
    const currentChatId = chatUserId;
    const res = await axios.get(
      `${BaseUrl.baseurl}/chat/get-message/${id}?senderId=${chatUserId}&receiverId=${id}&page=${pageNum}&limit=20`,
    );
    if (activeChatRef.current !== currentChatId) {
      return;
    }
    if (pageNum === 0) {
      setMessages([...res.data.message]);

      if (scrollBottom) {
        setTimeout(() => {
          if (containerRef.current) {
            containerRef.current.scrollTop = containerRef.current.scrollHeight;
          }
        }, 100);
      }
    } else {
      setMessages((prev) => [...res.data.message, ...prev]);
    }
  };
  useEffect(() => {
    fetchChats();
  }, []);
 

  const callDeleteApi = async (chatRoomId) => {
    const ok = window.confirm("Are you sure you want to re initiate");
    if (!ok) return;
    const res = await axios.delete(
      `${BaseUrl.baseurl}/chat/delete-chat-room/${chatRoomId}`,
    );
    if (res.data.status) {
      toast.success(res.data.message);
      fetchChats();
      setSelectedChat(null);
      setMessages([]);
    } else {
      toast.error(res.data.message);
    }
  };
  return (
    <div className="h-[84vh] bg-[#05080f] text-white flex">
      {/* ================= LEFT SIDEBAR ================= */}
      <div className="w-96 border-r border-slate-800 overflow-y-auto">
        <div className="p-4 text-lg font-bold border-b border-slate-800 flex justify-between">
          <div> 💬 Chats</div>
          <div>
            <span
              onClick={() => navigate(-1)}
              className={`px-4 py-2 rounded-full text-sm font-semibold bg-rose-500/20 text-rose-300 cursor-pointer`}
            >
              Back
            </span>
          </div>
        </div>

        {chatList.map((chat) => {
          if (chat.uId === 56) {
            return null;
          }
          return (
            <div
              key={chat.userId}
              onClick={() => {
                activeChatRef.current = chat.userId;

                setSelectedChat(chat);
                setPage(0);
                setMessages([]);
                setHasMore(true);
                setLoadingMore(false);

                fetchMessages(chat.userId, 0, true);
              }}
              className={`p-4 flex gap-3 cursor-pointer hover:bg-slate-800/40 transition  ${selectedChat?.messageId===chat.messageId&&"bg-slate-900/80"}`} 
            >
              <img
                referrerPolicy="no-referrer"
                src={chat.avatarUrl}
                className="w-12 h-12 rounded-full object-cover"
              />

              <div className="flex-1 min-w-0">
                <div className="flex justify-between">
                  <h3 className="font-semibold">{chat.username}</h3>

                  <span className="text-xs text-slate-400">
                    {new Date(chat.latestMessageTime).toLocaleString("en-IN", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true,
                    })}
                  </span>
                </div>

                <p className="text-sm text-slate-400 truncate">
                  {chat.latestMessage}
                </p>
              </div>
              <div>
                {chat.unreadCount > 0 && (
                  <div className="bg-green-500 text-black text-xs px-2 py-1 rounded-full">
                    {chat.unreadCount}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ================= RIGHT CHAT VIEW ================= */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 space-y-3"
      >
        {loadingMore && (
          <div className="text-center text-xs text-slate-400">
            Loading older messages...
          </div>
        )}
        {!selectedChat ? (
          <div className="flex-1 flex items-center justify-center text-slate-500">
            Select a chat
          </div>
        ) : (
          <>
            {/* HEADER */}
            <div className="p-4   w-full  border-b border-slate-800 flex items-center gap-3 bg-[#0b0f1a]">
              <Trash
                onClick={(e) => {
                  e.stopPropagation();
                  callDeleteApi(messages[0].chatRoomId);
                }}
                className="text-red-400 cursor-pointer"
                size={18}
              />
              <img
                referrerPolicy="no-referrer"
                src={selectedChat.avatarUrl}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <div className="font-semibold">
                  {selectedChat.username} ({selectedChat.uId})
                </div>
                <div
                  className={` text-xs ${selectedChat.user?.isOnline ? "text-green-400" : "text-rose-400"} `}
                >
                  {selectedChat.user?.isOnline ? "Online" : "Offline"}
                </div>
              </div>
            </div>

            {/* MESSAGES */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg) => (
                <div
                  key={msg._id}
                  className={`flex ${
                    msg.isMine ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-xs px-4 py-2 rounded-2xl text-sm shadow-lg ${
                      msg.isMine
                        ? "bg-gradient-to-r from-indigo-500 to-purple-600"
                        : "bg-slate-800"
                    }`}
                  >
                    {msg.message}

                    <div className="text-[10px] mt-1 text-right text-white/60">
                      {new Date(msg.createdAt).toLocaleString("en-IN", {
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
              ))}

              <div ref={messageEndRef} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
