// src/pages/Categories/CategoryList.jsx
import React, { useEffect, useState, useCallback } from "react";
import { getCategories, deleteCategory } from "../../services/api";
import { Link } from "react-router-dom";

export default function CategoryList() {
  const [categories, setCategories] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const list = await getCategories();
      const categoriesData = list || [];
      setCategories(categoriesData);
      setFilteredCategories(categoriesData);
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

  useEffect(() => {
    let filtered = categories;
    
    // Apply search filter
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = categories.filter(c => {
        const name = (c.name || "").toLowerCase();
        const description = (c.description || "").toLowerCase();
        const id = String(c.id || "");
        
        return name.includes(searchLower) ||
               description.includes(searchLower) ||
               id.includes(searchLower);
      });
    }

    // Apply sorting
    if (sortField) {
      filtered = [...filtered].sort((a, b) => {
        let aVal, bVal;
        
        switch (sortField) {
          case "name":
            aVal = (a.name || "").toLowerCase();
            bVal = (b.name || "").toLowerCase();
            break;
          case "id":
            aVal = parseInt(a.id || 0);
            bVal = parseInt(b.id || 0);
            break;
          default:
            return 0;
        }
        
        if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
        if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
        return 0;
      });
    }
    
    setFilteredCategories(filtered);
  }, [searchTerm, categories, sortField, sortDirection]);

  const handleSortChange = useCallback((e) => {
    const value = e.target.value;
    if (value === "") {
      setSortField(null);
      setSortDirection("asc");
    } else {
      const [field, direction] = value.split("-");
      setSortField(field);
      setSortDirection(direction);
    }
  }, []);

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
      <div style={{ marginBottom: "20px", display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
        <input
          type="text"
          placeholder="Search categories by name, description, or ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            flex: "1",
            minWidth: "200px",
            maxWidth: "500px",
            padding: "10px",
            fontSize: "14px",
            border: "1px solid #ddd",
            borderRadius: "4px"
          }}
        />
        <select
          value={sortField ? `${sortField}-${sortDirection}` : ""}
          onChange={handleSortChange}
          style={{
            padding: "10px",
            fontSize: "14px",
            border: "1px solid #ddd",
            borderRadius: "4px",
            cursor: "pointer"
          }}
        >
          <option value="">Sort by...</option>
          <option value="name-asc">Name (A-Z)</option>
          <option value="name-desc">Name (Z-A)</option>
          <option value="id-asc">ID (Low to High)</option>
          <option value="id-desc">ID (High to Low)</option>
        </select>
      </div>
      {filteredCategories.length === 0 ? (
        <div className="empty-state">
          <p>{searchTerm ? `No categories found matching "${searchTerm}".` : "No categories found."}</p>
          {!searchTerm && <Link to="/categories/new"><button>Create First Category</button></Link>}
        </div>
      ) : (
        <div className="categories-grid">
          {filteredCategories.map(c => (
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
