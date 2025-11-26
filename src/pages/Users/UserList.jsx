// src/pages/Users/UserList.jsx
import React, { useEffect, useState } from "react";
import { getUsers, deleteUser } from "../../services/api";

export default function UserList() {
  const [users, setUsers] = useState([]);

  async function load() {
    try {
      const list = await getUsers();
      setUsers(list || []);
    } catch (err) {
      console.error(err);
      alert("Failed to load users");
    }
  }

  useEffect(() => { load(); }, []);

  async function remove(id) {
    if (!confirm("Delete user?")) return;
    try {
      await deleteUser(id);
      load();
    } catch (err) {
      console.error(err);
      alert("Delete failed");
    }
  }

  return (
    <div>
      <h2>Users</h2>
      <table className="table">
        <thead><tr><th>ID</th><th>Email</th><th>Name</th><th>Roles</th><th>Actions</th></tr></thead>
        <tbody>
          {users.map(u => (
            <tr key={u.id}>
              <td>{u.id}</td>
              <td>{u.email}</td>
              <td>{u.name || u.fullName || "-"}</td>
              <td>{(u.roles || []).map(r => r.name).join(", ")}</td>
              <td>
                <button onClick={() => remove(u.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
