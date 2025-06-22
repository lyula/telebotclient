import React from "react";

function ChatMessages({ activeMessages, formatWhatsAppTime, onTogglePaused, activeChat }) {
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
              <div className="d-flex align-items-center">
                <span className="flex-grow-1">{msg.text || msg.message}</span>
                {/* Tiny toggle switch for scheduled messages */}
                {msg.isScheduled && (
                  <label
                    className="form-check form-switch ms-2 mb-0"
                    title={msg.paused ? "Resume automation" : "Pause automation"}
                    style={{ fontSize: 12 }}
                  >
                    <input
                      className="form-check-input"
                      type="checkbox"
                      checked={!msg.paused}
                      onChange={() => onTogglePaused(msg._id)}
                      style={{ width: 28, height: 16, cursor: "pointer" }}
                    />
                    <span style={{ marginLeft: 8 }}>
                      {msg.paused ? "Paused" : "Active"}
                    </span>
                  </label>
                )}
              </div>
              {/* Repeat message info */}
              {typeof msg.repeatCount === "number" && msg.repeatCount > 1 && (
                <div
                  className="bg-light rounded px-2 py-1 mt-1 small text-secondary"
                  style={{ maxWidth: 320, fontSize: 12 }}
                >
                  <span>
                    <b>Repeat:</b> Sent {msg.sentCount || 0} of {msg.repeatCount} times
                  </span>
                </div>
              )}
              {/* Schedule summary as a reply */}
              {msg.isScheduled && msg.userSchedule && (
                <div
                  className="bg-light rounded px-2 py-1 mt-1 small text-secondary"
                  style={{ maxWidth: 320, fontSize: 12 }}
                >
                  <span>
                    <b>Scheduled:</b> {msg.userSchedule}
                  </span>
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
          </div>
        );
      })}
    </div>
  );
}

export default ChatMessages;