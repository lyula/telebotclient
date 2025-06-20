import React, { useState } from "react";
import { API_BASE_URL } from "./api";

function Login({ switchToRegister, onLogin }) {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [dots, setDots] = useState("");
  const [error, setError] = useState("");

  // Animate dots
  React.useEffect(() => {
    if (!loading) return;
    let count = 0;
    const interval = setInterval(() => {
      count = (count + 1) % 4;
      setDots(".".repeat(count));
    }, 400);
    return () => clearInterval(interval);
  }, [loading]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Login failed");
      // Call parent onLogin with user data or token
      onLogin(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setDots("");
    }
  };

  return (
    <div className="d-flex align-items-center justify-content-center" style={{ minHeight: "100vh", width: "100vw" }}>
      <div className="card shadow p-4" style={{ maxWidth: 340, width: "100%" }}>
        <h2 className="mb-4 text-center" style={{ color: "#0d6efd" }}>Login</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="email" className="form-label">Email address</label>
            <input
              type="email"
              className="form-control"
              id="email"
              placeholder="Enter email"
              required
              value={form.email}
              onChange={handleChange}
              disabled={loading}
            />
          </div>
          <div className="mb-3">
            <label htmlFor="password" className="form-label">Password</label>
            <input
              type="password"
              className="form-control"
              id="password"
              placeholder="Enter password"
              required
              value={form.password}
              onChange={handleChange}
              disabled={loading}
            />
          </div>
          {error && <div className="alert alert-danger py-1">{error}</div>}
          <button
            type="submit"
            className="btn btn-primary w-100"
            disabled={loading}
            style={{ position: "relative" }}
          >
            Login
            <span style={{
              display: "inline-block",
              minWidth: "20px",
              marginLeft: "4px",
              letterSpacing: "2px"
            }}>
              {loading && <span>{dots}</span>}
            </span>
          </button>
        </form>
        <div className="mt-3 text-center">
          <small>
            Don't have an account?{" "}
            <button className="btn btn-link p-0" style={{ color: "#0d6efd" }} onClick={switchToRegister} disabled={loading}>
              Register
            </button>
          </small>
        </div>
      </div>
    </div>
  );
}

export default Login;

// App.jsx
const handleLogin = async (credentials) => {
  console.log("Login credentials:", credentials); // Add this line
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });
  const data = await res.json();
  console.log("Login response:", data); // Add this line
  if (data.user) {
    setUser(data.user);
    localStorage.setItem("token", data.token);
    setLoggedIn(true);
  } else {
    alert(data.message || "Login failed");
  }
};