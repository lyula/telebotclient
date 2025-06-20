import React from "react";

function Login({ switchToRegister, onLogin }) {
  const handleSubmit = (e) => {
    e.preventDefault();
    // Add authentication logic here
    onLogin();
  };

  return (
    <div
      className="d-flex align-items-center justify-content-center"
      style={{ minHeight: "100vh", width: "100vw" }}
    >
      <div className="card shadow p-4" style={{ maxWidth: 340, width: "100%" }}>
        <h2 className="mb-4 text-center" style={{ color: "#0d6efd" }}>Login</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="email" className="form-label">Email address</label>
            <input type="email" className="form-control" id="email" placeholder="Enter email" required />
          </div>
          <div className="mb-3">
            <label htmlFor="password" className="form-label">Password</label>
            <input type="password" className="form-control" id="password" placeholder="Enter password" required />
          </div>
          <button type="submit" className="btn btn-primary w-100">Login</button>
        </form>
        <div className="mt-3 text-center">
          <small>
            Don't have an account?{" "}
            <button className="btn btn-link p-0" style={{ color: "#0d6efd" }} onClick={switchToRegister}>
              Register
            </button>
          </small>
        </div>
      </div>
    </div>
  );
}

export default Login;