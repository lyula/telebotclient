import { useState } from 'react'
import Register from "./Register";
import Login from "./Login";
import Dashboard from "./Dashboard";

const API_BASE_URL = 'https://telebot-0ev9.onrender.com/api';

function App() {
  const [showLogin, setShowLogin] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false);
  const [user, setUser] = useState(null);

  const handleLogin = (data) => {
    if (data.user) {
      setUser(data.user);
      localStorage.setItem("token", data.token);
      setLoggedIn(true);
    } else {
      alert(data.message || "Login failed");
    }
  };
// pushed githun back
  const handleLogout = () => {
    setUser(null);
    setLoggedIn(false);
    localStorage.removeItem("token");
  };

  if (loggedIn) {
    return <Dashboard user={user} onLogout={handleLogout} />;
  }

  return (
    <>
      {showLogin ? (
        <Login
          switchToRegister={() => setShowLogin(false)}
          onLogin={handleLogin}
        />
      ) : (
        <Register switchToLogin={() => setShowLogin(true)} />
      )}
    </>
  )
}

export default App
