import React from "react";

function GroupModal({
  show,
  onClose,
  onSubmit,
  newGroupName,
  setNewGroupName,
  newGroupId,
  setNewGroupId,
  groupIdError,
  creatingGroup,
}) {
  if (!show) return null;

  return (
    <>
      <div
        className={`modal fade show ${window.innerWidth < 768 ? 'modal-mobile' : ''}`}
        id="groupModal"
        tabIndex="-1"
        style={{
          display: 'block',
          zIndex: 3000,
          position: 'fixed',
          top: window.innerWidth < 768 ? 0 : 0,
          left: window.innerWidth < 768 ? 0 : (window.innerWidth >= 768 ? 360 : 0),
          width: window.innerWidth < 768 ? '100vw' : (window.innerWidth >= 768 ? 'calc(100vw - 360px)' : '100vw'),
          height: '100vh',
          overflowY: 'auto',
          background: 'rgba(0,0,0,0.01)',
        }}
        aria-labelledby="groupModalLabel"
        aria-modal="true"
        role="dialog"
      >
        <div className="modal-dialog modal-dialog-centered" style={{
          minHeight: '100vh',
          margin: 0,
          ...(window.innerWidth < 768
            ? {
                width: '100vw',
                maxWidth: '100vw',
                height: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }
            : {
                width: '100%',
                maxWidth: 400,
                height: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }),
        }}>
          <div className="modal-content" style={window.innerWidth < 768 ? {width: '95vw', maxWidth: 400} : {width: '95%', maxWidth: 400}}>
            <div className="modal-header">
              <h5 className="modal-title" id="groupModalLabel">Create New Group</h5>
              <button
                type="button"
                className="btn-close"
                onClick={onClose}
                aria-label="Close"
              ></button>
            </div>
            <form onSubmit={onSubmit}>
              <div className="modal-body">
                <div className="mb-3">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Group Name"
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    required
                    maxLength={50}
                  />
                </div>
                <div className="mb-1">
                  <input
                    type="text"
                    className={`form-control ${groupIdError ? "is-invalid" : ""}`}
                    placeholder="Telegram Group ID (e.g. -1001234567890 or @publicgroup)"
                    value={newGroupId}
                    onChange={(e) => {
                      setNewGroupId(e.target.value);
                      // Clear error on change
                      if (groupIdError) setTimeout(() => onClose(), 0);
                    }}
                    required
                  />
                  {groupIdError && (
                    <div className="invalid-feedback">{groupIdError}</div>
                  )}
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={onClose}
                  disabled={creatingGroup}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={creatingGroup}>
                  {creatingGroup ? "Creating..." : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      <div
        className="modal-backdrop fade show"
        style={{
          zIndex: 2999,
          position: 'fixed',
          top: 0,
          left: window.innerWidth < 768 ? 0 : (window.innerWidth >= 768 ? 360 : 0),
          width: window.innerWidth < 768 ? '100vw' : (window.innerWidth >= 768 ? 'calc(100vw - 360px)' : '100vw'),
          height: '100vh',
          background: 'rgba(0,0,0,0.5)',
        }}
        onClick={onClose}
      ></div>
    </>
  );
}

export default GroupModal;