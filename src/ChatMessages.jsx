import React, { useRef, useState, useEffect } from "react";

function formatDateLabel(date) {
  const now = new Date();
  const msgDate = new Date(date);
  const diff = Math.floor((now - msgDate) / (1000 * 60 * 60 * 24));
  if (
    now.getFullYear() === msgDate.getFullYear() &&
    now.getMonth() === msgDate.getMonth() &&
    now.getDate() === msgDate.getDate()
  ) {
    return "Today";
  }
  if (
    diff === 1 &&
    now.getDate() - msgDate.getDate() === 1 &&
    now.getMonth() === msgDate.getMonth() &&
    now.getFullYear() === msgDate.getFullYear()
  ) {
    return "Yesterday";
  }
  return msgDate.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function groupMessagesByDate(messages) {
  const groups = [];
  let lastDate = null;
  messages.forEach((msg, idx) => {
    const date = new Date(msg.time || msg.createdAt);
    const dateKey = date.toISOString().slice(0, 10);
    if (dateKey !== lastDate) {
      groups.push({
        type: "separator",
        date: date,
        label: formatDateLabel(date),
        key: `sep-${dateKey}-${idx}`,
      });
      lastDate = dateKey;
    }
    groups.push({ ...msg, type: "message", key: msg._id || idx });
  });
  return groups;
}

function ChatMessages({
  activeMessages,
  formatWhatsAppTime,
  onTogglePaused,
  activeChat,
  onManualRefresh,
  bottomControlsHeight = 72,
}) {
  const chatContainerRef = useRef(null);
  const [refreshing, setRefreshing] = useState(false);
  const refreshTimeout = useRef();
  const [stickyDate, setStickyDate] = useState("");
  const [showSticky, setShowSticky] = useState(false);
  const lastScrollTop = useRef(0);

  // Group messages by date
  const groupedMessages = groupMessagesByDate(activeMessages);

  // Sticky date label logic (only show on scroll up, hide on scroll down)
  useEffect(() => {
    const chatDiv = chatContainerRef.current;
    if (!chatDiv) return;

    const handleScroll = () => {
      // Find the first visible message separator
      const separators = Array.from(chatDiv.querySelectorAll(".date-separator"));
      let found = "";
      for (let i = separators.length - 1; i >= 0; i--) {
        const rect = separators[i].getBoundingClientRect();
        if (rect.top < chatDiv.getBoundingClientRect().top + 60) {
          found = separators[i].dataset.label;
          break;
        }
      }
      setStickyDate(found);

      // Detect scroll direction
      const st = chatDiv.scrollTop;
      if (st < lastScrollTop.current) {
        // Scrolling up
        setShowSticky(true);
      } else {
        // Scrolling down
        setShowSticky(false);
      }
      lastScrollTop.current = st <= 0 ? 0 : st;

      // Trigger refresh if scrolled to bottom
      if (chatDiv.scrollHeight - chatDiv.scrollTop - chatDiv.clientHeight < 20) {
        onManualRefresh();
      }
    };

    chatDiv.addEventListener("scroll", handleScroll);
    // Initial call
    handleScroll();
    return () => chatDiv.removeEventListener("scroll", handleScroll);
  }, [onManualRefresh, groupedMessages]);

  if (activeMessages.length === 0) {
    return (
      <div className="text-center text-muted my-auto">
        No messages yet. Say hello!
      </div>
    );
  }

  // Find the last message's alignment for refresh button placement
  const lastMsg = activeMessages[activeMessages.length - 1];
  const isLastSent = lastMsg && (lastMsg.sent || lastMsg.isSent || lastMsg.user === (activeChat?.user || "me"));

  return (
    <div
      ref={chatContainerRef}
      style={{
        marginBottom: 0,
        overflowY: "auto",
        height: "100%",
        scrollbarWidth: "none",
        msOverflowStyle: "none",
        paddingBottom: bottomControlsHeight + 8, // minimal padding
        position: "relative",
      }}
      className="hide-scrollbar"
    >
      {/* Sticky date label: no background, only visible when scrolling up */}
      {stickyDate && showSticky && (
        <div
          style={{
            position: "sticky",
            top: 0,
            zIndex: 10,
            textAlign: "center",
            padding: "4px 0 2px 0",
            fontWeight: 500,
            fontSize: 13,
            color: "#444",
            borderBottom: "1px solid #eee",
            background: "none", // No background
            transition: "opacity 0.2s",
          }}
        >
          {stickyDate}
        </div>
      )}
      {groupedMessages.map((item, idx) => {
        if (item.type === "separator") {
          return (
            <div
              className="date-separator"
              data-label={item.label}
              key={item.key}
              style={{
                textAlign: "center",
                margin: "16px 0 8px 0",
                position: "relative",
                zIndex: 2,
              }}
            >
              <span
                style={{
                  background: "#e9ecef",
                  color: "#555",
                  borderRadius: 8,
                  padding: "2px 12px",
                  fontSize: 12,
                  fontWeight: 500,
                  display: "inline-block",
                  boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
                }}
              >
                {item.label}
              </span>
            </div>
          );
        }

        // ...your existing message rendering code, using item instead of msg...
        const msg = item;
        const isSent = msg.sent || msg.isSent || msg.user === (activeChat?.user || "me");
        const hasUpdate =
          msg.scheduleType !== "now" &&
          (msg.scheduleSummary || (typeof msg.repeatCount === "number" && msg.repeatCount > 1));
        const messagePreview = (msg.text || msg.message || "").slice(0, 20);
        const messagePreviewEllipsis = (msg.text || msg.message || "").length > 20 ? "..." : "";

        return (
          <React.Fragment key={msg.key}>
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
                  {/* Always show ticks for all message types */}
                  <span style={{ marginLeft: 8, display: "flex", alignItems: "center" }}>
                    {/* Grey double tick for unsent */}
                    {(
                      (!msg.sentCount || msg.sentCount === 0) ||
                      (msg.scheduleType === "datetime" && !msg.isSent)
                    ) && (
                      <svg width="18" height="18" style={{ marginLeft: 2 }} viewBox="0 0 24 24">
                        <path fill="#bbb" d="M1.73,12.91 1.73,12.91 8.1,19.28 22.79,4.59 21.37,3.17 8.1,16.44 3.14,11.48z"/>
                        <path fill="#bbb" d="M5.73,12.91 5.73,12.91 12.1,19.28 23.79,7.59 22.37,6.17 12.1,16.44 7.14,11.48z"/>
                      </svg>
                    )}
                    {/* One blue, one grey tick for partial sent (mainly for interval/recurring) */}
                    {msg.sentCount > 0 && msg.sentCount < (msg.repeatCount ?? 1) && msg.scheduleType !== "datetime" && (
                      <>
                        <svg width="18" height="18" style={{ marginLeft: 2 }} viewBox="0 0 24 24">
                          <path fill="#0d6efd" d="M1.73,12.91 1.73,12.91 8.1,19.28 22.79,4.59 21.37,3.17 8.1,16.44 3.14,11.48z"/>
                        </svg>
                        <svg width="18" height="18" style={{ marginLeft: -8 }} viewBox="0 0 24 24">
                          <path fill="#bbb" d="M5.73,12.91 5.73,12.91 12.1,19.28 23.79,7.59 22.37,6.17 12.1,16.44 7.14,11.48z"/>
                        </svg>
                      </>
                    )}
                    {/* Double blue tick for sent */}
                    {(
                      (msg.sentCount >= (msg.repeatCount ?? 1) && msg.scheduleType !== "datetime") ||
                      (msg.scheduleType === "datetime" && msg.isSent)
                    ) && (
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
                          {msg.scheduleTime
                            ? new Date(msg.scheduleTime).toLocaleString()
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
            {/* Only render the refresh button after the last message */}
            {idx === groupedMessages.length - 1 && (
              <div
                style={{
                  width: "100%",
                  display: "flex",
                  justifyContent: isSent ? "flex-end" : "flex-start",
                  marginTop: 2,
                  marginBottom: 0, // minimal gap
                }}
              >
                <button
                  className="border-0 bg-transparent p-0"
                  title="Refresh"
                  style={{
                    borderRadius: "50%",
                    width: 28,
                    height: 28,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "#e9ecef",
                    color: "#0d6efd",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.07)",
                    transition: "background 0.2s",
                    cursor: "pointer",
                  }}
                  onClick={() => {
                    setRefreshing(false);
                    setTimeout(() => {
                      setRefreshing(true);
                      if (refreshTimeout.current) clearTimeout(refreshTimeout.current);
                      refreshTimeout.current = setTimeout(() => setRefreshing(false), 350);
                      onManualRefresh();
                    }, 10);
                  }}
                >
                  <svg
                    key={refreshing ? "spin" : "static"}
                    width="16"
                    height="16"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    style={{
                      animation: refreshing ? "spin-refresh 0.35s linear" : "none",
                    }}
                  >
                    <path d="M17.65 6.35A7.95 7.95 0 0 0 12 4V1L7 6l5 5V7c1.93 0 3.68.78 4.95 2.05A7 7 0 1 1 5 12H3a9 9 0 1 0 14.65-5.65z"/>
                  </svg>
                </button>
                <style>
                  {`
                    @keyframes spin-refresh {
                      100% { transform: rotate(360deg);}
                    }
                  `}
                </style>
              </div>
            )}
          </React.Fragment>
        );
      })}
      <style>
        {`
          .hide-scrollbar::-webkit-scrollbar {
            display: none;
          }
          .hide-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
        `}
      </style>
    </div>
  );
}

export default ChatMessages;