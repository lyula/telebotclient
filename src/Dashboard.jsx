import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { API_BASE_URL } from "./api";

// Theme colors
const PRIMARY = "#0d6efd";
const LIGHT_BG = "#f5f7fa";

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

// Helper to format dates like WhatsApp
const formatWhatsAppDate = (date) => {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  const isToday = date.toDateString() === today.toDateString();
  const isYesterday = date.toDateString() === yesterday.toDateString();

  if (isToday) return "Today";
  if (isYesterday) return "Yesterday";
  return `${date.getDate().toString().padStart(2, "0")}/${(date.getMonth() + 1)
    .toString()
    .padStart(2, "0")}/${date.getFullYear()}`;
};

// Helper to format time like WhatsApp
const formatWhatsAppTime = (date) => {
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? "PM" : "AM";
  const formattedHours = hours % 12 || 12;
  return `${formattedHours}:${minutes.toString().padStart(2, "0")} ${ampm}`;
};

const sampleChats = [
  {
    id: 1,
    name: "Telebot Support",
    lastMessage: "Welcome to Telebot! How can we help?",
    time: new Date().toISOString(),
    messages: [
      { text: "Welcome to Telebot! How can we help?", createdAt: new Date().toISOString(), sent: false },
      { text: "Hi, just testing!", createdAt: new Date().toISOString(), sent: true },
    ],
  },
];

