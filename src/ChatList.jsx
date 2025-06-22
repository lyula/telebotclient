import React, { useState } from "react";

function ChatList({
  chats,
  activeChatId,
  handleSelectChat,
  formatWhatsAppDate,
  handleOpenGroupModal,
  user,
  onLogout,
  greeting,
  mobileView,
  PRIMARY,
}) {
  const [showDocs, setShowDocs] = useState(false);

  return (
    <aside
      className={`d-flex flex-column bg-white ${
        mobileView === "chat" && window.innerWidth < 768 ? "d-none" : "d-flex"
      } w-100 col-md-4 col-lg-3 col-xl-2`}
      style={{
        width: window.innerWidth < 768 ? "100vw" : undefined,
        maxWidth: window.innerWidth < 768 ? "100vw" : "360px",
        height: "100vh",
        position: "fixed",
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
      {/* Greeting + How to use link */}
      <div className="d-flex align-items-center justify-content-between px-3 py-2 text-secondary border-bottom small">
        <span>{greeting}</span>
        <a
          href="#"
          onClick={e => { e.preventDefault(); setShowDocs(true); }}
          className="ms-2"
          style={{ color: "#007bff", textDecoration: "none", fontWeight: 500, cursor: "pointer" }}
        >
          How to use this platform?
        </a>
      </div>
      {/* Chat List */}
      <div className="flex-grow-1 overflow-auto bg-white position-relative" style={{ paddingBottom: "80px" }}>
        {showDocs && (
          <div
            style={{
              position: "absolute",
              top: 0, left: 0, right: 0, bottom: 0,
              background: "rgba(255,255,255,0.98)",
              zIndex: 100,
              overflowY: "auto"
            }}
            className="p-4"
          >
            <button
              className="btn btn-link"
              style={{ position: "absolute", top: 16, left: 16, fontSize: 24 }}
              onClick={() => setShowDocs(false)}
              aria-label="Back"
            >
              &#8592; Back
            </button>
            <div style={{ maxWidth: 600, margin: "60px auto 0 auto" }}>
              <h2>How to use this platform</h2>
              <ol>
                <li>
                  Read All the steps below first then proceed to click the link.
                </li>
                <li>
                  Click <a href="https://t.me/ShunMeiBot" target="_blank" rel="noopener noreferrer">this link</a> to open the Telegram bot.
                </li>
                <li>
                  Press <b>Start</b> in Telegram to activate the bot.
                </li>
                <li>
                  Follow the instructions from the bot to add it to your group or chat.
                </li>
                <li>
                  Return here and create or select a group to start sending messages.
                </li>
                <li>
                  Messages sent from this platform will be delivered to your Telegram group, even if you are offline. You can check them anytime in Telegram.
                </li>
              </ol>
            </div>
          </div>
        )}
        {!showDocs && (
          <>
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
          </>
        )}
        {/* "+" button: INSIDE chatlist for desktop, floating for mobile */}
        {window.innerWidth < 768 ? (
          <button
            className="btn rounded-circle new-chat-btn"
            onClick={handleOpenGroupModal}
            title="Create new group"
            type="button"
          >
            <svg width="28" height="28" fill="currentColor" viewBox="0 0 20 20">
              <path
                d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
              />
            </svg>
          </button>
        ) : (
          <button
            className="btn btn-primary rounded-circle new-chat-btn"
            style={{
              width: "56px",
              height: "56px",
              fontSize: "28px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "absolute",
              bottom: "24px",
              right: "24px",
              zIndex: 1050,
              boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
            }}
            onClick={handleOpenGroupModal}
            title="Create new group"
            type="button"
          >
            <svg width="28" height="28" fill="currentColor" viewBox="0 0 20 20">
              <path
                d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
              />
            </svg>
          </button>
        )}
      </div>
    </aside>
  );
}

export default ChatList;