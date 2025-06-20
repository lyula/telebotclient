import React from "react";

function Register({ switchToLogin }) {
  return (
    <div
      className="d-flex align-items-center justify-content-center"
      style={{ minHeight: "100vh", width: "100vw" }}
    >
      <div className="card shadow p-4" style={{ maxWidth: 340, width: "100%" }}>
        <h2 className="mb-4 text-center" style={{ color: "#0d6efd" }}>Register</h2>
        <form>
          <div className="mb-3">
            <label htmlFor="username" className="form-label">Username</label>
            <input type="text" className="form-control" id="username" placeholder="Enter username" required />
          </div>
          <div className="mb-3">
            <label htmlFor="email" className="form-label">Email address</label>
            <input type="email" className="form-control" id="email" placeholder="Enter email" required />
          </div>
          <div className="mb-3">
            <label htmlFor="password" className="form-label">Password</label>
            <input type="password" className="form-control" id="password" placeholder="Enter password" required />
          </div>
          <button type="submit" className="btn btn-primary w-100">Register</button>
        </form>
        <div className="mt-3 text-center">
          <small>
            Already have an account?{" "}
            <button className="btn btn-link p-0" style={{ color: "#0d6efd" }} onClick={switchToLogin}>
              Login
            </button>
          </small>
        </div>
      </div>
    </div>
  );
}

export default Register;