import { useState } from "react";
import { Link, Navigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

export default function Register() {
  const { user, register, error } = useAuth();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (user) return <Navigate to="/" replace />;

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    await register(username, email, password);
    setSubmitting(false);
  }

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h1>Create an account</h1>
        <p className="auth-subtitle">New accounts start as customers — browse and purchase right away.</p>

        <label className="field">
          <span>Username</span>
          <input value={username} onChange={(e) => setUsername(e.target.value)} required autoFocus />
        </label>

        <label className="field">
          <span>Email</span>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>

        <label className="field">
          <span>Password</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={8}
            required
          />
          <small>At least 8 characters.</small>
        </label>

        {error && <p className="form-error">{error}</p>}

        <button className="btn btn-primary" type="submit" disabled={submitting}>
          {submitting ? "Creating account…" : "Create account"}
        </button>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </form>
    </div>
  );
}
