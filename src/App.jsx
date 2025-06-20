import { useState } from 'react'
import Register from "./Register";
import Login from "./Login";
import Dashboard from "./Dashboard";

function App() {
  const [showLogin, setShowLogin] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [user, setUser] = useState({ username: "John" }); // Replace with real user data

  if (loggedIn) {
    return <Dashboard user={user} onLogout={() => setLoggedIn(false)} />;
  }

  return (
    <>
      {showLogin ? (
        <Login
          switchToRegister={() => setShowLogin(false)}
          onLogin={() => setLoggedIn(true)}
        />
      ) : (
        <Register switchToLogin={() => setShowLogin(true)} />
      )}
    </>
  )
}

export default App
