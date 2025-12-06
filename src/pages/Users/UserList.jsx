// src/pages/Users/UserList.jsx
import React, { useEffect, useState, useCallback } from "react";
import { getUsers, deleteUser } from "../../services/api";

export default function UserList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleting, setDeleting] = useState(null);

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
      <h2>Users</h2>
      {users.length === 0 ? (
        <div className="empty-state">
          <p>No users found.</p>
        </div>
      ) : (
        <table className="table">
          <thead><tr><th>ID</th><th>Email</th><th>Name</th><th>Roles</th><th>Actions</th></tr></thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id}>
                <td>{u.id}</td>
                <td>{u.email}</td>
                <td>{u.name || u.fullName || "-"}</td>
                <td>{(u.roles || []).map(r => r.name).join(", ") || "-"}</td>
                <td>
                  <button 
                    onClick={() => remove(u.id)}
                    disabled={deleting === u.id}
                  >
                    {deleting === u.id ? "Deleting..." : "Delete"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
