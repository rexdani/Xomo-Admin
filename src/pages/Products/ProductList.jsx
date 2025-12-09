import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { getProducts, deleteProduct, getCategories } from "../../services/api";

export default function ProductList(){
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);
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
      const [productsList, categoriesList] = await Promise.all([
        getProducts(),
        getCategories().catch(() => []) // Don't fail if categories fail
      ]);
      const productsData = productsList || [];
      setProducts(productsData);
      setFilteredProducts(productsData);
      setCategories(categoriesList || []);
    } catch (err) {
      console.error("Failed to load products", err);
      setError("Failed to load products. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  const getCategoryName = useCallback((categoryId) => {
    if (!categoryId) return "-";
    const category = categories.find(c => c.id === categoryId);
    return category?.name || `ID: ${categoryId}`;
  }, [categories]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    let filtered = products;
    
    // Apply search filter
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = products.filter(p => {
        const name = (p.name || "").toLowerCase();
        const description = (p.description || "").toLowerCase();
        const categoryName = getCategoryName(p.categoryId || p.category?.id).toLowerCase();
        const price = String(p.price || 0);
        
        return name.includes(searchLower) ||
               description.includes(searchLower) ||
               categoryName.includes(searchLower) ||
               price.includes(searchLower);
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
          case "price":
            aVal = parseFloat(a.price || 0);
            bVal = parseFloat(b.price || 0);
            break;
          case "stock":
            aVal = parseInt(a.stock || 0);
            bVal = parseInt(b.stock || 0);
            break;
          case "category":
            aVal = getCategoryName(a.categoryId || a.category?.id).toLowerCase();
            bVal = getCategoryName(b.categoryId || b.category?.id).toLowerCase();
            break;
          default:
            return 0;
        }
        
        if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
        if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
        return 0;
      });
    }
    
    setFilteredProducts(filtered);
  }, [searchTerm, products, sortField, sortDirection, getCategoryName]);

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
    if(!confirm("Delete this product?")) return;
    try {
      setDeleting(id);
      await deleteProduct(id);
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
          <h2>Products</h2>
          <Link to="/products/new"><button>Create</button></Link>
        </div>
        <div className="loading-state">Loading products...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <div className="page-header">
          <h2>Products</h2>
          <Link to="/products/new"><button>Create</button></Link>
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
        <h2>Products</h2>
        <Link to="/products/new"><button>Create</button></Link>
      </div>
      <div style={{ marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="Search products by name, description, category, or price..."
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
      {filteredProducts.length === 0 ? (
        <div className="empty-state">
          <p>{searchTerm ? `No products found matching "${searchTerm}".` : "No products found."}</p>
          {!searchTerm && <Link to="/products/new"><button>Create First Product</button></Link>}
        </div>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <SortableHeader field="name">Name</SortableHeader>
              <SortableHeader field="price">Price</SortableHeader>
              <SortableHeader field="stock">Stock</SortableHeader>
              <SortableHeader field="category">Category</SortableHeader>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map(p => (
              <tr key={p.id}>
                <td>{p.name}</td>
                <td>₹{p.price || 0}</td>
                <td>
                  <span className={p.stock <= 0 ? "stock-out" : p.stock < 10 ? "stock-low" : "stock-ok"}>
                    {p.stock ?? 0}
                  </span>
                </td>
                <td>{getCategoryName(p.categoryId || p.category?.id)}</td>
                <td>
                  <Link to={`/products/${p.id}`}>View</Link>{" | "}
                  <Link to={`/products/${p.id}/edit`}>Edit</Link>{" | "}
                  <button 
                    onClick={() => remove(p.id)} 
                    disabled={deleting === p.id}
                  >
                    {deleting === p.id ? "Deleting..." : "Delete"}
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
