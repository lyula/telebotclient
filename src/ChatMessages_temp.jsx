import React from "react";

function ChatMessages({ activeChat, activeMessages, formatWhatsAppTime }) {
  if (!activeChat) {
    return (
      <div className="text-center text-muted my-auto">
        Select a chat to start messaging.
      </div>
    );
  }

  if (activeMessages.length === 0) {
    return (
      <div className="text-center text-muted my-auto">
        No messages yet.Say hello!
      </div>
    );
  }

  return (
    <>
      {activeMessages.map((msg, idx) => (
        <React.Fragment key={idx}>
          <div
            className={`d-flex mb-2 ${msg.sent ? "justify-content-end" : "justify-content-start"}`}
          >
            <div
              className={`d-flex flex-column py-2 px-3 rounded-3 position-relative ${
                msg.sent ? "chat-bubble-sent" : "chat-bubble-received"
              }`}
              style={{
                background: msg.sent ? "#0d6efd" : "#FFFFFF",
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
      ))}
    </>
  );
}

export default ChatMessages;