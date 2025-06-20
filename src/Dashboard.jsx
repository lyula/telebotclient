import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

// Theme colors
const PRIMARY = "#0d6efd";
const LIGHT_BG = "#f5f7fa";

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

const sampleChats = [
  {
    id: 1,
    name: "Telebot Support",
    lastMessage: "Welcome to Telebot! How can we help?",
    time: "09:00",
    messages: [
      { text: "Welcome to Telebot! How can we help?", time: "09:00", sent: false },
      { text: "Hi, just testing!", time: "09:01", sent: true },
    ],
  },
];

function Dashboard({ user, onLogout }) {
  const [greeting, setGreeting] = useState(getGreeting());
  const [chats, setChats] = useState(sampleChats);
  const [activeChatId, setActiveChatId] = useState(null);
  const [message, setMessage] = useState("");
  const [mobileView, setMobileView] = useState("list");

  useEffect(() => {
    const interval = setInterval(() => setGreeting(getGreeting()), 60 * 1000);
    return () => clearInterval(interval);
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

  const activeChat = chats.find((c) => c.id === activeChatId);

  const handleSend = (e) => {
    e.preventDefault();
    if (!message.trim() || !activeChat) return;
    const newMsg = {
      text: message,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      sent: true,
    };
    setChats((prev) =>
      prev.map((chat) =>
        chat.id === activeChatId
          ? {
              ...chat,
              messages: [...chat.messages, newMsg],
              lastMessage: message,
              time: newMsg.time,
            }
          : chat
      )
    );
    setMessage("");
  };

  const handleNewChat = () => {
    const newId = Date.now();
    const newChat = {
      id: newId,
      name: "New Chat",
      lastMessage: "",
      time: "",
      messages: [],
    };
    setChats([newChat, ...chats]);
    setActiveChatId(newId);
    if (window.innerWidth < 768) setMobileView("chat");
  };

  const handleBack = () => {
    setMobileView("list");
    setActiveChatId(null);
  };

  return (
    <div
      className="w-100 h-100 vh-100 d-flex"
      style={{
        background: LIGHT_BG,
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
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
            bottom: 24px;
            right: 24px;
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
          }
          .sidebar-plus-btn {
            position: fixed;
            bottom: 24px;
            right: 24px;
            width: 56px;
            height: 56px;
            z-index: 2000;
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
          @media (max-width: 767.98px) {
            .new-chat-btn {
              display: none !important;
            }
            .message-input {
              display: flex !important;
              width: calc(100% - 52px) !important;
            }
          }
          @media (min-width: 768px) {
            .sidebar-plus-btn {
              display: none !important;
            }
            .message-input {
              width: calc(100% - 52px) !important;
            }
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
          top: 0,
          left: 0,
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
        <div className="flex-grow-1 overflow-auto bg-white" style={{ paddingBottom: "70px" }}>
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
                onClick={() => setActiveChatId(chat.id)}
              >
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center me-3"
                  style={{
                    width: 48,
                    height: 48,
                    background: PRIMARY,
                    color: "#fff",
                    fontWeight: "bold",
                    fontSize: 20,
                  }}
                >
                  {chat.name[0]}
                </div>
                <div className="flex-grow-1">
                  <div className="fw-semibold">{chat.name}</div>
                  <div className="small text-truncate text-secondary" style={{ maxWidth: 200 }}>
                    {chat.lastMessage}
                  </div>
                </div>
                <div className="small text-secondary ms-2">{chat.time}</div>
              </div>
            ))
          )}
        </div>
        {/* Desktop only "+" button */}
        <button
          className="btn rounded-circle new-chat-btn"
          onClick={handleNewChat}
          title="Start new chat"
          type="button"
        >
          <svg width="28" height="28" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" />
          </svg>
        </button>
      </aside>

      {/* Mobile only floating "+" button */}
      <button
        className="btn rounded-circle sidebar-plus-btn"
        onClick={handleNewChat}
        title="Start new chat"
        type="button"
        style={{
          background: PRIMARY,
          color: "#fff",
          width: 56,
          height: 56,
          boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
          alignItems: "center",
          justifyContent: "center",
          display: window.innerWidth < 768 ? "flex" : "none",
        }}
      >
        <svg width="28" height="28" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" />
        </svg>
      </button>

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
          top: 0,
          left: 0,
          marginLeft: window.innerWidth >= 768 ? 360 : 0,
          transition: "margin-left 0.2s",
        }}
      >
        {/* Chat header */}
        <div
          className="d-flex align-items-center px-3 py-3 border-bottom bg-white"
          style={{ minHeight: 60 }}
        >
          {window.innerWidth < 768 && (
            <button
              className="btn btn-link me-2 d-md-none"
              style={{ color: PRIMARY, fontSize: 22 }}
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
                  width: 40,
                  height: 40,
                  background: PRIMARY,
                  color: "#fff",
                  fontWeight: "bold",
                  fontSize: 18,
                }}
              >
                {activeChat.name[0]}
              </div>
              <div>
                <div className="fw-semibold">{activeChat.name}</div>
                <div className="small text-secondary">{activeChat.time}</div>
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
            overflowY: "auto",
            paddingBottom: window.innerWidth < 768 ? 90 : 80,
          }}
        >
          {activeChat && activeChat.messages.length > 0 ? (
            activeChat.messages.map((msg, idx) => (
              <div
                key={idx}
                className={`d-flex mb-2 ${msg.sent ? "justify-content-end" : "justify-content-start"}`}
              >
                <div
                  className={`px-3 py-2 rounded-3 position-relative ${
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
                  <div>{msg.text}</div>
                  <div className="text-end small text-secondary" style={{ opacity: 0.75 }}>
                    {msg.time}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-muted my-auto">
              {activeChat ? "No messages yet. Say hello!" : "Select a chat to start messaging."}
            </div>
          )}
        </div>
        {/* Message input */}
        {activeChat && (
          <div
            className="p-3 border-top d-flex bg-white"
            style={{
              position: "sticky",
              bottom: 0,
              left: 0,
              right: 0,
              zIndex: 10,
              background: "#fff",
              alignItems: "center",
              gap: "12px",
              display: "flex",
            }}
          >
            <input
              className="form-control rounded-pill border-0 message-input"
              style={{ background: "#f5f7fa", flex: 1, minWidth: 0 }}
              placeholder="Type a message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <button
              className="btn rounded-circle d-flex align-items-center justify-content-center"
              style={{ background: PRIMARY, color: "#fff", width: 40, height: 40, flexShrink: 0 }}
              type="button"
              onClick={handleSend}
            >
              <svg
                width="22"
                height="22"
                fill="currentColor"
                viewBox="0 0 20 20"
                style={{ margin: "auto" }}
              >
                <path d="M2.293 10.293a1 1 0 011.32-.083l.094.083 11-7a1 1 0 011.497.868v14a1 1 0 01-1.497.868l-11-7a1 1 0 01-.094-1.651z" />
              </svg>
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

export default Dashboard;