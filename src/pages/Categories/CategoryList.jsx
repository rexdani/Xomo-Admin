// src/pages/Categories/CategoryList.jsx
import React, { useEffect, useState } from "react";
import { getCategories, deleteCategory } from "../../services/api";
import { Link } from "react-router-dom";

export default function CategoryList() {
  const [categories, setCategories] = useState([]);

  async function load() {
    try {
      const list = await getCategories();
      setCategories(list || []);
    } catch (err) {
      console.error(err);
      alert("Failed to load categories");
    }
  }

  useEffect(() => { load(); }, []);

  async function remove(id) {
    if (!confirm("Delete this category?")) return;
    try {
      await deleteCategory(id);
      load();
    } catch (err) {
      console.error(err);
      alert("Delete failed");
    }
  }

  return (
    <div>
      <header style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <h2>Categories</h2>
        <Link to="/categories/new"><button>Create Category</button></Link>
      </header>

      <table className="table">
        <thead><tr><th>Name</th><th>Slug</th><th>Actions</th></tr></thead>
        <tbody>
          {categories.map(c => (
            <tr key={c.id}>
              <td>{c.name}</td>
              <td>{c.slug || "-"}</td>
              <td>
                <Link to={`/categories/${c.id}/edit`}>Edit</Link>{" | "}
                <button onClick={() => remove(c.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
