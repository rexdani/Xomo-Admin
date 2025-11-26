import React from "react";
import { Navigate } from "react-router-dom";
import { getToken, isAdmin } from "../utils/auth";

export const PrivateRoute = ({ children }) => {
  const token = getToken();
  if (!token) return <Navigate to="/" replace />;
  try {
    if (!isAdmin()) return <Navigate to="/" replace />;
    return children;
  } catch (err) {
    console.error("PrivateRoute check failed", err);
    return <Navigate to="/" replace />;
  }
};
