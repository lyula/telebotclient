import React from "react";

export default function NotificationModal({ show, message, onClose }) {
  if (!show) return null;
  return (
    <div className="modal fade show" style={{
      display: "block", background: "rgba(0,0,0,0.2)", position: "fixed",
      zIndex: 4000, top: 0, left: 0, width: "100vw", height: "100vh"
    }}>
      <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: 340 }}>
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Notification</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            <div>{message}</div>
          </div>
          <div className="modal-footer">
            <button className="btn btn-primary" onClick={onClose}>OK</button>
          </div>
        </div>
      </div>
    </div>
  );
}