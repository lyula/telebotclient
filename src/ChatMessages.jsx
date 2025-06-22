import React from "react";

function ChatMessages({ activeMessages, formatWhatsAppTime, onTogglePaused, activeChat, onManualRefresh }) {
  if (activeMessages.length === 0) {
    return (
      <div className="text-center text-muted my-auto">
        No messages yet. Say hello!
      </div>
    );
  }

  return (
    <div>
      {activeMessages.map((msg, idx) => {
        const isSent = msg.sent || msg.isSent || msg.user === (activeChat?.user || "me");
        const hasUpdate = !!(msg.scheduleSummary || (typeof msg.repeatCount === "number" && msg.repeatCount > 1));
        return (
          <div
            key={msg._id || idx}
            className={`d-flex mb-2 ${isSent ? "justify-content-end" : "justify-content-start"}`}
          >
            <div
              className={`position-relative p-2 rounded-3 shadow-sm ${
                isSent ? "chat-bubble-sent ms-auto" : "chat-bubble-received me-auto"
              }`}
              style={{
                maxWidth: "80%",
                background: isSent ? "#d1e7ff" : "#fff",
                border: isSent ? "1px solid #b6d4fe" : "1px solid #eee",
                minWidth: "80px",
                wordBreak: "break-word",
              }}
            >
              {/* Main message text */}
              <div className="d-flex align-items-center">
                <span className="flex-grow-1">{msg.text || msg.message}</span>
              </div>
              {/* "Reply" style update below the message */}
              {hasUpdate && (
                <div
                  className="bg-light rounded px-2 py-1 mt-2 small text-secondary"
                  style={{
                    maxWidth: 320,
                    fontSize: 12,
                    borderLeft: "3px solid #0d6efd",
                    marginLeft: isSent ? "auto" : 0,
                  }}
                >
                  {msg.scheduleSummary && (
                    <div>
                      <b>Update:</b> {msg.scheduleSummary}
                    </div>
                  )}
                  {typeof msg.repeatCount === "number" && msg.repeatCount > 1 && (
                    <div>
                      <b>Repeat:</b> Sent {msg.sentCount || 0} of {msg.repeatCount} times
                    </div>
                  )}
                </div>
              )}
              {/* Schedule type indication */}
              {msg.scheduleType && (
                <div className="small text-secondary mt-1">
                  <b>Schedule Type:</b> {msg.scheduleType === "now"
                    ? "Send Now"
                    : msg.scheduleType === "datetime"
                      ? "Specific Time"
                      : msg.scheduleType === "interval"
                        ? "Recurring"
                        : msg.scheduleType}
                </div>
              )}
              <div
                className="text-end text-secondary small mt-1"
                style={{ fontSize: 11 }}
              >
                {msg.time
                  ? formatWhatsAppTime(new Date(msg.time))
                  : msg.createdAt
                  ? formatWhatsAppTime(new Date(msg.createdAt))
                  : ""}
              </div>
            </div>
            {/* Show refresh button below the latest message reply */}
            {idx === activeMessages.length - 1 && (
              <div style={{ width: "100%", display: "flex", justifyContent: isSent ? "flex-end" : "flex-start" }}>
                <button
                  className="btn btn-outline-secondary btn-sm mt-2"
                  title="Refresh"
                  style={{ borderRadius: "50%", padding: "6px 10px", marginLeft: isSent ? "auto" : 0 }}
                  onClick={onManualRefresh}
                >
                  <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.65 6.35A7.95 7.95 0 0 0 12 4V1L7 6l5 5V7c1.93 0 3.68.78 4.95 2.05A7 7 0 1 1 5 12H3a9 9 0 1 0 14.65-5.65z"/>
                  </svg>
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default ChatMessages;