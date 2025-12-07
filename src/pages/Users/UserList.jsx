// src/pages/Users/UserList.jsx
import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { getUsers, deleteUser, updateUserRoles } from "../../services/api";

// Common roles in the system
const AVAILABLE_ROLES = [
  { value: "ROLE_ADMIN", label: "Admin" },
  { value: "ROLE_USER", label: "User" },
  { value: "ADMIN", label: "Admin (Alt)" },
  { value: "USER", label: "User (Alt)" }
];

export default function UserList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [updatingRoles, setUpdatingRoles] = useState({});
  const [editingRoles, setEditingRoles] = useState(null);
  const [tempRoles, setTempRoles] = useState({});

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const list = await getUsers();
      setUsers(list || []);
    } catch (err) {
      console.error(err);
      setError("Failed to load users. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const remove = useCallback(async (id) => {
    if (!confirm("Delete user? This action cannot be undone.")) return;
    try {
      setDeleting(id);
      await deleteUser(id);
      await load();
    } catch (err) {
      console.error(err);
      alert("Delete failed: " + (err.response?.data?.message || "Unknown error"));
    } finally {
      setDeleting(null);
    }
  }, [load]);

  const startEditingRoles = useCallback((userId, currentRoles) => {
    const rolesList = currentRoles ? (Array.isArray(currentRoles) ? currentRoles : Array.from(currentRoles)) : [];
    const roleNames = rolesList.map(r => r.name || r);
    setTempRoles({ [userId]: roleNames });
    setEditingRoles(userId);
  }, []);

  const toggleTempRole = useCallback((userId, roleName) => {
    setTempRoles(prev => {
      const currentRoles = prev[userId] || [];
      if (currentRoles.includes(roleName)) {
        return { ...prev, [userId]: currentRoles.filter(r => r !== roleName) };
      } else {
        return { ...prev, [userId]: [...currentRoles, roleName] };
      }
    });
  }, []);

  const saveRoles = useCallback(async (userId) => {
    const newRoles = tempRoles[userId] || [];
    
    setUpdatingRoles(prev => ({ ...prev, [userId]: true }));
    try {
      await updateUserRoles(userId, newRoles);
      // Reload users to get updated data
      await load();
      setEditingRoles(null);
      setTempRoles(prev => {
        const updated = { ...prev };
        delete updated[userId];
        return updated;
      });
    } catch (err) {
      console.error(err);
      alert("Failed to update roles: " + (err.response?.data?.message || "Unknown error"));
    } finally {
      setUpdatingRoles(prev => ({ ...prev, [userId]: false }));
    }
  }, [tempRoles, load]);

  const cancelEditingRoles = useCallback((userId) => {
    setEditingRoles(null);
    setTempRoles(prev => {
      const updated = { ...prev };
      delete updated[userId];
      return updated;
    });
  }, []);

  if (loading) {
    return (
      <div>
        <h2>Users</h2>
        <div className="loading-state">Loading users...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h2>Users</h2>
        <div className="error-state">
          <p>{error}</p>
          <button onClick={load}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <h2>Users</h2>
        <div className="user-stats">
          <span>Total: {users.length}</span>
        </div>
      </div>
      {users.length === 0 ? (
        <div className="empty-state">
          <p>No users found.</p>
        </div>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Roles</th>
              <th>Address</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => {
              // Handle Name field (capital N from backend)
              const userName = u.Name || u.name || u.fullName || "-";
              // Handle roles (Set or Array)
              const rolesList = u.roles ? (Array.isArray(u.roles) ? u.roles : Array.from(u.roles)) : [];
              const rolesDisplay = rolesList.length > 0 
                ? rolesList.map(r => r.name || r).join(", ")
                : "-";
              // Handle address
              const addressDisplay = u.address 
                ? `${u.address.city || ""}${u.address.city && u.address.state ? ", " : ""}${u.address.state || ""}${u.address.pincode ? ` - ${u.address.pincode}` : ""}`.trim() || "Address set"
                : "-";
              
              return (
                <tr key={u.id}>
                  <td>{u.id}</td>
                  <td>{userName}</td>
                  <td>{u.email || "-"}</td>
                  <td>{u.phone || "-"}</td>
                  <td>
                    {editingRoles === u.id ? (
                      <div className="role-editor">
                        <div className="role-checkboxes">
                          {AVAILABLE_ROLES.map(role => {
                            const currentTempRoles = tempRoles[u.id] || [];
                            const hasRole = currentTempRoles.includes(role.value);
                            return (
                              <label key={role.value} className="role-checkbox-label">
                                <input
                                  type="checkbox"
                                  checked={hasRole}
                                  onChange={() => toggleTempRole(u.id, role.value)}
                                  disabled={updatingRoles[u.id]}
                                />
                                <span>{role.label}</span>
                              </label>
                            );
                          })}
                        </div>
                        <div className="role-editor-actions">
                          <button
                            onClick={() => saveRoles(u.id)}
                            className="btn-save-small"
                            disabled={updatingRoles[u.id]}
                          >
                            {updatingRoles[u.id] ? "Saving..." : "Save"}
                          </button>
                          <button
                            onClick={() => cancelEditingRoles(u.id)}
                            className="btn-cancel-small"
                            disabled={updatingRoles[u.id]}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="roles-cell">
                        {rolesDisplay !== "-" ? (
                          <div className="roles-badges">
                            {rolesList.map((r, idx) => (
                              <span key={idx} className="role-badge">
                                {r.name || r}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="no-roles">No roles</span>
                        )}
                        <button
                          onClick={() => startEditingRoles(u.id, u.roles)}
                          className="btn-edit-roles"
                          title="Edit roles"
                        >
                          ✏️
                        </button>
                      </div>
                    )}
                  </td>
                  <td className="address-cell">{addressDisplay}</td>
                  <td>
                    <div className="action-buttons">
                      <Link to={`/users/${u.id}`} className="btn-view">
                        View
                      </Link>
                      <button 
                        onClick={() => remove(u.id)}
                        disabled={deleting === u.id}
                        className="btn-delete"
                      >
                        {deleting === u.id ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}
