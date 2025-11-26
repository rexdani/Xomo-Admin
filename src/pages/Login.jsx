import React, { useState } from "react";
import api from "../services/api";
import { saveToken } from "../utils/auth";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const navigate = useNavigate();

  const handleChange = (e) => setForm({...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post("/auth/login", form);
      // your backend returns token, message, roles, userId, email
      const { token, roles } = data;
      const rolesArr = roles || [];
      const isAdmin = rolesArr.some(r => r.name === "ROLE_ADMIN" || r.name === "ADMIN");
      if (!isAdmin) {
        alert("Only admins allowed");
        return;
      }
      saveToken(token);
      // store full login response so PrivateRoute can check roles
      localStorage.setItem("xomo_login", JSON.stringify(data));
      // navigate to dashboard after successful login
      navigate("/Dashboard");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={submit}>
        <h2>Admin Login</h2>
        <input name="email" placeholder="Email" value={form.email} onChange={handleChange}/>
        <input name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange}/>
        <button type="submit">Login</button>
      </form>
    </div>
  );
}
