// src/pages/Users/UserList.jsx
import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { getUsers, deleteUser, updateUserRoles } from "../../services/api";

// Common roles in the system
const AVAILABLE_ROLES = [
  { value: "ROLE_ADMIN", label: "Admin" },
  { value: "ROLE_USER", label: "User" }
  
];

export default function UserList() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [updatingRoles, setUpdatingRoles] = useState({});
  const [editingRoles, setEditingRoles] = useState(null);
  const [tempRoles, setTempRoles] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const list = await getUsers();
      const usersData = list || [];
      setUsers(usersData);
      setFilteredUsers(usersData);
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

  useEffect(() => {
    let filtered = users;
    
    // Apply search filter
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = users.filter(u => {
        const id = String(u.id || "");
        const name = ((u.Name || u.name || u.fullName || "")).toLowerCase();
        const email = (u.email || "").toLowerCase();
        const phone = (u.phone || "").toLowerCase();
        const rolesList = u.roles ? (Array.isArray(u.roles) ? u.roles : Array.from(u.roles)) : [];
        const rolesDisplay = rolesList.map(r => (r.name || r)).join(" ").toLowerCase();
        const address = u.address 
          ? `${u.address.city || ""} ${u.address.state || ""} ${u.address.pincode || ""}`.toLowerCase()
          : "";
        
        return id.includes(searchLower) ||
               name.includes(searchLower) ||
               email.includes(searchLower) ||
               phone.includes(searchLower) ||
               rolesDisplay.includes(searchLower) ||
               address.includes(searchLower);
      });
    }

    // Apply sorting
    if (sortField) {
      filtered = [...filtered].sort((a, b) => {
        let aVal, bVal;
        
        switch (sortField) {
          case "id":
            aVal = parseInt(a.id || 0);
            bVal = parseInt(b.id || 0);
            break;
          case "name":
            aVal = ((a.Name || a.name || a.fullName || "")).toLowerCase();
            bVal = ((b.Name || b.name || b.fullName || "")).toLowerCase();
            break;
          case "email":
            aVal = (a.email || "").toLowerCase();
            bVal = (b.email || "").toLowerCase();
            break;
          case "phone":
            aVal = (a.phone || "").toLowerCase();
            bVal = (b.phone || "").toLowerCase();
            break;
          default:
            return 0;
        }
        
        if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
        if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
        return 0;
      });
    }
    
    setFilteredUsers(filtered);
  }, [searchTerm, users, sortField, sortDirection]);

  const handleSort = useCallback((field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  }, [sortField, sortDirection]);

  const SortableHeader = ({ field, children }) => {
    const isActive = sortField === field;
    return (
      <th 
        onClick={(e) => {
          e.preventDefault();
          handleSort(field);
        }}
        style={{ 
          cursor: "pointer", 
          userSelect: "none",
          position: "relative",
          paddingRight: "30px",
          whiteSpace: "nowrap"
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = "#f0f0f0";
          e.currentTarget.style.transition = "background-color 0.2s";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "";
        }}
        title={`Click to sort by ${children} ${isActive ? (sortDirection === "asc" ? "(ascending)" : "(descending)") : ""}`}
      >
        <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
          {children}
          <span style={{ 
            fontSize: "16px",
            fontWeight: "bold",
            color: isActive ? "#007bff" : "#999",
            display: "inline-block",
            minWidth: "20px"
          }}>
            {isActive ? (sortDirection === "asc" ? "▲" : "▼") : "⇅"}
          </span>
        </span>
      </th>
    );
  };

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
    // Normalize roles to role values (strings) for editing
    const roleNames = rolesList.map(r => {
      if (typeof r === "string") return r;
      if (typeof r === "number") {
        // Map numeric roles to string roles
        const roleMap = { 1: "ROLE_USER", 2: "ROLE_ADMIN" };
        return roleMap[r] || `ROLE_${r}`;
      }
      if (r && typeof r === "object") {
        return r.name || r.authority || r.role || String(r);
      }
      return String(r);
    });
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
      <div style={{ marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="Search users by ID, name, email, phone, roles, or address..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: "100%",
            maxWidth: "500px",
            padding: "10px",
            fontSize: "14px",
            border: "1px solid #ddd",
            borderRadius: "4px"
          }}
        />
      </div>
      {filteredUsers.length === 0 ? (
        <div className="empty-state">
          <p>{searchTerm ? `No users found matching "${searchTerm}".` : "No users found."}</p>
        </div>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <SortableHeader field="id">ID</SortableHeader>
              <SortableHeader field="name">Name</SortableHeader>
              <SortableHeader field="email">Email</SortableHeader>
              <SortableHeader field="phone">Phone</SortableHeader>
              <th>Roles</th>
              <th>Address</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(u => {
              // Handle Name field (capital N from backend)
              const userName = u.Name || u.name || u.fullName || "-";
              // Handle roles (Set or Array)
              const rolesList = u.roles ? (Array.isArray(u.roles) ? u.roles : Array.from(u.roles)) : [];
              const rolesDisplay = rolesList.length > 0 
                ? rolesList.map(r => {
                    // Handle different role formats for display
                    if (typeof r === "string") return r;
                    if (typeof r === "number") {
                      const roleMap = { 1: "ROLE_USER", 2: "ROLE_ADMIN" };
                      return roleMap[r] || `ROLE_${r}`;
                    }
                    if (r && typeof r === "object") {
                      return r.name || r.authority || r.role || JSON.stringify(r);
                    }
                    return String(r);
                  }).join(", ")
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
                            {rolesList.map((r, idx) => {
                              // Handle different role formats
                              let roleDisplay = "";
                              if (typeof r === "string") {
                                roleDisplay = r;
                              } else if (typeof r === "number") {
                                // If role is a number, try to map it to a role name
                                const roleMap = { 1: "ROLE_USER", 2: "ROLE_ADMIN" };
                                roleDisplay = roleMap[r] || `ROLE_${r}`;
                              } else if (r && typeof r === "object") {
                                roleDisplay = r.name || r.authority || r.role || JSON.stringify(r);
                              } else {
                                roleDisplay = String(r);
                              }
                              
                              return (
                                <span key={idx} className="role-badge">
                                  {roleDisplay}
                                </span>
                              );
                            })}
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
