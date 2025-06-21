import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { API_BASE_URL } from "./api";
import GroupModal from "./GroupModal";
import ChatMessages from "./ChatMessages";
import ChatList from "./ChatList";

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

  if (isToday) {
    // Show time in hh:mm AM/PM
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? "PM" : "AM";
    const formattedHours = hours % 12 || 12;
    return `${formattedHours}:${minutes.toString().padStart(2, "0")} ${ampm}`;
  }
  if (isYesterday) return "Yesterday";
  // Show date in dd/mm/yy
  return `${date.getDate().toString().padStart(2, "0")}/${(date.getMonth() + 1)
    .toString()
    .padStart(2, "0")}/${date.getFullYear().toString().slice(-2)}`;
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

// Allow any negative number group ID or @username
function isValidTelegramGroupId(id) {
  return /^-\d+$/.test(id) || /^@[a-zA-Z0-9_]{5,}$/.test(id);
}

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
  const [isSchedulerOpen, setIsSchedulerOpen] = useState(false);
  const [groupIdError, setGroupIdError] = useState("");
  const [customIntervalValue, setCustomIntervalValue] = useState("");
  const [customIntervalUnit, setCustomIntervalUnit] = useState("minutes");

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

  useEffect(() => {
    if (!activeChatId) return;
    const token = localStorage.getItem("token");

    const fetchMessages = async () => {
      try {
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
      } catch (err) {}
    };

    fetchMessages();
    const interval = setInterval(fetchMessages, 30000); // every 30 seconds
    return () => clearInterval(interval);
  }, [activeChatId]);

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

  // Update getCronString for custom intervals
  const getCronString = () => {
    if (scheduleType === "now") return "* * * * *";
    if (scheduleType === "datetime" && scheduleDateTime) {
      const dt = new Date(scheduleDateTime);
      return `${dt.getMinutes()} ${dt.getHours()} ${dt.getDate()} ${dt.getMonth() + 1} *`;
    }
    if (scheduleType === "interval") {
      switch (interval) {
        case "every_minute":
          return "* * * * *";
        case "every_3_minutes":
          return "*/3 * * * *";
        case "every_5_minutes":
          return "*/5 * * * *";
        case "every_10_minutes":
          return "*/10 * * * *";
        case "every_15_minutes":
          return "*/15 * * * *";
        case "every_30_minutes":
          return "*/30 * * * *";
        case "every_hour":
          return "0 * * * *";
        case "every_day":
          return "0 0 * * *";
        case "custom":
          if (!customIntervalValue || isNaN(customIntervalValue) || customIntervalValue <= 0)
            return "* * * * *";
          if (customIntervalUnit === "minutes")
            return `*/${customIntervalValue} * * * *`;
          if (customIntervalUnit === "hours")
            return `0 */${customIntervalValue} * * *`;
          if (customIntervalUnit === "days")
            return `0 0 */${customIntervalValue} * *`;
          return "* * * * *";
        default:
          return "* * * * *";
      }
    }
    return "* * * * *";
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

  const handleOpenGroupModal = () => {
    setShowGroupModal(true);
  };

  const handleCloseGroupModal = () => {
    setShowGroupModal(false);
    setNewGroupName("");
    setNewGroupId("");
  };

  // Update handleCreateGroup to validate group ID
  const handleCreateGroup = async (e) => {
    e.preventDefault();
    if (!newGroupName.trim() || !newGroupId.trim()) {
      alert("Please fill in all fields");
      return;
    }
    if (!isValidTelegramGroupId(newGroupId.trim())) {
      setGroupIdError(
        "Invalid Group ID. Use -100... for group ID or @username for public groups."
      );
      return;
    }
    setGroupIdError("");
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

  const toggleScheduler = () => {
    setIsSchedulerOpen((prev) => !prev);
  };

  const activeChat = chats.find((chat) => chat.id === activeChatId);
  const activeMessages = messagesByGroup[activeChatId] || [];

  useEffect(() => {
    if (showGroupModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [showGroupModal]);

  const isSendDisabled = () => {
    if (!message.trim()) return true;
    if (scheduleType === "now") return false;
    if (scheduleType === "datetime") return !scheduleDateTime;
    if (scheduleType === "interval") {
      if (!interval) return true;
      if (interval === "custom") {
        return (
          !customIntervalValue ||
          isNaN(customIntervalValue) ||
          Number(customIntervalValue) <= 0 ||
          !customIntervalUnit
        );
      }
      return false;
    }
    return true;
  };

  return (
    <>
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
              position: fixed;
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
              cursor: pointer;
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
              position: fixed;
              bottom: 0;
              left: ${window.innerWidth >= 768 ? '360px' : '0'};
              right: 0;
              background: #fff;
              padding: 8px 16px;
              z-index: 1000;
            }
            .schedule-controls {
              position: fixed;
              bottom: 64px;
              left: ${window.innerWidth >= 768 ? '360px' : '16px'};
              right: 16px;
              background: #fff;
              padding: 8px;
              border-radius: 8px;
              box-shadow: 0 -2px 8px rgba(0,0,0,0.1);
              display: flex;
              flex-direction: column;
              gap: 8px;
              z-index: 999;
              transition: max-height 0.3s ease-in-out;
              max-height: ${isSchedulerOpen && message.length > 0 ? '200px' : '40px'};
              overflow: hidden;
            }
            .schedule-controls.collapsed {
              max-height: 40px;
            }
            @keyframes popUp {
              from { transform: translateY(10px); opacity: 0; }
              to { transform: translateY(0); opacity: 1; }
            }
            @keyframes popDown {
              from { transform: translateY(0); opacity: 1; }
              to { transform: translateY(10px); opacity: 0; }
            }
            .scheduler-toggle-btn {
              width: 40px;
              height: 40px;
              padding: 0;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            .modal-mobile {
              z-index: 1060;
            }
            @media (max-width: 767px) {
              .modal-mobile .modal-dialog {
                margin: 0;
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
              }
              .new-chat-btn {
                z-index: 1060; /* Ensure button is above chatlist */
              }
            }
          `}
        </style>
        {/* Sidebar (Chat List) */}
        <ChatList
          chats={chats}
          activeChatId={activeChatId}
          handleSelectChat={handleSelectChat}
          formatWhatsAppDate={formatWhatsAppDate}
          handleOpenGroupModal={handleOpenGroupModal}
          user={user}
          onLogout={onLogout}
          greeting={greeting}
          mobileView={mobileView}
          PRIMARY={PRIMARY}
        />

        {/* Chat Area */}
        <main
          className={`flex-grow-1 d-flex flex-column ${
            mobileView === "list" && window.innerWidth < 768 ? "d-none" : "d-flex"
          }`}
          style={{
            height: "100vh",
            background: LIGHT_BG,
            position: "fixed",
            zIndex: 1,
            width: window.innerWidth >= 768 ? "calc(100% - 360px)" : "100%",
            top: "0",
            left: window.innerWidth >= 768 ? "360px" : "0",
            transition: "left 0.2s",
          }}
        >
          {/* Chat header */}
          <div
            className="d-flex align-items-center justify-content-between px-3 py-3 border-bottom bg-white"
            style={{ minHeight: "60px" }}
          >
            {activeChat ? (
              <>
                <div className="d-flex align-items-center">
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
                </div>
                {window.innerWidth < 768 && (
                  <button
                    className="btn btn-link d-md-none"
                    style={{ color: PRIMARY, fontSize: "22px" }}
                    onClick={handleBack}
                  >
                    ←
                  </button>
                )}
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
              paddingBottom: "120px",
            }}
          >
            <ChatMessages
              activeChat={activeChat}
              activeMessages={activeMessages}
              formatWhatsAppTime={formatWhatsAppTime}
            />
          </div>
          {/* Message input */}
          {activeChat && (
            <form
              className="border-top bg-white"
              style={{
                position: "fixed",
                bottom: "0",
                left: window.innerWidth >= 768 ? "360px" : "0",
                right: "0",
                zIndex: "1000",
                background: "#fff",
              }}
              onSubmit={handleSend}
            >
              <div className={`schedule-controls ${!isSchedulerOpen ? 'collapsed' : ''}`}>
                <button
                  type="button"
                  className="btn btn-link scheduler-toggle-btn"
                  onClick={toggleScheduler}
                  style={{ color: PRIMARY }}
                >
                  {isSchedulerOpen ? '▼' : '▲'}
                </button>
                {isSchedulerOpen && (
                  <>
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
                      <>
                        <select
                          className="form-select rounded-pill"
                          style={{ maxWidth: "200px" }}
                          value={interval}
                          onChange={(e) => setInterval(e.target.value)}
                        >
                          <option value="every_minute">Every 1 Minute</option>
                          <option value="every_3_minutes">Every 3 Minutes</option>
                          <option value="every_5_minutes">Every 5 Minutes</option>
                          <option value="every_10_minutes">Every 10 Minutes</option>
                          <option value="every_15_minutes">Every 15 Minutes</option>
                          <option value="every_30_minutes">Every 30 Minutes</option>
                          <option value="every_hour">Every Hour</option>
                          <option value="every_day">Every Day</option>
                          <option value="custom">Custom</option>
                        </select>
                        {interval === "custom" && (
                          <div className="d-flex align-items-center gap-2 mt-1">
                            <input
                              type="number"
                              min="1"
                              className="form-control rounded-pill"
                              style={{ maxWidth: "100px" }}
                              placeholder="Value"
                              value={customIntervalValue}
                              onChange={(e) => setCustomIntervalValue(e.target.value)}
                            />
                            <select
                              className="form-select rounded-pill"
                              style={{ maxWidth: "100px" }}
                              value={customIntervalUnit}
                              onChange={(e) => setCustomIntervalUnit(e.target.value)}
                            >
                              <option value="minutes">Minutes</option>
                              <option value="hours">Hours</option>
                              <option value="days">Days</option>
                            </select>
                          </div>
                        )}
                      </>
                    )}
                  </>
                )}
              </div>
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
                  disabled={isSendDisabled()}
                >
                  <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                  </svg>
                </button>
              </div>
            </form>
          )}
        </main>
      </div>

      {/* Group Creation Modal - OUTSIDE main layout, always at top level */}
      <GroupModal
        show={showGroupModal}
        onClose={handleCloseGroupModal}
        onSubmit={handleCreateGroup}
        newGroupName={newGroupName}
        setNewGroupName={setNewGroupName}
        newGroupId={newGroupId}
        setNewGroupId={setNewGroupId}
        groupIdError={groupIdError}
        creatingGroup={creatingGroup}
      />
    </>
  );
}

export default Dashboard;