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
    <div style={{ marginBottom: 72 }}>
      {activeMessages.map((msg, idx) => {
        const isSent = msg.sent || msg.isSent || msg.user === (activeChat?.user || "me");
        const hasUpdate = !!(msg.scheduleSummary || (typeof msg.repeatCount === "number" && msg.repeatCount > 1));
        const messagePreview = (msg.text || msg.message || "").slice(0, 20);
        const messagePreviewEllipsis = (msg.text || msg.message || "").length > 20 ? "..." : "";

        return (
          <React.Fragment key={msg._id || idx}>
            {/* Main message bubble */}
            <div
              className={`d-flex mb-1 ${isSent ? "justify-content-end" : "justify-content-start"}`}
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
                <div className="d-flex align-items-center mb-1">
                  <span className="flex-grow-1">{msg.text || msg.message}</span>
                  {/* Ticks */}
                  {msg.scheduleType === "interval" && (
                    <span style={{ marginLeft: 8, display: "flex", alignItems: "center" }}>
                      {/* Grey double tick */}
                      {(!msg.sentCount || msg.sentCount === 0) && (
                        <svg width="18" height="18" style={{ marginLeft: 2 }} viewBox="0 0 24 24">
                          <path fill="#bbb" d="M1.73,12.91 1.73,12.91 8.1,19.28 22.79,4.59 21.37,3.17 8.1,16.44 3.14,11.48z"/>
                          <path fill="#bbb" d="M5.73,12.91 5.73,12.91 12.1,19.28 23.79,7.59 22.37,6.17 12.1,16.44 7.14,11.48z"/>
                        </svg>
                      )}
                      {/* One blue, one grey tick */}
                      {msg.sentCount > 0 && msg.sentCount < msg.repeatCount && (
                        <>
                          <svg width="18" height="18" style={{ marginLeft: 2 }} viewBox="0 0 24 24">
                            <path fill="#0d6efd" d="M1.73,12.91 1.73,12.91 8.1,19.28 22.79,4.59 21.37,3.17 8.1,16.44 3.14,11.48z"/>
                          </svg>
                          <svg width="18" height="18" style={{ marginLeft: -8 }} viewBox="0 0 24 24">
                            <path fill="#bbb" d="M5.73,12.91 5.73,12.91 12.1,19.28 23.79,7.59 22.37,6.17 12.1,16.44 7.14,11.48z"/>
                          </svg>
                        </>
                      )}
                      {/* Double blue tick */}
                      {msg.sentCount >= msg.repeatCount && (
                        <>
                          <svg width="18" height="18" style={{ marginLeft: 2 }} viewBox="0 0 24 24">
                            <path fill="#0d6efd" d="M1.73,12.91 1.73,12.91 8.1,19.28 22.79,4.59 21.37,3.17 8.1,16.44 3.14,11.48z"/>
                          </svg>
                          <svg width="18" height="18" style={{ marginLeft: -8 }} viewBox="0 0 24 24">
                            <path fill="#0d6efd" d="M5.73,12.91 5.73,12.91 12.1,19.28 23.79,7.59 22.37,6.17 12.1,16.44 7.14,11.48z"/>
                          </svg>
                        </>
                      )}
                    </span>
                  )}
                </div>
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
            {/* Reply bubble for update, if any */}
            {hasUpdate && (
              <div
                className={`d-flex mb-2 ${isSent ? "justify-content-end" : "justify-content-start"}`}
              >
                <div
                  className="bg-light rounded px-3 py-2 shadow-sm"
                  style={{
                    maxWidth: 320,
                    fontSize: 13,
                    borderLeft: "3px solid #0d6efd",
                    marginLeft: isSent ? "auto" : 0,
                    marginTop: 0,
                    marginBottom: 0,
                  }}
                >
                  {/* WhatsApp-style reply tag */}
                  <div
                    style={{
                      fontWeight: 700,
                      color: "#0d6efd",
                      fontSize: 13,
                      marginBottom: 2,
                      borderLeft: "2px solid #0d6efd",
                      paddingLeft: 6,
                    }}
                  >
                    You
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      color: "#222",
                      marginBottom: 6,
                      paddingLeft: 6,
                      wordBreak: "break-word",
                    }}
                  >
                    {(msg.text || msg.message || "").slice(0, 40)}
                    {((msg.text || msg.message || "").length > 40) && "..."}
                  </div>
                  {/* Human-like schedule summary for all messages */}
                  <div style={{ color: "#444", fontSize: 13, marginBottom: 0, paddingLeft: 6 }}>
                    {msg.scheduleType === "interval" && (
                      <>
                        This message will repeat every{" "}
                        <b>
                          {(msg.customIntervalValue !== undefined && msg.customIntervalValue !== null && msg.customIntervalValue !== "")
                            ? msg.customIntervalValue
                            : (msg.intervalValue !== undefined && msg.intervalValue !== null && msg.intervalValue !== "")
                              ? msg.intervalValue
                              : "null"}
                          {" "}
                          {(msg.customIntervalUnit !== undefined && msg.customIntervalUnit !== null && msg.customIntervalUnit !== "")
                            ? msg.customIntervalUnit
                            : (msg.intervalUnit !== undefined && msg.intervalUnit !== null && msg.intervalUnit !== "")
                              ? msg.intervalUnit
                              : "null"}
                        </b>
                        . It will be sent <b>{typeof msg.repeatCount === "number" ? msg.repeatCount : "null"}</b> times.
                        <br />
                        Already sent: <b>{typeof msg.sentCount === "number" ? msg.sentCount : "null"}</b> times.<br />
                        <b>Schedule type:</b> Recurring.<br />
                      </>
                    )}
                    {msg.scheduleType === "datetime" && (
                      <>
                        This message is scheduled for{" "}
                        <b>
                          {msg.scheduleDateTime
                            ? new Date(msg.scheduleDateTime).toLocaleString()
                            : "null"}
                        </b>
                        .<br />
                        <b>Schedule type:</b> Specific Time.<br />
                        Repeat count: <b>{typeof msg.repeatCount === "number" ? msg.repeatCount : "null"}</b>.<br />
                        Already sent: <b>{typeof msg.sentCount === "number" ? msg.sentCount : "null"}</b> times.<br />
                      </>
                    )}
                    {msg.scheduleType === "now" && (
                      <>
                        This message will be sent immediately.<br />
                        <b>Schedule type:</b> Send Now.<br />
                        Repeat count: <b>{typeof msg.repeatCount === "number" ? msg.repeatCount : "null"}</b>.<br />
                        Already sent: <b>{typeof msg.sentCount === "number" ? msg.sentCount : "null"}</b> times.<br />
                      </>
                    )}
                    {!msg.scheduleType && (
                      <>
                        <b>Schedule type:</b> null<br />
                        Repeat count: <b>{typeof msg.repeatCount === "number" ? msg.repeatCount : "null"}</b>.<br />
                        Already sent: <b>{typeof msg.sentCount === "number" ? msg.sentCount : "null"}</b> times.<br />
                      </>
                    )}
                    {/* Tip at the end */}
                    <div style={{ marginTop: 6 }}>
                      <span style={{ color: "#0d6efd" }}>
                        Tip: Refresh below to see updated sent counts.
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {/* Refresh button below the latest reply */}
            {idx === activeMessages.length - 1 && hasUpdate && (
              <div
                style={{
                  width: "100%",
                  display: "flex",
                  justifyContent: isSent ? "flex-end" : "flex-start",
                  marginTop: 2,
                  marginBottom: 16,
                }}
              >
                <button
                  className="border-0 bg-transparent p-0"
                  title="Refresh"
                  style={{
                    borderRadius: "50%",
                    width: 24,
                    height: 24,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "#e9ecef",
                    color: "#0d6efd",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.07)",
                    transition: "background 0.2s",
                    cursor: "pointer",
                  }}
                  onClick={onManualRefresh}
                >
                  <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.65 6.35A7.95 7.95 0 0 0 12 4V1L7 6l5 5V7c1.93 0 3.68.78 4.95 2.05A7 7 0 1 1 5 12H3a9 9 0 1 0 14.65-5.65z"/>
                  </svg>
                </button>
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

export default ChatMessages;