import React, { useMemo, useState } from "react";
import { createUser, getBookUrl, login } from "./api.js";

const storageKey = "mdbook_token";

function loadSession() {
  const token = localStorage.getItem(storageKey);
  const rawUser = localStorage.getItem("mdbook_user");
  const user = rawUser ? JSON.parse(rawUser) : null;
  return { token, user };
}

function saveSession(token, user) {
  localStorage.setItem(storageKey, token);
  localStorage.setItem("mdbook_user", JSON.stringify(user));
}

function clearSession() {
  localStorage.removeItem(storageKey);
  localStorage.removeItem("mdbook_user");
}

export default function App() {
  const initial = useMemo(loadSession, []);
  const [token, setToken] = useState(initial.token);
  const [user, setUser] = useState(initial.user);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [adminForm, setAdminForm] = useState({ email: "", password: "", role: "reader" });
  const [adminMessage, setAdminMessage] = useState("");

  async function handleLogin(e) {
    e.preventDefault();
    setError("");
    try {
      const data = await login(email, password);
      setToken(data.token);
      setUser(data.user);
      saveSession(data.token, data.user);
    } catch (err) {
      setError(err.message);
    }
  }

  function handleLogout() {
    clearSession();
    setToken(null);
    setUser(null);
  }

  async function handleCreateUser(e) {
    e.preventDefault();
    setAdminMessage("");
    try {
      await createUser(token, adminForm);
      setAdminMessage("User created");
      setAdminForm({ email: "", password: "", role: "reader" });
    } catch (err) {
      setAdminMessage(err.message);
    }
  }

  return (
    <div className="page">
      <header className="header">
        <div>
          <div className="title">mdBook Secure Portal</div>
          <div className="subtitle">Access is restricted to authenticated users.</div>
        </div>
        {user ? (
          <div className="user">
            <span>{user.email}</span>
            <span className={`role role-${user.role}`}>{user.role}</span>
            <button className="secondary" onClick={handleLogout}>Logout</button>
          </div>
        ) : null}
      </header>

      {!user ? (
        <section className="card">
          <h2>Sign in</h2>
          <form onSubmit={handleLogin} className="form">
            <label>
              Email
              <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
            </label>
            <label>
              Password
              <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required />
            </label>
            {error ? <div className="error">{error}</div> : null}
            <button type="submit">Login</button>
          </form>
        </section>
      ) : (
        <section className="card">
          <h2>Book Access</h2>
          <p>Open the secured mdBook in a new tab.</p>
          <a className="primary" href={getBookUrl(token)} target="_blank" rel="noreferrer">
            Open Book
          </a>
        </section>
      )}

      {user && user.role === "admin" ? (
        <section className="card">
          <h2>Admin: Create User</h2>
          <form onSubmit={handleCreateUser} className="form">
            <label>
              Email
              <input
                value={adminForm.email}
                onChange={(e) => setAdminForm({ ...adminForm, email: e.target.value })}
                type="email"
                required
              />
            </label>
            <label>
              Password
              <input
                value={adminForm.password}
                onChange={(e) => setAdminForm({ ...adminForm, password: e.target.value })}
                type="password"
                required
              />
            </label>
            <label>
              Role
              <select
                value={adminForm.role}
                onChange={(e) => setAdminForm({ ...adminForm, role: e.target.value })}
              >
                <option value="reader">reader</option>
                <option value="admin">admin</option>
              </select>
            </label>
            {adminMessage ? <div className="hint">{adminMessage}</div> : null}
            <button type="submit">Create User</button>
          </form>
        </section>
      ) : null}
    </div>
  );
}
