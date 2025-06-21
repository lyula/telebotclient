import React from "react";

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
          <>
            {/* Floating "+" button for desktop */}
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
          </>
        )}
      </div>
    </aside>
  );
}

export default ChatList;