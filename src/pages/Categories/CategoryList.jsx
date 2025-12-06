// src/pages/Categories/CategoryList.jsx
import React, { useEffect, useState, useCallback } from "react";
import { getCategories, deleteCategory } from "../../services/api";
import { Link } from "react-router-dom";

export default function CategoryList() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const list = await getCategories();
      setCategories(list || []);
    } catch (err) {
      console.error(err);
      setError("Failed to load categories. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const remove = useCallback(async (id) => {
    if (!confirm("Delete this category?")) return;
    try {
      setDeleting(id);
      await deleteCategory(id);
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
        <div className="page-header">
          <h2>Categories</h2>
          <Link to="/categories/new"><button>Create Category</button></Link>
        </div>
        <div className="loading-state">Loading categories...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <div className="page-header">
          <h2>Categories</h2>
          <Link to="/categories/new"><button>Create Category</button></Link>
        </div>
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
        <h2>Categories</h2>
        <Link to="/categories/new"><button>Create Category</button></Link>
      </div>

      {categories.length === 0 ? (
        <div className="empty-state">
          <p>No categories found.</p>
          <Link to="/categories/new"><button>Create First Category</button></Link>
        </div>
      ) : (
        <div className="categories-grid">
          {categories.map(c => (
            <div key={c.id} className="category-card">
              <div className="category-image">
                {c.imageBase64 ? (
                  <img 
                    src={`data:image/jpeg;base64,${c.imageBase64}`} 
                    alt={c.name}
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                ) : (
                  <div className="no-image-placeholder">
                    <span>No Image</span>
                  </div>
                )}
              </div>
              <div className="category-info">
                <h3>{c.name}</h3>
                <p className="category-description">{c.description || "No description"}</p>
              </div>
              <div className="category-actions">
                <Link to={`/categories/${c.id}/edit`}><button>Edit</button></Link>
                <button 
                  onClick={() => remove(c.id)}
                  disabled={deleting === c.id}
                >
                  {deleting === c.id ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
