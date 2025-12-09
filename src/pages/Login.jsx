import React, { useState, useEffect, useRef } from "react";
import api, { googleLogin } from "../services/api";     // ✅ Correct import
import { saveToken } from "../utils/auth";
import { useNavigate } from "react-router-dom";

const GOOGLE_CLIENT_ID =
  "856313994821-qqi10amq812emvt5q2tgo9otkpf2e21u.apps.googleusercontent.com";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleReady, setGoogleReady] = useState(false);
  const navigate = useNavigate();
  const googleButtonRef = useRef(null);

  // ---------------- GOOGLE SIGN-IN INIT ----------------
  useEffect(() => {
    let checkInterval = null;
    let timeoutId = null;
    let initialized = false;

    const initializeGoogleSignIn = () => {
      if (initialized) return; // Prevent double initialization
      
      if (window.google?.accounts?.id && googleButtonRef.current) {
        try {
          window.google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: handleGoogleSignIn,
          });

          window.google.accounts.id.renderButton(googleButtonRef.current, {
            theme: "outline",
            size: "large",
            width: 300, // Fixed width in pixels (Google doesn't accept percentage)
            text: "signin_with",
            locale: "en",
          });

          setGoogleReady(true);
          initialized = true;
          
          // Clear any pending checks
          if (checkInterval) clearInterval(checkInterval);
          if (timeoutId) clearTimeout(timeoutId);
        } catch (error) {
          console.error("Error initializing Google Sign-In:", error);
        }
      }
    };

    // Check if already loaded
    if (window.google?.accounts?.id) {
      // Small delay to ensure DOM is ready
      setTimeout(initializeGoogleSignIn, 100);
    } else {
      // Wait for script to load
      checkInterval = setInterval(() => {
        if (window.google?.accounts?.id) {
          clearInterval(checkInterval);
          initializeGoogleSignIn();
        }
      }, 100);

      // Extended timeout (30 seconds) - script might load slowly
      timeoutId = setTimeout(() => {
        if (checkInterval) clearInterval(checkInterval);
        if (!initialized && !window.google?.accounts?.id) {
          // Only warn if script truly didn't load (not just slow)
          console.warn("Google Sign-In script is taking longer than expected to load.");
        }
      }, 30000);
    }

    // Cleanup
    return () => {
      if (checkInterval) clearInterval(checkInterval);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  // ---------------- INPUT HANDLER ----------------
  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  // ---------------- NORMAL LOGIN ----------------
  const submit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);

      const { data } = await api.post("/auth/login", form);

      const rolesArr = data.roles || [];

      // Works for ["ROLE_ADMIN"] OR [{name:"ROLE_ADMIN"}]
      const isAdmin = rolesArr.some(
        (r) =>
          r === "ROLE_ADMIN" ||
          r === "ADMIN" ||
          r?.name === "ROLE_ADMIN" ||
          r?.name === "ADMIN"
      );

      if (!isAdmin) return alert("Only admins allowed");

      saveToken(data.token);
      localStorage.setItem("xomo_login", JSON.stringify(data));

      navigate("/Dashboard");
    } catch (err) {
      alert(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  // ---------------- GOOGLE LOGIN ----------------
  const handleGoogleSignIn = async (googleResponse) => {
    try {
      setGoogleLoading(true);

      // Extract credential from Google's response
      let credential =
        googleResponse?.credential ||
        googleResponse?.id_token ||
        googleResponse?.token ||
        (typeof googleResponse === "string" ? googleResponse : null);

      if (!credential) {
        throw new Error("No valid credential received from Google");
      }

      console.log("Calling googleLogin with credential length:", credential.length);
      
      // Call the API - this returns the backend response data
      const backendResponse = await googleLogin(credential);
      
      console.log("Backend response received:", backendResponse);
      console.log("Backend response type:", typeof backendResponse);
      console.log("Backend response keys:", backendResponse ? Object.keys(backendResponse) : "null");
      
      if (!backendResponse) {
        throw new Error("No response received from server");
      }

      const token = backendResponse.token || backendResponse.accessToken;
      if (!token) {
        console.error("No token found in response. Response structure:", backendResponse);
        throw new Error("No token received from server. Please check backend response.");
      }
      
      const rolesArr = backendResponse.roles || [];

      const isAdmin = rolesArr.some(
        (r) =>
          r === "ROLE_ADMIN" ||
          r === "ADMIN" ||
          r?.name === "ROLE_ADMIN" ||
          r?.name === "ADMIN"
      );

      if (!isAdmin) {
        alert("Only admins allowed");
        return;
      }

      saveToken(token);
      localStorage.setItem("xomo_login", JSON.stringify(backendResponse));
      navigate("/Dashboard");
    } catch (err) {
      console.error("Google login error:", err);
      console.error("Error stack:", err.stack);
      const errorMessage = err.response?.data?.message || err.message || "Google login failed. Please try again.";
      alert(errorMessage);
    } finally {
      setGoogleLoading(false);
    }
  };

  // ---------------- UI ----------------
  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <div style={styles.logo}>⚡</div>
          <h1 style={styles.title}>Admin Login</h1>
          <p style={styles.subtitle}>Sign in to access the admin panel</p>
        </div>

        {/* Normal Login Form */}
        <form onSubmit={submit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Email</label>
            <input
              name="email"
              type="email"
              placeholder="Enter email"
              value={form.email}
              onChange={handleChange}
              style={styles.input}
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <input
              name="password"
              type="password"
              placeholder="Enter password"
              value={form.password}
              onChange={handleChange}
              style={styles.input}
              required
            />
          </div>

          <button
            type="submit"
            style={{
              ...styles.submitButton,
              ...(loading ? styles.buttonLoading : {}),
            }}
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        {/* Divider */}
        <div style={styles.divider}>
          <span style={styles.dividerLine} />
          <span style={styles.dividerText}>OR</span>
          <span style={styles.dividerLine} />
        </div>

        {/* Google Login */}
        <div style={styles.googleSection}>
          <div ref={googleButtonRef} style={styles.googleButtonContainer}></div>

          {!googleReady && (
            <div style={styles.googleLoading}>
              <span style={{ color: "#718096", fontSize: "12px" }}>
                Loading Google Sign-In...
              </span>
            </div>
          )}

          {googleLoading && (
            <div style={styles.googleLoading}>
              <div style={styles.spinner}></div>
              <span>Signing in with Google...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ---------------- STYLES ----------------
const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f5f7fa",
    padding: "20px",
  },
  card: {
    width: "100%",
    maxWidth: "420px",
    backgroundColor: "white",
    borderRadius: "16px",
    padding: "40px",
    boxShadow: "0 4px 24px rgba(0,0,0,0.1)",
    border: "1px solid #e0e6ed",
  },
  header: { textAlign: "center", marginBottom: "32px" },
  logo: { fontSize: "48px", marginBottom: "16px" },
  title: { fontSize: "28px", fontWeight: "700", color: "#1a202c" },
  subtitle: { fontSize: "14px", color: "#718096" },
  form: { display: "flex", flexDirection: "column", gap: "20px" },
  inputGroup: { display: "flex", flexDirection: "column", gap: "8px" },
  label: { fontSize: "14px", fontWeight: "500", color: "#4a5568" },
  input: {
    padding: "12px 16px",
    fontSize: "16px",
    border: "1px solid #e0e6ed",
    borderRadius: "8px",
    backgroundColor: "#f8f9fa",
  },
  submitButton: {
    padding: "14px",
    fontSize: "16px",
    fontWeight: "600",
    color: "white",
    backgroundColor: "#667eea",
    borderRadius: "8px",
    cursor: "pointer",
    marginTop: "8px",
  },
  buttonLoading: { opacity: 0.7, cursor: "not-allowed" },
  divider: { display: "flex", alignItems: "center", margin: "24px 0" },
  dividerLine: {
    flex: 1,
    height: "1px",
    backgroundColor: "#e0e6ed",
  },
  dividerText: {
    margin: "0 12px",
    color: "#a0aec0",
    fontSize: "12px",
  },
  googleSection: { display: "flex", flexDirection: "column", gap: "12px" },
  googleButtonContainer: { 
    display: "flex", 
    justifyContent: "center",
    width: "100%",
    minHeight: "40px"
  },
  googleLoading: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "12px",
    padding: "12px",
    color: "#667eea",
  },
  spinner: {
    width: "20px",
    height: "20px",
    border: "3px solid #e0e6ed",
    borderTop: "3px solid #667eea",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
};

// Spinner animation
if (typeof document !== "undefined") {
  const style = document.createElement("style");
  style.textContent = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(style);
}
