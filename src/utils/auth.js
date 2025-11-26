// src/utils/auth.js
import { jwtDecode } from "jwt-decode";

export function saveToken(token) {
  localStorage.setItem("xomo_token", token);
}

export function getToken() {
  return localStorage.getItem("xomo_token");
}

export function logout() {
  localStorage.removeItem("xomo_token");
}

export function getPayload() {
  const token = getToken();
  if (!token) return null;
  try {
    return jwtDecode(token);
  } catch (err) {
    console.error("Invalid token", err);
    return null;
  }
}

export function isAdmin() {
  // Prefer checking stored login info if present
  const loginInfo = localStorage.getItem("xomo_login");
  if (loginInfo) {
    try {
      const info = JSON.parse(loginInfo);
      const roles = info.roles || [];
      return roles.some(r => (r.name || r).toString().toUpperCase().includes("ADMIN"));
    } catch (err) {
      // fallthrough to token check
    }
  }

  const payload = getPayload();
  if (!payload) return false;
  // common claim shapes: roles, authorities, role
  const claims = payload.roles || payload.authorities || payload.role || [];
  if (Array.isArray(claims)) {
    return claims.some(r => (r.name || r).toString().toUpperCase().includes("ADMIN"));
  }
  if (typeof claims === "string") {
    return claims.toUpperCase().includes("ADMIN");
  }
  return false;
}