function Dashboard({ user, onLogout }) {
  const [greeting, setGreeting] = useState(getGreeting());
  const [chats, setChats] = useState(sampleChats);
  const [activeChatId, setActiveChatId] = useState(null);
  const [message, setMessage] = useState("");
  const [mobileView, setMobileView] = useState("list");
  const [scheduleType, setScheduleType] = useState("now");
  const [scheduleDateTime, setScheduleDateTime] = useState("");
  const [interval, setInterval] = useState("every_minute");
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupId, setNewGroupId] = useState("");
  const [creatingGroup, setCreatingGroup] = useState(false);
  const [messagesByGroup, setMessagesByGroup] = useState({});

  useEffect(() => {
    const greetingInterval = setInterval(() => setGreeting(getGreeting()), 60 * 1000);
    return () => clearInterval(greetingInterval);
  }, []);

  useEffect(() => {
    if (window.innerWidth < 768 && activeChatId !== null) {
      setMobileView("chat");
    }
  }, [activeChatId]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768 && mobileView === "chat" && activeChatId === null) {
        setMobileView("list");
      }
      if (window.innerWidth >= 768) {
        setMobileView("list");
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [mobileView, activeChatId]);

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_BASE_URL}/groups`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch groups");
      const data = await res.json();
      const chatList = (Array.isArray(data) ? data : [])
        .sort((a, b) =>
          new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
        )
        .map((g) => ({
          id: g.groupId,
          name: g.displayName,
          lastMessage: "",
          time: g.createdAt || "",
          messages: [],
        }));
      setChats(chatList);

      chatList.forEach(async (chat) => {
        try {
          const resMsg = await fetch(`${API_BASE_URL}/messages/group/${chat.id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (resMsg.ok) {
            const msgData = await resMsg.json();
            setMessagesByGroup((prev) => ({
              ...prev,
              [chat.id]: msgData.messages || [],
            }));
          }
        } catch (err) {
          setMessagesByGroup((prev) => ({
            ...prev,
            [chat.id]: [],
          }));
        }
      });
    } catch (err) {
      console.error("Failed to fetch groups:", err);
      setChats(sampleChats);
    }
  };

  const getCronString = () => {
    if (scheduleType === "now") return "* * * * *";
    if (scheduleType === "datetime" && scheduleDateTime) {
      const dt = new Date(scheduleDateTime);
      return `${dt.getMinutes()} ${dt.getHours()} ${dt.getDate()} ${dt.getMonth() + 1} *`;
    }
    switch (interval) {
      case "every_minute":
        return "* * * * *";
      case "every_5_minutes":
        return "*/5 * * * *";
      case "every_hour":
        return "0 * * * *";
      case "every_day":
        return "0 0 * * *";
      default:
        return "* * * * *";
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!message.trim() || !activeChatId) return;
    setMessage("");

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/messages/schedule`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          groupId: activeChatId,
          message: message.trim(),
          scheduleTime: getCronString(),
        }),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const resMsg = await fetch(`${API_BASE_URL}/messages/group/${activeChatId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (resMsg.ok) {
        const msgData = await resMsg.json();
        setMessagesByGroup((prev) => ({
          ...prev,
          [activeChatId]: msgData.messages || [],
        }));
      }
    } catch (err) {
      console.error("Failed to send message:", err);
      alert("Failed to send message. Please try again.");
    }
  };

  const handleSelectChat = (chatId) => {
    setActiveChatId(chatId);
    if (window.innerWidth < 768) setMobileView("chat");
  };

  const handleBack = () => {
    setMobileView("list");
    setActiveChatId(null);
  };

  const handleOpenGroupModal = () => setShowGroupModal(true);
  const handleCloseGroupModal = () => {
    setShowGroupModal(false);
    setNewGroupName("");
    setNewGroupId("");
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    if (!newGroupName.trim() || !newGroupId.trim()) {
      alert("Please fill in all fields");
      return;
    }
    setCreatingGroup(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/groups`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          displayName: newGroupName.trim(),
          groupId: newGroupId.trim(),
        }),
      });
      const data = await res.json();
      if (res.ok) {
        await fetchGroups();
        setActiveChatId(newGroupId.trim());
        handleCloseGroupModal();
        if (window.innerWidth < 768) setMobileView("chat");
      } else {
        alert(data.message || "Failed to create group");
      }
    } catch (err) {
      console.error("Failed to create group:", err);
      alert("Failed to create group. Please check your connection and try again.");
    } finally {
      setCreatingGroup(false);
    }
  };

  const activeChat = chats.find((chat) => chat.id === activeChatId);
  const activeMessages = messagesByGroup[activeChatId] || [];

  return (
    <div
      className="w-100 h-100 vh-100 d-flex"
      style={{
        background: LIGHT_BG,
        position: "fixed",
        top: "0",
        left: "0",
        right: "0",
        bottom: "0",
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif",
        overflow: "hidden",
      }}
    >
      <style>
        {`
          .chat-bubble-sent::after, .chat-bubble-received::after {
            content: '';
            position: absolute;
            bottom: 8px;
            width: 0;
            height: 0;
            border: 6px solid transparent;
          }
          .chat-bubble-sent::after {
            right: -6px;
            border-left-color: ${PRIMARY};
            border-bottom-left-radius: 2px;
          }
          .chat-bubble-received::after {
            left: -6px;
            border-right-color: #FFFFFF;
            border-bottom-right-radius: 2px;
          }
          .new-chat-btn {
            position: absolute;
            bottom: 16px;
            right: 16px;
            width: 56px;
            height: 56px;
            z-index: 1050;
            box-shadow: 0 2px 8px rgba(0,0,0,0.15);
            background: ${PRIMARY};
            color: #fff;
            font-size: 28px;
            display: flex;
            align-items: center;
            justify-content: center;
            border: none;
            border-radius: 50%;
          }
          .message-input {
            flex: 1;
            min-width: 0;
          }
          .input-container {
            display: flex;
            align-items: center;
            gap: 8px;
            flex-wrap: nowrap;
          }
          .schedule-controls {
            display: flex;
            flex-direction: column;
            gap: 8px;
            padding-top: 8px;
          }
        `}
      </style>
      {/* Sidebar (Chat List) */}
      <aside
        className={`d-flex flex-column bg-white ${
          mobileView === "chat" && window.innerWidth < 768 ? "d-none" : "d-flex"
        } w-100 col-md-4 col-lg-3 col-xl-2`}
        style={{
          width: window.innerWidth < 768 ? "100vw" : undefined,
          maxWidth: window.innerWidth < 768 ? "100vw" : "360px",
          height: "100vh",
          position: "absolute",
          zIndex: 2,
          borderRight: "1px solid #dee2e6",
          top: "0",
          left: "0",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          className="d-flex align-items-center justify-content-between px-3 py-3"
          style={{ background: PRIMARY, color: "#fff" }}
        >
          <span className="fw-semibold fs-5">{user?.username || "User"}</span>
          <button className="btn btn-outline-light btn-sm" onClick={onLogout}>
            Logout
          </button>
        </div>
        {/* Greeting */}
        <div className="px-3 py-2 text-secondary border-bottom small">
          {greeting}
        </div>
        {/* Chat List */}
        <div className="flex-grow-1 overflow-auto bg-white" style={{ paddingBottom: "80px" }}>
          {chats.length === 0 ? (
            <div className="text-center text-muted mt-5">No chats yet. Start a new chat!</div>
          ) : (
            chats.map((chat) => (
              <div
                key={chat.id}
                className={`d-flex align-items-center px-3 py-3 border-bottom ${
                  chat.id === activeChatId ? "bg-light" : ""
                }`}
                style={{ cursor: "pointer" }}
                onClick={() => handleSelectChat(chat.id)}
              >
                <div className="flex-grow-1">
                  <div className="fw-semibold">{chat.name}</div>
                  <div
                    className="text-secondary small"
                    style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}
                  >
                    {chat.lastMessage}
                  </div>
                </div>
                <div className="text-end small text-secondary ms-2" style={{ minWidth: "60px" }}>
                  {chat.time ? formatWhatsAppDate(new Date(chat.time)) : ""}
                </div>
              </div>
            ))
          )}
        </div>
        {/* Single "+" button for creating new group */}
        <button
          className="btn rounded-circle new-chat-btn"
          onClick={handleOpenGroupModal}
          title="Create new group"
          type="button"
        >
          <svg width="28" height="28" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" />
          </svg>
        </button>
      </aside>

      {/* Chat Area */}
      <main
        className={`flex-grow-1 d-flex flex-column ${
          mobileView === "list" && window.innerWidth < 768 ? "d-none" : "d-flex"
        }`}
        style={{
          height: "100vh",
          background: LIGHT_BG,
          position: "absolute",
          zIndex: 1,
          width: "100%",
          top: "0",
          left: "0",
          marginLeft: window.innerWidth >= 768 ? "360px" : "0",
          transition: "margin-left 0.2s",
        }}
      >
        {/* Chat header */}
        <div
          className="d-flex align-items-center px-3 py-3 border-bottom bg-white"
          style={{ minHeight: "60px" }}
        >
          {window.innerWidth < 768 && (
            <button
              className="btn btn-link me-2 d-md-none"
              style={{ color: PRIMARY, fontSize: "22px" }}
              onClick={handleBack}
            >
              ←
            </button>
          )}
          {activeChat ? (
            <>
              <div
                className="rounded-circle d-flex align-items-center justify-content-center me-3"
                style={{
                  width: "40px",
                  height: "40px",
                  background: PRIMARY,
                  color: "#fff",
                  fontWeight: "bold",
                  fontSize: "18px",
                }}
              >
                {activeChat?.name ? activeChat.name[0] : ""}
              </div>
              <div>
                <div className="fw-semibold">{activeChat.name}</div>
                <div className="small text-secondary">
                  {activeChat.time ? formatWhatsAppDate(new Date(activeChat.time)) : ""}
                </div>
              </div>
            </>
          ) : (
            <span className="text-muted">Select a chat to start messaging</span>
          )}
        </div>
        {/* Messages */}
        <div
          className="flex-grow-1 p-3 d-flex flex-column gap-2"
          style={{
            overflow: "auto",
            paddingBottom: window.innerWidth < 768 ? "140px" : "120px",
          }}
        >
          {activeChat && activeMessages.length > 0 ? (
            activeMessages.map((msg, idx) => (
              <React.Fragment key={idx}>
                <div
                  className={`d-flex mb-2 ${msg.sent ? "justify-content-end" : "justify-content-start"}`}
                >
                  <div
                    className={`d-flex flex-column py-2 px-3 rounded-3 position-relative ${
                      msg.sent ? "chat-bubble-sent" : "chat-bubble-received"
                    }`}
                    style={{
                      background: msg.sent ? PRIMARY : "#FFFFFF",
                      color: msg.sent ? "#fff" : "#000",
                      maxWidth: "70%",
                      wordBreak: "break-word",
                      boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
                    }}
                  >
                    <div>{msg.message}</div>
                    <div className="text-end small text-secondary" style={{ opacity: 0.75, fontSize: "0.75em" }}>
                      {msg.sentAt
                        ? `Sent at ${formatWhatsAppTime(new Date(msg.sentAt))}`
                        : msg.createdAt
                        ? formatWhatsAppTime(new Date(msg.createdAt))
                        : ""}
                    </div>
                  </div>
                </div>
                {/* System-generated scheduling info for scheduled messages */}
                {msg.scheduleTime && !msg.isSent && (
                  <div className="d-flex mb-2 justify-content-end">
                    <div
                      className="small text-secondary"
                      style={{
                        background: "#f1f3f6",
                        borderRadius: "8px",
                        padding: "6px 12px",
                        maxWidth: "70%",
                        fontStyle: "italic",
                      }}
                    >
                      {`The above message sent at ${msg.createdAt ? formatWhatsAppTime(new Date(msg.createdAt)) : ""} has been scheduled for `}
                      <b>{msg.scheduleTime}</b>
                      {msg.interval && ` and will be automated at the interval: ${msg.interval}`}
                    </div>
                  </div>
                )}
              </React.Fragment>
            ))
          ) : (
            <div className="text-center text-muted my-auto">
              {activeChat ? "No messages yet. Say hello!" : "Select a chat to start messaging."}
            </div>
          )}
        </div>
        {/* Message input */}
        {activeChat && (
          <form
            className="p-3 border-top px-3 bg-white d-flex flex-column gap-2"
            style={{
              position: "sticky",
              bottom: "0",
              left: "0",
              right: "0",
              zIndex: "10",
              background: "#fff",
            }}
            onSubmit={handleSend}
          >
            <div className="input-container">
              <input
                type="text"
                className="form-control rounded-pill border-0 message-input"
                style={{ background: "#f5f7fa" }}
                placeholder="Type a message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
              <button
                type="submit"
                className="btn btn-primary rounded-circle"
                style={{
                  width: "40px",
                  height: "40px",
                  padding: "0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginLeft: "8px",
                }}
              >
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                </svg>
              </button>
            </div>
            <div className="schedule-controls">
              <select
                className="form-select rounded-pill"
                style={{ maxWidth: "200px" }}
                value={scheduleType}
                onChange={(e) => setScheduleType(e.target.value)}
              >
                <option value="now">Send Now</option>
                <option value="datetime">Specific Time</option>
                <option value="interval">Recurring</option>
              </select>
              {scheduleType === "datetime" && (
                <input
                  type="datetime-local"
                  className="form-control rounded-pill"
                  style={{ maxWidth: "200px" }}
                  value={scheduleDateTime}
                  onChange={(e) => setScheduleDateTime(e.target.value)}
                />
              )}
              {scheduleType === "interval" && (
                <select
                  className="form-select rounded-pill"
                  style={{ maxWidth: "200px" }}
                  value={interval}
                  onChange={(e) => setInterval(e.target.value)}
                >
                  <option value="every_minute">Every Minute</option>
                  <option value="every_5_minutes">Every 5 Minutes</option>
                  <option value="every_hour">Every Hour</option>
                  <option value="every_day">Every Day</option>
                </select>
              )}
            </div>
          </form>
        )}
        {/* Group Creation Modal */}
        {showGroupModal && (
          <div
            style={{
              position: "fixed",
              top: "0",
              left: "0",
              width: "100vw",
              height: "100vh",
              background: "rgba(0,0,0,0.5)",
              zIndex: "3000",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <form
              onSubmit={handleCreateGroup}
              style={{
                background: "#fff",
                padding: "32px",
                borderRadius: "12px",
                minWidth: "320px",
                boxShadow: "0 4px 24px rgba(0,0,0,0.15)",
                display: "flex",
                flexDirection: "column",
                gap: "16px",
              }}
            >
              <h5 className="mb-3">Create New Group</h5>
              <input
                type="text"
                className="form-control"
                placeholder="Group Name"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                required
                maxLength={50}
              />
              <input
                type="text"
                className="form-control"
                placeholder="Telegram Group ID"
                value={newGroupId}
                onChange={(e) => setNewGroupId(e.target.value)}
                required
              />
              <div className="d-flex gap-2 justify-content-end">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleCloseGroupModal}
                  disabled={creatingGroup}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={creatingGroup}>
                  {creatingGroup ? "Creating..." : "Create"}
                </button>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}

export default Dashboard;