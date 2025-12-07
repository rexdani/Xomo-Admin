import React, { useEffect, useState, useCallback } from "react";
import { getUserById, updateUserRoles } from "../../services/api";
import { useParams, Link } from "react-router-dom";

const AVAILABLE_ROLES = [
  { value: "ROLE_ADMIN", label: "Admin" },
  { value: "ROLE_USER", label: "User" },
  { value: "ADMIN", label: "Admin (Alt)" },
  { value: "USER", label: "User (Alt)" }
];

export default function UserView() {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingRoles, setEditingRoles] = useState(false);
  const [tempRoles, setTempRoles] = useState([]);
  const [updatingRoles, setUpdatingRoles] = useState(false);

  const loadUser = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      const res = await getUserById(id);
      setUser(res);
      // Initialize temp roles for editing
      const rolesList = res.roles ? (Array.isArray(res.roles) ? res.roles : Array.from(res.roles)) : [];
      setTempRoles(rolesList.map(r => r.name || r));
    } catch (err) {
      console.error(err);
      setError("Failed to load user. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    let cancelled = false;
    loadUser();
    return () => { cancelled = true; };
  }, [loadUser]);

  const toggleTempRole = useCallback((roleName) => {
    setTempRoles(prev => {
      if (prev.includes(roleName)) {
        return prev.filter(r => r !== roleName);
      } else {
        return [...prev, roleName];
      }
    });
  }, []);

  const saveRoles = useCallback(async () => {
    setUpdatingRoles(true);
    try {
      await updateUserRoles(id, tempRoles);
      await loadUser(); // Reload to get updated data
      setEditingRoles(false);
    } catch (err) {
      console.error(err);
      alert("Failed to update roles: " + (err.response?.data?.message || "Unknown error"));
    } finally {
      setUpdatingRoles(false);
    }
  }, [id, tempRoles, loadUser]);

  const cancelEditingRoles = useCallback(() => {
    const rolesList = user.roles ? (Array.isArray(user.roles) ? user.roles : Array.from(user.roles)) : [];
    setTempRoles(rolesList.map(r => r.name || r));
    setEditingRoles(false);
  }, [user]);

  if (loading) {
    return <div className="loading-state">Loading user...</div>;
  }

  if (error || !user) {
    return (
      <div>
        <div className="error-state">
          <p>{error || "User not found"}</p>
          <button onClick={loadUser}>Retry</button>
          <Link to="/users"><button>Back to Users</button></Link>
        </div>
      </div>
    );
  }

  const userName = user.Name || user.name || user.fullName || "-";
  const rolesList = user.roles ? (Array.isArray(user.roles) ? user.roles : Array.from(user.roles)) : [];

  return (
    <div className="user-view">
      <div className="user-view-header">
        <div>
          <h2>User Details</h2>
          <p className="user-id">User ID: #{user.id}</p>
        </div>
        <div className="user-actions">
          <Link to="/users"><button>Back to Users</button></Link>
        </div>
      </div>

      <div className="user-details-grid">
        <div className="user-info-section">
          <h3>Personal Information</h3>
          <div className="info-item">
            <label>Full Name:</label>
            <span>{userName}</span>
          </div>
          <div className="info-item">
            <label>Email:</label>
            <span>{user.email || "-"}</span>
          </div>
          <div className="info-item">
            <label>Phone:</label>
            <span>{user.phone || "-"}</span>
          </div>
        </div>

        <div className="user-info-section">
          <h3>Roles & Permissions</h3>
          {editingRoles ? (
            <div className="role-editor-full">
              <div className="role-checkboxes">
                {AVAILABLE_ROLES.map(role => {
                  const hasRole = tempRoles.includes(role.value);
                  return (
                    <label key={role.value} className="role-checkbox-label">
                      <input
                        type="checkbox"
                        checked={hasRole}
                        onChange={() => toggleTempRole(role.value)}
                        disabled={updatingRoles}
                      />
                      <span>{role.label}</span>
                    </label>
                  );
                })}
              </div>
              <div className="role-editor-actions">
                <button
                  onClick={saveRoles}
                  className="btn-save-small"
                  disabled={updatingRoles}
                >
                  {updatingRoles ? "Saving..." : "Save Roles"}
                </button>
                <button
                  onClick={cancelEditingRoles}
                  className="btn-cancel-small"
                  disabled={updatingRoles}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div>
              {rolesList.length > 0 ? (
                <div className="roles-badges">
                  {rolesList.map((r, idx) => (
                    <span key={idx} className="role-badge">
                      {r.name || r}
                    </span>
                  ))}
                </div>
              ) : (
                <span className="no-roles">No roles assigned</span>
              )}
              <button
                onClick={() => setEditingRoles(true)}
                className="btn-edit-roles"
                style={{ marginTop: '12px' }}
              >
                ✏️ Edit Roles
              </button>
            </div>
          )}
        </div>
      </div>

      {user.address && (
        <div className="user-info-section">
          <h3>Address Information</h3>
          <div className="address-details">
            {user.address.street && (
              <div className="info-item">
                <label>Street:</label>
                <span>{user.address.street}</span>
              </div>
            )}
            {user.address.city && (
              <div className="info-item">
                <label>City:</label>
                <span>{user.address.city}</span>
              </div>
            )}
            {user.address.state && (
              <div className="info-item">
                <label>State:</label>
                <span>{user.address.state}</span>
              </div>
            )}
            {user.address.pincode && (
              <div className="info-item">
                <label>PIN Code:</label>
                <span>{user.address.pincode}</span>
              </div>
            )}
            {user.address.country && (
              <div className="info-item">
                <label>Country:</label>
                <span>{user.address.country}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {!user.address && (
        <div className="user-info-section">
          <h3>Address Information</h3>
          <p className="no-data">No address information available</p>
        </div>
      )}
    </div>
  );
}

